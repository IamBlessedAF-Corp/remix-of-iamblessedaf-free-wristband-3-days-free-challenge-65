import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Flame, Heart, Globe, Users, ChevronDown, ChevronUp, Zap } from "lucide-react";
import { useGamificationStats } from "@/hooks/useGamificationStats";
import { useFunnelProgress } from "@/hooks/useFunnelProgress";
import BcCoinButton from "@/components/gamification/BcCoinButton";
import TrophyCase from "@/components/gamification/TrophyCase";

/** Animated rolling number */
function RollingNumber({ value, className = "" }: { value: number; className?: string }) {
  const [display, setDisplay] = useState(value);

  useEffect(() => {
    if (display === value) return;
    const diff = value - display;
    const step = diff > 0 ? Math.max(1, Math.ceil(diff / 12)) : Math.min(-1, Math.floor(diff / 12));
    const id = setTimeout(() => setDisplay((d) => {
      const next = d + step;
      return diff > 0 ? Math.min(next, value) : Math.max(next, value);
    }), 40);
    return () => clearTimeout(id);
  }, [display, value]);

  return <span className={className}>{display.toLocaleString()}</span>;
}

/** Live activity ticker messages */
const tickerMessages = [
  "🎁 Sarah from TX just blessed a friend",
  "🍽️ 11 meals donated moments ago",
  "🔥 Mark from CA hit a 7-day streak",
  "📿 Lisa claimed 3 wristbands",
  "🙏 2,340+ challengers and counting",
  "💛 A new blessing just confirmed",
  "🎉 Emily from NY won the weekly draw",
  "🪙 +50 BC earned by Juan from FL",
];

const GamificationHeader = () => {
  const { stats } = useGamificationStats();
  const { totalXp, xpJustEarned } = useFunnelProgress();
  const [tickerIndex, setTickerIndex] = useState(0);
  const [expanded, setExpanded] = useState(false);

  const toggle = useCallback(() => setExpanded((e) => !e), []);

  // Rotate ticker messages every 4s
  useEffect(() => {
    const id = setInterval(() => {
      setTickerIndex((i) => (i + 1) % tickerMessages.length);
    }, 4000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="sticky top-0 z-50 w-full">
      {/* ── Primary bar: slim, focused ── */}
      <div className="bg-foreground/95 backdrop-blur-md text-background">
        <div className="container mx-auto px-3">
          <div className="flex items-center justify-between h-9 gap-1.5 text-xs font-medium">
            {/* Left: BC coins — the #1 action driver */}
            <BcCoinButton balance={stats.blessedCoins} />

            {/* Center: rotating social proof ticker */}
            <div className="flex-1 min-w-0 overflow-hidden mx-2">
              <AnimatePresence mode="wait">
                <motion.p
                  key={tickerIndex}
                  className="text-[10px] text-center whitespace-nowrap truncate opacity-70"
                  initial={{ y: 10, opacity: 0 }}
                  animate={{ y: 0, opacity: 0.7 }}
                  exit={{ y: -10, opacity: 0 }}
                  transition={{ duration: 0.25 }}
                >
                  {tickerMessages[tickerIndex]}
                </motion.p>
              </AnimatePresence>
            </div>

            {/* Right: streak (loss aversion) + expand toggle */}
            <div className="flex items-center gap-2 shrink-0">
              {/* Streak */}
              <div className="flex items-center gap-0.5">
                <Flame className="w-3.5 h-3.5 text-orange-400" />
                <span className="font-bold tabular-nums">{stats.streak}</span>
              </div>

              {/* Live dot */}
              <span className="relative flex h-1.5 w-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500" />
              </span>

              {/* Expand/collapse */}
              <button
                onClick={toggle}
                className="p-0.5 rounded hover:bg-background/10 transition-colors"
                aria-label={expanded ? "Collapse stats" : "Expand stats"}
              >
                {expanded ? (
                  <ChevronUp className="w-3.5 h-3.5 opacity-60" />
                ) : (
                  <ChevronDown className="w-3.5 h-3.5 opacity-60" />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── Expandable stats drawer ── */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            className="overflow-hidden bg-card border-b border-border"
          >
            <div className="container mx-auto px-3 py-3">
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
                {/* Hearts */}
                <StatTile
                  icon={<Heart className="w-4 h-4 text-primary fill-primary" />}
                  value={stats.hearts}
                  label="Hearts"
                />

                {/* Meals impact */}
                <StatTile
                  icon={<span className="text-base">🍽️</span>}
                  value={stats.mealsImpact}
                  label={stats.mealsImpact === 1 ? "Person fed" : "People fed"}
                />

                {/* Global blessings */}
                <StatTile
                  icon={<Globe className="w-4 h-4 text-emerald-500" />}
                  value={stats.globalBlessings}
                  label="Global"
                />

                {/* Live users */}
                <StatTile
                  icon={<Users className="w-4 h-4 text-muted-foreground" />}
                  value={stats.livePeopleOnline}
                  label="Online now"
                  live
                />

                {/* XP */}
                <StatTile
                  icon={<Zap className="w-4 h-4 text-primary" />}
                  value={totalXp}
                  label="XP earned"
                />
              </div>

              {/* Trophy case link */}
              <div className="mt-3 flex justify-center">
                <TrophyCase />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Ultra-slim XP progress line (2px) ── */}
      {totalXp > 0 && (
        <div className="h-0.5 bg-secondary relative overflow-hidden">
          <motion.div
            className="absolute inset-y-0 left-0 bg-primary"
            initial={{ width: 0 }}
            animate={{ width: `${Math.min((totalXp / 500) * 100, 100)}%` }}
            transition={{ duration: 1, ease: "easeOut" }}
          />
        </div>
      )}

      {/* ── XP earned popup (floats top-right when XP is gained) ── */}
      <AnimatePresence>
        {xpJustEarned && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.8 }}
            className="absolute top-10 right-4 flex items-center gap-1 bg-primary text-primary-foreground px-2.5 py-1 rounded-full text-[11px] font-bold shadow-lg z-50"
          >
            <Zap className="w-3 h-3" />
            +{xpJustEarned} XP!
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

/** Reusable stat tile for the expanded drawer */
function StatTile({
  icon,
  value,
  label,
  live,
}: {
  icon: React.ReactNode;
  value: number;
  label: string;
  live?: boolean;
}) {
  return (
    <div className="flex flex-col items-center gap-1 py-1.5">
      <div className="flex items-center gap-1">
        {icon}
        <span className="font-bold text-sm tabular-nums text-foreground">
          <RollingNumber value={value} />
        </span>
      </div>
      <span className="text-[10px] text-muted-foreground leading-tight flex items-center gap-1">
        {live && (
          <span className="relative flex h-1.5 w-1.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500" />
          </span>
        )}
        {label}
      </span>
    </div>
  );
}

export default GamificationHeader;
