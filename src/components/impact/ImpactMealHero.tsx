import { motion } from "framer-motion";
import { Utensils, Target, Heart } from "lucide-react";
import { useGlobalMeals } from "@/hooks/useGlobalMeals";

const GOAL = 1_111_111;

/** Animated number with cubic ease-out */
function AnimatedCounter({ value, duration = 1800 }: { value: number; duration?: number }) {
  const [display, setDisplay] = useState(0);
  const prevRef = useRef(0);

  useEffect(() => {
    if (value === 0) return;
    const from = prevRef.current;
    prevRef.current = value;
    const start = performance.now();
    const step = (now: number) => {
      const t = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      setDisplay(Math.round(from + (value - from) * eased));
      if (t < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [value, duration]);

  return <>{display.toLocaleString()}</>;
}

import { useState, useEffect, useRef } from "react";

export default function ImpactMealHero() {
  const { meals, loading } = useGlobalMeals();
  const progress = Math.min((meals / GOAL) * 100, 100);

  return (
    <motion.section
      className="relative overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
    >
      {/* Background glow */}
      <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-background to-background" />

      <div className="relative container mx-auto px-4 py-12 md:py-20 text-center">
        {/* Badge */}
        <motion.div
          className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-full px-4 py-1.5 mb-6"
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <Heart className="w-4 h-4 text-primary fill-primary" />
          <span className="text-xs font-bold text-primary uppercase tracking-wider">
            2026 Global Mission
          </span>
        </motion.div>

        {/* Main counter */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.3, type: "spring", damping: 20 }}
        >
          <p className="text-6xl sm:text-7xl md:text-8xl font-black text-foreground tracking-tighter leading-none">
            {loading ? "..." : <AnimatedCounter value={meals} />}
          </p>
          <p className="text-lg sm:text-xl text-muted-foreground mt-3">
            meals donated together toward our goal of{" "}
            <span className="font-bold text-foreground">{GOAL.toLocaleString()}</span>
          </p>
        </motion.div>

        {/* Giant progress bar */}
        <motion.div
          className="max-w-2xl mx-auto mt-8"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <div className="relative h-6 bg-secondary rounded-full overflow-hidden shadow-inner">
            <motion.div
              className="absolute inset-y-0 left-0 bg-primary rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${Math.max(progress, 1)}%` }}
              transition={{ duration: 2, ease: "easeOut", delay: 0.6 }}
            />
            <div className="absolute inset-0 overflow-hidden rounded-full">
              <div className="w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
            </div>
          </div>
          <div className="flex items-center justify-between mt-3">
            <div className="flex items-center gap-1.5">
              <Utensils className="w-4 h-4 text-primary" />
              <span className="text-sm font-bold text-primary">
                {progress.toFixed(1)}% complete
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <Target className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                {(GOAL - meals).toLocaleString()} to go
              </span>
            </div>
          </div>
        </motion.div>

        {/* Subtext */}
        <motion.p
          className="text-sm text-muted-foreground mt-6 max-w-md mx-auto"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
        >
          Every wristband you share feeds <strong className="text-primary">11 people</strong> through
          Feeding America — help us hit 1,111,111 meals by the end of 2026
        </motion.p>
      </div>
    </motion.section>
  );
}
