import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const LIVE_THRESHOLD = 999;
const STATIC_COUNT = 847;

/**
 * Returns the number of people who joined the movement THIS WEEK.
 * Shows a static number until real weekly registrations exceed LIVE_THRESHOLD,
 * then switches to live DB count filtered by last 7 days.
 */
export function useMovementCount() {
  const { data: liveCount, isLoading } = useQuery({
    queryKey: ["movement-count-weekly"],
    queryFn: async () => {
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      const { count, error } = await supabase
        .from("challenge_participants")
        .select("id", { count: "exact", head: true })
        .gte("created_at", sevenDaysAgo.toISOString());
      if (error) throw error;
      return count ?? 0;
    },
    staleTime: 60_000,
    refetchInterval: 120_000,
  });

  const isLive = (liveCount ?? 0) >= LIVE_THRESHOLD;
  const displayCount = isLive ? (liveCount ?? 0) : STATIC_COUNT;

  return { displayCount, isLive, isLoading };
}
