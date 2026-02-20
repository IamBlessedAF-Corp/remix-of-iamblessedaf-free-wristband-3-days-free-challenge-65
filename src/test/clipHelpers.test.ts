import { describe, it, expect } from "vitest";

/**
 * Tests for YouTube URL extraction logic (mirrors verify-clip edge function)
 */
function extractYouTubeId(url: string): string | null {
  const patterns = [
    /youtu\.be\/([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/watch\?v=([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/,
  ];
  for (const p of patterns) {
    const m = url.match(p);
    if (m) return m[1];
  }
  return null;
}

describe("extractYouTubeId", () => {
  it("extracts from youtu.be short URL", () => {
    expect(extractYouTubeId("https://youtu.be/dQw4w9WgXcQ")).toBe("dQw4w9WgXcQ");
  });

  it("extracts from youtube.com/watch", () => {
    expect(extractYouTubeId("https://www.youtube.com/watch?v=dQw4w9WgXcQ")).toBe("dQw4w9WgXcQ");
  });

  it("extracts from youtube.com/shorts", () => {
    expect(extractYouTubeId("https://www.youtube.com/shorts/dQw4w9WgXcQ")).toBe("dQw4w9WgXcQ");
  });

  it("extracts from youtube.com/embed", () => {
    expect(extractYouTubeId("https://www.youtube.com/embed/dQw4w9WgXcQ")).toBe("dQw4w9WgXcQ");
  });

  it("returns null for TikTok URL", () => {
    expect(extractYouTubeId("https://www.tiktok.com/@user/video/12345678901234567")).toBeNull();
  });

  it("returns null for empty string", () => {
    expect(extractYouTubeId("")).toBeNull();
  });

  it("returns null for random text", () => {
    expect(extractYouTubeId("not-a-url")).toBeNull();
  });

  it("handles URLs with extra query params", () => {
    const id = extractYouTubeId("https://www.youtube.com/watch?v=dQw4w9WgXcQ&t=42s&list=PLtest");
    expect(id).toBe("dQw4w9WgXcQ");
  });
});

/**
 * Short link code generation tests (mirrors generate_short_code() DB function)
 */
function generateShortCode(): string {
  const chars = "abcdefghjkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let result = "";
  for (let i = 0; i < 7; i++) {
    result += chars[Math.floor(Math.random() * chars.length)];
  }
  return result;
}

describe("generateShortCode", () => {
  it("generates a 7-character code", () => {
    expect(generateShortCode()).toHaveLength(7);
  });

  it("only contains valid charset characters", () => {
    const validChars = /^[abcdefghjkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789]+$/;
    for (let i = 0; i < 20; i++) {
      expect(generateShortCode()).toMatch(validChars);
    }
  });

  it("does not contain ambiguous chars (0, O, I, l, 1)", () => {
    const ambiguous = /[0OIl1]/;
    for (let i = 0; i < 50; i++) {
      expect(generateShortCode()).not.toMatch(ambiguous);
    }
  });

  it("produces unique codes (probabilistic)", () => {
    const codes = new Set(Array.from({ length: 100 }, () => generateShortCode()));
    // With 7 chars from ~56 char alphabet, collisions in 100 are astronomically unlikely
    expect(codes.size).toBe(100);
  });
});

/**
 * Referral code generation tests (mirrors generate_referral_code() DB function)
 */
function generateReferralCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let result = "BLESSED";
  for (let i = 0; i < 4; i++) {
    result += chars[Math.floor(Math.random() * chars.length)];
  }
  return result;
}

describe("generateReferralCode", () => {
  it("always starts with BLESSED", () => {
    for (let i = 0; i < 20; i++) {
      expect(generateReferralCode()).toMatch(/^BLESSED/);
    }
  });

  it("has total length of 11 (BLESSED + 4 chars)", () => {
    expect(generateReferralCode()).toHaveLength(11);
  });

  it("only uses uppercase chars and digits (no ambiguous chars)", () => {
    const pattern = /^BLESSED[ABCDEFGHJKLMNPQRSTUVWXYZ23456789]{4}$/;
    for (let i = 0; i < 20; i++) {
      expect(generateReferralCode()).toMatch(pattern);
    }
  });
});
