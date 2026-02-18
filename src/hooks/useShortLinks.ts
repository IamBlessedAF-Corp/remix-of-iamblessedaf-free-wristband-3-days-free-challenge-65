import { useState, useCallback, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

const SHORT_LINK_BASE = "https://iamblessedaf.com/go";

interface ShortLinkOptions {
  destination_url: string;
  title?: string;
  campaign?: string;
  source_page?: string;
  custom_code?: string;
  metadata?: Record<string, string>;
}

interface ShortLinkResult {
  short_code: string;
  short_url: string;
  id: string;
}

/**
 * Hook to create and manage short links (Bitly-style).
 * All links use the iamblessedaf.com domain.
 * Automatically embeds the logged-in user's referral code into destination URLs.
 */
export function useShortLinks() {
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const [referralCode, setReferralCode] = useState<string | null>(null);

  // Fetch the user's referral code once on mount / user change
  useEffect(() => {
    if (!user?.id) {
      setReferralCode(null);
      return;
    }
    supabase
      .from("creator_profiles")
      .select("referral_code")
      .eq("user_id", user.id)
      .maybeSingle()
      .then(({ data }) => {
        if (data?.referral_code) setReferralCode(data.referral_code);
      });
  }, [user?.id]);

  /** Append the user's referral code to a URL (if available and not already present) */
  const appendReferralCode = useCallback(
    (url: string): string => {
      if (!referralCode) return url;
      try {
        // If it's already a /r/CODE referral URL, don't modify
        if (url.includes(`/r/${referralCode}`)) return url;
        const parsed = new URL(url.startsWith("http") ? url : `https://iamblessedaf.com${url}`);
        if (!parsed.searchParams.has("ref")) {
          parsed.searchParams.set("ref", referralCode);
        }
        return parsed.toString();
      } catch {
        // If URL parsing fails, append as query string
        const separator = url.includes("?") ? "&" : "?";
        return `${url}${separator}ref=${referralCode}`;
      }
    },
    [referralCode]
  );

  /** Create a single short link */
  const createShortLink = useCallback(
    async (options: ShortLinkOptions): Promise<ShortLinkResult | null> => {
      setLoading(true);
      try {
        const destWithRef = appendReferralCode(options.destination_url);
        const { data, error } = await supabase.functions.invoke("short-link", {
          body: { action: "create", ...options, destination_url: destWithRef, created_by: user?.id || undefined },
        });

        if (error) throw error;
        if (data?.error) throw new Error(data.error);

        return data as ShortLinkResult;
      } catch (err) {
        console.error("Failed to create short link:", err);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [appendReferralCode]
  );

  /** Track a click on a short link (fire-and-forget) */
  const trackClick = useCallback(
    (linkId: string, extraParams?: Record<string, string>) => {
      const url = new URL(window.location.href);
      supabase.functions
        .invoke("short-link", {
          body: {
            action: "track",
            link_id: linkId,
            referrer: document.referrer || null,
            user_agent: navigator.userAgent,
            utm_source: url.searchParams.get("utm_source") || extraParams?.utm_source,
            utm_medium: url.searchParams.get("utm_medium") || extraParams?.utm_medium,
            utm_campaign: url.searchParams.get("utm_campaign") || extraParams?.utm_campaign,
          },
        })
        .catch((err) => console.error("Click tracking failed:", err));
    },
    []
  );

  /** Resolve a short code to its destination */
  const resolveShortCode = useCallback(
    async (code: string): Promise<{ destination_url: string; link_id: string } | null> => {
      try {
        const { data, error } = await supabase.functions.invoke("short-link", {
          body: { action: "resolve", code },
        });

        if (error || data?.error) return null;
        return data;
      } catch {
        return null;
      }
    },
    []
  );

  /** Generate a short URL string for sharing — reuses existing link if one matches */
  const getShareUrl = useCallback(
    async (
      destination: string,
      campaign: string,
      sourcePage?: string
    ): Promise<string> => {
      // Append user's referral code to destination
      const destWithRef = appendReferralCode(destination);

      // Try to find an existing link for this campaign+destination first
      try {
        const { data: existing } = await supabase
          .from("short_links")
          .select("short_code")
          .eq("destination_url", destWithRef)
          .eq("campaign", campaign)
          .eq("is_active", true)
          .order("click_count", { ascending: false })
          .limit(1)
          .maybeSingle();

        if (existing?.short_code) {
          return `${SHORT_LINK_BASE}/${existing.short_code}`;
        }
      } catch {
        // Fall through to create
      }

      const result = await createShortLink({
        destination_url: destWithRef,
        campaign,
        source_page: sourcePage || window.location.pathname,
      });

      return result?.short_url || destWithRef;
    },
    [createShortLink, appendReferralCode]
  );

  return {
    createShortLink,
    trackClick,
    resolveShortCode,
    getShareUrl,
    appendReferralCode,
    referralCode,
    loading,
    SHORT_LINK_BASE,
  };
}
