import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

interface EconomyState {
  // Per-clip metrics (latest 20 clips with metrics)
  clips: Array<{
    id: string;
    views: number;
    netViews: number;
    ctr: number;
    regRate: number;
    day1PostRate: number;
    isActivated: boolean;
    earningsCents: number;
    status: string;
    platform: string;
    submittedAt: string;
  }>;
  // Account-level
  monthlyViews: number;
  lifetimeViews: number;
  // Throttle
  riskThrottleActive: boolean;
  currentRpm: number;
  // Payouts
  payouts: Array<{
    weekKey: string;
    status: string;
    totalCents: number;
    baseCents: number;
    bonusCents: number;
    clipsCount: number;
    netViews: number;
  }>;
  loading: boolean;
}

export function useClipperEconomy(userId: string | undefined) {
  const [state, setState] = useState<EconomyState>({
    clips: [],
    monthlyViews: 0,
    lifetimeViews: 0,
    riskThrottleActive: false,
    currentRpm: 0.22,
    payouts: [],
    loading: true,
  });

  const fetch = useCallback(async () => {
    if (!userId) {
      setState((s) => ({ ...s, loading: false }));
      return;
    }

    try {
      // Fetch clips with economy metrics
      const { data: clips } = await supabase
        .from("clip_submissions")
        .select("id, view_count, baseline_view_count, ctr, reg_rate, day1_post_rate, is_activated, earnings_cents, status, platform, submitted_at, net_views")
        .eq("user_id", userId)
        .order("submitted_at", { ascending: false })
        .limit(50);

      // Fetch throttle state
      const { data: throttle } = await supabase
        .from("clipper_risk_throttle")
        .select("is_active, rpm_override")
        .limit(1)
        .single();

      // Fetch payouts
      const { data: payouts } = await supabase
        .from("clipper_payouts")
        .select("week_key, status, total_cents, base_earnings_cents, bonus_cents, clips_count, total_net_views")
        .eq("user_id", userId)
        .order("week_key", { ascending: false })
        .limit(12);

      const allClips = (clips || []).map((c: any) => ({
        id: c.id,
        views: c.view_count || 0,
        netViews: Math.max(0, (c.view_count || 0) - (c.baseline_view_count || 0)),
        ctr: c.ctr || 0,
        regRate: c.reg_rate || 0,
        day1PostRate: c.day1_post_rate || 0,
        isActivated: c.is_activated || false,
        earningsCents: c.earnings_cents || 0,
        status: c.status,
        platform: c.platform,
        submittedAt: c.submitted_at,
      }));

      // Monthly views (this calendar month)
      const now = new Date();
      const monthStart = new Date(now.getUTCFullYear(), now.getUTCMonth(), 1);
      monthStart.setUTCHours(0, 0, 0, 0);
      const monthlyViews = allClips
        .filter((c) => new Date(c.submittedAt) >= monthStart)
        .reduce((s, c) => s + c.netViews, 0);

      const lifetimeViews = allClips.reduce((s, c) => s + c.netViews, 0);

      setState({
        clips: allClips,
        monthlyViews,
        lifetimeViews,
        riskThrottleActive: throttle?.is_active || false,
        currentRpm: (throttle as any)?.rpm_override ?? 0.22,
        payouts: (payouts || []).map((p: any) => ({
          weekKey: p.week_key,
          status: p.status,
          totalCents: p.total_cents || 0,
          baseCents: p.base_earnings_cents || 0,
          bonusCents: p.bonus_cents || 0,
          clipsCount: p.clips_count || 0,
          netViews: p.total_net_views || 0,
        })),
        loading: false,
      });
    } catch {
      setState((s) => ({ ...s, loading: false }));
    }
  }, [userId]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { ...state, refresh: fetch };
}
