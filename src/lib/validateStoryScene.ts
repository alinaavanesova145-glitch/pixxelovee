import type { AmbientEffectType, Hotspot, StoryScene, VibeId } from '@/types/story';

const VALID_VIBES: VibeId[] = ['cozy_room', 'sunset_roof', 'cyberpunk_alley', 'rainy_coffee_shop'];
const VALID_AMBIENT: AmbientEffectType[] = ['rain', 'snow', 'fireflies', 'none'];

/**
 * Structural check for the JSON an admin pastes into the scene editor —
 * enough to catch a malformed StoryScene before it reaches StoryViewer,
 * without pulling in a schema-validation dependency for one form.
 */
export function validateStoryScene(input: unknown): string | null {
  if (typeof input !== 'object' || input === null) return 'Scene must be a JSON object.';
  const scene = input as Partial<StoryScene>;

  if (!scene.vibe || !VALID_VIBES.includes(scene.vibe)) {
    return `"vibe" must be one of ${VALID_VIBES.join(', ')}.`;
  }

  if (
    !scene.background ||
    typeof scene.background.image !== 'string' ||
    typeof scene.background.width !== 'number' ||
    typeof scene.background.height !== 'number'
  ) {
    return '"background" needs image (string), width (number), height (number).';
  }

  if (
    !scene.ambient ||
    !VALID_AMBIENT.includes(scene.ambient.effect) ||
    typeof scene.ambient.intensity !== 'number'
  ) {
    return `"ambient.effect" must be one of ${VALID_AMBIENT.join(', ')}, with a numeric "intensity".`;
  }

  if (!Array.isArray(scene.hotspots)) return '"hotspots" must be an array.';
  for (const [i, h] of scene.hotspots.entries()) {
    const hotspot = h as Partial<Hotspot>;
    if (
      typeof hotspot.id !== 'string' ||
      typeof hotspot.x !== 'number' ||
      typeof hotspot.y !== 'number' ||
      typeof hotspot.width !== 'number' ||
      typeof hotspot.height !== 'number' ||
      typeof hotspot.sprite !== 'string' ||
      typeof hotspot.message !== 'string'
    ) {
      return `hotspots[${i}] is missing a required field (id, x, y, width, height, sprite, message).`;
    }
  }

  if (!scene.footerCta || typeof scene.footerCta.text !== 'string' || typeof scene.footerCta.url !== 'string') {
    return '"footerCta" needs text and url strings.';
  }

  return null;
}
