import { describe, it, expect } from "vitest";
import { ACHIEVEMENTS } from "@/data/achievements";

describe("ACHIEVEMENTS data", () => {
  it("is a non-empty array", () => {
    expect(Array.isArray(ACHIEVEMENTS)).toBe(true);
    expect(ACHIEVEMENTS.length).toBeGreaterThan(0);
  });

  it("each achievement has required fields", () => {
    ACHIEVEMENTS.forEach((a) => {
      expect(typeof a.id).toBe("string");
      expect(typeof a.name).toBe("string");
      expect(a.id.length).toBeGreaterThan(0);
      expect(a.name.length).toBeGreaterThan(0);
    });
  });

  it("all IDs are unique", () => {
    const ids = ACHIEVEMENTS.map((a) => a.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});
