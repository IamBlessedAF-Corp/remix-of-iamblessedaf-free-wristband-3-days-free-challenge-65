import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

interface ClipperStats {
  totalViews: number;
  totalClips: number;
  totalEarningsCents: number;
  clipsThisWeek: number;
  viewsThisWeek: number;
  earningsThisWeekCents: number;
  clipsLastWeek: number;
  clipsToday: number;
  streakDays: number;
  lastPayoutDate: string | null;
  avgViewsPerClipPerWeek: number;
  loading: boolean;
}

// Get Monday 00:00 of the current week (UTC)
const getWeekStart = (weeksAgo = 0): string => {
  const now = new Date();
  const day = now.getUTCDay();
  const diff = (day === 0 ? 6 : day - 1) + weeksAgo * 7;
  const monday = new Date(now);
  monday.setUTCDate(now.getUTCDate() - diff);
  monday.setUTCHours(0, 0, 0, 0);
  return monday.toISOString();
};

export function useClipperDashboard(userId: string | undefined) {
  const [stats, setStats] = useState<ClipperStats>({
    totalViews: 0,
    totalClips: 0,
    totalEarningsCents: 0,
    clipsThisWeek: 0,
    viewsThisWeek: 0,
    earningsThisWeekCents: 0,
    clipsLastWeek: 0,
    clipsToday: 0,
    streakDays: 0,
    lastPayoutDate: null,
    avgViewsPerClipPerWeek: 0,
    loading: true,
  });

  const fetchStats = useCallback(async () => {
    if (!userId) {
      setStats((s) => ({ ...s, loading: false }));
      return;
    }

    try {
      const thisWeekStart = getWeekStart(0);
      const lastWeekStart = getWeekStart(1);

      // Fetch all clips
      const { data: allClips } = await supabase
        .from("clip_submissions")
        .select("view_count, baseline_view_count, earnings_cents, submitted_at")
        .eq("user_id", userId)
        .order("submitted_at", { ascending: false });

      if (!allClips) {
        setStats((s) => ({ ...s, loading: false }));
        return;
      }

      // Net views = total views minus baseline (views at submission time)
      const totalViews = allClips.reduce((s, c) => s + Math.max(0, (c.view_count || 0) - (c.baseline_view_count || 0)), 0);
      const totalEarningsCents = allClips.reduce((s, c) => s + (c.earnings_cents || 0), 0);

      const thisWeekClips = allClips.filter((c) => c.submitted_at >= thisWeekStart);
      const lastWeekClips = allClips.filter(
        (c) => c.submitted_at >= lastWeekStart && c.submitted_at < thisWeekStart
      );

      // Simple streak: count consecutive days with clips (max 30)
      let streakDays = 0;
      if (allClips.length > 0) {
        const today = new Date();
        today.setUTCHours(0, 0, 0, 0);
        const daySet = new Set(
          allClips.map((c) => {
            const d = new Date(c.submitted_at);
            d.setUTCHours(0, 0, 0, 0);
            return d.toISOString();
          })
        );
        for (let i = 0; i < 30; i++) {
          const check = new Date(today);
          check.setUTCDate(check.getUTCDate() - i);
          if (daySet.has(check.toISOString())) {
            streakDays++;
          } else if (i > 0) break; // allow today to be missing
          else break;
        }
      }

      // Calculate average views per clip per week (based on last 2 weeks)
      const recentClips = [...thisWeekClips, ...lastWeekClips];
      const avgViewsPerClipPerWeek = recentClips.length > 0
        ? recentClips.reduce((s, c) => s + Math.max(0, (c.view_count || 0) - (c.baseline_view_count || 0)), 0) / Math.max(1, recentClips.length) * 10
        : 0;

      // Clips today
      const todayStart = new Date();
      todayStart.setUTCHours(0, 0, 0, 0);
      const todayISO = todayStart.toISOString();
      const clipsToday = allClips.filter((c) => c.submitted_at >= todayISO).length;

      setStats({
        totalViews,
        totalClips: allClips.length,
        totalEarningsCents,
        clipsThisWeek: thisWeekClips.length,
        viewsThisWeek: thisWeekClips.reduce((s, c) => s + Math.max(0, (c.view_count || 0) - (c.baseline_view_count || 0)), 0),
        earningsThisWeekCents: thisWeekClips.reduce((s, c) => s + (c.earnings_cents || 0), 0),
        clipsLastWeek: lastWeekClips.length,
        clipsToday,
        streakDays,
        lastPayoutDate: null,
        avgViewsPerClipPerWeek,
        loading: false,
      });
    } catch {
      setStats((s) => ({ ...s, loading: false }));
    }
  }, [userId]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return { ...stats, refresh: fetchStats };
}
