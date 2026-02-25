import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight, TrendingUp, Heart, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";

interface GratitudeMicroWinProps {
  onContinue: () => void;
}

const GratitudeMicroWin = ({ onContinue }: GratitudeMicroWinProps) => {
  const [score, setScore] = useState(0);
  const targetScore = 78; // Simulated gratitude score

  useEffect(() => {
    const timer = setTimeout(() => {
      const interval = setInterval(() => {
        setScore((prev) => {
          if (prev >= targetScore) {
            clearInterval(interval);
            return targetScore;
          }
          return prev + 2;
        });
      }, 30);
      return () => clearInterval(interval);
    }, 600);
    return () => clearTimeout(timer);
  }, []);

  const friendName = localStorage.getItem("gratitude_friend_1") || "your friend";

  return (
    <motion.div
      className="space-y-6 max-w-lg mx-auto"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Celebration header */}
      <motion.div
        className="text-center"
        initial={{ scale: 0.8 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", delay: 0.2 }}
      >
        <motion.div
          className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4"
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
        >
          <Sparkles className="w-10 h-10 text-primary" />
        </motion.div>
        <h2 className="text-2xl md:text-3xl font-extrabold text-foreground leading-tight">
          You Just Activated Your{" "}
          <span className="text-primary">Gratitude Circuit</span> 🧠
        </h2>
      </motion.div>

      {/* Animated score */}
      <motion.div
        className="bg-card border border-border/50 rounded-2xl p-6 text-center shadow-soft"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground font-semibold mb-2">
          Your Gratitude Activation Score
        </p>
        <div className="flex items-center justify-center gap-2 mb-3">
          <TrendingUp className="w-6 h-6 text-primary" />
          <span className="text-5xl font-black text-primary">{score}</span>
          <span className="text-lg text-muted-foreground font-semibold">/100</span>
        </div>

        {/* Progress bar */}
        <div className="w-full bg-muted rounded-full h-3 mb-3 overflow-hidden">
          <motion.div
            className="bg-primary h-full rounded-full"
            initial={{ width: "0%" }}
            animate={{ width: `${score}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>

        <p className="text-sm text-foreground font-semibold">
          {score >= 70 ? "🔥 Above Average!" : "Building momentum..."}
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          By naming {friendName} and expressing gratitude, you triggered a dopamine + serotonin release in your brain.
        </p>
      </motion.div>

      {/* Science micro-insight */}
      <motion.div
        className="bg-accent/50 border border-primary/20 rounded-xl p-4 space-y-2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
      >
        <div className="flex items-center gap-2">
          <Heart className="w-4 h-4 text-primary" />
          <p className="text-sm font-bold text-foreground">Here's What Just Happened</p>
        </div>
        <p className="text-sm text-muted-foreground leading-relaxed">
          According to Huberman's research, just <span className="font-semibold text-foreground">thinking about someone you're grateful for</span> activates
          your prefrontal cortex and releases serotonin. But wearing a <span className="font-semibold text-foreground">physical reminder</span> makes this happen
          <span className="text-primary font-bold"> 4-7× more often per day</span>.
        </p>
      </motion.div>

      {/* Bridge to upsell */}
      <motion.div
        className="text-center space-y-2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.0 }}
      >
        <p className="text-sm text-muted-foreground">
          Imagine if <span className="font-semibold text-foreground">{friendName}</span> wore one too.
          Every time they look at their wrist, they'd think of you — and BOTH your brains would reward you.
        </p>
        <p className="text-xs text-primary font-semibold">
          That's the Gratitude Loop™ — and it's backed by the Harvard Grant Study.
        </p>
      </motion.div>

      {/* CTA */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.2 }}
      >
        <Button
          onClick={onContinue}
          className="w-full h-14 text-base md:text-lg font-bold btn-glow animate-pulse-glow rounded-xl"
        >
          <Sparkles className="w-5 h-5 mr-2 flex-shrink-0" />
          See How to Amplify This 27×
          <ArrowRight className="w-5 h-5 ml-2 flex-shrink-0" />
        </Button>
      </motion.div>
    </motion.div>
  );
};

export default GratitudeMicroWin;
