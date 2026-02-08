import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

interface GamificationStats {
  blessedCoins: number;
  hearts: number;
  streak: number;
  mealsImpact: number;
  wristbandsImpact: number;
  friendsBlessed: number;
  globalBlessings: number;
  livePeopleOnline: number;
}

const STORAGE_KEY = "gamification-stats";
const GLOBAL_CACHE_KEY = "gamification-global-cache";
const GLOBAL_CACHE_TTL = 30_000; // 30s

function loadLocal(): Omit<GamificationStats, "globalBlessings" | "livePeopleOnline"> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return {
    blessedCoins: 0,
    hearts: 0,
    streak: 0,
    mealsImpact: 0,
    wristbandsImpact: 0,
    friendsBlessed: 0,
  };
}

function saveLocal(data: Omit<GamificationStats, "globalBlessings" | "livePeopleOnline">) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

/** Simulate live people online with slow drift (TEMU-style) */
function getSimulatedOnline(): number {
  const hour = new Date().getHours();
  // Peak at 8pm (20h), low at 4am (4h)
  const base = 800 + Math.round(400 * Math.sin(((hour - 4) / 24) * Math.PI * 2));
  const jitter = Math.floor(Math.random() * 60) - 30;
  return Math.max(200, base + jitter);
}

export function useGamificationStats() {
  const [stats, setStats] = useState<GamificationStats>(() => ({
    ...loadLocal(),
    globalBlessings: 0,
    livePeopleOnline: getSimulatedOnline(),
  }));

  // Fetch real global blessing count (with cache)
  useEffect(() => {
    const fetchGlobal = async () => {
      try {
        const cached = sessionStorage.getItem(GLOBAL_CACHE_KEY);
        if (cached) {
          const { value, ts } = JSON.parse(cached);
          if (Date.now() - ts < GLOBAL_CACHE_TTL) {
            setStats((s) => ({ ...s, globalBlessings: value }));
            return;
          }
        }
        const { data } = await supabase.rpc("get_global_blessing_count");
        const count = (data as number) ?? 0;
        sessionStorage.setItem(GLOBAL_CACHE_KEY, JSON.stringify({ value: count, ts: Date.now() }));
        setStats((s) => ({ ...s, globalBlessings: count }));
      } catch {}
    };
    fetchGlobal();
  }, []);

  // Drift "live people online" every 8s
  useEffect(() => {
    const id = setInterval(() => {
      setStats((s) => ({
        ...s,
        livePeopleOnline: Math.max(
          200,
          s.livePeopleOnline + Math.floor(Math.random() * 11) - 5
        ),
      }));
    }, 8000);
    return () => clearInterval(id);
  }, []);

  const addCoins = useCallback((amount: number) => {
    setStats((s) => {
      const updated = { ...s, blessedCoins: s.blessedCoins + amount };
      saveLocal(updated);
      return updated;
    });
  }, []);

  const addHearts = useCallback((amount: number) => {
    setStats((s) => {
      const updated = { ...s, hearts: s.hearts + amount };
      saveLocal(updated);
      return updated;
    });
  }, []);

  const incrementStreak = useCallback(() => {
    setStats((s) => {
      const updated = { ...s, streak: s.streak + 1 };
      saveLocal(updated);
      return updated;
    });
  }, []);

  const addImpact = useCallback(
    (meals: number, wristbands: number, friends: number) => {
      setStats((s) => {
        const updated = {
          ...s,
          mealsImpact: s.mealsImpact + meals,
          wristbandsImpact: s.wristbandsImpact + wristbands,
          friendsBlessed: s.friendsBlessed + friends,
          hearts: s.hearts + meals + wristbands * 5 + friends * 10,
          blessedCoins: s.blessedCoins + meals * 2 + wristbands * 10 + friends * 25,
        };
        saveLocal(updated);
        return updated;
      });
    },
    []
  );

  return { stats, addCoins, addHearts, incrementStreak, addImpact };
}
