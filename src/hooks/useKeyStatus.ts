import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

// ── Types ──────────────────────────────────────────────────────
export interface KeysStatus {
  id: string;
  user_id: string;
  key0_at: string | null;
  key1_at: string | null;
  key1_referrer_id: string | null;
  key2_at: string | null;
  key2_proof_type: string | null;
  key2_proof_url: string | null;
  key3_at: string | null;
  key3_friends_invited: number;
  key3_friends_accepted: number;
  master_key_at: string | null;
  shipping_credit_applied: boolean;
  timer_expires_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface ChallengeFriend {
  id: string;
  inviter_id: string;
  friend_user_id: string | null;
  friend_name: string | null;
  friend_phone: string | null;
  friend_email: string | null;
  invite_code: string;
  status: "invited" | "clicked" | "joined" | "expired";
  created_at: string;
  joined_at: string | null;
}

export interface JoyInvite {
  id: string;
  inviter_id: string;
  code: string;
  method: string;
  is_used: boolean;
  used_by: string | null;
  created_at: string;
  used_at: string | null;
}

export type KeyNumber = 0 | 1 | 2 | 3 | "master";

// ── Helpers ────────────────────────────────────────────────────
const from = (table: string) => supabase.from(table as any);

function computeCurrentKey(status: KeysStatus | null): KeyNumber | null {
  if (!status) return null;
  if (status.master_key_at) return "master";
  if (status.key3_at) return 3;
  if (status.key2_at) return 2;
  if (status.key1_at) return 1;
  if (status.key0_at) return 0;
  return null;
}

function computeTimerRemaining(status: KeysStatus | null): number {
  if (!status?.timer_expires_at) return 0;
  const diff = new Date(status.timer_expires_at).getTime() - Date.now();
  return Math.max(0, diff);
}

// ── Hook ───────────────────────────────────────────────────────
export function useKeyStatus() {
  const [status, setStatus] = useState<KeysStatus | null>(null);
  const [friends, setFriends] = useState<ChallengeFriend[]>([]);
  const [invites, setInvites] = useState<JoyInvite[]>([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

  // ── Auth listener ──
  useEffect(() => {
    const getUser = async () => {
      const { data } = await supabase.auth.getUser();
      setUserId(data.user?.id ?? null);
    };
    getUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUserId(session?.user?.id ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  // ── Fetch key status + friends + invites ──
  const fetchStatus = useCallback(async () => {
    if (!userId) {
      setStatus(null);
      setFriends([]);
      setInvites([]);
      setLoading(false);
      return;
    }

    setLoading(true);

    const [statusRes, friendsRes, invitesRes] = await Promise.all([
      from("keys_status")
        .select("*")
        .eq("user_id", userId)
        .maybeSingle(),
      from("challenge_friends")
        .select("*")
        .eq("inviter_id", userId)
        .order("created_at", { ascending: false }),
      from("joy_invites")
        .select("*")
        .eq("inviter_id", userId)
        .order("created_at", { ascending: false })
        .limit(20),
    ]);

    if (statusRes.data) setStatus(statusRes.data as unknown as KeysStatus);
    if (friendsRes.data) setFriends(friendsRes.data as unknown as ChallengeFriend[]);
    if (invitesRes.data) setInvites(invitesRes.data as unknown as JoyInvite[]);

    setLoading(false);
  }, [userId]);

  useEffect(() => {
    fetchStatus();
  }, [fetchStatus]);

  // ── Key 0: Activate challenge ──
  const activateKey0 = useCallback(async (): Promise<boolean> => {
    if (!userId) return false;

    const { error } = await supabase.rpc("joy_activate_key0" as any, {
      p_user_id: userId,
    });
    if (error) {
      console.error("joy_activate_key0 error:", error);
      return false;
    }
    await fetchStatus();
    return true;
  }, [userId, fetchStatus]);

  // ── Key 1: Unlock via referral/clip ──
  const unlockKey1 = useCallback(
    async (
      referrerId: string | null,
      source: string = "organic",
      platform: string = "web",
      clipId: string = ""
    ): Promise<boolean> => {
      if (!userId) return false;

      const { error } = await supabase.rpc("joy_unlock_key1" as any, {
        p_user_id: userId,
        p_referrer_id: referrerId,
        p_source: source,
        p_platform: platform,
        p_clip_id: clipId,
      });
      if (error) {
        console.error("joy_unlock_key1 error:", error);
        return false;
      }
      await fetchStatus();
      return true;
    },
    [userId, fetchStatus]
  );

  // ── Key 2: Submit story proof ──
  const unlockKey2 = useCallback(
    async (proofType: string, proofUrl: string): Promise<boolean> => {
      if (!userId) return false;

      const { error } = await supabase.rpc("joy_unlock_key2" as any, {
        p_user_id: userId,
        p_proof_type: proofType,
        p_proof_url: proofUrl,
      });
      if (error) {
        console.error("joy_unlock_key2 error:", error);
        return false;
      }
      await fetchStatus();
      return true;
    },
    [userId, fetchStatus]
  );

  // ── Key 3: Send invite to a friend ──
  const sendInvite = useCallback(
    async (
      friendName: string,
      friendPhone: string = "",
      friendEmail: string = "",
      method: string = "link"
    ): Promise<{ success: boolean; inviteCode?: string }> => {
      if (!userId) return { success: false };

      const { data, error } = await supabase.rpc("joy_send_invite" as any, {
        p_inviter_id: userId,
        p_friend_name: friendName,
        p_friend_phone: friendPhone,
        p_friend_email: friendEmail,
        p_method: method,
      });
      if (error) {
        console.error("joy_send_invite error:", error);
        return { success: false };
      }

      await fetchStatus();
      const result = data as any;
      return {
        success: true,
        inviteCode: result?.invite_code || undefined,
      };
    },
    [userId, fetchStatus]
  );

  // ── Accept invite (called by the FRIEND, not the inviter) ──
  const acceptInvite = useCallback(
    async (inviteCode: string): Promise<boolean> => {
      if (!userId) return false;

      const { error } = await supabase.rpc("joy_accept_invite" as any, {
        p_invite_code: inviteCode,
        p_friend_user_id: userId,
      });
      if (error) {
        console.error("joy_accept_invite error:", error);
        return false;
      }
      await fetchStatus();
      return true;
    },
    [userId, fetchStatus]
  );

  // ── Computed values ──
  const currentKey = computeCurrentKey(status);
  const timerMs = computeTimerRemaining(status);
  const hasMasterKey = !!status?.master_key_at;
  const hasShippingCredit = !!status?.shipping_credit_applied;
  const friendsNeeded = status ? Math.max(0, 3 - status.key3_friends_accepted) : 3;

  const isKeyUnlocked = useCallback(
    (key: KeyNumber): boolean => {
      if (!status) return false;
      switch (key) {
        case 0:
          return !!status.key0_at;
        case 1:
          return !!status.key1_at;
        case 2:
          return !!status.key2_at;
        case 3:
          return !!status.key3_at;
        case "master":
          return !!status.master_key_at;
        default:
          return false;
      }
    },
    [status]
  );

  return {
    // State
    status,
    friends,
    invites,
    loading,
    isAuthenticated: !!userId,
    userId,

    // Computed
    currentKey,
    timerMs,
    hasMasterKey,
    hasShippingCredit,
    friendsNeeded,
    isKeyUnlocked,

    // Actions
    activateKey0,
    unlockKey1,
    unlockKey2,
    sendInvite,
    acceptInvite,

    // Refresh
    refetch: fetchStatus,
  };
}
