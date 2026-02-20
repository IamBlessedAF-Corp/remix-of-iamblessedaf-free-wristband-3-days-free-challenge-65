import { useMemo } from "react";

/**
 * UTM-aware CTA copy hook.
 *
 * Reads UTM params from the current URL and returns personalized
 * CTA text, sub-copy, and a source classification.
 *
 * Source classification:
 *   paid    → utm_medium = cpc | paid | ppc | ads | meta | google | tiktok
 *   social  → utm_medium = social | instagram | twitter | facebook | youtube
 *   email   → utm_medium = email | newsletter
 *   referral→ utm_source = referral | affiliate
 *   organic → everything else (default)
 */

export type UtmSource = "paid" | "social" | "email" | "referral" | "organic";

export interface CtaCopy {
  /** Primary button label */
  primary: string;
  /** Short sub-label below the button */
  sub: string;
  /** Classified traffic source */
  source: UtmSource;
  /** True when an explicit discount angle is appropriate */
  showDiscount: boolean;
}

/** Override map: per utm_campaign slug → custom CTA */
const CAMPAIGN_OVERRIDES: Record<string, Partial<CtaCopy>> = {
  "black-friday": { primary: "🔥 Grab My Black Friday Deal →", showDiscount: true },
  "flash-sale":   { primary: "⚡ Lock In My Flash Deal →", showDiscount: true },
  "vip":          { primary: "👑 Claim My VIP Access →", showDiscount: false },
};

const PAID_MEDIUMS = new Set(["cpc", "paid", "ppc", "ads", "meta", "google", "tiktok", "youtube_ads"]);
const SOCIAL_MEDIUMS = new Set(["social", "instagram", "twitter", "facebook", "youtube", "tiktok_organic"]);
const EMAIL_MEDIUMS = new Set(["email", "newsletter", "digest"]);
const REFERRAL_SOURCES = new Set(["referral", "affiliate", "partner"]);

function classifySource(
  utmMedium: string | null,
  utmSource: string | null
): UtmSource {
  const medium = (utmMedium || "").toLowerCase();
  const source = (utmSource || "").toLowerCase();

  if (PAID_MEDIUMS.has(medium)) return "paid";
  if (SOCIAL_MEDIUMS.has(medium)) return "social";
  if (EMAIL_MEDIUMS.has(medium)) return "email";
  if (REFERRAL_SOURCES.has(source)) return "referral";
  return "organic";
}

const SOURCE_DEFAULTS: Record<UtmSource, CtaCopy> = {
  paid: {
    primary: "🎁 Claim Your Exclusive Discount →",
    sub: "Limited-time offer · Secure checkout",
    source: "paid",
    showDiscount: true,
  },
  social: {
    primary: "❤️ Join the Movement — It's Free →",
    sub: "Thousands already inside · No credit card",
    source: "social",
    showDiscount: false,
  },
  email: {
    primary: "✉️ Unlock Your Member Reward →",
    sub: "Special rate reserved for subscribers",
    source: "email",
    showDiscount: true,
  },
  referral: {
    primary: "🤝 Accept Your Referral Bonus →",
    sub: "Your friend saved you a spot · Claim it now",
    source: "referral",
    showDiscount: true,
  },
  organic: {
    primary: "🌱 Join Free — Start Today →",
    sub: "No commitment · Cancel anytime",
    source: "organic",
    showDiscount: false,
  },
};

/**
 * Optional override: pass a `variantLabel` to customize the default label
 * while keeping all UTM logic intact (used by offer-specific CtaBlocks).
 */
export function useUtmCta(variantLabel?: string): CtaCopy {
  return useMemo(() => {
    const params = new URLSearchParams(window.location.search);
    const utmSource   = params.get("utm_source");
    const utmMedium   = params.get("utm_medium");
    const utmCampaign = (params.get("utm_campaign") || "").toLowerCase();

    const trafficSource = classifySource(utmMedium, utmSource);
    const base: CtaCopy = { ...SOURCE_DEFAULTS[trafficSource] };

    // Campaign slug overrides take highest priority
    for (const [slug, override] of Object.entries(CAMPAIGN_OVERRIDES)) {
      if (utmCampaign.includes(slug)) {
        return { ...base, ...override, source: trafficSource } as CtaCopy;
      }
    }

    // Allow per-component label override while keeping discount / sub copy
    if (variantLabel) {
      base.primary = variantLabel;
    }

    return base;
  }, [variantLabel]);
}
