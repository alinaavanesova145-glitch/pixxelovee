'use client';

import { AnimatePresence, motion } from 'framer-motion';
import type { Hotspot } from '@/types/story';

interface SecretMessageModalProps {
  hotspot: Hotspot | null;
  onClose: () => void;
}

export function SecretMessageModal({ hotspot, onClose }: SecretMessageModalProps) {
  return (
    <AnimatePresence>
      {hotspot && (
        <motion.div
          className="absolute inset-0 z-30 flex items-end justify-center bg-black/60 p-6 sm:items-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            initial={{ y: 24, opacity: 0, scale: 0.96 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 16, opacity: 0, scale: 0.98 }}
            transition={{ type: 'spring', stiffness: 260, damping: 24 }}
            onClick={(e) => e.stopPropagation()}
            className="max-w-sm rounded-2xl border border-[#FFB6C1]/30 bg-[#0a0a0a] p-6 shadow-[0_0_40px_rgba(255,182,193,0.15)]"
          >
            {hotspot.label && (
              <p className="mb-2 font-pixel text-[10px] uppercase tracking-widest text-[#FFB6C1]">
                {hotspot.label}
              </p>
            )}
            <p className="text-base leading-relaxed text-white/90">{hotspot.message}</p>
            <button
              type="button"
              onClick={onClose}
              className="mt-5 font-pixel text-[10px] text-white/50 hover:text-white"
            >
              close
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
