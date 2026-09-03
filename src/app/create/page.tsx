'use client';

import { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';
import { estimate } from '@/lib/pricing';
import type { OrderDraft } from '@/types/order';
import { Step1Vibe } from './Step1Vibe';
import { Step2Character } from './Step2Character';
import { Step3MusicElements } from './Step3MusicElements';
import { Step4EstimateSubmit } from './Step4EstimateSubmit';

const STEP_LABELS = ['Vibe', 'Character', 'Music & Magic', 'Estimate'];

function emptyDraft(): OrderDraft {
  return {
    customerName: '',
    customerEmail: '',
    vibe: null,
    characterDetails: { names: [], description: '', photoAssetPaths: [] },
    musicChoice: null,
    musicAssetPath: null,
    easterEggs: [],
    textPrompts: [],
  };
}

export default function CreatePage() {
  const [step, setStep] = useState(1);
  const [draft, setDraft] = useState<OrderDraft>(emptyDraft);
  const [draftId] = useState(() => crypto.randomUUID());
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const supabase = useMemo(() => createSupabaseBrowserClient(), []);
  const priceEstimate = useMemo(() => estimate(draft), [draft]);

  const patch = (partial: Partial<OrderDraft>) => setDraft((d) => ({ ...d, ...partial }));

  const canAdvance =
    step === 1
      ? draft.vibe !== null
      : step === 2
        ? draft.characterDetails.description.trim().length > 0
        : true;

  async function handleSubmit() {
    setStatus('submitting');
    setErrorMessage(null);
    try {
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          customer_name: draft.customerName,
          customer_email: draft.customerEmail,
          vibe: draft.vibe,
          character_details: draft.characterDetails,
          music_choice: draft.musicChoice,
          easter_eggs: draft.easterEggs,
          text_prompts: draft.textPrompts,
          price_estimate: priceEstimate.price,
          timeline_estimate: priceEstimate.timeline,
        })
        .select('id')
        .single();

      if (orderError || !order) throw orderError ?? new Error('Order insert failed');

      const assetRows = [
        ...draft.characterDetails.photoAssetPaths.map((path) => ({
          order_id: order.id,
          asset_type: 'photo_reference',
          storage_bucket: 'photo-references',
          storage_path: path,
          file_name: path.split('/').pop() ?? path,
        })),
        ...(draft.musicAssetPath
          ? [
              {
                order_id: order.id,
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
        <p className="font-pixel text-sm text-[#FFB6C1]">your story is in the queue ♥</p>
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

        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -16 }}
            transition={{ duration: 0.25 }}
          >
            {step === 1 && <Step1Vibe vibe={draft.vibe} onChange={(vibe) => patch({ vibe })} />}
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
                priceEstimate={priceEstimate}
                onChange={patch}
                onSubmit={handleSubmit}
                submitting={status === 'submitting'}
                errorMessage={errorMessage}
              />
            )}
          </motion.div>
        </AnimatePresence>

        <div className="mt-10 flex justify-between">
          <button
            type="button"
            onClick={() => setStep((s) => Math.max(1, s - 1))}
            className={`font-pixel text-[10px] text-white/50 hover:text-white ${step === 1 ? 'invisible' : ''}`}
          >
            back
          </button>
          {step < 4 && (
            <button
              type="button"
              onClick={() => setStep((s) => Math.min(4, s + 1))}
              disabled={!canAdvance}
              className="rounded-full border border-[#FFB6C1]/40 px-5 py-2 font-pixel text-[10px] text-white transition-colors hover:bg-[#FFB6C1]/10 disabled:cursor-not-allowed disabled:opacity-30"
            >
              next
            </button>
          )}
        </div>
      </div>
    </main>
  );
}
