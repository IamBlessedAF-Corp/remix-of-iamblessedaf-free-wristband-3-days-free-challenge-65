import { describe, it, expect } from "vitest";
import { TIER_REWARDS } from "@/hooks/useGamificationStats";
import type { OfferTier } from "@/hooks/useGamificationStats";

/**
 * Checkout Tier Mapping & Pricing Tests
 * Validates tier configurations, downsell logic, and price consistency.
 */

const ALL_TIERS: OfferTier[] = [
  "free-wristband",
  "wristband-22",
  "pack-111",
  "starter-67",
  "pack-444",
  "pack-1111",
  "pack-4444",
  "monthly-11",
];

// Stripe price mapping (mirrors create-checkout edge function)
const TIER_PRICE_MAP: Record<string, number> = {
  "free-wristband": 0,
  "wristband-22": 2200,
  "starter-67": 6700,
  "pack-111": 11100,
  "pack-444": 44400,
  "pack-1111": 111100,
  "pack-4444": 444400,
  "monthly-11": 1100,
};

describe("Checkout tier coverage", () => {
  it("every OfferTier has a TIER_REWARDS entry", () => {
    ALL_TIERS.forEach((tier) => {
      expect(TIER_REWARDS[tier], `Missing TIER_REWARDS for ${tier}`).toBeDefined();
    });
  });

  it("every OfferTier has a price mapping", () => {
    ALL_TIERS.forEach((tier) => {
      expect(TIER_PRICE_MAP[tier] !== undefined, `Missing price for ${tier}`).toBe(true);
    });
  });

  it("prices are non-negative", () => {
    Object.entries(TIER_PRICE_MAP).forEach(([tier, price]) => {
      expect(price, `Negative price for ${tier}`).toBeGreaterThanOrEqual(0);
    });
  });
});

describe("Downsell pricing hierarchy", () => {
  it("starter-67 is cheaper than pack-111 (downsell)", () => {
    expect(TIER_PRICE_MAP["starter-67"]).toBeLessThan(TIER_PRICE_MAP["pack-111"]);
  });

  it("monthly-11 is cheapest paid tier", () => {
    const paidPrices = Object.entries(TIER_PRICE_MAP)
      .filter(([tier]) => tier !== "free-wristband")
      .map(([, price]) => price);
    expect(TIER_PRICE_MAP["monthly-11"]).toBe(Math.min(...paidPrices));
  });

  it("pack price order: 111 < 444 < 1111 < 4444", () => {
    expect(TIER_PRICE_MAP["pack-111"]).toBeLessThan(TIER_PRICE_MAP["pack-444"]);
    expect(TIER_PRICE_MAP["pack-444"]).toBeLessThan(TIER_PRICE_MAP["pack-1111"]);
    expect(TIER_PRICE_MAP["pack-1111"]).toBeLessThan(TIER_PRICE_MAP["pack-4444"]);
  });
});

describe("Tier reward consistency", () => {
  it("wristband counts are reasonable", () => {
    ALL_TIERS.forEach((tier) => {
      const r = TIER_REWARDS[tier];
      expect(r.wristbands, `${tier} wristbands`).toBeGreaterThanOrEqual(0);
      expect(r.wristbands, `${tier} wristbands too high`).toBeLessThanOrEqual(500);
    });
  });

  it("meal counts scale with price", () => {
    expect(TIER_REWARDS["pack-444"].meals).toBeGreaterThan(TIER_REWARDS["pack-111"].meals);
    expect(TIER_REWARDS["pack-1111"].meals).toBeGreaterThan(TIER_REWARDS["pack-444"].meals);
    expect(TIER_REWARDS["pack-4444"].meals).toBeGreaterThan(TIER_REWARDS["pack-1111"].meals);
  });

  it("starter-67 gives fewer coins than pack-111", () => {
    expect(TIER_REWARDS["starter-67"].coins).toBeLessThan(TIER_REWARDS["pack-111"].coins);
  });
});
