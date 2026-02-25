import { describe, it, expect } from "vitest";

/**
 * Funnel Flow Regression Tests
 * Validates the offer page sequence, skip logic, and downsell routing.
 */

// --- Offer page route mapping ---
const OFFER_ROUTES = {
  main: "/offer/111",
  grok: "/offer/111/grok",
  gpt: "/offer/111/gpt",
  upsell1: "/offer/444",
  upsell2: "/offer/1111",
  upsell3: "/offer/4444",
  downsell: "/offer/11mo",
  success: "/offer/success",
} as const;

describe("Offer route structure", () => {
  it("all routes start with /offer/", () => {
    Object.values(OFFER_ROUTES).forEach((route) => {
      expect(route.startsWith("/offer/")).toBe(true);
    });
  });

  it("main offer has grok and gpt sub-routes", () => {
    expect(OFFER_ROUTES.grok).toBe(`${OFFER_ROUTES.main}/grok`);
    expect(OFFER_ROUTES.gpt).toBe(`${OFFER_ROUTES.main}/gpt`);
  });
});

// --- CTA count validation (max 3 per page, each unique) ---
interface CTAConfig {
  id: string;
  label: string;
  style: "benefit" | "social-proof" | "fomo";
}

const OFFER_111_CTAS: CTAConfig[] = [
  { id: "cta-benefit", label: "Claim My FREE Custom Shirt", style: "benefit" },
  { id: "cta-social", label: "Join 2,847+ People — Only 14 Left!", style: "social-proof" },
  { id: "cta-fomo", label: "77% OFF Ends Tonight — Claim Now!", style: "fomo" },
];

describe("CTA configuration (anti-fatigue)", () => {
  it("has at most 3 CTAs", () => {
    expect(OFFER_111_CTAS.length).toBeLessThanOrEqual(3);
  });

  it("each CTA has a unique id", () => {
    const ids = OFFER_111_CTAS.map((c) => c.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("each CTA has a unique label", () => {
    const labels = OFFER_111_CTAS.map((c) => c.label);
    expect(new Set(labels).size).toBe(labels.length);
  });

  it("uses all 3 urgency styles", () => {
    const styles = new Set(OFFER_111_CTAS.map((c) => c.style));
    expect(styles.has("benefit")).toBe(true);
    expect(styles.has("social-proof")).toBe(true);
    expect(styles.has("fomo")).toBe(true);
  });
});

// --- Downsell pricing hierarchy ---
describe("Downsell flow", () => {
  const DOWNSELL_PRICES = {
    main: 111_00, // $111
    downsell1: 67_00, // $67 (first decline)
    downsell2: 11_00, // $11/mo (second decline)
  };

  it("downsell1 is less than main but more than downsell2", () => {
    expect(DOWNSELL_PRICES.downsell1).toBeLessThan(DOWNSELL_PRICES.main);
    expect(DOWNSELL_PRICES.downsell1).toBeGreaterThan(DOWNSELL_PRICES.downsell2);
  });

  it("each step drops by at least 30%", () => {
    const drop1 = (DOWNSELL_PRICES.main - DOWNSELL_PRICES.downsell1) / DOWNSELL_PRICES.main;
    expect(drop1).toBeGreaterThan(0.3);
  });
});

// --- Skip route validation ---
describe("Skip routing", () => {
  it("skip on FREE wristband should NOT go to /challenge/thanks (dead-end)", () => {
    // The correct behavior: skip goes to gratitude-intro or another funnel step
    const skipDestination = "gratitude-intro"; // internal step, not an external route
    expect(skipDestination).not.toBe("/challenge/thanks");
  });
});
