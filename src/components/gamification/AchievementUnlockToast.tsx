import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";
import { RARITY_COLORS, type Achievement } from "@/data/achievements";

interface AchievementUnlockToastProps {
  achievement: Achievement | null;
  onDismiss: () => void;
}

export default function AchievementUnlockToast({ achievement, onDismiss }: AchievementUnlockToastProps) {
  useEffect(() => {
    if (!achievement) return;

    // Fire confetti for epic+ badges
    if (achievement.rarity === "epic" || achievement.rarity === "legendary") {
      confetti({
        particleCount: achievement.rarity === "legendary" ? 120 : 60,
        spread: 70,
        origin: { y: 0.7 },
        colors: achievement.rarity === "legendary"
          ? ["#f59e0b", "#fbbf24", "#d97706"]
          : ["#a855f7", "#7c3aed", "#c084fc"],
      });
    }

    const timer = setTimeout(onDismiss, 5000);
    return () => clearTimeout(timer);
  }, [achievement, onDismiss]);

  return (
    <AnimatePresence>
      {achievement && (
        <motion.div
          className="fixed bottom-6 left-1/2 z-[100] -translate-x-1/2"
          initial={{ y: 100, opacity: 0, scale: 0.8 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          exit={{ y: 100, opacity: 0, scale: 0.8 }}
          transition={{ type: "spring", damping: 20, stiffness: 300 }}
        >
          <button
            onClick={onDismiss}
            className={`flex items-center gap-3 px-5 py-3 rounded-2xl border border-white/20 shadow-2xl backdrop-blur-md bg-gradient-to-r ${RARITY_COLORS[achievement.rarity]} cursor-pointer`}
          >
            <motion.span
              className="text-3xl"
              initial={{ rotate: -30, scale: 0 }}
              animate={{ rotate: 0, scale: 1 }}
              transition={{ type: "spring", delay: 0.2 }}
            >
              {achievement.emoji}
            </motion.span>
            <div className="text-left">
              <p className="text-[10px] font-bold uppercase tracking-widest text-white/70">
                🏆 Badge Unlocked!
              </p>
              <p className="text-sm font-bold text-white">{achievement.name}</p>
              <p className="text-[10px] text-white/80">+{achievement.rewardBc} BC</p>
            </div>
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
