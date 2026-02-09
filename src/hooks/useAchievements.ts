import { useState, useEffect, useCallback, useMemo } from "react";
import { ACHIEVEMENTS, type Achievement, type AchievementStats } from "@/data/achievements";
import { useGamificationStats } from "@/hooks/useGamificationStats";

const STORAGE_KEY = "achievements-unlocked";
const PURCHASES_KEY = "achievements-purchases";
const SHARES_KEY = "achievements-shares";

interface UnlockedBadge {
  achievementId: string;
  unlockedAt: string;
}

function loadUnlocked(): UnlockedBadge[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return [];
}

function saveUnlocked(badges: UnlockedBadge[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(badges));
}

function loadPurchases(): string[] {
  try {
    const raw = localStorage.getItem(PURCHASES_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return [];
}

function loadShares(): number {
  try {
    const raw = localStorage.getItem(SHARES_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return 0;
}

export function useAchievements() {
  const { stats } = useGamificationStats();
  const [unlocked, setUnlocked] = useState<UnlockedBadge[]>(loadUnlocked);
  const [newlyUnlocked, setNewlyUnlocked] = useState<Achievement | null>(null);
  // Track purchases & shares in state so changes trigger re-evaluation
  const [purchases, setPurchases] = useState<string[]>(loadPurchases);
  const [sharesCount, setSharesCount] = useState<number>(loadShares);

  // Build stats object for condition evaluation
  const achievementStats: AchievementStats = useMemo(() => {
    const funnelRaw = localStorage.getItem("funnel-progress");
    const funnel = funnelRaw ? JSON.parse(funnelRaw) : { completedSteps: [], totalXp: 0 };

    return {
      blessedCoins: stats.blessedCoins,
      hearts: stats.hearts,
      streak: stats.streak,
      mealsImpact: stats.mealsImpact,
      wristbandsImpact: stats.wristbandsImpact,
      friendsBlessed: stats.friendsBlessed,
      totalXp: funnel.totalXp || 0,
      completedSteps: funnel.completedSteps || [],
      sharesCount,
      purchaseTiers: purchases,
    };
  }, [stats, purchases, sharesCount]);

  // Check for newly unlocked achievements
  useEffect(() => {
    const unlockedIds = new Set(unlocked.map((u) => u.achievementId));
    const newBadges: UnlockedBadge[] = [];

    for (const achievement of ACHIEVEMENTS) {
      if (unlockedIds.has(achievement.id)) continue;
      try {
        if (achievement.condition(achievementStats)) {
          newBadges.push({
            achievementId: achievement.id,
            unlockedAt: new Date().toISOString(),
          });
        }
      } catch {}
    }

    if (newBadges.length > 0) {
      const updated = [...unlocked, ...newBadges];
      setUnlocked(updated);
      saveUnlocked(updated);

      // Show the first newly unlocked one
      const first = ACHIEVEMENTS.find((a) => a.id === newBadges[0].achievementId);
      if (first) setNewlyUnlocked(first);
    }
  }, [achievementStats]); // eslint-disable-line react-hooks/exhaustive-deps

  const dismissNewlyUnlocked = useCallback(() => {
    setNewlyUnlocked(null);
  }, []);

  /** Record a purchase tier for achievement tracking */
  const recordPurchase = useCallback((tier: string) => {
    setPurchases((prev) => {
      if (prev.includes(tier)) return prev;
      const updated = [...prev, tier];
      localStorage.setItem(PURCHASES_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  /** Record a share action */
  const recordShare = useCallback(() => {
    setSharesCount((prev) => {
      const updated = prev + 1;
      localStorage.setItem(SHARES_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  const unlockedIds = useMemo(() => new Set(unlocked.map((u) => u.achievementId)), [unlocked]);

  const allAchievements = useMemo(() =>
    ACHIEVEMENTS.map((a) => ({
      ...a,
      isUnlocked: unlockedIds.has(a.id),
      unlockedAt: unlocked.find((u) => u.achievementId === a.id)?.unlockedAt ?? null,
    })),
    [unlockedIds, unlocked]
  );

  return {
    achievements: allAchievements,
    unlockedCount: unlocked.length,
    totalCount: ACHIEVEMENTS.length,
    newlyUnlocked,
    dismissNewlyUnlocked,
    recordPurchase,
    recordShare,
  };
}
