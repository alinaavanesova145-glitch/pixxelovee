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
      <span className="font-pixel text-xs tracking-widest text-[#FFB6C1] sm:text-sm">
        a memory is waiting for you
      </span>
      <span className="rounded-full border border-[#FFB6C1]/40 px-6 py-3 font-pixel text-[10px] text-white transition-colors hover:bg-[#FFB6C1]/10 sm:text-xs">
        tap to enter ♥
      </span>
    </motion.button>
  );
}
