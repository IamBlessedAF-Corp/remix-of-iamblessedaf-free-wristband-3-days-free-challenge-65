import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, Zap } from "lucide-react";
import { useFunnelProgress, type FunnelStep } from "@/hooks/useFunnelProgress";
import { cn } from "@/lib/utils";

/** Compact step dot for mobile */
const StepDot = ({
  step,
  index,
  isCompleted,
  isCurrent,
  isLast,
}: {
  step: FunnelStep;
  index: number;
  isCompleted: boolean;
  isCurrent: boolean;
  isLast: boolean;
}) => (
  <div className="flex items-center">
    <div
      className={cn(
        "relative flex items-center justify-center w-6 h-6 rounded-full text-[10px] font-bold transition-all duration-300 shrink-0",
        isCompleted
          ? "bg-primary text-primary-foreground shadow-[0_0_8px_hsl(var(--primary)/0.4)]"
          : isCurrent
          ? "bg-primary/20 text-primary border-2 border-primary animate-pulse"
          : "bg-muted text-muted-foreground border border-border"
      )}
      title={step.label}
    >
      {isCompleted ? (
        <CheckCircle2 className="w-3.5 h-3.5" />
      ) : (
        <span>{step.emoji}</span>
      )}

      {/* Step label — only show on sm+ */}
      <span
        className={cn(
          "absolute -bottom-4 left-1/2 -translate-x-1/2 text-[8px] font-medium whitespace-nowrap hidden sm:block",
          isCurrent ? "text-primary font-bold" : isCompleted ? "text-foreground" : "text-muted-foreground"
        )}
      >
        {step.shortLabel}
      </span>
    </div>

    {/* Connector line */}
    {!isLast && (
      <div className="w-3 sm:w-6 h-0.5 mx-0.5">
        <div
          className={cn(
            "h-full rounded-full transition-all duration-500",
            isCompleted ? "bg-primary" : "bg-border"
          )}
        />
      </div>
    )}
  </div>
);

const FunnelProgressBar = () => {
  const {
    steps,
    completedSteps,
    currentStep,
    currentStepIndex,
    totalXp,
    progressPercent,
    xpJustEarned,
  } = useFunnelProgress();

  // Don't render on non-funnel pages
  if (!currentStep) return null;

  return (
    <div className="bg-card/80 backdrop-blur-sm border-b border-border/50">
      <div className="container mx-auto px-3 py-2">
        {/* Progress bar fill */}
        <div className="relative h-1.5 bg-muted rounded-full mb-2 overflow-hidden">
          <motion.div
            className="absolute inset-y-0 left-0 bg-gradient-to-r from-primary via-primary to-primary/70 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${progressPercent}%` }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          />
          {/* Shimmer effect */}
          <motion.div
            className="absolute inset-y-0 w-16 bg-gradient-to-r from-transparent via-white/30 to-transparent rounded-full"
            animate={{ x: ["-100%", "400%"] }}
            transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
          />
        </div>

        {/* Step dots row */}
        <div className="flex items-center justify-center">
          {steps.map((step, i) => (
            <StepDot
              key={step.id}
              step={step}
              index={i}
              isCompleted={completedSteps.includes(step.id)}
              isCurrent={currentStep?.id === step.id}
              isLast={i === steps.length - 1}
            />
          ))}
        </div>

        {/* XP bar + notification */}
        <div className="flex items-center justify-between mt-2 px-1">
          <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
            <Zap className="w-3 h-3 text-primary" />
            <span className="font-bold text-foreground tabular-nums">{totalXp.toLocaleString()}</span>
            <span>XP</span>
            <span className="text-border">•</span>
            <span className="tabular-nums">{progressPercent}%</span>
            <span>complete</span>
          </div>

          {/* XP earned popup */}
          <AnimatePresence>
            {xpJustEarned && (
              <motion.div
                initial={{ opacity: 0, y: 8, scale: 0.8 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8, scale: 0.8 }}
                className="flex items-center gap-1 bg-primary text-primary-foreground px-2 py-0.5 rounded-full text-[10px] font-bold shadow-lg"
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
