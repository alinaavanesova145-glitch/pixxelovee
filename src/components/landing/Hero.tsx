import Link from 'next/link';
import { HeroPixiDemo } from './HeroPixiDemo';

export function Hero() {
  return (
    <section className="relative flex min-h-[640px] flex-col items-center justify-center overflow-hidden px-6 py-24 text-center">
      <div className="absolute inset-0 opacity-50">
        <HeroPixiDemo />
      </div>
      <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/70 to-black" />

      <div className="relative z-10 flex flex-col items-center">
        <span className="mb-6 font-pixel text-[9px] uppercase tracking-widest text-[#FFB6C1]">pixxelovee</span>

        <h1 className="mb-4 max-w-2xl font-heading text-4xl font-bold leading-tight text-white sm:text-5xl">
          Every Story Deserves A Save File
        </h1>

        <p className="mb-8 max-w-md text-base text-white/70">
          Turn a real memory into a hand-drawn pixel-art world you can send as a link — for couples, best friends,
          siblings, or anyone far away.
        </p>

        {/* Star-rating social proof — hidden until there are real reviews to show, see Testimonials. */}

        <Link
          href="/create"
          className="rounded-full bg-neon px-8 py-4 font-heading text-base font-semibold text-white shadow-[0_0_25px_rgba(255,62,165,0.45)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_0_40px_rgba(255,62,165,0.7)]"
        >
          create your story ♥
        </Link>
      </div>
    </section>
  );
}
