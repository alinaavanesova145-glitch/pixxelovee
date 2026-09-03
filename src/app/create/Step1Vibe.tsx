'use client';

import type { VibeId } from '@/types/story';
import { RELATIONSHIP_TYPES, type RelationshipType } from '@/types/order';

const VIBES: { id: VibeId; label: string; description: string }[] = [
  { id: 'cozy_room', label: 'Cozy Room', description: 'Warm lamplight, soft rain on the window, a shared blanket.' },
  { id: 'sunset_roof', label: 'Sunset Roof', description: 'City lights below, a rooftop hangout, the sky turning pink.' },
  { id: 'cyberpunk_alley', label: 'Cyberpunk Alley', description: 'Neon signs, rain-slick streets, a quiet corner that’s just yours.' },
  { id: 'rainy_coffee_shop', label: 'Rainy Coffee Shop', description: 'Steamed-up windows, a corner booth, the world outside slowing down.' },
];

interface Step1VibeProps {
  vibe: VibeId | null;
  relationshipType: RelationshipType | null;
  onChange: (partial: { vibe?: VibeId; relationshipType?: RelationshipType }) => void;
}

export function Step1Vibe({ vibe, relationshipType, onChange }: Step1VibeProps) {
  return (
    <div>
      <h2 className="mb-1 font-heading text-lg font-semibold text-white">who&apos;s this for?</h2>
      <p className="mb-4 text-sm text-white/50">Every story is built around real people — tell us who.</p>

      <div className="mb-8 grid grid-cols-2 gap-2 sm:grid-cols-4">
        {RELATIONSHIP_TYPES.map((r) => (
          <button
            key={r.id}
            type="button"
            onClick={() => onChange({ relationshipType: r.id })}
            className={`rounded-xl border px-3 py-3 text-center text-sm transition-colors ${
              relationshipType === r.id
                ? 'border-neon bg-neon/10 text-white'
                : 'border-white/10 text-white/60 hover:border-white/25'
            }`}
          >
            {r.label}
          </button>
        ))}
      </div>

      <h2 className="mb-1 font-heading text-lg font-semibold text-white">pick a vibe</h2>
      <p className="mb-6 text-sm text-white/50">This sets the world your story lives in.</p>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {VIBES.map((v) => (
          <button
            key={v.id}
            type="button"
            onClick={() => onChange({ vibe: v.id })}
            className={`rounded-xl border p-4 text-left transition-colors ${
              vibe === v.id ? 'border-[#FFB6C1] bg-[#FFB6C1]/10' : 'border-white/10 hover:border-white/25'
            }`}
          >
            <p className="font-heading text-sm font-medium text-white">{v.label}</p>
            <p className="mt-2 text-xs text-white/50">{v.description}</p>
          </button>
        ))}
      </div>
    </div>
  );
}
