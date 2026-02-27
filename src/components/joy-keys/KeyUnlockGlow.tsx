import { motion, AnimatePresence } from 'framer-motion';
import { ReactNode } from 'react';

interface KeyUnlockGlowProps {
  unlocked: boolean;
  color?: string;
  children: ReactNode;
  className?: string;
}

/** Wraps any key card — adds glow pulse + scale pop when unlocked */
export default function KeyUnlockGlow({
  unlocked,
  color = '#FFD700',
  children,
  className = '',
}: KeyUnlockGlowProps) {
  return (
    <motion.div
      className={`relative ${className}`}
      animate={
        unlocked
          ? {
              scale: [1, 1.03, 1],
              transition: { duration: 2, repeat: Infinity, ease: 'easeInOut' },
            }
          : {}
      }
    >
      {/* Glow ring behind card */}
      <AnimatePresence>
        {unlocked && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{
              opacity: [0.3, 0.6, 0.3],
              scale: [0.98, 1.02, 0.98],
            }}
            exit={{ opacity: 0 }}
            transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute -inset-1 rounded-2xl blur-md pointer-events-none"
            style={{ background: color, zIndex: 0 }}
          />
        )}
      </AnimatePresence>

      {/* Actual content */}
      <div className="relative z-10">{children}</div>

      {/* Shimmer sweep on unlock */}
      <AnimatePresence>
        {unlocked && (
          <motion.div
            initial={{ x: '-100%', opacity: 0 }}
            animate={{ x: '200%', opacity: [0, 0.4, 0] }}
            transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 3 }}
            className="absolute inset-0 pointer-events-none rounded-2xl overflow-hidden z-20"
          >
            <div
              className="h-full w-1/3"
              style={{
                background: `linear-gradient(90deg, transparent, ${color}40, transparent)`,
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
