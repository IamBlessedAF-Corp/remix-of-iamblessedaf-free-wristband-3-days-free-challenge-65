import { useCallback, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

// ── Types ──────────────────────────────────────────────────────
export interface JoyAnalyticsEvent {
  id: string;
  user_id: string | null;
  event_type: string;
  metadata: Record<string, any>;
  session_id: string | null;
  created_at: string;
}

export interface KFactorData {
  total_users: number;
  total_invites_sent: number;
  total_invites_accepted: number;
  k_factor: number;
  conversion_rate: number;
  period_days: number;
}

// ── Helpers ────────────────────────────────────────────────────
const from = (table: string) => supabase.from(table as any);

function getSessionId(): string {
  const key = "joy_session_id";
  let sid = sessionStorage.getItem(key);
  if (!sid) {
    sid = crypto.randomUUID();
    sessionStorage.setItem(key, sid);
  }
  return sid;
}

// ── Hook ───────────────────────────────────────────────────────
export function useAnalytics() {
  const [kFactor, setKFactor] = useState<KFactorData | null>(null);
  const [kLoading, setKLoading] = useState(false);
  const trackingDisabledRef = useRef(false);

  /**
   * Track any joy-keys related event.
   * Works for both authenticated and anonymous users.
   *
   * Common event_types:
   *   page_view, key0_activated, key1_unlocked, key2_submitted,
   *   key3_invite_sent, key3_invite_accepted, master_key_unlocked,
   *   invite_link_clicked, share_whatsapp, share_sms, share_email,
   *   story_template_generated, wristband_checkout_started,
   *   wristband_checkout_completed, timer_expired
   */
  const track = useCallback(
    async (
      eventType: string,
      metadata: Record<string, any> = {}
    ): Promise<void> => {
      if (trackingDisabledRef.current) return;

      try {
        const { data: userData } = await supabase.auth.getUser();
        const userId = userData.user?.id ?? null;
        const sessionId = getSessionId();

        const { error } = await from("joy_analytics_events").insert({
          user_id: userId,
          event_type: eventType,
          metadata: {
            ...metadata,
            url: window.location.href,
            referrer: document.referrer || null,
            ua: navigator.userAgent,
            ts: Date.now(),
          },
          session_id: sessionId,
        } as any);

        if (error) {
          if ((error as { code?: string }).code === "PGRST205") {
            trackingDisabledRef.current = true;
            console.warn("analytics disabled: joy_analytics_events table not available yet");
            return;
          }
          throw error;
        }
      } catch (err) {
        // Analytics should never break UX — silently fail
        console.warn("analytics.track failed:", err);
      }
    },
    []
  );

  /**
   * Fetch K-factor metrics (admin only).
   * Calls the joy_get_kfactor RPC which requires is_eos_admin().
   */
  const fetchKFactor = useCallback(
    async (periodDays: number = 30): Promise<KFactorData | null> => {
      setKLoading(true);
      try {
        const { data, error } = await supabase.rpc(
          "joy_get_kfactor" as any,
          { p_days: periodDays }
        );
        if (error) {
          console.error("joy_get_kfactor error:", error);
          setKLoading(false);
          return null;
        }
        const result = data as any;
        const kData: KFactorData = {
          total_users: result?.total_users ?? 0,
          total_invites_sent: result?.total_invites_sent ?? 0,
          total_invites_accepted: result?.total_invites_accepted ?? 0,
          k_factor: result?.k_factor ?? 0,
          conversion_rate: result?.conversion_rate ?? 0,
          period_days: periodDays,
        };
        setKFactor(kData);
        setKLoading(false);
        return kData;
      } catch (err) {
        console.error("fetchKFactor exception:", err);
        setKLoading(false);
        return null;
      }
    },
    []
  );

  /**
   * Convenience: track a page view with current path.
   * Call once per page mount.
   */
  const trackPageView = useCallback(
    (pageName: string, extra: Record<string, any> = {}) => {
      return track("page_view", { page: pageName, ...extra });
    },
    [track]
  );

  /**
   * Convenience: track a share action.
   */
  const trackShare = useCallback(
    (platform: string, keyLevel: number | string, extra: Record<string, any> = {}) => {
      return track(`share_${platform}`, { key_level: keyLevel, ...extra });
    },
    [track]
  );

  return {
    // Core
    track,
    trackPageView,
    trackShare,

    // Admin K-factor
    kFactor,
    kLoading,
    fetchKFactor,
  };
}
