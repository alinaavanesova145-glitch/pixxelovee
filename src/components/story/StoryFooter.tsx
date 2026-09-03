'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';

interface StoryFooterProps {
  ctaText: string;
  ctaUrl: string;
}

export function StoryFooter({ ctaText, ctaUrl }: StoryFooterProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 1, duration: 0.6 }}
      className="pointer-events-none absolute inset-x-0 bottom-0 z-10 flex justify-center pb-4"
    >
      <Link
        href={ctaUrl}
        className="pointer-events-auto rounded-full border border-white/10 bg-black/60 px-4 py-2 font-pixel text-[9px] text-white/70 backdrop-blur transition-colors hover:border-[#FFB6C1]/40 hover:text-[#FFB6C1]"
      >
        {ctaText}
      </Link>
    </motion.div>
  );
}
