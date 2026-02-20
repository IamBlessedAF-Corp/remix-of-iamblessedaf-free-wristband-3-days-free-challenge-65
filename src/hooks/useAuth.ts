import { useState, useEffect, useCallback, useRef } from "react";
import type { User, Session, AuthChangeEvent } from "@supabase/supabase-js";

/**
 * Secure auth hook with refresh token rotation handling.
 * - Listens for TOKEN_REFRESHED events (Supabase rotates tokens automatically)
 * - Detects stale/expired sessions and forces re-auth
 * - Handles SIGNED_OUT from other tabs via broadcast
 * - Uses a ref for the handler to prevent the useEffect from re-running on
 *   every render (which would reset session state and log out the admin)
 */
export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  /** Stable ref so the subscription never re-subscribes on re-render */
  const handleSessionChangeRef = useRef<(event: AuthChangeEvent, newSession: Session | null) => void>();

  handleSessionChangeRef.current = useCallback((event: AuthChangeEvent, newSession: Session | null) => {
    setSession(newSession);
    setUser(newSession?.user ?? null);
    setLoading(false);

    if (import.meta.env.DEV && event === "TOKEN_REFRESHED") {
      console.log("[Auth] Refresh token rotated successfully");
    }

    if (event === "SIGNED_OUT") {
      setSession(null);
      setUser(null);
    }
  }, []);

  useEffect(() => {
    let subscription: { unsubscribe: () => void } | null = null;

    const init = async () => {
      try {
        const { supabase } = await import("@/integrations/supabase/client");

        // 1. Set up listener BEFORE getSession (per Supabase best practice)
        //    Use the ref so the subscription is only created ONCE (empty dep array)
        const { data: { subscription: sub } } = supabase.auth.onAuthStateChange(
          (event, sess) => handleSessionChangeRef.current?.(event, sess)
        );
        subscription = sub;

        // 2. Get current session
        const { data: { session: currentSession } } = await supabase.auth.getSession();

        // 3. Validate session isn't expired — attempt refresh if needed
        if (currentSession?.expires_at) {
          const expiresAt = currentSession.expires_at * 1000;
          if (Date.now() >= expiresAt) {
            const { data: { session: refreshed } } = await supabase.auth.refreshSession();
            setSession(refreshed);
            setUser(refreshed?.user ?? null);
            setLoading(false);
            return;
          }
        }

        setSession(currentSession);
        setUser(currentSession?.user ?? null);
        setLoading(false);
      } catch (error) {
        if (import.meta.env.DEV) {
          console.error("Failed to initialize auth:", error);
        }
        setLoading(false);
      }
    };

    init();

    return () => {
      subscription?.unsubscribe();
    };
  }, []); // ← empty: run once, never re-subscribe on re-render


  const signInWithGoogle = async () => {
    try {
      const { lovable } = await import("@/integrations/lovable/index");
      const refCode = sessionStorage.getItem("referral_code");
      const redirectUri = refCode
        ? `${window.location.origin}/?ref=${refCode}`
        : window.location.origin;
      const result = await lovable.auth.signInWithOAuth("google", {
        redirect_uri: redirectUri,
      });
      return { error: result.error };
    } catch (error) {
      return { error };
    }
  };

  const signInWithApple = async () => {
    try {
      const { lovable } = await import("@/integrations/lovable/index");
      const refCode = sessionStorage.getItem("referral_code");
      const redirectUri = refCode
        ? `${window.location.origin}/?ref=${refCode}`
        : window.location.origin;
      const result = await lovable.auth.signInWithOAuth("apple", {
        redirect_uri: redirectUri,
      });
      return { error: result.error };
    } catch (error) {
      return { error };
    }
  };

  const signUpWithEmail = async (email: string, password: string, firstName?: string) => {
    try {
      const { supabase } = await import("@/integrations/supabase/client");
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/challenge/thanks`,
          data: {
            first_name: firstName || email.split("@")[0],
          },
        },
      });
      return { data, error };
    } catch (error) {
      return { error };
    }
  };

  const signInWithEmail = async (email: string, password: string) => {
    try {
      const { supabase } = await import("@/integrations/supabase/client");
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      return { data, error };
    } catch (error) {
      return { error };
    }
  };

  const signOut = async () => {
    try {
      const { supabase } = await import("@/integrations/supabase/client");
      const { error } = await supabase.auth.signOut();
      return { error };
    } catch (error) {
      return { error };
    }
  };

  return {
    user,
    session,
    loading,
    signInWithGoogle,
    signInWithApple,
    signUpWithEmail,
    signInWithEmail,
    signOut,
  };
}
