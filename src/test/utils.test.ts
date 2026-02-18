import { describe, it, expect } from "vitest";
import { cn } from "@/lib/utils";

describe("cn() utility", () => {
  it("merges class names", () => {
    expect(cn("px-2", "py-1")).toBe("px-2 py-1");
  });

  it("resolves Tailwind conflicts (last wins)", () => {
    expect(cn("px-2", "px-4")).toBe("px-4");
  });

  it("handles conditional classes", () => {
    expect(cn("base", false && "hidden", "visible")).toBe("base visible");
  });

  it("handles undefined and null inputs", () => {
    expect(cn("a", undefined, null, "b")).toBe("a b");
  });

  it("returns empty string for no args", () => {
    expect(cn()).toBe("");
  });
});
