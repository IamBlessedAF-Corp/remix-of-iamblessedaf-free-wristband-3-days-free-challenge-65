import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

/**
 * Global copy values cache — fetches all copy_ prefixed campaign_config entries once
 * and provides a getter with hardcoded defaults as fallback.
 */

// Default values registry (mirrors CopyManagerTab COPY_REGISTRY)
const DEFAULTS: Record<string, string> = {
  hero_headline: "Feel Up to 27× Happier in 3 Days",
  hero_subheadline: "Neuroscience-backed gratitude hack. 100% FREE.",
  claim_cta: "🎁 Claim My FREE Wristband",
  offer111_hero: "$111 ÷ 365 = Just $0.30 a Day to Reprogram Your Brain",
  offer111_sub: "Your custom shirt for your best friend + 3 Neuro-Hacker Wristbands",
  offer444_hero: "$444 ÷ 365 = $1.22/day. The Habit Lock.",
  offer1111_hero: "The Kingdom Ambassador",
  offer4444_hero: "Custom Leather Jacket + Artist Patronage + NFT",
  discount_banner: "77% OFF TODAY",
  gratitude_guarantee: "Our Gratitude Guarantee: 11 meals donated in your honor",
  risk_reversal: "SSL Secured • 11 Meals Donated • FREE US Shipping",
  clipper_hero: "Turn 60-Second Clips Into Real Cash",
  clipper_sub: "Earn $2.22+ per 1,000 views. Weekly payouts every Friday.",
  clipper_cta: "Start Clipping & Earning →",
  clipper_how_step1: "Pick a clip from our curated library",
  clipper_how_step2: "Add your CTA overlay in CapCut (60 sec tutorial)",
  clipper_how_step3: "Post & earn $2.22 per 1K views",
  clipper_bonus_100k: "$111 Bonus — You're a Gratitude Amplifier!",
  clipper_bonus_500k: "$444 Bonus — You're a Gratitude Leader!",
  clipper_bonus_1m: "$1,111 Bonus — You're a Gratitude Legend!",
  repost_share_text: "This changed my perspective on gratitude 🙏 #IamBlessedAF",
  share_milestone_1: "🎉 First share! You just planted a seed of gratitude.",
  share_milestone_5: "🔥 5 shares! You're officially a Gratitude Ambassador.",
  post_purchase_share: "You just donated {meals} meals! Share the movement with friends 🙏",
  viral_nudge_text: "Know someone who needs more gratitude? Gift them a FREE wristband 🎁",
};

type CopyMap = Record<string, string>;

function useCopyValues() {
  const { data: copyMap = {} as CopyMap } = useQuery<CopyMap>({
    queryKey: ["copy-values-live"],
    queryFn: async () => {
      const { data } = await supabase
        .from("campaign_config")
        .select("key, value")
        .eq("category", "copy");
      const map: CopyMap = {};
      (data || []).forEach((row: any) => {
        // Strip the "copy_" prefix to match the key names
        const cleanKey = row.key.startsWith("copy_") ? row.key.slice(5) : row.key;
        map[cleanKey] = row.value;
      });
      return map;
    },
    staleTime: 30_000, // 30s cache
    refetchOnWindowFocus: true,
  });

  return copyMap;
}

/**
 * Returns the live copy value for a given key, falling back to default.
 * Usage: const headline = useCopyValue("hero_headline");
 */
export function useCopyValue(key: string, overrideDefault?: string): string {
  const map = useCopyValues();
  return map[key] || overrideDefault || DEFAULTS[key] || "";
}

/**
 * Returns multiple copy values at once.
 * Usage: const { hero_headline, claim_cta } = useCopyMulti(["hero_headline", "claim_cta"]);
 */
export function useCopyMulti(keys: string[]): Record<string, string> {
  const map = useCopyValues();
  const result: Record<string, string> = {};
  keys.forEach(k => {
    result[k] = map[k] || DEFAULTS[k] || "";
  });
  return result;
}

export { DEFAULTS as COPY_DEFAULTS };
