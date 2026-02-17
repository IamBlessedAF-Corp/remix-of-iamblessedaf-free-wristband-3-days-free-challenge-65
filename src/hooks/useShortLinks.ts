import { useState, useCallback } from "react";
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
 */
export function useShortLinks() {
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  /** Create a single short link */
  const createShortLink = useCallback(
    async (options: ShortLinkOptions): Promise<ShortLinkResult | null> => {
      setLoading(true);
      try {
        const { data, error } = await supabase.functions.invoke("short-link", {
          body: { action: "create", ...options, created_by: user?.id || undefined },
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
    []
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
      // Try to find an existing link for this campaign+destination first
      try {
        const { data: existing } = await supabase
          .from("short_links")
          .select("short_code")
          .eq("destination_url", destination)
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
        destination_url: destination,
        campaign,
        source_page: sourcePage || window.location.pathname,
      });

      return result?.short_url || destination;
    },
    [createShortLink]
  );

  return {
    createShortLink,
    trackClick,
    resolveShortCode,
    getShareUrl,
    loading,
    SHORT_LINK_BASE,
  };
}
