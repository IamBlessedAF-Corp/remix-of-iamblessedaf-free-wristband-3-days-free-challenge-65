import { motion, AnimatePresence } from "framer-motion";
import { Zap } from "lucide-react";
import { useFunnelProgress } from "@/hooks/useFunnelProgress";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const FunnelProgressBar = () => {
  const { currentStep, totalXp, xpJustEarned } = useFunnelProgress();

  if (!currentStep) return null;

  return (
    <div className="bg-card/80 backdrop-blur-sm border-b border-border/50">
      <div className="container mx-auto px-3 py-1.5">
        <div className="flex items-center gap-2">
          {/* XP counter with tooltip */}
          <TooltipProvider delayDuration={200}>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground shrink-0 cursor-help">
                  <Zap className="w-3.5 h-3.5 text-primary" />
                  <span className="font-bold text-foreground tabular-nums">{totalXp.toLocaleString()}</span>
                  <span>XP</span>
                </div>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="text-xs max-w-[200px] text-center">
                Experience points you earn by exploring the funnel, sharing, and making purchases. The more XP, the more rewards you unlock!
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

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
