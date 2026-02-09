/**
 * Achievement Badge definitions — the collectible card system.
 * Categories: purchase, impact, engagement, streak
 * Unlock conditions are evaluated client-side against gamification stats.
 */

export interface Achievement {
  id: string;
  name: string;
  description: string;
  emoji: string;
  category: "purchase" | "impact" | "engagement" | "streak";
  rarity: "common" | "rare" | "epic" | "legendary";
  /** Condition evaluated against stats to determine if unlocked */
  condition: (stats: AchievementStats) => boolean;
  /** Reward in BC when unlocked */
  rewardBc: number;
}

export interface AchievementStats {
  blessedCoins: number;
  hearts: number;
  streak: number;
  mealsImpact: number;
  wristbandsImpact: number;
  friendsBlessed: number;
  totalXp: number;
  completedSteps: string[];
  sharesCount: number;
  purchaseTiers: string[];
}

export const ACHIEVEMENTS: Achievement[] = [
  // 🛍️ Purchase Milestones
  {
    id: "first-blessing",
    name: "First Blessing",
    description: "Complete your first purchase",
    emoji: "🙏",
    category: "purchase",
    rarity: "common",
    condition: (s) => s.purchaseTiers.length > 0,
    rewardBc: 25,
  },
  {
    id: "generous-soul",
    name: "Generous Soul",
    description: "Spend $100+ total across all tiers",
    emoji: "💝",
    category: "purchase",
    rarity: "rare",
    condition: (s) => s.purchaseTiers.includes("pack-111") || s.purchaseTiers.includes("pack-444"),
    rewardBc: 50,
  },
  {
    id: "abundance-mindset",
    name: "Abundance Mindset",
    description: "Unlock the $444 Premium Pack",
    emoji: "✨",
    category: "purchase",
    rarity: "epic",
    condition: (s) => s.purchaseTiers.includes("pack-444"),
    rewardBc: 100,
  },
  {
    id: "kingdom-ambassador",
    name: "Kingdom Ambassador",
    description: "Unlock the $1,111 Kingdom Pack",
    emoji: "👑",
    category: "purchase",
    rarity: "legendary",
    condition: (s) => s.purchaseTiers.includes("pack-1111"),
    rewardBc: 250,
  },
  {
    id: "legacy-builder",
    name: "Legacy Builder",
    description: "Unlock the $4,444 Ambassador Pack",
    emoji: "💎",
    category: "purchase",
    rarity: "legendary",
    condition: (s) => s.purchaseTiers.includes("pack-4444"),
    rewardBc: 500,
  },

  // 💝 Impact Milestones
  {
    id: "meal-hero",
    name: "Meal Hero",
    description: "Donate 10+ meals through your purchases",
    emoji: "🍽️",
    category: "impact",
    rarity: "common",
    condition: (s) => s.mealsImpact >= 10,
    rewardBc: 30,
  },
  {
    id: "wristband-warrior",
    name: "Wristband Warrior",
    description: "Send 3+ wristbands to friends",
    emoji: "📿",
    category: "impact",
    rarity: "rare",
    condition: (s) => s.wristbandsImpact >= 3,
    rewardBc: 40,
  },
  {
    id: "blessing-machine",
    name: "Blessing Machine",
    description: "Get 3+ blessings confirmed",
    emoji: "⚡",
    category: "impact",
    rarity: "rare",
    condition: (s) => s.friendsBlessed >= 3,
    rewardBc: 60,
  },
  {
    id: "community-pillar",
    name: "Community Pillar",
    description: "Reach 100+ Hearts impact score",
    emoji: "🏛️",
    category: "impact",
    rarity: "epic",
    condition: (s) => s.hearts >= 100,
    rewardBc: 100,
  },

  // 🔥 Engagement Milestones
  {
    id: "challenge-accepted",
    name: "Challenge Accepted",
    description: "Join the 3-Day Gratitude Challenge",
    emoji: "🚀",
    category: "engagement",
    rarity: "common",
    condition: (s) => s.completedSteps.includes("challenge"),
    rewardBc: 10,
  },
  {
    id: "share-champion",
    name: "Share Champion",
    description: "Share your journey 3+ times",
    emoji: "📣",
    category: "engagement",
    rarity: "rare",
    condition: (s) => s.sharesCount >= 3,
    rewardBc: 50,
  },
  {
    id: "portal-pioneer",
    name: "Portal Pioneer",
    description: "Unlock the Ambassador Portal",
    emoji: "🏛️",
    category: "engagement",
    rarity: "epic",
    condition: (s) => s.completedSteps.includes("portal"),
    rewardBc: 100,
  },
  {
    id: "coin-collector",
    name: "Coin Collector",
    description: "Earn 100+ Blessed Coins",
    emoji: "🪙",
    category: "engagement",
    rarity: "common",
    condition: (s) => s.blessedCoins >= 100,
    rewardBc: 25,
  },

  // 🔥 Streak Milestones
  {
    id: "on-fire",
    name: "On Fire",
    description: "Maintain a 3-day streak",
    emoji: "🔥",
    category: "streak",
    rarity: "common",
    condition: (s) => s.streak >= 3,
    rewardBc: 20,
  },
  {
    id: "7-day-streak",
    name: "Unstoppable",
    description: "Maintain a 7-day streak",
    emoji: "⚡",
    category: "streak",
    rarity: "rare",
    condition: (s) => s.streak >= 7,
    rewardBc: 50,
  },
  {
    id: "devoted",
    name: "Devoted",
    description: "Maintain a 14-day streak",
    emoji: "🌟",
    category: "streak",
    rarity: "epic",
    condition: (s) => s.streak >= 14,
    rewardBc: 100,
  },
  {
    id: "gratitude-guru",
    name: "Gratitude Guru",
    description: "Maintain a 30-day streak",
    emoji: "👑",
    category: "streak",
    rarity: "legendary",
    condition: (s) => s.streak >= 30,
    rewardBc: 250,
  },
];

export const RARITY_COLORS: Record<Achievement["rarity"], string> = {
  common: "from-slate-400 to-slate-500",
  rare: "from-blue-400 to-blue-600",
  epic: "from-purple-400 to-purple-600",
  legendary: "from-amber-400 to-amber-600",
};

export const RARITY_BORDER: Record<Achievement["rarity"], string> = {
  common: "border-slate-400/40",
  rare: "border-blue-400/40",
  epic: "border-purple-400/40",
  legendary: "border-amber-400/40",
};

export const RARITY_GLOW: Record<Achievement["rarity"], string> = {
  common: "",
  rare: "shadow-blue-500/20",
  epic: "shadow-purple-500/30",
  legendary: "shadow-amber-500/40",
};
