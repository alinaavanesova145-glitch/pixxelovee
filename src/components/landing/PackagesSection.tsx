import Link from 'next/link';
import { LOOKALIKE_AVATAR_ADDON, PACKAGES } from '@/lib/pricing';

export function PackagesSection() {
  return (
    <section className="mx-auto max-w-5xl px-6 py-20">
      <h2 className="mb-2 text-center font-heading text-3xl font-bold text-white">packages</h2>
      <p className="mb-10 text-center text-sm text-white/50">Every tier is hand-built, start to finish.</p>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {PACKAGES.map((pkg) => (
          <div
            key={pkg.id}
            className="flex flex-col rounded-2xl border border-white/10 p-5 transition-shadow hover:shadow-[0_0_24px_rgba(255,62,165,0.15)]"
          >
            <p className="font-heading text-base font-semibold text-white">{pkg.name}</p>
            <p className="mt-2 font-heading text-2xl font-bold text-[#FFB6C1]">${pkg.price}</p>
            <p className="mt-1 text-xs text-white/40">
              {pkg.hotspotCount} hotspots
              {pkg.hasCutscenes ? ' · cutscenes' : ''}
              {pkg.hasFinale ? ' · finale scene' : ''}
            </p>
            <p className="mt-3 flex-1 text-xs text-white/50">{pkg.description}</p>
          </div>
        ))}
      </div>

      <p className="mt-6 text-center text-xs text-white/40">
        + Look-Alike Pixel Avatars, any tier — +${LOOKALIKE_AVATAR_ADDON}
      </p>

      <div className="mt-8 flex justify-center">
        <Link
          href="/create"
          className="rounded-full bg-neon px-8 py-3 font-heading text-sm font-semibold text-white shadow-[0_0_20px_rgba(255,62,165,0.4)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_0_32px_rgba(255,62,165,0.65)]"
        >
          start your story ♥
        </Link>
      </div>
    </section>
  );
}
