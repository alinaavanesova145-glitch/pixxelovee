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
