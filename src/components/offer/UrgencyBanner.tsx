import { Flame, AlertTriangle, Users } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useUrgencyStock } from "@/hooks/useUrgencyStock";
import { useState, useEffect } from "react";

interface UrgencyBannerProps {
  variant?: "shirts" | "wristbands";
}

const CONFIG = {
  shirts: {
    total: 111,
    baseRemaining: 14,
    decayPerVisit: 2,
    floor: 3,
    label: "FREE Shirts",
    labelSingular: "shirt",
    emoji: "👕",
  },
  wristbands: {
    total: 1111,
    baseRemaining: 91,
    decayPerVisit: 9,
    floor: 7,
    label: "FREE Wristbands",
    labelSingular: "wristband",
    emoji: "📿",
  },
};

/** Animated digit counter that rolls numbers */
const AnimatedDigit = ({ value }: { value: number }) => {
  const digits = String(value).split("");
  return (
    <span className="inline-flex">
      {digits.map((d, i) => (
        <motion.span
          key={`${i}-${d}`}
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: i * 0.08, type: "spring", stiffness: 300, damping: 20 }}
          className="inline-block"
        >
          {d}
        </motion.span>
      ))}
    </span>
  );
};

/** Individual dot representing one unit */
const StockDot = ({ filled, index }: { filled: boolean; index: number }) => (
  <motion.div
    className={`w-2 h-2 rounded-full ${filled ? "bg-destructive" : "bg-destructive/20"}`}
    initial={{ scale: 0 }}
    animate={{ scale: 1 }}
    transition={{ delay: index * 0.03, type: "spring", stiffness: 400, damping: 15 }}
  />
);

/** "Someone just claimed" live ticker */
const LiveClaimTicker = ({ labelSingular }: { labelSingular: string }) => {
  const names = ["Sarah", "Mike", "Emma", "James", "Ana", "Chris", "Lisa", "David", "Maria", "Jake"];
  const cities = ["LA", "NYC", "Miami", "Chicago", "Austin", "Seattle", "Denver", "Atlanta"];
  const minutes = [2, 1, 3, 1, 2, 3, 1, 2, 3, 1];
  const [currentClaim, setCurrentClaim] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentClaim((c) => (c + 1) % names.length);
    }, 4500);
    return () => clearInterval(interval);
  }, []);

  const name = names[currentClaim];
  const city = cities[currentClaim % cities.length];
  const min = minutes[currentClaim];

  return (
    <div className="overflow-hidden h-5 relative">
      <AnimatePresence mode="wait">
        <motion.p
          key={currentClaim}
          className="text-xs text-muted-foreground text-center absolute w-full"
          initial={{ y: 16, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -16, opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          <span className="text-foreground font-semibold">{name}</span> from {city} claimed a {labelSingular}{" "}
          <span className="text-destructive font-medium">{min}m ago</span>
        </motion.p>
      </AnimatePresence>
    </div>
  );
};

const UrgencyBanner = ({ variant = "shirts" }: UrgencyBannerProps) => {
  const cfg = CONFIG[variant];
  const { remaining, total, claimedPercent } = useUrgencyStock(
    cfg.total,
    cfg.baseRemaining,
    cfg.decayPerVisit,
    cfg.floor
  );
  const [viewerCount] = useState(() => Math.floor(Math.random() * 8) + 12);

  const isLow = remaining <= 10;
  const isCritical = remaining <= 5;
  const dotCount = Math.min(remaining, 20); // Show max 20 dots

  return (
    <motion.div
      className={`w-full rounded-xl border-2 p-4 mb-3 relative overflow-hidden ${
        isCritical
          ? "border-destructive bg-destructive/10"
          : isLow
          ? "border-destructive/50 bg-destructive/5"
          : "border-destructive/30 bg-destructive/5"
      }`}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4 }}
    >
      {/* Pulsing background glow for critical stock */}
      {isCritical && (
        <motion.div
          className="absolute inset-0 bg-destructive/5 rounded-xl"
          animate={{ opacity: [0.3, 0.8, 0.3] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
        />
      )}

      <div className="relative z-10">
        {/* Top line — alert icon + main message */}
        <div className="flex items-center justify-center gap-2 mb-2">
          {isCritical ? (
            <AlertTriangle className="w-5 h-5 text-destructive animate-bounce" />
          ) : (
            <Flame className="w-5 h-5 text-destructive animate-pulse" />
          )}
          <p className={`font-black text-destructive ${isCritical ? "text-base" : "text-sm"}`}>
            {isCritical ? "⚠️ ALMOST GONE — " : ""}
            Only <AnimatedDigit value={remaining} /> of {total.toLocaleString()} {cfg.label} Left!
          </p>
          {isCritical ? (
            <AlertTriangle className="w-5 h-5 text-destructive animate-bounce" />
          ) : (
            <Flame className="w-5 h-5 text-destructive animate-pulse" />
          )}
        </div>

        {/* Visual stock dots */}
        <div className="flex items-center justify-center gap-1 mb-2 flex-wrap">
          {Array.from({ length: dotCount }).map((_, i) => (
            <StockDot key={i} filled={true} index={i} />
          ))}
          {Array.from({ length: Math.min(20 - dotCount, 20) }).map((_, i) => (
            <StockDot key={`empty-${i}`} filled={false} index={dotCount + i} />
          ))}
        </div>

        {/* Progress bar with gradient */}
        <div className="w-full h-3 bg-destructive/10 rounded-full overflow-hidden mb-2">
          <motion.div
            className="h-full rounded-full relative"
            style={{
              background: `linear-gradient(90deg, hsl(var(--destructive)), hsl(var(--destructive) / 0.7))`,
            }}
            initial={{ width: 0 }}
            animate={{ width: `${claimedPercent}%` }}
            transition={{ duration: 1.5, ease: "easeOut" }}
          >
            {/* Shimmer effect */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
              animate={{ x: ["-100%", "200%"] }}
              transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
            />
          </motion.div>
        </div>

        {/* Claimed percentage */}
        <p className="text-xs font-semibold text-destructive text-center mb-1.5">
          🔥 {claimedPercent}% claimed — once they're gone, they're gone
        </p>

        {/* Live claim ticker */}
        <div className="flex items-center justify-center gap-1.5">
          <motion.div
            className="w-2 h-2 rounded-full bg-primary"
            animate={{ scale: [1, 1.4, 1], opacity: [1, 0.6, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          />
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Users className="w-3 h-3" />
            <span className="font-medium">
              {viewerCount} people viewing now
            </span>
          </div>
        </div>
        <LiveClaimTicker labelSingular={cfg.labelSingular} />
      </div>
    </motion.div>
  );
};

export default UrgencyBanner;
