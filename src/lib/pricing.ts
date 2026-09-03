export interface PackageTier {
  id: 'essential' | 'animated' | 'expanded' | 'ultimate';
  name: string;
  price: number;
  hotspotCount: 5 | 10;
  hasCutscenes: boolean;
  hasFinale: boolean;
  description: string;
}

/**
 * Real, tested pricing from the Google Form. Note: hotspotCount is only ever
 * 5 or 10 (not a continuous range), so each tier's price is the actual
 * quoted number rather than a derived "$40 base + $X/hotspot" formula — a
 * flat per-hotspot rate doesn't reconcile cleanly to both the 5- and
 * 10-hotspot prices at once (10 hotspots computes to $65 at $5/hotspot, but
 * the real price is $70), so the real numbers are the source of truth here.
 */
export const PACKAGES: PackageTier[] = [
  {
    id: 'essential',
    name: 'Essential Quest',
    price: 40,
    hotspotCount: 5,
    hasCutscenes: false,
    hasFinale: false,
    description: '5 interactive memory hotspots.',
  },
  {
    id: 'animated',
    name: 'Animated Story Quest',
    price: 65,
    hotspotCount: 5,
    hasCutscenes: true,
    hasFinale: false,
    description: '5 hotspots + animated cutscene moments.',
  },
  {
    id: 'expanded',
    name: 'Expanded Quest',
    price: 70,
    hotspotCount: 10,
    hasCutscenes: false,
    hasFinale: false,
    description: '10 interactive memory hotspots.',
  },
  {
    id: 'ultimate',
    name: 'The Ultimate Story',
    price: 100,
    hotspotCount: 10,
    hasCutscenes: true,
    hasFinale: true,
    description: '10 hotspots + cutscenes + a finale message & closing scene.',
  },
];

export const LOOKALIKE_AVATAR_ADDON = 10;

export function getPackage(packageId: string | null): PackageTier | undefined {
  return PACKAGES.find((p) => p.id === packageId);
}

export function packagePrice(packageId: string | null, hasLookAlikeAvatar: boolean): number {
  const pkg = getPackage(packageId);
  if (!pkg) return 0;
  return pkg.price + (hasLookAlikeAvatar ? LOOKALIKE_AVATAR_ADDON : 0);
}

export function packageTimeline(packageId: string | null): string {
  const pkg = getPackage(packageId);
  if (!pkg) return '';
  if (pkg.hotspotCount === 10) return pkg.hasCutscenes ? '7–10 days' : '5–7 days';
  return pkg.hasCutscenes ? '5–7 days' : '3–5 days';
}

/** Reverse-lookup for the admin dashboard, matching stored flags back to a named tier. */
export function findPackageByFlags(
  hotspotCount: number | null,
  hasCutscenes: boolean,
  hasFinale: boolean
): PackageTier | undefined {
  return PACKAGES.find(
    (p) => p.hotspotCount === hotspotCount && p.hasCutscenes === hasCutscenes && p.hasFinale === hasFinale
  );
}
