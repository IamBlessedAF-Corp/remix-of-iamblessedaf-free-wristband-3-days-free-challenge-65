import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

const LIVE_THRESHOLD = 21; // switch to live after 21+ real submissions

// Simulated seed data: 14 clippers with good payouts
const SIMULATED = {
  totalClippers: 14,
  totalClips: 87,
  totalViewsFormatted: "142k",
  totalPaidOut: "$412",
};

export function useClipperSocialProof() {
  const [realCount, setRealCount] = useState(0);
  const [realStats, setRealStats] = useState({ clips: 0, views: 0, earningsCents: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      // Count distinct clippers
      const { data: clippers } = await supabase
        .from("clip_submissions")
        .select("user_id");

      const uniqueUsers = new Set(clippers?.map((c) => c.user_id) || []);
      setRealCount(uniqueUsers.size);

      // Aggregate stats
      const { data: allClips } = await supabase
        .from("clip_submissions")
        .select("view_count, earnings_cents");

      if (allClips) {
        setRealStats({
          clips: allClips.length,
          views: allClips.reduce((s, c) => s + (c.view_count || 0), 0),
          earningsCents: allClips.reduce((s, c) => s + (c.earnings_cents || 0), 0),
        });
      }
      setLoading(false);
    };
    fetch();
  }, []);

  const useLive = realCount >= LIVE_THRESHOLD;

  const formatViews = (v: number) =>
    v >= 1_000_000 ? `${(v / 1_000_000).toFixed(1)}M` : v >= 1_000 ? `${Math.round(v / 1000)}k` : `${v}`;

  return {
    totalClippers: useLive ? realCount : SIMULATED.totalClippers,
    totalClips: useLive ? realStats.clips : SIMULATED.totalClips,
    totalViews: useLive ? formatViews(realStats.views) : SIMULATED.totalViewsFormatted,
    totalPaidOut: useLive ? `$${(realStats.earningsCents / 100).toFixed(0)}` : SIMULATED.totalPaidOut,
    isLive: useLive,
    loading,
  };
}
