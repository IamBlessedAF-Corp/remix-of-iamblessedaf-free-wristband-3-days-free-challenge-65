import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

/**
 * Global listener that catches PASSWORD_RECOVERY events from Supabase
 * and redirects the user to /reset-password regardless of which page they land on.
 */
export function AuthRedirectListener() {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY" && location.pathname !== "/reset-password") {
        navigate("/reset-password", { replace: true });
      }
    });

    // Also check URL hash on mount for recovery tokens
    const hash = window.location.hash;
    if (hash && hash.includes("type=recovery") && location.pathname !== "/reset-password") {
      navigate("/reset-password", { replace: true });
    }

    return () => subscription.unsubscribe();
  }, [navigate, location.pathname]);

  return null;
}
