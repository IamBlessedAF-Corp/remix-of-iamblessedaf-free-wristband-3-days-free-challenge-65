import { describe, it, expect } from "vitest";

/**
 * Test the fingerprinting algorithm used by errorCapture.ts
 * (inlined to avoid side effects from importing the full module)
 */
function quickFingerprint(msg: string): string {
  let hash = 0;
  for (let i = 0; i < msg.length; i++) {
    hash = ((hash << 5) - hash) + msg.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash).toString(36);
}

describe("quickFingerprint", () => {
  it("returns a non-empty string", () => {
    expect(quickFingerprint("test error").length).toBeGreaterThan(0);
  });

  it("is deterministic", () => {
    const a = quickFingerprint("same error message");
    const b = quickFingerprint("same error message");
    expect(a).toBe(b);
  });

  it("produces different hashes for different messages", () => {
    const a = quickFingerprint("Error A");
    const b = quickFingerprint("Error B");
    expect(a).not.toBe(b);
  });

  it("handles empty string", () => {
    expect(quickFingerprint("")).toBe("0");
  });

  it("handles very long strings without throwing", () => {
    const long = "x".repeat(10_000);
    expect(() => quickFingerprint(long)).not.toThrow();
    expect(quickFingerprint(long).length).toBeGreaterThan(0);
  });
});
