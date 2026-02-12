import { useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

const getSessionId = () => {
  let id = sessionStorage.getItem("exit_intent_session");
  if (!id) {
    id = crypto.randomUUID();
    sessionStorage.setItem("exit_intent_session", id);
  }
  return id;
};

export function useExitIntentTracking(page: string) {
  const track = useCallback(
    async (eventType: "shown" | "accepted" | "declined" | "closed") => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        await supabase.from("exit_intent_events" as any).insert({
          page,
          event_type: eventType,
          user_id: user?.id ?? null,
          session_id: getSessionId(),
        });
      } catch (e) {
        console.error("Exit intent tracking error:", e);
      }
    },
    [page]
  );

  return { track };
}
