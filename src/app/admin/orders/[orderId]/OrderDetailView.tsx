'use client';

import { useState } from 'react';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';
import { validateStoryScene } from '@/lib/validateStoryScene';
import { findPackageByFlags, LOOKALIKE_AVATAR_ADDON } from '@/lib/pricing';
import type { AssetRow, OrderRow } from '@/types/order';
import type { Story } from '@/types/story';

interface AssetWithUrl extends AssetRow {
  signedUrl: string | null;
}

interface OrderDetailViewProps {
  order: OrderRow;
  assets: AssetWithUrl[];
  existingStory: Story | null;
}

function slugify(input: string) {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

export function OrderDetailView({ order, assets, existingStory }: OrderDetailViewProps) {
  const [slug, setSlug] = useState(existingStory?.slug ?? slugify(`${order.customer_name}-${order.id.slice(0, 8)}`));
  const [title, setTitle] = useState(existingStory?.title ?? `${order.customer_name}'s story`);
  const [sceneJson, setSceneJson] = useState(existingStory ? JSON.stringify(existingStory.scene_data, null, 2) : '');
  const [galleryOptIn, setGalleryOptIn] = useState(existingStory?.gallery_opt_in ?? false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [status, setStatus] = useState<'idle' | 'publishing' | 'done' | 'error'>('idle');
  const [message, setMessage] = useState<string | null>(null);

  const photos = assets.filter((a) => a.asset_type === 'photo_reference');
  const audioAssets = assets.filter((a) => a.asset_type === 'audio_upload');
  const pkg = findPackageByFlags(order.package_hotspot_count, order.package_has_cutscenes, order.package_has_finale);

  async function handlePublish() {
    setValidationError(null);
    setMessage(null);

    let parsed: unknown;
    try {
      parsed = JSON.parse(sceneJson);
    } catch {
      setValidationError('That’s not valid JSON.');
      return;
    }

    const sceneError = validateStoryScene(parsed);
    if (sceneError) {
      setValidationError(sceneError);
      return;
    }

    setStatus('publishing');
    const supabase = createSupabaseBrowserClient();

    try {
      const { data: story, error: storyError } = await supabase
        .from('stories')
        .upsert(
          {
            ...(existingStory ? { id: existingStory.id } : {}),
            order_id: order.id,
            slug,
            title,
            scene_data: parsed,
            is_published: true,
            gallery_opt_in: galleryOptIn,
          },
          { onConflict: 'id' }
        )
        .select('id')
        .single();

      if (storyError || !story) throw storyError ?? new Error('Failed to save story');

      const { error: orderError } = await supabase
        .from('orders')
        .update({ story_id: story.id, status: 'ready_for_review' })
        .eq('id', order.id);

      if (orderError) throw orderError;

      setStatus('done');
      setMessage(`Published at /story/${slug}`);
    } catch (err) {
      setStatus('error');
      setMessage(err instanceof Error ? err.message : 'Something went wrong.');
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <p className="font-pixel text-[9px] uppercase tracking-widest text-white/40">order</p>
        <h1 className="mt-1 font-heading text-xl font-semibold text-white">{order.customer_name}</h1>
        <p className="text-sm text-white/50">{order.customer_email}</p>
        <div className="mt-3 flex flex-wrap gap-2 text-xs text-white/60">
          <span className="rounded-full border border-white/15 px-2 py-0.5">{order.status.replace(/_/g, ' ')}</span>
          <span className="rounded-full border border-white/15 px-2 py-0.5">{order.vibe.replace(/_/g, ' ')}</span>
          {order.relationship_type && (
            <span className="rounded-full border border-white/15 px-2 py-0.5">
              {order.relationship_type.replace(/_/g, ' ')}
            </span>
          )}
          {order.price_estimate != null && (
            <span className="rounded-full border border-neon/30 bg-neon/10 px-2 py-0.5">${order.price_estimate}</span>
          )}
          {order.timeline_estimate && (
            <span className="rounded-full border border-white/15 px-2 py-0.5">{order.timeline_estimate}</span>
          )}
        </div>
      </div>

      <section className="rounded-xl border border-white/10 p-4">
        <h2 className="mb-3 font-pixel text-[10px] text-[#FFB6C1]">package</h2>
        {pkg ? (
          <>
            <p className="text-sm text-white">
              {pkg.name} — {pkg.hotspotCount} hotspots
              {pkg.hasCutscenes ? ', cutscenes' : ''}
              {pkg.hasFinale ? ', finale scene' : ''}
            </p>
            {order.has_lookalike_avatar && (
              <p className="mt-1 text-sm text-white/70">+ Look-Alike Pixel Avatars (+${LOOKALIKE_AVATAR_ADDON})</p>
            )}
          </>
        ) : (
          <p className="text-sm text-white/40">
            No matching package tier for the stored flags ({order.package_hotspot_count ?? '—'} hotspots, cutscenes:{' '}
            {String(order.package_has_cutscenes)}, finale: {String(order.package_has_finale)}) — this order may
            predate the package system.
          </p>
        )}
      </section>

      <section className="rounded-xl border border-white/10 p-4">
        <h2 className="mb-3 font-pixel text-[10px] text-[#FFB6C1]">character</h2>
        {order.character_details?.names?.length ? (
          <p className="mb-2 text-sm text-white">{order.character_details.names.join(' & ')}</p>
        ) : null}
        <p className="text-sm text-white/70">{order.character_details?.description || 'No description provided.'}</p>
      </section>

      <section className="rounded-xl border border-white/10 p-4">
        <h2 className="mb-3 font-pixel text-[10px] text-[#FFB6C1]">reference photos</h2>
        {photos.length === 0 ? (
          <p className="text-sm text-white/40">No photos uploaded.</p>
        ) : (
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
            {photos.map((p) =>
              p.signedUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  key={p.id}
                  src={p.signedUrl}
                  alt={p.file_name}
                  className="aspect-square rounded-lg border border-white/10 object-cover"
                />
              ) : (
                <div
                  key={p.id}
                  className="flex aspect-square items-center justify-center rounded-lg border border-white/10 text-[10px] text-white/30"
                >
                  failed to load
                </div>
              )
            )}
          </div>
        )}
      </section>

      {(audioAssets.length > 0 || order.music_choice) && (
        <section className="rounded-xl border border-white/10 p-4">
          <h2 className="mb-3 font-pixel text-[10px] text-[#FFB6C1]">music</h2>
          {order.music_choice && order.music_choice !== 'custom' && (
            <p className="text-sm text-white/70">Preset: {order.music_choice}</p>
          )}
          {audioAssets.map((a) =>
            a.signedUrl ? (
              // eslint-disable-next-line jsx-a11y/media-has-caption
              <audio key={a.id} controls src={a.signedUrl} className="mt-2 w-full" />
            ) : (
              <p key={a.id} className="text-sm text-white/40">
                Failed to load {a.file_name}.
              </p>
            )
          )}
        </section>
      )}

      {(order.easter_eggs?.length > 0 || order.text_prompts?.length > 0) && (
        <section className="rounded-xl border border-white/10 p-4">
          <h2 className="mb-3 font-pixel text-[10px] text-[#FFB6C1]">requested elements</h2>
          {order.easter_eggs?.length > 0 && (
            <ul className="mb-3 list-inside list-disc text-sm text-white/70">
              {order.easter_eggs.map((e, i) => (
                <li key={i}>{e.label}</li>
              ))}
            </ul>
          )}
          {order.text_prompts?.map((p, i) => (
            <div key={i} className="mb-2 rounded-lg border border-white/10 p-2">
              <p className="text-xs text-white/40">{p.label || 'untitled'}</p>
              <p className="text-sm text-white/80">{p.message}</p>
            </div>
          ))}
        </section>
      )}

      <section className="rounded-xl border border-[#FFB6C1]/30 bg-[#FFB6C1]/5 p-4">
        <h2 className="mb-3 font-pixel text-[10px] text-[#FFB6C1]">build & publish</h2>

        <label className="mb-3 block text-xs text-white/60">
          Slug (used in /story/[slug])
          <input
            type="text"
            value={slug}
            onChange={(e) => setSlug(slugify(e.target.value))}
            className="mt-1 w-full rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-sm text-white focus:border-[#FFB6C1]/50 focus:outline-none"
          />
        </label>

        <label className="mb-3 block text-xs text-white/60">
          Title
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="mt-1 w-full rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-sm text-white focus:border-[#FFB6C1]/50 focus:outline-none"
          />
        </label>

        <label className="mb-2 block text-xs text-white/60">
          Scene JSON (StoryScene shape — see src/types/story.ts)
          <textarea
            value={sceneJson}
            onChange={(e) => setSceneJson(e.target.value)}
            rows={14}
            spellCheck={false}
            placeholder='{"vibe": "cozy_room", "background": {...}, "ambient": {...}, "hotspots": [...], "footerCta": {...}}'
            className="mt-1 w-full resize-y rounded-lg border border-white/15 bg-black/40 px-3 py-2 font-mono text-xs text-white placeholder:text-white/30 focus:border-[#FFB6C1]/50 focus:outline-none"
          />
        </label>

        <label className="mb-4 flex cursor-pointer items-start gap-2 rounded-lg border border-white/10 p-3 text-xs hover:border-white/25">
          <input
            type="checkbox"
            checked={galleryOptIn}
            onChange={(e) => setGalleryOptIn(e.target.checked)}
            className="mt-0.5 accent-neon"
          />
          <span>
            <span className="block text-white">Feature this on the landing page gallery</span>
            <span className="text-white/40">
              Leave unchecked to keep the story private-link-only — the customer can still reach it at{' '}
              /story/{slug || '[slug]'}, it just won&apos;t be listed publicly.
            </span>
          </span>
        </label>

        {validationError && <p className="mb-3 text-xs text-red-400">{validationError}</p>}
        {message && (
          <p className={`mb-3 text-xs ${status === 'error' ? 'text-red-400' : 'text-emerald-400'}`}>{message}</p>
        )}

        <button
          type="button"
          onClick={handlePublish}
          disabled={status === 'publishing' || !slug || !sceneJson.trim()}
          className="w-full rounded-full bg-neon py-3 font-heading text-sm font-semibold text-white shadow-[0_0_20px_rgba(255,62,165,0.4)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_0_32px_rgba(255,62,165,0.65)] disabled:cursor-not-allowed disabled:opacity-40 disabled:shadow-none disabled:hover:translate-y-0"
        >
          {status === 'publishing' ? 'publishing…' : existingStory ? 'update & republish' : 'publish story'}
        </button>
      </section>
    </div>
  );
}
