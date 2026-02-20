import { useCallback, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";

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
  /** Log a CTA conversion to exit_intent_events (fire-and-forget) */
  logConversion: (page?: string) => void;
}

/** Override map: per utm_campaign slug → custom CTA */
const CAMPAIGN_OVERRIDES: Record<string, Partial<Omit<CtaCopy, "logConversion">>> = {
  // Evergreen deal overrides
  "black-friday":  { primary: "🔥 Grab My Black Friday Deal →",    showDiscount: true  },
  "cyber-monday":  { primary: "💻 Lock In My Cyber Monday Deal →",  showDiscount: true  },
  "flash-sale":    { primary: "⚡ Lock In My Flash Deal →",          showDiscount: true  },
  "vip":           { primary: "👑 Claim My VIP Access →",            showDiscount: false },
  // Seasonal campaigns
  "easter":        { primary: "🐣 Claim My Easter Gift →",           showDiscount: true  },
  "summer":        { primary: "☀️ Grab My Summer Deal →",            showDiscount: true  },
  "new-year":      { primary: "🎆 Start the Year Free →",            showDiscount: false },
  "holiday":       { primary: "🎁 Claim My Holiday Gift →",          showDiscount: true  },
  "back-to-school":{ primary: "📚 Get My Student Deal →",            showDiscount: true  },
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

type BaseCopy = Omit<CtaCopy, "logConversion">;

const SOURCE_DEFAULTS: Record<UtmSource, BaseCopy> = {
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
  const params = useMemo(() => new URLSearchParams(window.location.search), []);
  const utmSource   = params.get("utm_source");
  const utmMedium   = params.get("utm_medium");
  const utmCampaign = (params.get("utm_campaign") || "").toLowerCase();
  const sessionId   = useMemo(() => `ses_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`, []);

  const base: BaseCopy = useMemo(() => {
    const trafficSource = classifySource(utmMedium, utmSource);
    const result: BaseCopy = { ...SOURCE_DEFAULTS[trafficSource] };

    // Campaign slug overrides take highest priority
    for (const [slug, override] of Object.entries(CAMPAIGN_OVERRIDES)) {
      if (utmCampaign.includes(slug)) {
        return { ...result, ...override, source: trafficSource } as BaseCopy;
      }
    }

    // Allow per-component label override while keeping discount / sub copy
    if (variantLabel) {
      result.primary = variantLabel;
    }

    return result;
  }, [utmSource, utmMedium, utmCampaign, variantLabel]);

  /** Fire-and-forget: log a CTA conversion to exit_intent_events */
  const logConversion = useCallback(
    (page?: string) => {
      const eventMeta = {
        utm_source: utmSource,
        utm_medium: utmMedium,
        utm_campaign: utmCampaign || null,
        cta_variant: base.source,
        show_discount: base.showDiscount,
      };
      supabase
        .from("exit_intent_events")
        .insert({
          event_type: `cta_conversion_${base.source}`,
          page: page || window.location.pathname,
          session_id: sessionId,
          user_id: null, // filled server-side via RLS if authenticated
          // We store the UTM variant info in the page field as query string for easy filtering
        })
        .then(({ error }) => {
          if (error) console.warn("UTM conversion log failed:", error.message, eventMeta);
        });
    },
    [base.source, base.showDiscount, utmSource, utmMedium, utmCampaign, sessionId]
  );

  return useMemo(() => ({ ...base, logConversion }), [base, logConversion]);
}
