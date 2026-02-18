import { describe, it, expect } from "vitest";
import { ACHIEVEMENTS, type AchievementStats } from "@/data/achievements";

const EMPTY_STATS: AchievementStats = {
  blessedCoins: 0,
  hearts: 0,
  streak: 0,
  mealsImpact: 0,
  wristbandsImpact: 0,
  friendsBlessed: 0,
  totalXp: 0,
  completedSteps: [],
  sharesCount: 0,
  purchaseTiers: [],
};

describe("Achievement conditions", () => {
  it("no achievements are unlocked with empty stats", () => {
    ACHIEVEMENTS.forEach((a) => {
      expect(a.condition(EMPTY_STATS)).toBe(false);
    });
  });

  it("first-blessing unlocks with any purchase", () => {
    const stats: AchievementStats = { ...EMPTY_STATS, purchaseTiers: ["free-wristband"] };
    const a = ACHIEVEMENTS.find((a) => a.id === "first-blessing")!;
    expect(a.condition(stats)).toBe(true);
  });

  it("on-fire unlocks at streak >= 3", () => {
    const a = ACHIEVEMENTS.find((a) => a.id === "on-fire")!;
    expect(a.condition({ ...EMPTY_STATS, streak: 2 })).toBe(false);
    expect(a.condition({ ...EMPTY_STATS, streak: 3 })).toBe(true);
  });

  it("gratitude-guru requires streak >= 30", () => {
    const a = ACHIEVEMENTS.find((a) => a.id === "gratitude-guru")!;
    expect(a.condition({ ...EMPTY_STATS, streak: 29 })).toBe(false);
    expect(a.condition({ ...EMPTY_STATS, streak: 30 })).toBe(true);
  });

  it("meal-hero requires mealsImpact >= 10", () => {
    const a = ACHIEVEMENTS.find((a) => a.id === "meal-hero")!;
    expect(a.condition({ ...EMPTY_STATS, mealsImpact: 9 })).toBe(false);
    expect(a.condition({ ...EMPTY_STATS, mealsImpact: 10 })).toBe(true);
  });

  it("all reward BCs are positive", () => {
    ACHIEVEMENTS.forEach((a) => {
      expect(a.rewardBc).toBeGreaterThan(0);
    });
  });

  it("legendary achievements have highest BC rewards", () => {
    const legendary = ACHIEVEMENTS.filter((a) => a.rarity === "legendary");
    const common = ACHIEVEMENTS.filter((a) => a.rarity === "common");
    const maxCommon = Math.max(...common.map((a) => a.rewardBc));
    legendary.forEach((a) => {
      expect(a.rewardBc).toBeGreaterThan(maxCommon);
    });
  });
});
