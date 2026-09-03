'use client';

import type { OrderDraft, PackageId } from '@/types/order';
import { LOOKALIKE_AVATAR_ADDON, PACKAGES, packagePrice, packageTimeline } from '@/lib/pricing';

interface Step4EstimateSubmitProps {
  draft: OrderDraft;
  onChange: (partial: Partial<OrderDraft>) => void;
  onSubmit: () => void;
  submitting: boolean;
  errorMessage: string | null;
}

export function Step4EstimateSubmit({ draft, onChange, onSubmit, submitting, errorMessage }: Step4EstimateSubmitProps) {
  const total = packagePrice(draft.packageId, draft.hasLookAlikeAvatar);
  const timeline = packageTimeline(draft.packageId);
  const canSubmit =
    draft.packageId !== null &&
    draft.customerName.trim().length > 0 &&
    draft.customerEmail.trim().length > 0 &&
    !submitting;

  return (
    <div>
      <h2 className="mb-1 font-heading text-lg font-semibold text-white">pick your package</h2>
      <p className="mb-6 text-sm text-white/50">Every tier is hand-built — pick the size that fits your story.</p>

      <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
        {PACKAGES.map((pkg) => (
          <button
            key={pkg.id}
            type="button"
            onClick={() => onChange({ packageId: pkg.id as PackageId })}
            className={`rounded-xl border p-4 text-left transition-colors ${
              draft.packageId === pkg.id ? 'border-neon bg-neon/10' : 'border-white/10 hover:border-white/25'
            }`}
          >
            <div className="flex items-baseline justify-between">
              <p className="font-heading text-sm font-semibold text-white">{pkg.name}</p>
              <p className="font-heading text-sm font-semibold text-[#FFB6C1]">${pkg.price}</p>
            </div>
            <p className="mt-2 text-xs text-white/50">{pkg.description}</p>
          </button>
        ))}
      </div>

      <label className="mb-6 flex cursor-pointer items-start gap-2 rounded-lg border border-white/10 p-3 text-xs hover:border-white/25">
        <input
          type="checkbox"
          checked={draft.hasLookAlikeAvatar}
          onChange={(e) => onChange({ hasLookAlikeAvatar: e.target.checked })}
          className="mt-0.5 accent-neon"
        />
        <span>
          <span className="block text-white">Look-Alike Pixel Avatars — +${LOOKALIKE_AVATAR_ADDON}</span>
          <span className="text-white/40">Sprites drawn to actually resemble the two of you, not generic characters.</span>
        </span>
      </label>

      {draft.packageId && (
        <div className="mb-6 rounded-xl border border-neon/30 bg-neon/5 p-4">
          <p className="font-heading text-lg font-semibold text-[#FFB6C1]">${total}</p>
          <p className="mt-1 text-xs text-white/50">estimated delivery: {timeline}</p>
        </div>
      )}

      <label className="mb-4 block text-xs text-white/60">
        Your name
        <input
          type="text"
          value={draft.customerName}
          onChange={(e) => onChange({ customerName: e.target.value })}
          className="mt-1 w-full rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-sm text-white focus:border-[#FFB6C1]/50 focus:outline-none"
        />
      </label>

      <label className="mb-6 block text-xs text-white/60">
        Email
        <input
          type="email"
          value={draft.customerEmail}
          onChange={(e) => onChange({ customerEmail: e.target.value })}
          className="mt-1 w-full rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-sm text-white focus:border-[#FFB6C1]/50 focus:outline-none"
        />
      </label>

      {errorMessage && <p className="mb-4 text-xs text-red-400">{errorMessage}</p>}

      <button
        type="button"
        onClick={onSubmit}
        disabled={!canSubmit}
        className="w-full rounded-full bg-neon py-3 font-heading text-sm font-semibold text-white shadow-[0_0_20px_rgba(255,62,165,0.4)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_0_32px_rgba(255,62,165,0.65)] disabled:cursor-not-allowed disabled:opacity-40 disabled:shadow-none disabled:hover:translate-y-0"
      >
        {submitting ? 'sending…' : 'send my story request ♥'}
      </button>
    </div>
  );
}
