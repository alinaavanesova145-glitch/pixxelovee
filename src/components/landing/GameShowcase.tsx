import Image from 'next/image';

/**
 * Real footage from Alina's own pixel-art gifts — not stock art, not a
 * template. As more of her projects come in, add them here; ShowcaseImage
 * is deliberately a small typed list rather than a single hardcoded src so
 * this can grow into a rotation later without touching the layout below.
 */
interface ShowcaseImage {
  src: string;
  width: number;
  height: number;
  alt: string;
  caption: string;
}

const SHOWCASE_IMAGES: ShowcaseImage[] = [
  {
    src: '/showcase/preview-1.png',
    width: 1280,
    height: 960,
    alt: 'A pixel-art bedroom at night, string lights and a moonlit window, with a phone on the nightstand showing the message "Where should we meet today?"',
    caption: 'an actual pixxelovee gift, mid-story',
  },
];

export function GameShowcase() {
  const image = SHOWCASE_IMAGES[0];

  return (
    <div className="w-full max-w-md">
      <div className="showcase-glow overflow-hidden rounded-2xl border-[3px] border-neon bg-black">
        <Image
          src={image.src}
          width={image.width}
          height={image.height}
          alt={image.alt}
          priority
          className="h-auto w-full"
        />
      </div>
      <p className="mt-4 text-center font-pixel text-[8px] uppercase tracking-widest text-blush/70 lg:text-right">
        {image.caption}
      </p>
    </div>
  );
}
