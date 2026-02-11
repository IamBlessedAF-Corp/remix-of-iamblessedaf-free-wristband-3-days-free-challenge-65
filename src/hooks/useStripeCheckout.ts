import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { OfferTier } from "./useGamificationStats";

export function useStripeCheckout() {
  const [loading, setLoading] = useState(false);

  const startCheckout = useCallback(async (tier: OfferTier, coupon?: string) => {
    setLoading(true);
    try {
      // Check URL for test coupon param
      const urlCoupon = new URLSearchParams(window.location.search).get("coupon");
      const appliedCoupon = coupon || urlCoupon || undefined;

      const body: Record<string, string> = { tier };
      if (appliedCoupon) body.coupon = appliedCoupon;

      const { data, error } = await supabase.functions.invoke("create-checkout", {
        body,
      });

      if (error) throw error;
      if (!data?.url) throw new Error("No checkout URL returned");

      window.location.href = data.url;
    } catch (err) {
      console.error("Checkout error:", err);
      toast.error("Unable to start checkout. Please try again.");
      setLoading(false);
    }
  }, []);

  return { startCheckout, loading };
}
