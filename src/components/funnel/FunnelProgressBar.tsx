import { motion, AnimatePresence } from "framer-motion";
import { Zap } from "lucide-react";
import { useFunnelProgress } from "@/hooks/useFunnelProgress";

const FunnelProgressBar = () => {
  const { currentStep, totalXp, progressPercent, xpJustEarned } = useFunnelProgress();

  if (!currentStep) return null;

  return (
    <div className="bg-card/80 backdrop-blur-sm border-b border-border/50">
      <div className="container mx-auto px-3 py-1.5">
        <div className="flex items-center gap-3">
          {/* XP counter */}
          <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground shrink-0">
            <Zap className="w-3 h-3 text-primary" />
            <span className="font-bold text-foreground tabular-nums">{totalXp.toLocaleString()}</span>
            <span>XP</span>
          </div>

          {/* Progress bar fill */}
          <div className="relative h-1.5 bg-muted rounded-full flex-1 overflow-hidden">
            <motion.div
              className="absolute inset-y-0 left-0 bg-gradient-to-r from-primary via-primary to-primary/70 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progressPercent}%` }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            />
          </div>

          {/* Percentage */}
          <span className="text-[10px] text-muted-foreground tabular-nums shrink-0">
            {progressPercent}%
          </span>

          {/* XP earned popup */}
          <AnimatePresence>
            {xpJustEarned && (
              <motion.div
                initial={{ opacity: 0, y: 8, scale: 0.8 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8, scale: 0.8 }}
                className="flex items-center gap-1 bg-primary text-primary-foreground px-2 py-0.5 rounded-full text-[10px] font-bold shadow-lg shrink-0"
              >
                <Zap className="w-3 h-3" />
                +{xpJustEarned} XP!
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default FunnelProgressBar;
