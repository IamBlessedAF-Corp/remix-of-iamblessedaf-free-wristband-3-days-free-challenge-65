import { motion } from "framer-motion";
import { Rocket, Zap, Upload, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
  totalClips: number;
  clipsToday: number;
  onSubmitClip: () => void;
}

/**
 * Behavioral activation triggers:
 * - 0 clips ever → "First Clip Dopamine Trigger"
 * - 1 clip in last 24h → "Second Clip Urgency Trigger"
 * - 2+ clips today → hidden (user is activated)
 */
const ClipperActivationTrigger = ({ totalClips, clipsToday, onSubmitClip }: Props) => {
  // First-clip dopamine: user has never submitted
  if (totalClips === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        className="rounded-2xl border-2 border-primary/40 bg-primary/5 p-5"
      >
        <div className="text-center space-y-3">
          <div className="w-12 h-12 rounded-xl bg-primary/15 flex items-center justify-center mx-auto">
            <Rocket className="w-6 h-6 text-primary" />
          </div>
          <div>
            <p className="text-lg font-bold text-foreground">Post your first clip to activate</p>
            <p className="text-sm text-muted-foreground mt-1">
              One clip is all it takes. Your sprint begins the moment you start.
            </p>
          </div>
          <Button
            size="lg"
            onClick={onSubmitClip}
            className="w-full h-13 font-bold rounded-xl text-base"
          >
            <Upload className="w-4 h-4 mr-2" />
            Start My First Clip
          </Button>
          <p className="text-xs text-muted-foreground">Takes less than 5 minutes to begin.</p>
        </div>
      </motion.div>
    );
  }

  // First clip uploaded → dopamine hit
  if (totalClips === 1 && clipsToday >= 1) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl border-2 border-primary/40 bg-primary/5 p-5"
      >
        <div className="text-center space-y-3">
          <p className="text-2xl">🎉</p>
          <div>
            <p className="text-lg font-bold text-foreground">You're In.</p>
            <p className="text-sm text-muted-foreground mt-1">
              Sprint 1 is now active. Post 2 more clips today to build real momentum.
            </p>
          </div>
          <div className="flex items-center justify-center gap-1.5">
            {[1, 2, 3].map((n) => (
              <div
                key={n}
                className={`w-8 h-2 rounded-full transition-all ${
                  n <= clipsToday ? "bg-primary" : "bg-secondary"
                }`}
              />
            ))}
          </div>
          <p className="text-xs text-muted-foreground">
            {Math.max(0, 3 - clipsToday)} more clip{3 - clipsToday !== 1 ? "s" : ""} to hit today's target
          </p>
          <Button onClick={onSubmitClip} className="w-full h-12 font-bold rounded-xl">
            <Upload className="w-4 h-4 mr-2" />
            Submit Clip #{clipsToday + 1}
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </motion.div>
    );
  }

  // Second clip urgency: 1 clip total but not today, or 1 clip today and total > 1
  if (clipsToday <= 1 && totalClips >= 1) {
    const clipsRemaining = Math.max(0, 3 - clipsToday);
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl border border-amber-500/30 bg-amber-500/5 p-5"
      >
        <div className="text-center space-y-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/15 flex items-center justify-center mx-auto">
            <Zap className="w-5 h-5 text-amber-400" />
          </div>
          <div>
            <p className="font-bold text-foreground">Momentum Window Open</p>
            <p className="text-sm text-muted-foreground mt-1">
              Post {clipsRemaining} more clip{clipsRemaining !== 1 ? "s" : ""} today to stay on pace for your weekly target.
            </p>
          </div>
          <div className="flex items-center justify-center gap-1.5">
            {[1, 2, 3].map((n) => (
              <div
                key={n}
                className={`w-8 h-2 rounded-full transition-all ${
                  n <= clipsToday ? "bg-primary" : "bg-secondary"
                }`}
              />
            ))}
          </div>
          <Button onClick={onSubmitClip} className="w-full h-12 font-bold rounded-xl">
            <Upload className="w-4 h-4 mr-2" />
            Submit a Clip
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </motion.div>
    );
  }

  // Activated — don't show this component
  return null;
};

export default ClipperActivationTrigger;
