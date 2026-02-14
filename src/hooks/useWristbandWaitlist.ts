import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

const SEED = 847;
const GROWTH_RATE = 0.05;

export function useWristbandWaitlist() {
  const [realCount, setRealCount] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    supabase.rpc("get_wristband_waitlist_count").then(({ data }) => {
      setRealCount(data ?? 0);
    });
  }, []);

  // Simulated-to-live logic: show seed until 999 real signups
  const displayCount = (() => {
    if (realCount === null) return SEED;
    if (realCount >= 999) return realCount;
    const visits = parseInt(localStorage.getItem("wristband-visits") || "0");
    localStorage.setItem("wristband-visits", String(visits + 1));
    return SEED + Math.floor(visits * GROWTH_RATE * 10) + realCount;
  })();

  const joinWaitlist = async (email: string, firstName?: string, userId?: string, phone?: string) => {
    setLoading(true);
    try {
      const { error } = await supabase.from("smart_wristband_waitlist" as any).insert({
        email,
        first_name: firstName || null,
        user_id: userId || null,
        phone: phone || null,
      });
      if (error) throw error;

      // Send welcome email + SMS (fire and forget)
      supabase.functions.invoke("send-wristband-welcome", {
        body: { email, firstName: firstName || email.split("@")[0], phone: phone || null },
      });

      setRealCount((c) => (c ?? 0) + 1);
      return { success: true };
    } catch (err: any) {
      console.error("Waitlist error:", err);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  return { count: displayCount, joinWaitlist, loading };
}
