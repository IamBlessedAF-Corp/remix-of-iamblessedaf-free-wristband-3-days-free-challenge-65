import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface BcWallet {
  id: string;
  user_id: string;
  balance: number;
  lifetime_earned: number;
  lifetime_spent: number;
  streak_days: number;
  last_login_bonus_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface BcTransaction {
  id: string;
  user_id: string;
  wallet_id: string;
  type: "earn" | "spend";
  amount: number;
  reason: string;
  metadata: Record<string, any>;
  balance_after: number;
  created_at: string;
}

export interface BcStoreItem {
  id: string;
  name: string;
  description: string | null;
  cost_bc: number;
  category: string;
  reward_type: string;
  reward_value: Record<string, any>;
  image_url: string | null;
  stock: number | null;
  is_active: boolean;
  sort_order: number;
  created_at: string;
}

export interface BcRedemption {
  id: string;
  user_id: string;
  store_item_id: string;
  cost_bc: number;
  status: string;
  redemption_code: string | null;
  created_at: string;
}

const from = (table: string) => supabase.from(table as any); // used for read queries

export function useBcWallet() {
  const [wallet, setWallet] = useState<BcWallet | null>(null);
  const [transactions, setTransactions] = useState<BcTransaction[]>([]);
  const [storeItems, setStoreItems] = useState<BcStoreItem[]>([]);
  const [redemptions, setRedemptions] = useState<BcRedemption[]>([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

  // Get current user
  useEffect(() => {
    const getUser = async () => {
      const { data } = await supabase.auth.getUser();
      setUserId(data.user?.id ?? null);
    };
    getUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUserId(session?.user?.id ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  // Fetch or create wallet when user is authenticated
  const fetchWallet = useCallback(async () => {
    if (!userId) {
      setWallet(null);
      setTransactions([]);
      setRedemptions([]);
      setLoading(false);
      return;
    }

    setLoading(true);

    // Try to fetch existing wallet
    const { data: existingWallet } = await from("bc_wallets")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle();

    let currentWallet: BcWallet;

    if (existingWallet) {
      currentWallet = existingWallet as unknown as BcWallet;
    } else {
      // Merge localStorage balance into new wallet
      const localBalance = getLocalStorageBalance();
      const { data: newWallet } = await from("bc_wallets")
        .insert({
          user_id: userId,
          balance: localBalance,
          lifetime_earned: localBalance,
        } as any)
        .select()
        .single();

      if (!newWallet) {
        setLoading(false);
        return;
      }
      currentWallet = newWallet as unknown as BcWallet;

      // Log the merge as a transaction if there's a balance
      if (localBalance > 0) {
        await from("bc_transactions").insert({
          user_id: userId,
          wallet_id: currentWallet.id,
          type: "earn",
          amount: localBalance,
          reason: "local_sync",
          metadata: { source: "localStorage_merge" },
          balance_after: localBalance,
        } as any);

        // Clear localStorage balance after sync
        clearLocalStorageBalance();
      }
    }

    setWallet(currentWallet);

    // Fetch transactions + redemptions in parallel
    const [txRes, redRes] = await Promise.all([
      from("bc_transactions")
        .select("*")
        .eq("wallet_id", currentWallet.id)
        .order("created_at", { ascending: false })
        .limit(50),
      from("bc_redemptions")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(20),
    ]);

    if (txRes.data) setTransactions(txRes.data as unknown as BcTransaction[]);
    if (redRes.data) setRedemptions(redRes.data as unknown as BcRedemption[]);
    setLoading(false);
  }, [userId]);

  // Fetch store items (public, no auth needed)
  const fetchStore = useCallback(async () => {
    const { data } = await from("bc_store_items")
      .select("*")
      .eq("is_active", true)
      .order("sort_order");
    if (data) setStoreItems(data as unknown as BcStoreItem[]);
  }, []);

  useEffect(() => {
    fetchWallet();
  }, [fetchWallet]);

  useEffect(() => {
    fetchStore();
  }, [fetchStore]);

  /** Earn BC — server-side via RPC */
  const earnCoins = useCallback(async (amount: number, reason: string, metadata: Record<string, any> = {}) => {
    if (!wallet || !userId) return;

    const { data, error } = await supabase.rpc('bc_earn_coins' as any, {
      p_amount: amount,
      p_reason: reason,
      p_metadata: metadata,
    });
    if (error) { console.error("bc_earn_coins error:", error); return; }
    await fetchWallet();
  }, [wallet, userId, fetchWallet]);

  /** Spend BC — server-side via RPC */
  const spendCoins = useCallback(async (amount: number, reason: string, metadata: Record<string, any> = {}): Promise<boolean> => {
    if (!wallet || !userId || wallet.balance < amount) return false;

    const { data, error } = await supabase.rpc('bc_spend_coins' as any, {
      p_amount: amount,
      p_reason: reason,
      p_metadata: metadata,
    });
    if (error) { console.error("bc_spend_coins error:", error); return false; }
    const result = data as any;
    if (result && !result.success) return false;
    await fetchWallet();
    return true;
  }, [wallet, userId, fetchWallet]);

  /** Redeem a store item — server-side via RPC */
  const redeemItem = useCallback(async (item: BcStoreItem): Promise<boolean> => {
    if (!wallet || !userId || wallet.balance < item.cost_bc) return false;

    const { data, error } = await supabase.rpc('bc_redeem_item' as any, {
      p_item_id: item.id,
    });
    if (error) { console.error("bc_redeem_item error:", error); return false; }
    const result = data as any;
    if (result && !result.success) return false;
    await fetchWallet();
    return true;
  }, [wallet, userId, fetchWallet]);

  /** Check and award daily login bonus — server-side via RPC */
  const claimDailyBonus = useCallback(async (): Promise<{ awarded: boolean; amount: number; streak: number }> => {
    if (!wallet || !userId) return { awarded: false, amount: 0, streak: 0 };

    const today = new Date().toISOString().split("T")[0];
    if (wallet.last_login_bonus_at === today) {
      return { awarded: false, amount: 0, streak: wallet.streak_days };
    }

    const { data, error } = await supabase.rpc('bc_claim_daily_bonus' as any);
    if (error) { console.error("bc_claim_daily_bonus error:", error); return { awarded: false, amount: 0, streak: 0 }; }
    const result = data as any;
    if (result?.awarded) await fetchWallet();
    return { awarded: result?.awarded || false, amount: result?.amount || 0, streak: result?.streak || 0 };
  }, [wallet, userId, fetchWallet]);

  return {
    wallet,
    transactions,
    storeItems,
    redemptions,
    loading,
    isAuthenticated: !!userId,
    earnCoins,
    spendCoins,
    redeemItem,
    claimDailyBonus,
    refetch: fetchWallet,
  };
}

// LocalStorage helpers for anonymous users
function getLocalStorageBalance(): number {
  try {
    const raw = localStorage.getItem("gamification-stats");
    if (raw) {
      const data = JSON.parse(raw);
      return data.blessedCoins || 0;
    }
  } catch {}
  return 0;
}

function clearLocalStorageBalance() {
  try {
    const raw = localStorage.getItem("gamification-stats");
    if (raw) {
      const data = JSON.parse(raw);
      data.blessedCoins = 0;
      localStorage.setItem("gamification-stats", JSON.stringify(data));
    }
  } catch {}
}
