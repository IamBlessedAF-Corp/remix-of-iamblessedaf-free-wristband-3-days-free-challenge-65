import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { User } from "@supabase/supabase-js";

export interface PortalProfile {
  id: string;
  user_id: string;
  display_name: string | null;
  email: string;
  referral_code: string;
  blessings_confirmed: number;
  instagram_handle: string | null;
  tiktok_handle: string | null;
  twitter_handle: string | null;
}

export interface PortalWallet {
  id: string;
  balance: number;
  lifetime_earned: number;
  lifetime_spent: number;
  streak_days: number;
  last_login_bonus_at: string | null;
}

export interface LeaderboardEntry {
  id: string | null;
  display_name: string | null;
  referral_code: string | null;
  blessings_confirmed: number | null;
  user_id: string | null;
}

export interface BlessingRow {
  id: string;
  recipient_name: string | null;
  confirmed_at: string | null;
  created_at: string;
  expires_at: string;
}

export const TIERS = [
  { name: "Bronze", minBC: 0, emoji: "🥉", color: "hsl(30 60% 50%)" },
  { name: "Silver", minBC: 500, emoji: "🥈", color: "hsl(0 0% 70%)" },
  { name: "Gold", minBC: 2000, emoji: "🥇", color: "hsl(45 100% 50%)" },
  { name: "Diamond", minBC: 5000, emoji: "💎", color: "hsl(190 80% 70%)" },
] as const;

export function getTier(lifetimeEarned: number) {
  for (let i = TIERS.length - 1; i >= 0; i--) {
    if (lifetimeEarned >= TIERS[i].minBC) {
      const current = TIERS[i];
      const next = TIERS[i + 1] ?? null;
      const progress = next
        ? ((lifetimeEarned - current.minBC) / (next.minBC - current.minBC)) * 100
        : 100;
      return { current, next, progress: Math.min(progress, 100), index: i };
    }
  }
  return { current: TIERS[0], next: TIERS[1], progress: 0, index: 0 };
}

export function usePortalData() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<PortalProfile | null>(null);
  const [wallet, setWallet] = useState<PortalWallet | null>(null);
  const [blessings, setBlessings] = useState<BlessingRow[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Auth listener
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null);
      }
    );
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (!session?.user) setLoading(false);
    });
    return () => subscription.unsubscribe();
  }, []);

  // Fetch data when user changes
  useEffect(() => {
    if (!user) {
      setProfile(null);
      setWallet(null);
      setBlessings([]);
      setLoading(false);
      return;
    }
    const fetchAll = async () => {
      setLoading(true);
      setError(null);
      try {
        const [profileRes, walletRes, blessingsRes, leaderboardRes] = await Promise.all([
          supabase.from("creator_profiles").select("*").eq("user_id", user.id).maybeSingle(),
          supabase.from("bc_wallets").select("*").eq("user_id", user.id).maybeSingle(),
          supabase.from("blessings").select("id, recipient_name, confirmed_at, created_at, expires_at").eq("sender_id", user.id).order("created_at", { ascending: false }).limit(50),
          supabase.from("creator_profiles_public").select("*").order("blessings_confirmed", { ascending: false }).limit(50),
        ]);

        const currentProfile = (profileRes.data as PortalProfile) ?? null;

        setProfile(currentProfile);
        setWallet((walletRes.data as PortalWallet) ?? null);
        setBlessings((blessingsRes.data as BlessingRow[]) ?? []);
        setLeaderboard((leaderboardRes.data as LeaderboardEntry[]) ?? []);
      } catch (e: any) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, [user]);

  // Fetch leaderboard (public — no auth required)
  const refreshLeaderboard = useCallback(async () => {
    const { data } = await supabase
      .from("creator_profiles_public")
      .select("*")
      .order("blessings_confirmed", { ascending: false })
      .limit(50);
    if (data) setLeaderboard(data as LeaderboardEntry[]);
  }, []);

  // Claim daily login bonus
  const claimDailyBonus = useCallback(async () => {
    if (!user) return null;
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return null;

    const res = await supabase.functions.invoke("portal-daily-login", {
      headers: { Authorization: `Bearer ${session.access_token}` },
    });
    if (res.data && !res.error) {
      // Refresh wallet
      const { data: w } = await supabase.from("bc_wallets").select("*").eq("user_id", user.id).maybeSingle();
      if (w) setWallet(w as PortalWallet);
      return res.data;
    }
    return null;
  }, [user]);

  // Refresh blessings
  const refreshBlessings = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase
      .from("blessings")
      .select("id, recipient_name, confirmed_at, created_at, expires_at")
      .eq("sender_id", user.id)
      .order("created_at", { ascending: false })
      .limit(50);
    if (data) setBlessings(data as BlessingRow[]);
  }, [user]);

  return {
    user,
    profile,
    wallet,
    blessings,
    leaderboard,
    loading,
    error,
    claimDailyBonus,
    refreshLeaderboard,
    refreshBlessings,
  };
}
