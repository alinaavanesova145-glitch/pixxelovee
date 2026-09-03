import type { Metadata } from 'next';
import { Hero } from '@/components/landing/Hero';
import { HowItWorks } from '@/components/landing/HowItWorks';
import { PackagesSection } from '@/components/landing/PackagesSection';
import { StoryGallery } from '@/components/landing/StoryGallery';
import { TrustBadges } from '@/components/landing/TrustBadges';
import { Testimonials } from '@/components/landing/Testimonials';

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
      <Hero />
      <HowItWorks />
      <PackagesSection />
      <StoryGallery />
      <TrustBadges />
      <Testimonials />
    </main>
  );
}
