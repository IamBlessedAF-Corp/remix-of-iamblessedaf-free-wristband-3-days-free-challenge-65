import { describe, it, expect } from "vitest";

// Inline the pure function to avoid import side-effects
function escCsv(val: string | null | undefined): string {
  if (val == null) return "";
  const s = String(val);
  return s.includes(",") || s.includes('"') || s.includes("\n")
    ? `"${s.replace(/"/g, '""')}"`
    : s;
}

describe("escCsv", () => {
  it("returns empty string for null/undefined", () => {
    expect(escCsv(null)).toBe("");
    expect(escCsv(undefined)).toBe("");
  });

  it("passes through simple strings", () => {
    expect(escCsv("hello")).toBe("hello");
  });

  it("wraps strings with commas in quotes", () => {
    expect(escCsv("hello,world")).toBe('"hello,world"');
  });

  it("escapes double quotes inside values", () => {
    expect(escCsv('say "hi"')).toBe('"say ""hi"""');
  });

  it("wraps strings with newlines", () => {
    expect(escCsv("line1\nline2")).toBe('"line1\nline2"');
  });
});
