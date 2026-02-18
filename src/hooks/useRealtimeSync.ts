import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

/**
 * Subscribes to Supabase Realtime on high-value tables and
 * automatically invalidates the relevant React Query cache keys.
 *
 * Strategy (Meta-style):
 * - Only 4 hot tables get websocket channels (not all 36)
 * - Each table change invalidates ALL query keys that reference it
 * - Debounced: changes within 500ms are batched into one invalidation
 * - Cleanup on unmount to prevent memory leaks
 */

const REALTIME_TABLES = [
  { table: "campaign_config", queryKeys: ["campaign-config", "copy-manager", "admin-copy-config"] },
  { table: "orders", queryKeys: ["orders", "orders-count-live"] },
  { table: "clip_submissions", queryKeys: ["clips", "clipper", "clippers-count"] },
  { table: "creator_profiles", queryKeys: ["creators", "creators-count-live", "creator-profile", "leaderboard"] },
  { table: "changelog_entries", queryKeys: ["changelog-entries"] },
] as const;

export function useRealtimeSync() {
  const queryClient = useQueryClient();

  useEffect(() => {
    let debounceTimer: ReturnType<typeof setTimeout> | null = null;
    const pendingKeys = new Set<string>();

    const flush = () => {
      pendingKeys.forEach((key) => {
        queryClient.invalidateQueries({ queryKey: [key] });
      });
      pendingKeys.clear();
      debounceTimer = null;
    };

    const scheduleInvalidation = (keys: readonly string[]) => {
      keys.forEach((k) => pendingKeys.add(k));
      if (debounceTimer) clearTimeout(debounceTimer);
      debounceTimer = setTimeout(flush, 500);
    };

    const channel = supabase
      .channel("admin-realtime-sync")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "campaign_config" },
        () => scheduleInvalidation(REALTIME_TABLES[0].queryKeys)
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "orders" },
        () => scheduleInvalidation(REALTIME_TABLES[1].queryKeys)
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "clip_submissions" },
        () => scheduleInvalidation(REALTIME_TABLES[2].queryKeys)
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "creator_profiles" },
        () => scheduleInvalidation(REALTIME_TABLES[3].queryKeys)
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "changelog_entries" },
        () => scheduleInvalidation(REALTIME_TABLES[4].queryKeys)
      )
      .subscribe();

    return () => {
      if (debounceTimer) clearTimeout(debounceTimer);
      supabase.removeChannel(channel);
    };
  }, [queryClient]);
}
