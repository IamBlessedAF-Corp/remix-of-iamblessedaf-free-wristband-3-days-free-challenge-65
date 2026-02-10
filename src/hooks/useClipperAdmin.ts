import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface ClipRow {
  id: string;
  user_id: string;
  clip_url: string;
  platform: string;
  status: string;
  view_count: number;
  earnings_cents: number;
  submitted_at: string;
  verified_at: string | null;
  display_name?: string;
}

export interface ClipperUser {
  user_id: string;
  display_name: string;
  totalClips: number;
  totalViews: number;
  totalEarningsCents: number;
  pendingClips: number;
  lastSubmitted: string;
}

export interface CampaignStats {
  totalClippers: number;
  totalClips: number;
  totalViews: number;
  totalPaidCents: number;
  pendingReviewCount: number;
  verifiedCount: number;
  avgViewsPerClip: number;
  topPlatform: string;
  clipsThisWeek: number;
  clipsLastWeek: number;
}

const getWeekStart = (weeksAgo = 0): string => {
  const now = new Date();
  const day = now.getUTCDay();
  const diff = (day === 0 ? 6 : day - 1) + weeksAgo * 7;
  const monday = new Date(now);
  monday.setUTCDate(now.getUTCDate() - diff);
  monday.setUTCHours(0, 0, 0, 0);
  return monday.toISOString();
};

export function useClipperAdmin() {
  const [clips, setClips] = useState<ClipRow[]>([]);
  const [clippers, setClippers] = useState<ClipperUser[]>([]);
  const [stats, setStats] = useState<CampaignStats | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      // Fetch all clips (admin RLS policy)
      const { data: allClips } = await supabase
        .from("clip_submissions")
        .select("*")
        .order("submitted_at", { ascending: false });

      if (!allClips) {
        setLoading(false);
        return;
      }

      // Get display names
      const userIds = [...new Set(allClips.map((c) => c.user_id))];
      const { data: profiles } = await supabase
        .from("creator_profiles")
        .select("user_id, display_name");

      const nameMap = new Map<string, string>();
      profiles?.forEach((p) => {
        if (p.display_name) nameMap.set(p.user_id, p.display_name);
      });

      // Enrich clips with display names
      const enrichedClips: ClipRow[] = allClips.map((c) => ({
        ...c,
        display_name: nameMap.get(c.user_id) || `User ${c.user_id.slice(0, 6)}`,
      }));
      setClips(enrichedClips);

      // Aggregate per user
      const userMap = new Map<string, ClipperUser>();
      for (const c of allClips) {
        const prev = userMap.get(c.user_id) || {
          user_id: c.user_id,
          display_name: nameMap.get(c.user_id) || `User ${c.user_id.slice(0, 6)}`,
          totalClips: 0,
          totalViews: 0,
          totalEarningsCents: 0,
          pendingClips: 0,
          lastSubmitted: c.submitted_at,
        };
        prev.totalClips += 1;
        prev.totalViews += c.view_count || 0;
        prev.totalEarningsCents += c.earnings_cents || 0;
        if (c.status === "pending") prev.pendingClips += 1;
        if (c.submitted_at > prev.lastSubmitted) prev.lastSubmitted = c.submitted_at;
        userMap.set(c.user_id, prev);
      }
      setClippers(Array.from(userMap.values()).sort((a, b) => b.totalViews - a.totalViews));

      // Campaign stats
      const thisWeekStart = getWeekStart(0);
      const lastWeekStart = getWeekStart(1);
      const platformCount: Record<string, number> = {};
      let totalViews = 0;
      let totalPaid = 0;
      let pending = 0;
      let verified = 0;
      let thisWeek = 0;
      let lastWeek = 0;

      for (const c of allClips) {
        totalViews += c.view_count || 0;
        totalPaid += c.earnings_cents || 0;
        if (c.status === "pending") pending++;
        if (c.status === "verified") verified++;
        platformCount[c.platform] = (platformCount[c.platform] || 0) + 1;
        if (c.submitted_at >= thisWeekStart) thisWeek++;
        else if (c.submitted_at >= lastWeekStart) lastWeek++;
      }

      const topPlatform = Object.entries(platformCount).sort((a, b) => b[1] - a[1])[0]?.[0] || "—";

      setStats({
        totalClippers: userIds.length,
        totalClips: allClips.length,
        totalViews,
        totalPaidCents: totalPaid,
        pendingReviewCount: pending,
        verifiedCount: verified,
        avgViewsPerClip: allClips.length > 0 ? Math.round(totalViews / allClips.length) : 0,
        topPlatform,
        clipsThisWeek: thisWeek,
        clipsLastWeek: lastWeek,
      });
    } catch (err) {
      console.error("Admin fetch error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const updateClipStatus = useCallback(
    async (clipId: string, newStatus: string, viewCount?: number, earningsCents?: number) => {
      const updates: Record<string, any> = { status: newStatus };
      if (newStatus === "verified") updates.verified_at = new Date().toISOString();
      if (viewCount !== undefined) updates.view_count = viewCount;
      if (earningsCents !== undefined) updates.earnings_cents = earningsCents;

      const { error } = await supabase
        .from("clip_submissions")
        .update(updates)
        .eq("id", clipId);

      if (!error) {
        // Send notification + award BC for approved clips
        if (newStatus === "verified") {
          const clip = clips.find((c) => c.id === clipId);
          if (clip) {
            supabase.functions.invoke("clip-approved-notification", {
              body: { clip_id: clipId, user_id: clip.user_id, action: "approved" },
            }).catch((e) => console.error("Notification error:", e));
          }
        }
        await fetchAll();
      }
      return error;
    },
    [fetchAll, clips]
  );

  const bulkApprove = useCallback(
    async (clipIds: string[]) => {
      for (const id of clipIds) {
        await supabase
          .from("clip_submissions")
          .update({ status: "verified", verified_at: new Date().toISOString() })
          .eq("id", id);

        // Send notification for each approved clip
        const clip = clips.find((c) => c.id === id);
        if (clip) {
          supabase.functions.invoke("clip-approved-notification", {
            body: { clip_id: id, user_id: clip.user_id, action: "approved" },
          }).catch((e) => console.error("Notification error:", e));
        }
      }
      await fetchAll();
    },
    [fetchAll, clips]
  );

  const deleteClip = useCallback(
    async (clipId: string) => {
      const { error } = await supabase.from("clip_submissions").delete().eq("id", clipId);
      if (!error) await fetchAll();
      return error;
    },
    [fetchAll]
  );

  return { clips, clippers, stats, loading, refresh: fetchAll, updateClipStatus, bulkApprove, deleteClip };
}
