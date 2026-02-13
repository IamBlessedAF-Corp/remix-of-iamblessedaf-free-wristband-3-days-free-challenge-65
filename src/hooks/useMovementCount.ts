import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const LIVE_THRESHOLD = 999;
const BASE_STATIC_COUNT = 847;
const VISIT_BOOST_KEY = "movement_visit_count";

/**
 * Returns the number of people who joined the movement THIS WEEK.
 * - Increments displayed count by 5% for each repeat visit (same user).
 * - After 999 real weekly users, switches to live DB count.
 */
export function useMovementCount() {
  // Track visit count in localStorage for 5% boost per visit
  const visitCount = (() => {
    const stored = parseInt(localStorage.getItem(VISIT_BOOST_KEY) || "0", 10);
    const next = stored + 1;
    localStorage.setItem(VISIT_BOOST_KEY, next.toString());
    return next;
  })();

  const boostedStatic = Math.round(BASE_STATIC_COUNT * Math.pow(1.05, visitCount - 1));

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
  const displayCount = isLive ? (liveCount ?? 0) : boostedStatic;

  return { displayCount, isLive, isLoading };
}
