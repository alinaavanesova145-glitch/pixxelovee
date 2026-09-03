'use client';

import type { SupabaseClient } from '@supabase/supabase-js';
import type { EasterEgg, OrderDraft, TextPrompt } from '@/types/order';
import { FileDropzone } from '@/components/create/FileDropzone';

const MUSIC_PRESETS = [
  { id: 'lofi-night', label: 'Lo-fi Night' },
  { id: 'acoustic-warmth', label: 'Acoustic Warmth' },
  { id: 'synth-dusk', label: 'Synth Dusk' },
  { id: 'custom', label: 'Upload your own' },
];

const EASTER_EGG_OPTIONS = [
  { label: 'A falling star to click', hint: 'reveals a message when tapped' },
  { label: 'A guitar to strum', hint: 'plays a chord and a memory' },
  { label: 'A window that changes weather', hint: 'cycles rain/snow/clear' },
  { label: 'A hidden photo frame', hint: 'shows a real photo of you two' },
];

interface Step3MusicElementsProps {
  draftId: string;
  supabase: SupabaseClient;
  musicChoice: string | null;
  musicAssetPath: string | null;
  easterEggs: EasterEgg[];
  textPrompts: TextPrompt[];
  onChange: (partial: Partial<OrderDraft>) => void;
}

export function Step3MusicElements({
  draftId,
  supabase,
  musicChoice,
  musicAssetPath,
  easterEggs,
  textPrompts,
  onChange,
}: Step3MusicElementsProps) {
  const toggleEgg = (label: string) => {
    const exists = easterEggs.some((e) => e.label === label);
    onChange({
      easterEggs: exists ? easterEggs.filter((e) => e.label !== label) : [...easterEggs, { label }],
    });
  };

  const addPrompt = () => onChange({ textPrompts: [...textPrompts, { label: '', message: '' }] });
  const updatePrompt = (i: number, field: 'label' | 'message', value: string) => {
    const next = textPrompts.slice();
    next[i] = { ...next[i], [field]: value };
    onChange({ textPrompts: next });
  };
  const removePrompt = (i: number) => onChange({ textPrompts: textPrompts.filter((_, idx) => idx !== i) });

  return (
    <div>
      <h2 className="mb-1 font-heading text-lg font-semibold text-white">music & magic</h2>
      <p className="mb-6 text-sm text-white/50">Set the soundtrack and choose what&apos;s clickable.</p>

      <p className="mb-2 text-xs text-white/60">Background music</p>
      <div className="mb-4 grid grid-cols-2 gap-2">
        {MUSIC_PRESETS.map((p) => (
          <button
            key={p.id}
            type="button"
            onClick={() => onChange({ musicChoice: p.id, musicAssetPath: p.id === 'custom' ? musicAssetPath : null })}
            className={`rounded-lg border px-3 py-2 text-left text-xs transition-colors ${
              musicChoice === p.id
                ? 'border-[#FFB6C1] bg-[#FFB6C1]/10 text-white'
                : 'border-white/10 text-white/60 hover:border-white/25'
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>

      {musicChoice === 'custom' && (
        <div className="mb-6">
          <FileDropzone
            supabase={supabase}
            bucket="audio-uploads"
            pathPrefix={draftId}
            accept="audio/*"
            label="drop your track here"
            hint="mp3 or wav, a minute or two loops nicely"
            onUploadedPathsChange={(paths) => onChange({ musicAssetPath: paths[0] ?? null })}
          />
        </div>
      )}

      <p className="mb-2 text-xs text-white/60">Clickable easter eggs</p>
      <div className="mb-6 space-y-2">
        {EASTER_EGG_OPTIONS.map((opt) => (
          <label
            key={opt.label}
            className="flex cursor-pointer items-start gap-2 rounded-lg border border-white/10 p-3 text-xs hover:border-white/25"
          >
            <input
              type="checkbox"
              checked={easterEggs.some((e) => e.label === opt.label)}
              onChange={() => toggleEgg(opt.label)}
              className="mt-0.5 accent-[#FFB6C1]"
            />
            <span>
              <span className="block text-white">{opt.label}</span>
              <span className="text-white/40">{opt.hint}</span>
            </span>
          </label>
        ))}
      </div>

      <div className="mb-2 flex items-center justify-between">
        <p className="text-xs text-white/60">Secret messages</p>
        <button type="button" onClick={addPrompt} className="font-pixel text-[9px] text-[#FFB6C1] hover:text-white">
          + add one
        </button>
      </div>
      <div className="space-y-3">
        {textPrompts.map((prompt, i) => (
          <div key={i} className="rounded-lg border border-white/10 p-3">
            <input
              type="text"
              value={prompt.label}
              onChange={(e) => updatePrompt(i, 'label', e.target.value)}
              placeholder="Label (e.g. 'the mixtape')"
              className="mb-2 w-full bg-transparent text-xs text-white placeholder:text-white/30 focus:outline-none"
            />
            <textarea
              value={prompt.message}
              onChange={(e) => updatePrompt(i, 'message', e.target.value)}
              rows={2}
              placeholder="What should it say when they click it?"
              className="w-full resize-none bg-transparent text-sm text-white placeholder:text-white/30 focus:outline-none"
            />
            <button type="button" onClick={() => removePrompt(i)} className="mt-1 text-[10px] text-white/30 hover:text-red-400">
              remove
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
