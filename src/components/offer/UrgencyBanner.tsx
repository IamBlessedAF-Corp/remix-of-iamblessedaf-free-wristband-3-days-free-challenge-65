import { Flame } from "lucide-react";
import { motion } from "framer-motion";
import { useUrgencyStock } from "@/hooks/useUrgencyStock";

interface UrgencyBannerProps {
  /** What product we're showing urgency for */
  variant?: "shirts" | "wristbands";
}

const CONFIG = {
  shirts: {
    total: 111,
    baseRemaining: 14,
    decayPerVisit: 2,
    floor: 3,
    label: "FREE Shirts",
    emoji: "👕",
  },
  wristbands: {
    total: 1111,
    baseRemaining: 91,
    decayPerVisit: 9,
    floor: 7,
    label: "FREE Wristbands",
    emoji: "📿",
  },
};

const UrgencyBanner = ({ variant = "shirts" }: UrgencyBannerProps) => {
  const cfg = CONFIG[variant];
  const { remaining, total, claimedPercent } = useUrgencyStock(
    cfg.total,
    cfg.baseRemaining,
    cfg.decayPerVisit,
    cfg.floor
  );

  return (
    <motion.div
      className="w-full rounded-xl border border-destructive/30 bg-destructive/5 p-3 mb-3"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4 }}
    >
      <div className="flex items-center justify-center gap-2 mb-2">
        <Flame className="w-4 h-4 text-destructive animate-pulse" />
        <p className="text-sm font-bold text-destructive">
          Only {remaining} of {total.toLocaleString()} {cfg.label} Left!
        </p>
        <Flame className="w-4 h-4 text-destructive animate-pulse" />
      </div>

      {/* Progress bar */}
      <div className="w-full h-2.5 bg-destructive/10 rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-destructive rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${claimedPercent}%` }}
          transition={{ duration: 1.2, ease: "easeOut" }}
        />
      </div>

      <p className="text-xs text-muted-foreground text-center mt-1.5">
        🔥 {claimedPercent}% claimed — once they're gone, they're gone
      </p>
    </motion.div>
  );
};

export default UrgencyBanner;
