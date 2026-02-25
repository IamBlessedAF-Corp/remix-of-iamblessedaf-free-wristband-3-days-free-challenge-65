import { describe, it, expect } from "vitest";

/**
 * Short Link Tests
 * Validates URL construction, code generation format, and UTM passthrough.
 */

const SHORT_LINK_BASE = "https://iamblessedaf.com/go";

// Mirrors generate_short_code() DB function character set
const SHORT_CODE_CHARS = "abcdefghjkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789";
const SHORT_CODE_REGEX = new RegExp(`^[${SHORT_CODE_CHARS}]{7}$`);

describe("Short code format", () => {
  it("regex matches valid 7-char codes", () => {
    expect(SHORT_CODE_REGEX.test("aBcD234")).toBe(true);
    expect(SHORT_CODE_REGEX.test("XyZ5678")).toBe(true);
  });

  it("rejects codes with ambiguous chars (0, 1, l, o, i, O, I)", () => {
    expect(SHORT_CODE_REGEX.test("0000000")).toBe(false);
    expect(SHORT_CODE_REGEX.test("1111111")).toBe(false);
    expect(SHORT_CODE_REGEX.test("lllllll")).toBe(false);
    expect(SHORT_CODE_REGEX.test("ooooooo")).toBe(false);
  });

  it("rejects wrong lengths", () => {
    expect(SHORT_CODE_REGEX.test("abc")).toBe(false);
    expect(SHORT_CODE_REGEX.test("abcdefgh")).toBe(false);
    expect(SHORT_CODE_REGEX.test("")).toBe(false);
  });
});

describe("Short link URL construction", () => {
  it("builds correct /go/ URL", () => {
    const code = "aBcD234";
    expect(`${SHORT_LINK_BASE}/${code}`).toBe("https://iamblessedaf.com/go/aBcD234");
  });
});

// Mirrors GoRedirect UTM passthrough logic
function buildDestinationWithUTM(
  destinationUrl: string,
  searchParams: URLSearchParams
): string {
  const destUrl = new URL(destinationUrl);
  for (const [key, value] of searchParams.entries()) {
    if (!destUrl.searchParams.has(key)) {
      destUrl.searchParams.set(key, value);
    }
  }
  return destUrl.toString();
}

describe("UTM passthrough", () => {
  it("appends UTM params to destination", () => {
    const params = new URLSearchParams("utm_source=tiktok&utm_medium=social");
    const result = buildDestinationWithUTM("https://iamblessedaf.com/offer/111", params);
    expect(result).toContain("utm_source=tiktok");
    expect(result).toContain("utm_medium=social");
  });

  it("does not overwrite existing destination params", () => {
    const params = new URLSearchParams("ref=OVERRIDE");
    const result = buildDestinationWithUTM("https://iamblessedaf.com/offer/111?ref=ORIGINAL", params);
    expect(result).toContain("ref=ORIGINAL");
    expect(result).not.toContain("ref=OVERRIDE");
  });

  it("handles empty search params", () => {
    const params = new URLSearchParams("");
    const result = buildDestinationWithUTM("https://iamblessedaf.com/offer/111", params);
    expect(result).toBe("https://iamblessedaf.com/offer/111");
  });
});
