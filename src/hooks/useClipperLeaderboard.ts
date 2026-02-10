import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface LeaderboardClipper {
  rank: number;
  displayName: string;
  viewsThisWeek: number;
  clipsThisWeek: number;
  isCurrentUser: boolean;
}

const LIVE_THRESHOLD = 21; // switch to live after 21 unique submitters

// Simulated leaderboard for early campaign phase
const SIMULATED_LEADERBOARD: Omit<LeaderboardClipper, "isCurrentUser">[] = [
  { rank: 1, displayName: "DegenKing_TT", viewsThisWeek: 48200, clipsThisWeek: 12 },
  { rank: 2, displayName: "BlessedClips", viewsThisWeek: 34700, clipsThisWeek: 9 },
  { rank: 3, displayName: "ViralVault_", viewsThisWeek: 27100, clipsThisWeek: 8 },
  { rank: 4, displayName: "ReelsRunner", viewsThisWeek: 19800, clipsThisWeek: 7 },
  { rank: 5, displayName: "ShortFormSam", viewsThisWeek: 15400, clipsThisWeek: 6 },
  { rank: 6, displayName: "ClipMaster22", viewsThisWeek: 11200, clipsThisWeek: 5 },
  { rank: 7, displayName: "NightOwlEdits", viewsThisWeek: 8900, clipsThisWeek: 4 },
  { rank: 8, displayName: "TrendCatcher", viewsThisWeek: 6100, clipsThisWeek: 4 },
  { rank: 9, displayName: "ContentBlitz", viewsThisWeek: 4300, clipsThisWeek: 3 },
  { rank: 10, displayName: "FreshStartClips", viewsThisWeek: 2800, clipsThisWeek: 3 },
];

// Get Monday 00:00 of current week (UTC)
const getWeekStart = (): string => {
  const now = new Date();
  const day = now.getUTCDay();
  const diff = day === 0 ? 6 : day - 1;
  const monday = new Date(now);
  monday.setUTCDate(now.getUTCDate() - diff);
  monday.setUTCHours(0, 0, 0, 0);
  return monday.toISOString();
};

export function useClipperLeaderboard(currentUserId: string | undefined) {
  const [leaderboard, setLeaderboard] = useState<LeaderboardClipper[]>([]);
  const [isLive, setIsLive] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        // Check unique submitters count
        const { count } = await supabase
          .from("clip_submissions")
          .select("user_id", { count: "exact", head: true });

        // Count distinct users - if we can't get exact, use the count
        const { data: distinctUsers } = await supabase
          .from("clip_submissions")
          .select("user_id")
          .limit(100);

        const uniqueUserIds = new Set(distinctUsers?.map((r) => r.user_id) ?? []);
        const isAboveThreshold = uniqueUserIds.size >= LIVE_THRESHOLD;

        if (!isAboveThreshold) {
          // Use simulated data
          setLeaderboard(
            SIMULATED_LEADERBOARD.map((entry) => ({
              ...entry,
              isCurrentUser: false,
            }))
          );
          setIsLive(false);
          setLoading(false);
          return;
        }

        // Live mode: aggregate this week's clips by user
        setIsLive(true);
        const weekStart = getWeekStart();

        const { data: clips } = await supabase
          .from("clip_submissions")
          .select("user_id, view_count")
          .gte("submitted_at", weekStart);

        if (!clips || clips.length === 0) {
          setLeaderboard([]);
          setLoading(false);
          return;
        }

        // Aggregate per user
        const userMap = new Map<string, { views: number; clips: number }>();
        for (const clip of clips) {
          const prev = userMap.get(clip.user_id) ?? { views: 0, clips: 0 };
          userMap.set(clip.user_id, {
            views: prev.views + (clip.view_count || 0),
            clips: prev.clips + 1,
          });
        }

        // Get display names from creator_profiles
        const userIds = Array.from(userMap.keys());
        const { data: profiles } = await supabase
          .from("creator_profiles")
          .select("user_id, display_name")
          .in("user_id", userIds);

        const nameMap = new Map<string, string>();
        profiles?.forEach((p) => {
          if (p.display_name) nameMap.set(p.user_id, p.display_name);
        });

        // Sort and rank
        const sorted = Array.from(userMap.entries())
          .sort((a, b) => b[1].views - a[1].views)
          .slice(0, 10);

        const board: LeaderboardClipper[] = sorted.map(([userId, stats], i) => ({
          rank: i + 1,
          displayName: nameMap.get(userId) ?? `Clipper #${i + 1}`,
          viewsThisWeek: stats.views,
          clipsThisWeek: stats.clips,
          isCurrentUser: userId === currentUserId,
        }));

        setLeaderboard(board);
      } catch {
        // Fallback to simulated
        setLeaderboard(
          SIMULATED_LEADERBOARD.map((entry) => ({
            ...entry,
            isCurrentUser: false,
          }))
        );
        setIsLive(false);
      } finally {
        setLoading(false);
      }
    };

    fetch();
  }, [currentUserId]);

  return { leaderboard, isLive, loading };
}
