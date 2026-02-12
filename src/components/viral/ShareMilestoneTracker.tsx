import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Share2, Trophy, Zap, Check } from "lucide-react";
import { Progress } from "@/components/ui/progress";

/**
 * Share Milestone Tracker — gamified sharing progress bar.
 * Tracks total shares in localStorage and rewards BC at milestones.
 * 
 * Milestones: 1 share → 25 BC, 3 → 50 BC, 5 → 100 BC, 10 → 250 BC, 25 → 1000 BC
 * 
 * Hormozi lens: Reduces CAC by turning every customer into a distribution channel.
 * K-factor boost: Makes sharing feel like progress, not effort.
 */

const MILESTONES = [
  { shares: 1, reward: 25, label: "First Share" },
  { shares: 3, reward: 50, label: "Sharing Streak" },
  { shares: 5, reward: 100, label: "Social Butterfly" },
  { shares: 10, reward: 250, label: "Viral Ambassador" },
  { shares: 25, reward: 1000, label: "Legendary Spreader" },
];

const STORAGE_KEY = "viral-share-count";
const CLAIMED_KEY = "viral-milestones-claimed";

function getShareCount(): number {
  return parseInt(localStorage.getItem(STORAGE_KEY) ?? "0", 10);
}

function getClaimedMilestones(): number[] {
  try {
    return JSON.parse(localStorage.getItem(CLAIMED_KEY) ?? "[]");
  } catch {
    return [];
  }
}

/** Call this from any share action to increment the counter */
export function recordShare() {
  const count = getShareCount() + 1;
  localStorage.setItem(STORAGE_KEY, String(count));
  // Also update legacy key for missions compatibility
  localStorage.setItem("achievements-shares", String(count));
  window.dispatchEvent(new CustomEvent("share-recorded", { detail: { count } }));
}

interface Props {
  variant?: "compact" | "full";
}

export default function ShareMilestoneTracker({ variant = "full" }: Props) {
  const [shares, setShares] = useState(getShareCount);
  const [claimed, setClaimed] = useState(getClaimedMilestones);
  const [justClaimed, setJustClaimed] = useState<number | null>(null);

  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      setShares(detail?.count ?? getShareCount());
    };
    window.addEventListener("share-recorded", handler);
    return () => window.removeEventListener("share-recorded", handler);
  }, []);

  const nextMilestone = MILESTONES.find((m) => shares < m.shares && !claimed.includes(m.shares));
  const currentMilestone = MILESTONES.filter((m) => shares >= m.shares).pop();
  const claimableMilestones = MILESTONES.filter(
    (m) => shares >= m.shares && !claimed.includes(m.shares)
  );

  const claimMilestone = (milestoneShares: number) => {
    const newClaimed = [...claimed, milestoneShares];
    setClaimed(newClaimed);
    localStorage.setItem(CLAIMED_KEY, JSON.stringify(newClaimed));
    setJustClaimed(milestoneShares);
    setTimeout(() => setJustClaimed(null), 2000);

    // Dispatch BC earn event
    const milestone = MILESTONES.find((m) => m.shares === milestoneShares);
    if (milestone) {
      window.dispatchEvent(
        new CustomEvent("gamification-earn", {
          detail: { type: "coins", amount: milestone.reward, reason: `share-milestone-${milestoneShares}` },
        })
      );
    }
  };

  const progressToNext = nextMilestone
    ? Math.min((shares / nextMilestone.shares) * 100, 100)
    : 100;

  if (variant === "compact") {
    return (
      <div className="flex items-center gap-2 text-xs">
        <Share2 className="w-3.5 h-3.5 text-primary" />
        <span className="text-muted-foreground">
          {shares} share{shares !== 1 ? "s" : ""}
        </span>
        {nextMilestone && (
          <span className="text-primary font-bold">
            {nextMilestone.shares - shares} to +{nextMilestone.reward} BC
          </span>
        )}
      </div>
    );
  }

  return (
    <motion.div
      className="bg-card border border-border/50 rounded-xl p-4"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Share2 className="w-4 h-4 text-primary" />
          <h3 className="text-sm font-bold text-foreground">Share Milestones</h3>
        </div>
        <span className="text-xs text-muted-foreground">
          {shares} total share{shares !== 1 ? "s" : ""}
        </span>
      </div>

      {/* Progress to next milestone */}
      {nextMilestone && (
        <div className="mb-3">
          <div className="flex items-center justify-between text-[10px] mb-1">
            <span className="text-muted-foreground">
              Next: {nextMilestone.label}
            </span>
            <span className="text-primary font-bold">
              +{nextMilestone.reward} BC
            </span>
          </div>
          <Progress value={progressToNext} className="h-2" />
          <p className="text-[10px] text-muted-foreground mt-1">
            {nextMilestone.shares - shares} more share{nextMilestone.shares - shares !== 1 ? "s" : ""} to go
          </p>
        </div>
      )}

      {/* Claimable milestones */}
      <AnimatePresence>
        {claimableMilestones.map((m) => (
          <motion.button
            key={m.shares}
            onClick={() => claimMilestone(m.shares)}
            className="w-full flex items-center justify-between bg-primary/10 border border-primary/20 rounded-lg p-3 mb-2 hover:bg-primary/15 transition-colors"
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
          >
            <div className="flex items-center gap-2">
              <Trophy className="w-4 h-4 text-primary" />
              <span className="text-sm font-bold text-foreground">{m.label}</span>
            </div>
            <div className="flex items-center gap-1 text-xs font-bold text-primary">
              {justClaimed === m.shares ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  Claimed!
                </>
              ) : (
                <>
                  <Zap className="w-3.5 h-3.5" />
                  Claim +{m.reward} BC
                </>
              )}
            </div>
          </motion.button>
        ))}
      </AnimatePresence>

      {/* Milestone ladder */}
      <div className="flex items-center gap-1 mt-2">
        {MILESTONES.map((m) => {
          const done = shares >= m.shares;
          const isClaimed = claimed.includes(m.shares);
          return (
            <div
              key={m.shares}
              className={`flex-1 h-1.5 rounded-full transition-colors ${
                done
                  ? isClaimed
                    ? "bg-primary"
                    : "bg-primary/60 animate-pulse"
                  : "bg-secondary"
              }`}
              title={`${m.shares} shares → +${m.reward} BC`}
            />
          );
        })}
      </div>
    </motion.div>
  );
}
