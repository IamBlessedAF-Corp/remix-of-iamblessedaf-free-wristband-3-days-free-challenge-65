import { describe, it, expect } from "vitest";
import { TIER_REWARDS } from "@/hooks/useGamificationStats";
import type { OfferTier } from "@/hooks/useGamificationStats";

const ALL_TIERS: OfferTier[] = [
  "free-wristband", "wristband-22", "pack-111", "pack-444", "pack-1111", "pack-4444", "monthly-11",
];

describe("TIER_REWARDS integrity", () => {
  it("covers every tier", () => {
    ALL_TIERS.forEach((tier) => {
      expect(TIER_REWARDS[tier]).toBeDefined();
    });
  });

  it("coins scale upward with tier price", () => {
    expect(TIER_REWARDS["pack-4444"].coins).toBeGreaterThan(TIER_REWARDS["pack-1111"].coins);
    expect(TIER_REWARDS["pack-1111"].coins).toBeGreaterThan(TIER_REWARDS["pack-444"].coins);
    expect(TIER_REWARDS["pack-444"].coins).toBeGreaterThan(TIER_REWARDS["pack-111"].coins);
    expect(TIER_REWARDS["pack-111"].coins).toBeGreaterThan(TIER_REWARDS["wristband-22"].coins);
    expect(TIER_REWARDS["wristband-22"].coins).toBeGreaterThan(TIER_REWARDS["free-wristband"].coins);
  });

  it("hearts scale upward with tier price", () => {
    expect(TIER_REWARDS["pack-4444"].hearts).toBeGreaterThan(TIER_REWARDS["pack-1111"].hearts);
    expect(TIER_REWARDS["pack-1111"].hearts).toBeGreaterThan(TIER_REWARDS["pack-444"].hearts);
  });

  it("meals are non-negative for all tiers", () => {
    ALL_TIERS.forEach((tier) => {
      expect(TIER_REWARDS[tier].meals).toBeGreaterThanOrEqual(0);
    });
  });

  it("wristbands are non-negative integers", () => {
    ALL_TIERS.forEach((tier) => {
      expect(TIER_REWARDS[tier].wristbands).toBeGreaterThanOrEqual(0);
      expect(Number.isInteger(TIER_REWARDS[tier].wristbands)).toBe(true);
    });
  });

  it("free-wristband has 0 meals and no streak", () => {
    expect(TIER_REWARDS["free-wristband"].meals).toBe(0);
    expect(TIER_REWARDS["free-wristband"].streak).toBe(false);
  });

  it("premium tiers enable streak", () => {
    expect(TIER_REWARDS["pack-111"].streak).toBe(true);
    expect(TIER_REWARDS["pack-444"].streak).toBe(true);
    expect(TIER_REWARDS["pack-1111"].streak).toBe(true);
    expect(TIER_REWARDS["pack-4444"].streak).toBe(true);
  });

  it("each tier has exactly 6 reward keys", () => {
    ALL_TIERS.forEach((tier) => {
      expect(Object.keys(TIER_REWARDS[tier])).toHaveLength(6);
    });
  });
});
