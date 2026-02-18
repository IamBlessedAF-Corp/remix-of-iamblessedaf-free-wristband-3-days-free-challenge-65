import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

/**
 * Reward tiers — maps each checkout offer to BC coins, hearts, meals, wristbands, friends blessed.
 * Aligned with Feeding America donation tiers.
 */
export type OfferTier =
  | "free-wristband"
  | "wristband-22"
  | "pack-111"
  | "pack-444"
  | "pack-1111"
  | "pack-4444"
  | "monthly-11";

export interface TierReward {
  coins: number;
  hearts: number;
  meals: number;
  wristbands: number;
  friends: number;
  streak: boolean; // whether this purchase increments the streak
}

export const TIER_REWARDS: Record<OfferTier, TierReward> = {
  "free-wristband": { coins: 10, hearts: 5, meals: 0, wristbands: 1, friends: 0, streak: false },
  "wristband-22":   { coins: 50, hearts: 30, meals: 22, wristbands: 3, friends: 0, streak: false },
  "pack-111":       { coins: 111, hearts: 80, meals: 11, wristbands: 3, friends: 1, streak: true },
  "pack-444":       { coins: 444, hearts: 250, meals: 1111, wristbands: 14, friends: 3, streak: true },
  "pack-1111":      { coins: 1111, hearts: 700, meals: 11111, wristbands: 111, friends: 11, streak: true },
  "pack-4444":      { coins: 4444, hearts: 3000, meals: 44444, wristbands: 444, friends: 44, streak: true },
  "monthly-11":     { coins: 25, hearts: 15, meals: 1, wristbands: 0, friends: 0, streak: true },
};

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

/** Tracks the last BC earn event for UI toasts */
let _lastCoinEarn: { amount: number; ts: number } | null = null;
const _coinEarnListeners = new Set<() => void>();

function notifyCoinEarn(amount: number) {
  _lastCoinEarn = { amount, ts: Date.now() };
  _coinEarnListeners.forEach((fn) => fn());
}

/** Hook to subscribe to BC earn events (used by GamificationHeader) */
export function useCoinEarnEvent() {
  const [earn, setEarn] = useState<{ amount: number; ts: number } | null>(null);

  useEffect(() => {
    const handler = () => setEarn(_lastCoinEarn ? { ..._lastCoinEarn } : null);
    _coinEarnListeners.add(handler);
    return () => { _coinEarnListeners.delete(handler); };
  }, []);

  const dismiss = useCallback(() => setEarn(null), []);
  return { earn, dismiss };
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
    notifyCoinEarn(amount);
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
      const coinGain = meals * 2 + wristbands * 10 + friends * 25;
      setStats((s) => {
        const updated = {
          ...s,
          mealsImpact: s.mealsImpact + meals,
          wristbandsImpact: s.wristbandsImpact + wristbands,
          friendsBlessed: s.friendsBlessed + friends,
          hearts: s.hearts + meals + wristbands * 5 + friends * 10,
          blessedCoins: s.blessedCoins + coinGain,
        };
        saveLocal(updated);
        return updated;
      });
      if (coinGain > 0) notifyCoinEarn(coinGain);
    },
    []
  );

  /** Reward for sharing (SMS, WhatsApp, link copy) */
  const rewardShare = useCallback((method: "sms" | "whatsapp" | "link") => {
    const shareRewards: Record<string, number> = { sms: 15, whatsapp: 15, link: 5 };
    const amount = shareRewards[method] || 5;
    setStats((s) => {
      const updated = { ...s, blessedCoins: s.blessedCoins + amount };
      saveLocal(updated);
      return updated;
    });
    notifyCoinEarn(amount);
  }, []);

  /** Fire-and-forget: reward the user for completing a checkout at a given tier */
  const rewardCheckout = useCallback(async (tier: OfferTier) => {
    const r = TIER_REWARDS[tier];
    setStats((s) => {
      const updated = {
        ...s,
        blessedCoins: s.blessedCoins + r.coins,
        hearts: s.hearts + r.hearts,
        mealsImpact: s.mealsImpact + r.meals,
        wristbandsImpact: s.wristbandsImpact + r.wristbands,
        friendsBlessed: s.friendsBlessed + r.friends,
        streak: r.streak ? s.streak + 1 : s.streak,
      };
      saveLocal(updated);
      return updated;
    });
    notifyCoinEarn(r.coins);

    // Also sync to DB wallet if user is authenticated (via server-side RPC)
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.rpc('bc_earn_coins' as any, {
          p_amount: r.coins,
          p_reason: 'checkout',
          p_metadata: { tier, hearts: r.hearts, meals: r.meals },
        });
      }
    } catch (err) {
      console.error("BC wallet sync error (non-blocking):", err);
    }
  }, []);

  return { stats, addCoins, addHearts, incrementStreak, addImpact, rewardShare, rewardCheckout };
}
