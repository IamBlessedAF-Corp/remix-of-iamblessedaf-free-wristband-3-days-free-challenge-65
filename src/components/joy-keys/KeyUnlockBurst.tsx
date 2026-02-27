import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';

interface KeyUnlockBurstProps {
  trigger: boolean;
  color?: string;
}

/** One-shot radial burst animation when a key gets unlocked */
export default function KeyUnlockBurst({ trigger, color = '#FFD700' }: KeyUnlockBurstProps) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (trigger) {
      setShow(true);
      const t = setTimeout(() => setShow(false), 1200);
      return () => clearTimeout(t);
    }
  }, [trigger]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="absolute inset-0 pointer-events-none flex items-center justify-center z-30"
          initial={{ opacity: 1 }}
          animate={{ opacity: 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.2 }}
        >
          {/* Expanding rings */}
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="absolute rounded-full border-2"
              style={{ borderColor: color }}
              initial={{ width: 20, height: 20, opacity: 0.8 }}
              animate={{
                width: 200 + i * 60,
                height: 200 + i * 60,
                opacity: 0,
              }}
              transition={{
                duration: 0.8,
                delay: i * 0.15,
                ease: 'easeOut',
              }}
            />
          ))}

          {/* Central flash */}
          <motion.div
            className="absolute rounded-full"
            style={{ background: color }}
            initial={{ width: 10, height: 10, opacity: 1 }}
            animate={{ width: 60, height: 60, opacity: 0 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          />

          {/* Emoji burst */}
          <motion.span
            className="absolute text-4xl"
            initial={{ scale: 0, rotate: -20 }}
            animate={{ scale: [0, 1.4, 1], rotate: [-20, 10, 0] }}
            transition={{ duration: 0.6, ease: 'backOut' }}
          >
            🔓
          </motion.span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
