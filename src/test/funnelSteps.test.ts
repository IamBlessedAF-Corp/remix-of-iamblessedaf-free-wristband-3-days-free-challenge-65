import { describe, it, expect } from "vitest";
import { FUNNEL_STEPS } from "@/hooks/useFunnelProgress";

describe("FUNNEL_STEPS constants", () => {
  it("has at least 5 steps", () => {
    expect(FUNNEL_STEPS.length).toBeGreaterThanOrEqual(5);
  });

  it("each step has a unique id", () => {
    const ids = FUNNEL_STEPS.map((s) => s.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("XP values are monotonically non-decreasing", () => {
    for (let i = 1; i < FUNNEL_STEPS.length; i++) {
      expect(FUNNEL_STEPS[i].xp).toBeGreaterThanOrEqual(FUNNEL_STEPS[i - 1].xp);
    }
  });

  it("all steps have an emoji", () => {
    FUNNEL_STEPS.forEach((s) => {
      expect(s.emoji.length).toBeGreaterThan(0);
    });
  });

  it("portal is the last step", () => {
    expect(FUNNEL_STEPS[FUNNEL_STEPS.length - 1].id).toBe("portal");
  });

  it("challenge is the first step", () => {
    expect(FUNNEL_STEPS[0].id).toBe("challenge");
  });
});
