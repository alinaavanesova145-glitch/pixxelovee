import type { Metadata } from 'next';
import Link from 'next/link';
import { HeroPixiDemo } from '@/components/landing/HeroPixiDemo';
import { StoryGallery } from '@/components/landing/StoryGallery';

export const metadata: Metadata = {
  title: 'pixxelovee — turn a memory into a pixel-art world',
  description:
    'Custom 16-bit pixel-art scenes built from your real memories — ambient music, weather, and clickable secrets, delivered as a link.',
  openGraph: {
    title: 'pixxelovee',
    description: 'Turn a memory into a pixel-art world.',
    type: 'website',
  },
};

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-black">
      <section className="relative flex h-[80vh] min-h-[520px] flex-col items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          <HeroPixiDemo />
        </div>
        <div className="relative z-10 flex flex-col items-center px-6 text-center">
          <h1 className="mb-4 font-pixel text-lg leading-relaxed text-white sm:text-2xl">pixxelovee</h1>
          <p className="mb-8 max-w-md text-sm text-white/60 sm:text-base">
            Turn a real memory into a pixel-art world — ambient music, falling snow, and secrets only they can find.
          </p>
          <Link
            href="/create"
            className="rounded-full border border-[#FFB6C1]/50 bg-[#FFB6C1]/10 px-6 py-3 font-pixel text-[10px] text-white transition-colors hover:bg-[#FFB6C1]/20"
          >
            create your story ♥
          </Link>
        </div>
      </section>

      <StoryGallery />
    </main>
  );
}
