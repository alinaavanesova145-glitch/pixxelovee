'use client';

import type { SupabaseClient } from '@supabase/supabase-js';
import type { CharacterDetails } from '@/types/order';
import { FileDropzone } from '@/components/create/FileDropzone';

interface Step2CharacterProps {
  draftId: string;
  supabase: SupabaseClient;
  characterDetails: CharacterDetails;
  onChange: (details: CharacterDetails) => void;
}

export function Step2Character({ draftId, supabase, characterDetails, onChange }: Step2CharacterProps) {
  return (
    <div>
      <h2 className="mb-1 font-heading text-lg font-semibold text-white">the details</h2>
      <p className="mb-6 text-sm text-white/50">
        Names, a short description, and a few reference photos so we can pixel-art you all accurately.
      </p>

      <label className="mb-4 block text-xs text-white/60">
        Names (comma-separated)
        <input
          type="text"
          value={characterDetails.names.join(', ')}
          onChange={(e) =>
            onChange({
              ...characterDetails,
              names: e.target.value.split(',').map((n) => n.trim()).filter(Boolean),
            })
          }
          placeholder="Alex, Jamie"
          className="mt-1 w-full rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/30 focus:border-[#FFB6C1]/50 focus:outline-none"
        />
      </label>

      <label className="mb-6 block text-xs text-white/60">
        Tell us about you all
        <textarea
          value={characterDetails.description}
          onChange={(e) => onChange({ ...characterDetails, description: e.target.value })}
          rows={4}
          placeholder="Hair, style, anything that makes you look like you..."
          className="mt-1 w-full resize-none rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/30 focus:border-[#FFB6C1]/50 focus:outline-none"
        />
      </label>

      <FileDropzone
        supabase={supabase}
        bucket="photo-references"
        pathPrefix={draftId}
        accept="image/*"
        multiple
        label="drop reference photos here"
        hint="a few clear photos — used only to draw your pixel selves"
        onUploadedPathsChange={(photoAssetPaths) => onChange({ ...characterDetails, photoAssetPaths })}
      />
    </div>
  );
}
