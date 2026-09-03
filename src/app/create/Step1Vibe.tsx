'use client';

import type { VibeId } from '@/types/story';

const VIBES: { id: VibeId; label: string; description: string }[] = [
  { id: 'cozy_room', label: 'Cozy Room', description: 'Warm lamplight, soft rain on the window, a shared blanket.' },
  { id: 'sunset_roof', label: 'Sunset Roof', description: 'City lights below, a rooftop picnic, the sky turning pink.' },
  { id: 'cyberpunk_alley', label: 'Cyberpunk Alley', description: 'Neon signs, rain-slick streets, a quiet corner just for two.' },
  { id: 'rainy_coffee_shop', label: 'Rainy Coffee Shop', description: 'Steamed-up windows, a corner booth, the world outside slowing down.' },
];

interface Step1VibeProps {
  vibe: VibeId | null;
  onChange: (vibe: VibeId) => void;
}

export function Step1Vibe({ vibe, onChange }: Step1VibeProps) {
  return (
    <div>
      <h2 className="mb-1 font-pixel text-sm text-white">pick a vibe</h2>
      <p className="mb-6 text-sm text-white/50">This sets the world your story lives in.</p>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {VIBES.map((v) => (
          <button
            key={v.id}
            type="button"
            onClick={() => onChange(v.id)}
            className={`rounded-xl border p-4 text-left transition-colors ${
              vibe === v.id ? 'border-[#FFB6C1] bg-[#FFB6C1]/10' : 'border-white/10 hover:border-white/25'
            }`}
          >
            <p className="font-pixel text-[10px] text-white">{v.label}</p>
            <p className="mt-2 text-xs text-white/50">{v.description}</p>
          </button>
        ))}
      </div>
    </div>
  );
}
