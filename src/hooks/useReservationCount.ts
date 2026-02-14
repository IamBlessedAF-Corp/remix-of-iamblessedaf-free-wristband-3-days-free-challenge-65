import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

const SEED = 23;

export function useReservationCount() {
  const [realCount, setRealCount] = useState<number | null>(null);

  useEffect(() => {
    supabase.rpc("get_smart_reservation_count").then(({ data }) => {
      setRealCount(data ?? 0);
    });
  }, []);

  const displayCount = realCount === null ? SEED : SEED + realCount;

  return { count: displayCount };
}
