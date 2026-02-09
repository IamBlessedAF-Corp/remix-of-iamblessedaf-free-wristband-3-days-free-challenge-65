import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

const CACHE_KEY = "global-meals-cache";
const CACHE_TTL = 60_000; // 60s

export function useGlobalMeals() {
  const [meals, setMeals] = useState<number>(() => {
    try {
      const cached = sessionStorage.getItem(CACHE_KEY);
      if (cached) {
        const { value, ts } = JSON.parse(cached);
        if (Date.now() - ts < CACHE_TTL) return value;
      }
    } catch {}
    return 0;
  });
  const [loading, setLoading] = useState(meals === 0);

  useEffect(() => {
    const fetchMeals = async () => {
      try {
        const cached = sessionStorage.getItem(CACHE_KEY);
        if (cached) {
          const { value, ts } = JSON.parse(cached);
          if (Date.now() - ts < CACHE_TTL) {
            setMeals(value);
            setLoading(false);
            return;
          }
        }

        const { data, error } = await supabase.rpc("get_total_meals_donated");
        if (!error && data !== null) {
          const count = Number(data);
          setMeals(count);
          sessionStorage.setItem(CACHE_KEY, JSON.stringify({ value: count, ts: Date.now() }));
        }
      } catch {}
      setLoading(false);
    };

    fetchMeals();
  }, []);

  return { meals, loading };
}
