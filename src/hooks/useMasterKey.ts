import { useCallback, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

// ── Types ──────────────────────────────────────────────────────
export interface MasterKeyResult {
  unlocked: boolean;
  shipping_credit: boolean;
  keys_completed: {
    key0: boolean;
    key1: boolean;
    key2: boolean;
    key3: boolean;
  };
  bc_awarded: number;
}

// ── Hook ───────────────────────────────────────────────────────
/**
 * useMasterKey — checks whether all 4 joy keys are complete
 * and, if so, triggers the master key unlock + shipping credit.
 *
 * Wraps the `joy_check_master_key` RPC which:
 *   1. Verifies key0–key3 are all timestamped
 *   2. Sets master_key_at + shipping_credit_applied
 *   3. Awards 500 BC via bc_earn_coins
 *   4. Returns status payload
 *
 * Usage:
 *   const { checkMasterKey, result, checking, celebrated, markCelebrated } = useMasterKey();
 *   // After key3 completes → call checkMasterKey(userId)
 *   // If result.unlocked → show celebration, then markCelebrated()
 */
export function useMasterKey() {
  const [result, setResult] = useState<MasterKeyResult | null>(null);
  const [checking, setChecking] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Track whether the user has seen the celebration animation
  const [celebrated, setCelebrated] = useState(false);

  /**
   * Check if all keys are done → unlock master key if eligible.
   * Safe to call multiple times — the RPC is idempotent.
   */
  const checkMasterKey = useCallback(
    async (userId: string): Promise<MasterKeyResult | null> => {
      if (!userId) return null;

      setChecking(true);
      setError(null);

      try {
        const { data, error: rpcError } = await supabase.rpc(
          "joy_check_master_key" as any,
          { p_user_id: userId }
        );

        if (rpcError) {
          console.error("joy_check_master_key error:", rpcError);
          setError(rpcError.message);
          setChecking(false);
          return null;
        }

        const raw = data as any;

        const masterResult: MasterKeyResult = {
          unlocked: !!raw?.unlocked,
          shipping_credit: !!raw?.shipping_credit,
          keys_completed: {
            key0: !!raw?.keys_completed?.key0,
            key1: !!raw?.keys_completed?.key1,
            key2: !!raw?.keys_completed?.key2,
            key3: !!raw?.keys_completed?.key3,
          },
          bc_awarded: raw?.bc_awarded ?? 0,
        };

        setResult(masterResult);
        setChecking(false);

        // If it was JUST unlocked (not previously), reset celebration
        if (masterResult.unlocked && masterResult.bc_awarded > 0) {
          setCelebrated(false);
        }

        return masterResult;
      } catch (err: any) {
        console.error("checkMasterKey exception:", err);
        setError(err?.message || "Unknown error");
        setChecking(false);
        return null;
      }
    },
    []
  );

  /**
   * Mark the celebration as seen so the UI doesn't re-trigger.
   */
  const markCelebrated = useCallback(() => {
    setCelebrated(true);
  }, []);

  /**
   * Quick check: are all 4 keys done based on local status?
   * Use this BEFORE calling the RPC to avoid unnecessary calls.
   */
  const areAllKeysComplete = useCallback(
    (status: {
      key0_at: string | null;
      key1_at: string | null;
      key2_at: string | null;
      key3_at: string | null;
    } | null): boolean => {
      if (!status) return false;
      return !!(
        status.key0_at &&
        status.key1_at &&
        status.key2_at &&
        status.key3_at
      );
    },
    []
  );

  return {
    // Actions
    checkMasterKey,
    markCelebrated,

    // State
    result,
    checking,
    error,
    celebrated,

    // Utility
    areAllKeysComplete,
  };
}
