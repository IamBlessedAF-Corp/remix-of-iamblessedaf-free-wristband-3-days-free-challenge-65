import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

type Variant = "A" | "B";

/**
 * Simple A/B test hook.
 * - Assigns a random variant (A or B) per test name, persisted in localStorage.
 * - Logs "ab_shown" events to exit_intent_events for analytics.
 * - Provides a `trackConversion` helper to log "ab_converted".
 */
export function useABTest(testName: string): {
  variant: Variant;
  trackConversion: () => void;
} {
  const storageKey = `ab_test_${testName}`;

  const [variant] = useState<Variant>(() => {
    try {
      const stored = localStorage.getItem(storageKey);
      if (stored === "A" || stored === "B") return stored;
      const assigned: Variant = Math.random() < 0.5 ? "A" : "B";
      localStorage.setItem(storageKey, assigned);
      return assigned;
    } catch {
      return "A";
    }
  });

  // Log impression once per session
  useEffect(() => {
    const sessionKey = `ab_shown_${testName}_${variant}`;
    if (sessionStorage.getItem(sessionKey)) return;
    sessionStorage.setItem(sessionKey, "1");

    supabase
      .from("exit_intent_events")
      .insert({
        event_type: "ab_shown",
        page: testName,
        session_id: variant,
      })
      .then(() => {});
  }, [testName, variant]);

  const trackConversion = () => {
    supabase
      .from("exit_intent_events")
      .insert({
        event_type: "ab_converted",
        page: testName,
        session_id: variant,
      })
      .then(() => {});
  };

  return { variant, trackConversion };
}
