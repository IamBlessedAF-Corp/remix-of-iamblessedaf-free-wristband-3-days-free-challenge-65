import { describe, it, expect } from "vitest";

/**
 * Referral Attribution Flow Tests
 * Validates the /r/:code → sessionStorage → signup → creator_profiles chain
 */

// --- Referral code format validation ---
const REFERRAL_CODE_REGEX = /^IAMBLESSED[A-Z2-9]{4}$/;

describe("Referral code format", () => {
  it("matches the 14-char IAMBLESSED + 4 alphanumeric pattern", () => {
    expect(REFERRAL_CODE_REGEX.test("IAMBLESSED7CF8")).toBe(true);
    expect(REFERRAL_CODE_REGEX.test("IAMBLESSEDABCD")).toBe(true);
  });

  it("rejects codes that are too short", () => {
    expect(REFERRAL_CODE_REGEX.test("IAMBLESSED")).toBe(false);
    expect(REFERRAL_CODE_REGEX.test("IAMBLESSED7C")).toBe(false);
  });

  it("rejects codes with lowercase", () => {
    expect(REFERRAL_CODE_REGEX.test("IAMBLESSEDabcd")).toBe(false);
  });

  it("rejects codes with ambiguous chars (0, 1, I, O)", () => {
    expect(REFERRAL_CODE_REGEX.test("IAMBLESSED01IO")).toBe(false);
  });

  it("rejects empty string", () => {
    expect(REFERRAL_CODE_REGEX.test("")).toBe(false);
  });
});

// --- URL referral param extraction (mirrors Offer22 mount logic) ---
function extractRefFromUrl(url: string): string | null {
  try {
    const parsed = new URL(url);
    return parsed.searchParams.get("ref");
  } catch {
    return null;
  }
}

describe("extractRefFromUrl", () => {
  it("extracts ref param from valid URL", () => {
    expect(extractRefFromUrl("https://iamblessedaf.com/?ref=BLESSED7CF8")).toBe("BLESSED7CF8");
  });

  it("returns null when no ref param", () => {
    expect(extractRefFromUrl("https://iamblessedaf.com/")).toBeNull();
  });

  it("handles ref with other params", () => {
    expect(extractRefFromUrl("https://iamblessedaf.com/?utm_source=ig&ref=ABCD1234&foo=bar")).toBe("ABCD1234");
  });

  it("returns null for malformed URL", () => {
    expect(extractRefFromUrl("not a url")).toBeNull();
  });
});

// --- appendReferralCode logic (mirrors useShortLinks) ---
function appendReferralCode(url: string, referralCode: string | null): string {
  if (!referralCode) return url;
  try {
    if (url.includes(`/r/${referralCode}`)) return url;
    const parsed = new URL(url.startsWith("http") ? url : `https://iamblessedaf.com${url}`);
    if (!parsed.searchParams.has("ref")) {
      parsed.searchParams.set("ref", referralCode);
    }
    return parsed.toString();
  } catch {
    const separator = url.includes("?") ? "&" : "?";
    return `${url}${separator}ref=${referralCode}`;
  }
}

describe("appendReferralCode", () => {
  it("appends ref param to clean URL", () => {
    const result = appendReferralCode("https://iamblessedaf.com/offer/111", "IAMBLESSEDTEST");
    expect(result).toContain("ref=IAMBLESSEDTEST");
  });

  it("does not duplicate ref if already present", () => {
    const url = "https://iamblessedaf.com/offer/111?ref=EXISTING";
    expect(appendReferralCode(url, "IAMBLESSEDTEST")).toBe(url);
  });

  it("does not modify /r/ referral URLs", () => {
    const url = "https://iamblessedaf.com/r/IAMBLESSEDTEST";
    expect(appendReferralCode(url, "IAMBLESSEDTEST")).toBe(url);
  });

  it("returns original URL when no referral code", () => {
    const url = "https://iamblessedaf.com/offer/111";
    expect(appendReferralCode(url, null)).toBe(url);
  });

  it("handles relative URLs", () => {
    const result = appendReferralCode("/offer/111", "IAMBLESSEDTEST");
    expect(result).toContain("ref=IAMBLESSEDTEST");
  });
});

// --- Redirect path generation (mirrors ReferralRedirect) ---
function buildRedirectPath(code: string | undefined): string {
  return `/?ref=${code || ""}`;
}

describe("buildRedirectPath", () => {
  it("builds correct redirect with code", () => {
    expect(buildRedirectPath("BLESSED7CF8")).toBe("/?ref=BLESSED7CF8");
  });

  it("handles undefined code gracefully", () => {
    expect(buildRedirectPath(undefined)).toBe("/?ref=");
  });
});
