'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';
import { getPackage, packagePrice, packageTimeline } from '@/lib/pricing';
import type { OrderDraft } from '@/types/order';
import { Step1Vibe } from './Step1Vibe';
import { Step2Character } from './Step2Character';
import { Step3MusicElements } from './Step3MusicElements';
import { Step4EstimateSubmit } from './Step4EstimateSubmit';

const STEP_LABELS = ['Setup', 'Character', 'Music & Magic', 'Package'];
// Plain time-based debounce against double-click double-advancing the
// wizard — intentionally NOT tied to any framer-motion callback. The old
// AnimatePresence exit/enter cycle could hang mid-animation (confirmed via
// manual double-click testing: opacity/transform frozen partway,
// onExitComplete never firing, "next" permanently disabled). Removing
// AnimatePresence and giving each step's motion.div only a mount-time
// `initial`/`animate` (no `exit`) means a step change fully unmounts the
// old instance rather than coordinating an exit with it — there's nothing
// left to hang on.
const CLICK_COOLDOWN_MS = 300;

function emptyDraft(): OrderDraft {
  return {
    customerName: '',
    customerEmail: '',
    vibe: null,
    relationshipType: null,
    characterDetails: { names: [], description: '', photoAssetPaths: [] },
    musicChoice: null,
    musicAssetPath: null,
    easterEggs: [],
    textPrompts: [],
    packageId: null,
    hasLookAlikeAvatar: false,
  };
}

export default function CreatePage() {
  const [step, setStep] = useState(1);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [draft, setDraft] = useState<OrderDraft>(emptyDraft);
  const [draftId] = useState(() => crypto.randomUUID());
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const cooldownRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (cooldownRef.current) clearTimeout(cooldownRef.current);
    },
    []
  );

  const supabase = useMemo(() => createSupabaseBrowserClient(), []);

  const patch = (partial: Partial<OrderDraft>) => setDraft((d) => ({ ...d, ...partial }));

  const canAdvance =
    step === 1
      ? draft.vibe !== null && draft.relationshipType !== null
      : step === 2
        ? draft.characterDetails.description.trim().length > 0
        : true;

  function goToStep(next: (s: number) => number) {
    setIsTransitioning(true);
    setStep(next);
    if (cooldownRef.current) clearTimeout(cooldownRef.current);
    cooldownRef.current = setTimeout(() => setIsTransitioning(false), CLICK_COOLDOWN_MS);
  }

  async function handleSubmit() {
    setStatus('submitting');
    setErrorMessage(null);
    try {
      const pkg = getPackage(draft.packageId);
      // Insert without .select().single() -- anon has no SELECT policy on
      // orders (by design: only admins can read orders), and Postgres RLS
      // gates the implicit RETURNING/select-after-insert using SELECT
      // policy semantics, not just the INSERT policy's WITH CHECK. That
      // combination throws "new row violates row-level security policy"
      // even though the insert itself is fully permitted -- confirmed via
      // a direct fetch to /rest/v1/orders that isolated the failure to the
      // trailing .select('id'), not the insert or the RLS policy config.
      // Generating the id client-side sidesteps needing to read the row
      // back at all.
      const newOrderId = crypto.randomUUID();
      const { error: orderError } = await supabase
        .from('orders')
        .insert({
          id: newOrderId,
          customer_name: draft.customerName,
          customer_email: draft.customerEmail,
          vibe: draft.vibe,
          relationship_type: draft.relationshipType,
          character_details: draft.characterDetails,
          music_choice: draft.musicChoice,
          easter_eggs: draft.easterEggs,
          text_prompts: draft.textPrompts,
          package_hotspot_count: pkg?.hotspotCount ?? null,
          package_has_cutscenes: pkg?.hasCutscenes ?? false,
          package_has_finale: pkg?.hasFinale ?? false,
          has_lookalike_avatar: draft.hasLookAlikeAvatar,
          price_estimate: packagePrice(draft.packageId, draft.hasLookAlikeAvatar),
          timeline_estimate: packageTimeline(draft.packageId),
        });

      if (orderError) throw orderError;

      const assetRows = [
        ...draft.characterDetails.photoAssetPaths.map((path) => ({
          order_id: newOrderId,
          asset_type: 'photo_reference',
          storage_bucket: 'photo-references',
          storage_path: path,
          file_name: path.split('/').pop() ?? path,
        })),
        ...(draft.musicAssetPath
          ? [
              {
                order_id: newOrderId,
                asset_type: 'audio_upload',
                storage_bucket: 'audio-uploads',
                storage_path: draft.musicAssetPath,
                file_name: draft.musicAssetPath.split('/').pop() ?? draft.musicAssetPath,
              },
            ]
          : []),
      ];

      if (assetRows.length) {
        const { error: assetError } = await supabase.from('assets').insert(assetRows);
        if (assetError) throw assetError;
      }

      setStatus('success');
    } catch (err) {
      setStatus('error');
      setErrorMessage(err instanceof Error ? err.message : 'Something went wrong. Try again?');
    }
  }

  if (status === 'success') {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center gap-4 bg-black px-6 text-center">
        <p className="font-heading text-xl font-semibold text-[#FFB6C1]">your story is in the queue ♥</p>
        <p className="max-w-sm text-white/70">
          We&apos;ll email {draft.customerEmail} once your pixel world is ready to send.
        </p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-black px-6 py-16">
      <div className="mx-auto max-w-xl">
        <ol className="mb-10 flex justify-between">
          {STEP_LABELS.map((label, i) => (
            <li
              key={label}
              className={`font-pixel text-[9px] uppercase tracking-widest ${
                i + 1 <= step ? 'text-[#FFB6C1]' : 'text-white/30'
              }`}
            >
              {label}
            </li>
          ))}
        </ol>

        <motion.div
          key={step}
          initial={{ opacity: 0, x: 16 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.25 }}
        >
          {step === 1 && (
            <Step1Vibe vibe={draft.vibe} relationshipType={draft.relationshipType} onChange={patch} />
          )}
          {step === 2 && (
            <Step2Character
              draftId={draftId}
              supabase={supabase}
              characterDetails={draft.characterDetails}
              onChange={(characterDetails) => patch({ characterDetails })}
            />
          )}
          {step === 3 && (
            <Step3MusicElements
              draftId={draftId}
              supabase={supabase}
              musicChoice={draft.musicChoice}
              musicAssetPath={draft.musicAssetPath}
              easterEggs={draft.easterEggs}
              textPrompts={draft.textPrompts}
              onChange={patch}
            />
          )}
          {step === 4 && (
            <Step4EstimateSubmit
              draft={draft}
              onChange={patch}
              onSubmit={handleSubmit}
              submitting={status === 'submitting'}
              errorMessage={errorMessage}
            />
          )}
        </motion.div>

        <div className="mt-10 flex justify-between">
          <button
            type="button"
            onClick={() => goToStep((s) => Math.max(1, s - 1))}
            disabled={isTransitioning}
            className={`font-pixel text-[10px] text-white/50 hover:text-white disabled:cursor-not-allowed disabled:opacity-50 ${step === 1 ? 'invisible' : ''}`}
          >
            back
          </button>
          {step < 4 && (
            <button
              type="button"
              onClick={() => goToStep((s) => Math.min(4, s + 1))}
              disabled={!canAdvance || isTransitioning}
              className="rounded-full bg-neon px-6 py-2 font-heading text-sm font-semibold text-white shadow-[0_0_20px_rgba(255,62,165,0.4)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_0_32px_rgba(255,62,165,0.65)] disabled:cursor-not-allowed disabled:opacity-40 disabled:shadow-none disabled:hover:translate-y-0"
            >
              next
            </button>
          )}
        </div>
      </div>
    </main>
  );
}
