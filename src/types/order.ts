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

export type RelationshipType = 'couple' | 'best_friends' | 'siblings' | 'long_distance_friends';

export const RELATIONSHIP_TYPES: { id: RelationshipType; label: string }[] = [
  { id: 'couple', label: 'Couple' },
  { id: 'best_friends', label: 'Best Friends' },
  { id: 'siblings', label: 'Siblings' },
  { id: 'long_distance_friends', label: 'Long-Distance Friends' },
];

export type PackageId = 'essential' | 'animated' | 'expanded' | 'ultimate';

export interface OrderDraft {
  customerName: string;
  customerEmail: string;
  vibe: VibeId | null;
  relationshipType: RelationshipType | null;
  characterDetails: CharacterDetails;
  musicChoice: string | null;
  musicAssetPath: string | null;
  easterEggs: EasterEgg[];
  textPrompts: TextPrompt[];
  packageId: PackageId | null;
  hasLookAlikeAvatar: boolean;
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
  relationship_type: RelationshipType | null;
  package_hotspot_count: 5 | 10 | null;
  package_has_cutscenes: boolean;
  package_has_finale: boolean;
  has_lookalike_avatar: boolean;
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
