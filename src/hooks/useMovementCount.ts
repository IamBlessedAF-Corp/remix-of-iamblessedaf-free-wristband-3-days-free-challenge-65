import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const LIVE_THRESHOLD = 999;
const STATIC_COUNT = 847;

/**
 * Returns the number of people who joined the movement.
 * Shows a static number until real registrations exceed LIVE_THRESHOLD,
 * then switches to live DB count.
 */
export function useMovementCount() {
  const { data: liveCount, isLoading } = useQuery({
    queryKey: ["movement-count"],
    queryFn: async () => {
      const { count, error } = await supabase
        .from("challenge_participants")
        .select("id", { count: "exact", head: true });
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
