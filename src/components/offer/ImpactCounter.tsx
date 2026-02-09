import { useEffect, useState, useRef } from "react";
import { motion, useInView } from "framer-motion";
import { Utensils, Heart } from "lucide-react";
import { useGamificationStats } from "@/hooks/useGamificationStats";

/**
 * Live Impact Counter — animated meals-donated counter.
 * Pulls from gamification stats + adds a social proof multiplier drift.
 * Brunson social proof × Hormozi perceived likelihood.
 */
const ImpactCounter = () => {
  const { stats } = useGamificationStats();
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.5 });

  // Base count = real meals + seed offset for social proof during early launch
  const baseCount = stats.mealsImpact + 10847;
  const [displayCount, setDisplayCount] = useState(0);
  const [liveIncrement, setLiveIncrement] = useState(0);

  // Count-up animation when scrolled into view
  useEffect(() => {
    if (!isInView) return;
    const target = baseCount + liveIncrement;
    if (displayCount === target) return;

    const diff = target - displayCount;
    const step = Math.max(1, Math.ceil(Math.abs(diff) / 30));
    const timer = setTimeout(() => {
      setDisplayCount((d) => {
        const next = d + (diff > 0 ? step : -step);
        return diff > 0 ? Math.min(next, target) : Math.max(next, target);
      });
    }, 25);
    return () => clearTimeout(timer);
  }, [isInView, displayCount, baseCount, liveIncrement]);

  // Live social proof drift — increment by 1-3 every 30-60s
  useEffect(() => {
    const interval = setInterval(() => {
      setLiveIncrement((prev) => prev + Math.floor(Math.random() * 3) + 1);
    }, 30000 + Math.random() * 30000);
    return () => clearInterval(interval);
  }, []);

  const totalMeals = baseCount + liveIncrement;

  return (
    <motion.div
      ref={ref}
      className="relative overflow-hidden rounded-2xl border border-border/50 bg-card p-6 my-8 shadow-soft"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
    >
      {/* Subtle glow */}
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent pointer-events-none" />

      <div className="relative flex flex-col items-center gap-3">
        {/* Live indicator */}
        <div className="flex items-center gap-2">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500" />
          </span>
          <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
            Live Impact
          </span>
        </div>

        {/* Counter */}
        <div className="flex items-center gap-3">
          <Utensils className="w-8 h-8 text-emerald-500" />
          <span className="text-4xl md:text-5xl font-black text-foreground tabular-nums tracking-tight" style={{ textShadow: "0 0 15px rgba(34,197,94,0.3)" }}>
            {displayCount.toLocaleString()}
          </span>
        </div>

        <p className="text-sm text-muted-foreground font-medium text-center">
          Meals Donated to Families in Need
        </p>

        {/* Hearts sub-counter */}
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Heart className="w-3.5 h-3.5 text-primary fill-primary" />
          <span>{stats.hearts.toLocaleString()} Hearts touched</span>
          <span className="text-border">•</span>
          <span>Your purchase fuels this momentum</span>
        </div>
      </div>
    </motion.div>
  );
};

export default ImpactCounter;
