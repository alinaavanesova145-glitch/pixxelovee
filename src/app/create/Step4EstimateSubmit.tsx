'use client';

import type { OrderDraft } from '@/types/order';
import type { PriceEstimate } from '@/lib/pricing';

interface Step4EstimateSubmitProps {
  draft: OrderDraft;
  priceEstimate: PriceEstimate;
  onChange: (partial: Partial<OrderDraft>) => void;
  onSubmit: () => void;
  submitting: boolean;
  errorMessage: string | null;
}

export function Step4EstimateSubmit({
  draft,
  priceEstimate,
  onChange,
  onSubmit,
  submitting,
  errorMessage,
}: Step4EstimateSubmitProps) {
  const canSubmit = draft.customerName.trim().length > 0 && draft.customerEmail.trim().length > 0 && !submitting;

  return (
    <div>
      <h2 className="mb-1 font-pixel text-sm text-white">your estimate</h2>
      <p className="mb-6 text-sm text-white/50">Last step — where should we send it?</p>

      <div className="mb-6 rounded-xl border border-[#FFB6C1]/30 bg-[#FFB6C1]/5 p-4">
        <p className="font-pixel text-lg text-[#FFB6C1]">${priceEstimate.price}</p>
        <p className="mt-1 text-xs text-white/50">estimated delivery: {priceEstimate.timeline}</p>
      </div>

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
        className="w-full rounded-full border border-[#FFB6C1]/50 bg-[#FFB6C1]/10 py-3 font-pixel text-[10px] text-white transition-colors hover:bg-[#FFB6C1]/20 disabled:cursor-not-allowed disabled:opacity-30"
      >
        {submitting ? 'sending…' : 'send my story request ♥'}
      </button>
    </div>
  );
}
