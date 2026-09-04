'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';

/**
 * Real footage from Alina's own pixel-art gifts — not stock art, not a
 * template. Two different projects so far ("A Little Pixel World For You"
 * and "Vows & Vendettas"); add more here as they come in, the rotation
 * picks them up automatically.
 */
interface ShowcaseImage {
  src: string;
  alt: string;
  caption: string;
}

const SHOWCASE_IMAGES: ShowcaseImage[] = [
  {
    src: '/showcase/preview-1.png',
    alt: 'A pixel-art girl standing alone between two trees in a sunny park world, part of a real pixxelovee gift story',
    caption: 'an actual pixxelovee gift, mid-story',
  },
  {
    src: '/showcase/preview-2.webp',
    alt: 'Two pixel-art characters at a dinner table facing a dialogue choice — Pass the Salt, Draw Weapon, or Toast to Anniversary — from a real pixxelovee gift',
    caption: 'another pixxelovee gift — dinner turns tense',
  },
  {
    src: '/showcase/preview-3.webp',
    alt: 'The same two pixel-art characters in a "Final Standoff" sequence-matching minigame',
    caption: 'same gift — the final standoff',
  },
];

const ROTATE_MS = 4500;

export function GameShowcase() {
  const [index, setIndex] = useState(0);
  const pausedRef = useRef(false);

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const id = setInterval(() => {
      if (!pausedRef.current) {
        setIndex((i) => (i + 1) % SHOWCASE_IMAGES.length);
      }
    }, ROTATE_MS);
    return () => clearInterval(id);
  }, []);

  const active = SHOWCASE_IMAGES[index];

  return (
    <div
      className="w-full max-w-md"
      onMouseEnter={() => {
        pausedRef.current = true;
      }}
      onMouseLeave={() => {
        pausedRef.current = false;
      }}
    >
      <div className="showcase-glow relative aspect-[16/9] overflow-hidden rounded-2xl border-[3px] border-neon bg-black">
        {SHOWCASE_IMAGES.map((image, i) => (
          <Image
            key={image.src}
            src={image.src}
            alt={image.alt}
            fill
            sizes="(min-width: 1024px) 448px, 90vw"
            priority={i === 0}
            className={`object-cover transition-opacity duration-700 ease-in-out ${
              i === index ? 'opacity-100' : 'opacity-0'
            }`}
          />
        ))}
      </div>

      <div className="mt-4 flex justify-center gap-1.5 lg:justify-end">
        {SHOWCASE_IMAGES.map((image, i) => (
          <button
            key={image.src}
            type="button"
            onClick={() => setIndex(i)}
            aria-label={`Show preview ${i + 1} of ${SHOWCASE_IMAGES.length}`}
            aria-current={i === index}
            className={`h-1.5 w-4 rounded-full transition-colors ${
              i === index ? 'bg-neon' : 'bg-white/20 hover:bg-white/40'
            }`}
          />
        ))}
      </div>

      <p className="mt-2 text-center font-pixel text-[8px] uppercase tracking-widest text-blush/70 lg:text-right">
        {active.caption}
      </p>
    </div>
  );
}
