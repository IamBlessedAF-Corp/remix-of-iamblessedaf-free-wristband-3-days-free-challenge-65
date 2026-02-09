import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Utensils, Target } from "lucide-react";
import { useGlobalMeals } from "@/hooks/useGlobalMeals";

const GOAL = 1_111_111;

interface Props {
  variant?: "banner" | "compact" | "inline";
}

/** Animated number that counts up on mount */
function AnimatedNumber({ value, duration = 1200 }: { value: number; duration?: number }) {
  const [display, setDisplay] = useState(0);
  const prevRef = useRef(0);

  useEffect(() => {
    if (value === 0) return;
    const from = prevRef.current;
    prevRef.current = value;
    const start = performance.now();
    const step = (now: number) => {
      const t = Math.min((now - start) / duration, 1);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - t, 3);
      setDisplay(Math.round(from + (value - from) * eased));
      if (t < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [value, duration]);

  return <>{display.toLocaleString()}</>;
}

export default function GlobalMealCounter({ variant = "banner" }: Props) {
  const { meals, loading } = useGlobalMeals();
  const progress = Math.min((meals / GOAL) * 100, 100);

  if (loading && meals === 0) return null;

  // ─── Compact: just the number + icon (for headers) ───
  if (variant === "compact") {
    return (
      <div className="flex items-center gap-1.5 text-xs font-bold text-primary">
        <Utensils className="w-3 h-3" />
        <AnimatedNumber value={meals} />
        <span className="text-muted-foreground font-normal">meals donated</span>
      </div>
    );
  }

  // ─── Inline: single line for tight spaces ───
  if (variant === "inline") {
    return (
      <div className="flex items-center justify-center gap-2 py-2 text-xs">
        <Utensils className="w-3.5 h-3.5 text-primary" />
        <span className="text-foreground font-bold">
          <AnimatedNumber value={meals} />
        </span>
        <span className="text-muted-foreground">
          / {GOAL.toLocaleString()} meals donated together
        </span>
        <span className="text-primary font-bold">{progress.toFixed(1)}%</span>
      </div>
    );
  }

  // ─── Banner: full MrBeast-style counter ───
  return (
    <motion.div
      className="bg-card border border-border/50 rounded-xl overflow-hidden"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.1 }}
    >
      {/* Header */}
      <div className="bg-primary/5 border-b border-primary/10 px-4 py-3 flex items-center gap-3">
        <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
          <Utensils className="w-5 h-5 text-primary" />
        </div>
        <div className="flex-1">
          <p className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5">
            <Target className="w-3 h-3 text-primary" />
            2026 Global Mission
          </p>
          <p className="text-[10px] text-muted-foreground">
            Together we're feeding the world — one wristband at a time
          </p>
        </div>
      </div>

      {/* Counter */}
      <div className="px-4 py-5 text-center">
        <p className="text-4xl sm:text-5xl font-black text-foreground tracking-tight leading-none">
          <AnimatedNumber value={meals} duration={1500} />
        </p>
        <p className="text-sm text-muted-foreground mt-1.5">
          meals donated out of{" "}
          <span className="font-bold text-foreground">{GOAL.toLocaleString()}</span>
        </p>
      </div>

      {/* Progress bar */}
      <div className="px-4 pb-4">
        <div className="relative h-4 bg-secondary rounded-full overflow-hidden">
          <motion.div
            className="absolute inset-y-0 left-0 bg-primary rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${Math.max(progress, 1)}%` }}
            transition={{ duration: 1.5, ease: "easeOut", delay: 0.3 }}
          />
          {/* Shimmer effect */}
          <div className="absolute inset-0 overflow-hidden rounded-full">
            <div className="w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
          </div>
        </div>

        <div className="flex items-center justify-between mt-2">
          <span className="text-xs font-bold text-primary">
            {progress.toFixed(1)}% complete
          </span>
          <span className="text-xs text-muted-foreground">
            {(GOAL - meals).toLocaleString()} meals to go
          </span>
        </div>
      </div>

      {/* CTA line */}
      <div className="bg-primary/5 border-t border-primary/10 px-4 py-2.5 text-center">
        <p className="text-[11px] text-muted-foreground">
          🙏 Every wristband you share feeds <strong className="text-primary">11 people</strong> — 
          help us reach our 2026 goal!
        </p>
      </div>
    </motion.div>
  );
}
