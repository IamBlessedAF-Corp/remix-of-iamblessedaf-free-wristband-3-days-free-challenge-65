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
  streakDays: number;
  lastPayoutDate: string | null;
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
    streakDays: 0,
    lastPayoutDate: null,
    loading: true,
  });

  const fetchStats = useCallback(async () => {
    if (!userId) return;

    try {
      const thisWeekStart = getWeekStart(0);
      const lastWeekStart = getWeekStart(1);

      // Fetch all clips
      const { data: allClips } = await supabase
        .from("clip_submissions")
        .select("view_count, earnings_cents, submitted_at")
        .eq("user_id", userId)
        .order("submitted_at", { ascending: false });

      if (!allClips) {
        setStats((s) => ({ ...s, loading: false }));
        return;
      }

      const totalViews = allClips.reduce((s, c) => s + (c.view_count || 0), 0);
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

      setStats({
        totalViews,
        totalClips: allClips.length,
        totalEarningsCents,
        clipsThisWeek: thisWeekClips.length,
        viewsThisWeek: thisWeekClips.reduce((s, c) => s + (c.view_count || 0), 0),
        earningsThisWeekCents: thisWeekClips.reduce((s, c) => s + (c.earnings_cents || 0), 0),
        clipsLastWeek: lastWeekClips.length,
        streakDays,
        lastPayoutDate: null, // No payout table yet
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
