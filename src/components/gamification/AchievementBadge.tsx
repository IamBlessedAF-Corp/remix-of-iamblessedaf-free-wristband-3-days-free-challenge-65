import { motion } from "framer-motion";
import { Lock } from "lucide-react";
import { RARITY_COLORS, RARITY_BORDER, RARITY_GLOW, type Achievement } from "@/data/achievements";

interface AchievementBadgeProps {
  achievement: Achievement & { isUnlocked: boolean; unlockedAt: string | null };
  size?: "sm" | "md" | "lg";
  onClick?: () => void;
}

export default function AchievementBadge({ achievement, size = "md", onClick }: AchievementBadgeProps) {
  const { isUnlocked, rarity, emoji, name } = achievement;

  const sizeClasses = {
    sm: "w-16 h-20",
    md: "w-24 h-30",
    lg: "w-32 h-40",
  };

  const emojiSize = {
    sm: "text-2xl",
    md: "text-4xl",
    lg: "text-5xl",
  };

  const nameSize = {
    sm: "text-[9px]",
    md: "text-[10px]",
    lg: "text-xs",
  };

  return (
    <motion.button
      onClick={onClick}
      className={`${sizeClasses[size]} relative flex flex-col items-center justify-center gap-1 rounded-xl border-2 p-2 transition-all cursor-pointer
        ${isUnlocked
          ? `${RARITY_BORDER[rarity]} bg-gradient-to-b ${RARITY_COLORS[rarity]} bg-opacity-10 shadow-lg ${RARITY_GLOW[rarity]} hover:scale-105`
          : "border-border/30 bg-muted/30 grayscale opacity-50 hover:opacity-70"
        }`}
      whileHover={{ scale: isUnlocked ? 1.08 : 1.02 }}
      whileTap={{ scale: 0.95 }}
    >
      {/* Rarity shimmer for legendary */}
      {isUnlocked && rarity === "legendary" && (
        <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer overflow-hidden" />
      )}

      <span className={`${emojiSize[size]} ${isUnlocked ? "" : "grayscale"} select-none`}>
        {isUnlocked ? emoji : <Lock className="w-5 h-5 text-muted-foreground" />}
      </span>
      <span className={`${nameSize[size]} font-bold text-center leading-tight ${isUnlocked ? "text-white" : "text-muted-foreground"}`}>
        {name}
      </span>
    </motion.button>
  );
}
