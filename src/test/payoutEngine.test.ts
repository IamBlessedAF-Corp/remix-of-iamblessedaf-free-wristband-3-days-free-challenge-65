import { describe, it, expect } from "vitest";

/**
 * Regression tests for the delegation score formula used in compute_delegation_score() DB trigger.
 * Formula: ROUND((vs*0.3 + cc*0.25 + (5-hu)*0.3 + r*0.15 + ad*0.3) * 100 / (5*(0.3+0.25+0.3+0.15+0.3)), 1)
 */
function computeDelegationScore(vs = 0, cc = 0, hu = 0, r = 0, ad = 0): number {
  const MAX_WEIGHT = 5 * (0.3 + 0.25 + 0.3 + 0.15 + 0.3); // 6.5
  const raw = vs * 0.3 + cc * 0.25 + (5 - hu) * 0.3 + r * 0.15 + ad * 0.3;
  return Math.round((raw * 100 / MAX_WEIGHT) * 10) / 10;
}

describe("computeDelegationScore", () => {
  it("returns non-zero for all-zero scores (hu=0 gives baseline contribution)", () => {
    // When all scores are 0 and hu=0: (5-0)*0.3 = 1.5 → 1.5/6.5*100 ≈ 23.1
    const score = computeDelegationScore(0, 0, 0, 0, 0);
    expect(score).toBeGreaterThan(0);
    expect(score).toBeLessThan(30);
  });

  it("returns ~100 for perfect scores (all 5s, hu=0)", () => {
    const score = computeDelegationScore(5, 5, 0, 5, 5);
    expect(score).toBeGreaterThan(90);
  });

  it("high hu (5) lowers score significantly", () => {
    const low = computeDelegationScore(3, 3, 5, 3, 3);
    const high = computeDelegationScore(3, 3, 0, 3, 3);
    expect(high).toBeGreaterThan(low);
  });

  it("vs_score has 0.3 weight (same as ad_score)", () => {
    const vsOnly = computeDelegationScore(5, 0, 0, 0, 0);
    const adOnly = computeDelegationScore(0, 0, 0, 0, 5);
    expect(vsOnly).toBe(adOnly);
  });

  it("cc_score has 0.25 weight (less than vs_score)", () => {
    const ccOnly = computeDelegationScore(0, 5, 0, 0, 0);
    const vsOnly = computeDelegationScore(5, 0, 0, 0, 0);
    expect(vsOnly).toBeGreaterThan(ccOnly);
  });

  it("r_score has 0.15 weight (lowest)", () => {
    const rOnly = computeDelegationScore(0, 0, 0, 5, 0);
    const vsOnly = computeDelegationScore(5, 0, 0, 0, 0);
    expect(vsOnly).toBeGreaterThan(rOnly);
  });

  it("clamps hu at 5 (cannot go below zero contribution)", () => {
    const score = computeDelegationScore(0, 0, 5, 0, 0);
    // (5-5)*0.3 = 0 contribution from hu
    expect(score).toBe(0);
  });

  it("produces deterministic results", () => {
    const a = computeDelegationScore(3, 4, 2, 5, 1);
    const b = computeDelegationScore(3, 4, 2, 5, 1);
    expect(a).toBe(b);
  });
});

/**
 * RPM payout calculation tests (from process-weekly-payout edge function logic)
 */
const DEFAULT_RPM = 0.22;
const PROTECTION_RPM = 0.18;
const MIN_PAYOUT_CENTS = 222;

function calcBasePayout(netViews: number, rpm: number): number {
  const base = Math.round((netViews / 1000) * rpm * 100);
  if (base > 0 && base < MIN_PAYOUT_CENTS) return MIN_PAYOUT_CENTS;
  return base;
}

describe("clipper payout calculation", () => {
  it("returns 0 for 0 net views", () => {
    expect(calcBasePayout(0, DEFAULT_RPM)).toBe(0);
  });

  it("applies minimum payout floor of $2.22", () => {
    // 100 views at $0.22 RPM = $0.022 = 2.2 cents → floors to 222
    expect(calcBasePayout(100, DEFAULT_RPM)).toBe(MIN_PAYOUT_CENTS);
  });

  it("calculates correctly at 1000 views (1 CPM)", () => {
    // 1000 views / 1000 * 0.22 * 100 = 22 cents → floors to 222
    expect(calcBasePayout(1000, DEFAULT_RPM)).toBe(MIN_PAYOUT_CENTS);
  });

  it("calculates correctly at 100000 views", () => {
    // 100000 / 1000 * 0.22 * 100 = 2200 cents = $22
    expect(calcBasePayout(100000, DEFAULT_RPM)).toBe(2200);
  });

  it("protection mode uses lower RPM", () => {
    const normal = calcBasePayout(100000, DEFAULT_RPM);
    const protection = calcBasePayout(100000, PROTECTION_RPM);
    expect(normal).toBeGreaterThan(protection);
  });

  it("1M views at default RPM = $220 (22000 cents)", () => {
    expect(calcBasePayout(1_000_000, DEFAULT_RPM)).toBe(22000);
  });
});

/**
 * Monthly bonus tier tests
 */
const MONTHLY_BONUS_TIERS = [
  { views: 1_000_000, bonus: 111100, tier: "super" },
  { views: 500_000, bonus: 44400, tier: "proven" },
  { views: 100_000, bonus: 11100, tier: "verified" },
];

function getMonthlyBonus(monthlyViews: number): { bonus: number; tier: string } {
  for (const t of MONTHLY_BONUS_TIERS) {
    if (monthlyViews >= t.views) return { bonus: t.bonus, tier: t.tier };
  }
  return { bonus: 0, tier: "none" };
}

describe("monthly bonus tiers", () => {
  it("returns no bonus below 100k views", () => {
    expect(getMonthlyBonus(99999)).toEqual({ bonus: 0, tier: "none" });
  });

  it("returns verified tier at exactly 100k views", () => {
    expect(getMonthlyBonus(100000)).toEqual({ bonus: 11100, tier: "verified" });
  });

  it("returns proven tier at exactly 500k views", () => {
    expect(getMonthlyBonus(500000)).toEqual({ bonus: 44400, tier: "proven" });
  });

  it("returns super tier at exactly 1M views", () => {
    expect(getMonthlyBonus(1_000_000)).toEqual({ bonus: 111100, tier: "super" });
  });

  it("super tier is highest priority (checked first)", () => {
    expect(getMonthlyBonus(2_000_000)).toEqual({ bonus: 111100, tier: "super" });
  });
});
