import type { VibeId } from './story';

export interface CharacterDetails {
  names: string[];
  description: string;
  photoAssetPaths: string[];
}

export interface EasterEgg {
  label: string;
  hint?: string;
}

export interface TextPrompt {
  label: string;
  message: string;
}

export interface OrderDraft {
  customerName: string;
  customerEmail: string;
  vibe: VibeId | null;
  characterDetails: CharacterDetails;
  musicChoice: string | null;
  musicAssetPath: string | null;
  easterEggs: EasterEgg[];
  textPrompts: TextPrompt[];
}

/** Shape of a row in the `orders` table, as read back by the admin dashboard. */
export interface OrderRow {
  id: string;
  created_at: string;
  updated_at: string;
  customer_name: string;
  customer_email: string;
  status: string;
  vibe: VibeId;
  character_details: CharacterDetails;
  music_choice: string | null;
  easter_eggs: EasterEgg[];
  text_prompts: TextPrompt[];
  price_estimate: number | null;
  timeline_estimate: string | null;
  story_id: string | null;
  admin_notes: string | null;
}

export type AssetType = 'photo_reference' | 'audio_upload' | 'sprite' | 'background' | 'sfx';

/** Shape of a row in the `assets` table. */
export interface AssetRow {
  id: string;
  asset_type: AssetType;
  storage_bucket: string;
  storage_path: string;
  file_name: string;
}
