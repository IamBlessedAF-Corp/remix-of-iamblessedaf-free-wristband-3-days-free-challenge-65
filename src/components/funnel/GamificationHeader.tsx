import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Flame, Heart, Globe, Users } from "lucide-react";
import { useGamificationStats } from "@/hooks/useGamificationStats";
import BcCoinButton from "@/components/gamification/BcCoinButton";

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
  const [tickerIndex, setTickerIndex] = useState(0);

  // Rotate ticker messages every 4s
  useEffect(() => {
    const id = setInterval(() => {
      setTickerIndex((i) => (i + 1) % tickerMessages.length);
    }, 4000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="sticky top-0 z-50 w-full">
      {/* Main stats bar */}
      <div className="bg-foreground/95 backdrop-blur-md text-background">
        <div className="container mx-auto px-3">
          <div className="flex items-center justify-between h-10 gap-2 text-xs font-medium">
            {/* Blessed Coins — clickable to open wallet */}
            <BcCoinButton balance={stats.blessedCoins} />

            {/* Hearts (Impact Score) */}
            <div className="flex items-center gap-1 shrink-0">
              <Heart className="w-3.5 h-3.5 text-primary fill-primary" />
              <RollingNumber value={stats.hearts} className="font-bold tabular-nums" />
            </div>

            {/* Meals donated */}
            <div className="flex items-center gap-1 shrink-0">
              <span className="text-sm">🍽️</span>
              <RollingNumber value={stats.mealsImpact} className="font-bold tabular-nums" />
              <span className="hidden sm:inline opacity-70 text-[10px] leading-tight max-w-[90px] truncate">
                {stats.mealsImpact === 1 ? "person" : "people"} thanked you
              </span>
            </div>

            {/* Streak */}
            <div className="flex items-center gap-1 shrink-0">
              <Flame className="w-3.5 h-3.5 text-orange-400" />
              <span className="font-bold tabular-nums">{stats.streak}</span>
              <span className="hidden sm:inline opacity-70">day</span>
            </div>

            {/* Global blessings */}
            <div className="flex items-center gap-1 shrink-0">
              <Globe className="w-3.5 h-3.5 text-emerald-400" />
              <RollingNumber value={stats.globalBlessings} className="font-bold tabular-nums" />
            </div>

            {/* Live users */}
            <div className="flex items-center gap-1 shrink-0">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
              <Users className="w-3.5 h-3.5 opacity-70" />
              <RollingNumber value={stats.livePeopleOnline} className="font-bold tabular-nums" />
            </div>
          </div>
        </div>
      </div>

      {/* Social proof ticker */}
      <div className="bg-primary/90 backdrop-blur-sm text-primary-foreground overflow-hidden">
        <div className="container mx-auto px-3 h-7 flex items-center justify-center">
          <AnimatePresence mode="wait">
            <motion.p
              key={tickerIndex}
              className="text-[11px] font-medium text-center whitespace-nowrap"
              initial={{ y: 12, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -12, opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              {tickerMessages[tickerIndex]}
            </motion.p>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default GamificationHeader;
