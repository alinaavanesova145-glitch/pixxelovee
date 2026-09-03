export type VibeId = 'cozy_room' | 'sunset_roof' | 'cyberpunk_alley' | 'rainy_coffee_shop';

export type AmbientEffectType = 'rain' | 'snow' | 'fireflies' | 'none';

export interface Hotspot {
  id: string;
  /** All of x/y/width/height are normalized 0–1 fractions of the background image. */
  x: number;
  y: number;
  width: number;
  height: number;
  sprite: string;
  hoverSprite?: string;
  sound?: string;
  label?: string;
  message: string;
}

export interface StoryScene {
  vibe: VibeId;
  background: {
    image: string;
    /** Natural pixel dimensions of the background art, used to scale hotspots. */
    width: number;
    height: number;
  };
  ambient: {
    effect: AmbientEffectType;
    intensity: number; // 0–1
  };
  music?: {
    url: string;
    volume: number; // 0–1
    loop: boolean;
  };
  hotspots: Hotspot[];
  footerCta: {
    text: string;
    url: string;
  };
}

export interface Story {
  id: string;
  slug: string;
  title: string;
  scene_data: StoryScene;
  is_published: boolean;
  view_count: number;
  gallery_opt_in: boolean;
}
