import { Flame } from "lucide-react";
import { motion } from "framer-motion";

interface UrgencyBannerProps {
  totalShirts?: number;
  remaining?: number;
}

const UrgencyBanner = ({ totalShirts = 111, remaining = 14 }: UrgencyBannerProps) => {
  const claimedPercent = Math.round(((totalShirts - remaining) / totalShirts) * 100);

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
          Only {remaining} of {totalShirts} FREE Shirts Left!
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
