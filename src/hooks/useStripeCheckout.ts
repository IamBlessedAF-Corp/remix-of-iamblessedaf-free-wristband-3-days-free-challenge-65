import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { OfferTier } from "./useGamificationStats";

export function useStripeCheckout() {
  const [loading, setLoading] = useState(false);

  const startCheckout = useCallback(async (tier: OfferTier) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("create-checkout", {
        body: { tier },
      });

      if (error) throw error;
      if (!data?.url) throw new Error("No checkout URL returned");

      // Redirect to Stripe Checkout
      window.location.href = data.url;
    } catch (err) {
      console.error("Checkout error:", err);
      toast.error("Unable to start checkout. Please try again.");
      setLoading(false);
    }
  }, []);

  return { startCheckout, loading };
}
