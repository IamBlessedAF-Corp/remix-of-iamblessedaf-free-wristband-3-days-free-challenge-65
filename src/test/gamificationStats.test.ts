import { describe, it, expect } from "vitest";
import { TIER_REWARDS } from "@/hooks/useGamificationStats";
import type { OfferTier } from "@/hooks/useGamificationStats";

describe("TIER_REWARDS constants", () => {
  const allTiers: OfferTier[] = [
    "free-wristband",
    "wristband-22",
    "pack-111",
    "pack-444",
    "pack-1111",
    "pack-4444",
    "monthly-11",
  ];

  it("has entries for all tiers", () => {
    allTiers.forEach((tier) => {
      expect(TIER_REWARDS[tier]).toBeDefined();
    });
  });

  it("all coin values are non-negative integers", () => {
    allTiers.forEach((tier) => {
      const r = TIER_REWARDS[tier];
      expect(r.coins).toBeGreaterThanOrEqual(0);
      expect(Number.isInteger(r.coins)).toBe(true);
    });
  });

  it("higher tiers yield more coins", () => {
    expect(TIER_REWARDS["pack-4444"].coins).toBeGreaterThan(TIER_REWARDS["pack-1111"].coins);
    expect(TIER_REWARDS["pack-1111"].coins).toBeGreaterThan(TIER_REWARDS["pack-444"].coins);
    expect(TIER_REWARDS["pack-444"].coins).toBeGreaterThan(TIER_REWARDS["pack-111"].coins);
  });

  it("free-wristband donates zero meals", () => {
    expect(TIER_REWARDS["free-wristband"].meals).toBe(0);
  });

  it("monthly-11 has streak enabled", () => {
    expect(TIER_REWARDS["monthly-11"].streak).toBe(true);
  });

  it("free-wristband does NOT have streak", () => {
    expect(TIER_REWARDS["free-wristband"].streak).toBe(false);
  });
});
