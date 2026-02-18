import { describe, it, expect } from "vitest";
import { computeDelegationScore, getDelegationBadge } from "@/utils/boardHelpers";

describe("computeDelegationScore", () => {
  it("returns ~23 for all-zero scores (HU inverted baseline)", () => {
    // With all zeros, (5 - 0) * 0.3 still contributes (HU is inverted)
    const score = computeDelegationScore({});
    expect(score).toBeCloseTo(23.08, 0);
  });

  it("returns max (~100) for perfect scores with HU=0", () => {
    const score = computeDelegationScore({
      vs_score: 5,
      cc_score: 5,
      hu_score: 0,
      r_score: 5,
      ad_score: 5,
    });
    expect(score).toBeCloseTo(100, 0);
  });

  it("HU=5 (high human effort) lowers the score significantly", () => {
    const low = computeDelegationScore({ vs_score: 5, cc_score: 5, hu_score: 5, r_score: 5, ad_score: 5 });
    const high = computeDelegationScore({ vs_score: 5, cc_score: 5, hu_score: 0, r_score: 5, ad_score: 5 });
    expect(high).toBeGreaterThan(low);
  });

  it("handles partial scores gracefully", () => {
    const score = computeDelegationScore({ vs_score: 3 });
    expect(score).toBeGreaterThan(0);
    expect(score).toBeLessThan(100);
  });

  it("is symmetric in VS and AD (same weight 0.3)", () => {
    const a = computeDelegationScore({ vs_score: 5, ad_score: 0 });
    const b = computeDelegationScore({ vs_score: 0, ad_score: 5 });
    expect(a).toBeCloseTo(b, 5);
  });
});

describe("getDelegationBadge", () => {
  it("returns green for score >= 70", () => {
    const badge = getDelegationBadge(85);
    expect(badge.className).toContain("green");
  });

  it("returns yellow for score 40-69", () => {
    const badge = getDelegationBadge(55);
    expect(badge.className).toContain("yellow");
  });

  it("returns red for score < 40", () => {
    const badge = getDelegationBadge(20);
    expect(badge.className).toContain("red");
  });

  it("includes score in text", () => {
    const badge = getDelegationBadge(72.5);
    expect(badge.text).toBe("D:73");
  });
});
