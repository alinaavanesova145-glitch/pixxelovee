'use client';

import { motion } from 'framer-motion';

interface AudioUnlockOverlayProps {
  onUnlock: () => void;
}

/** Autoplay policies require a real user gesture before audio can start. */
export function AudioUnlockOverlay({ onUnlock }: AudioUnlockOverlayProps) {
  return (
    <motion.button
      type="button"
      onClick={onUnlock}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
      className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-4 bg-black/90 backdrop-blur-sm"
    >
      <span className="font-heading text-lg font-semibold text-[#FFB6C1] sm:text-xl">
        a memory is waiting for you
      </span>
      <span className="rounded-full bg-neon px-6 py-3 font-heading text-sm font-semibold text-white shadow-[0_0_20px_rgba(255,62,165,0.4)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_0_32px_rgba(255,62,165,0.65)]">
        tap to enter ♥
      </span>
    </motion.button>
  );
}
