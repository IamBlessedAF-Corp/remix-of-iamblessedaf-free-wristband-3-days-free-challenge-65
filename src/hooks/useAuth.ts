import { useState, useEffect } from "react";
import type { User, Session } from "@supabase/supabase-js";

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let subscription: { unsubscribe: () => void } | null = null;

    const init = async () => {
      try {
        const { supabase } = await import("@/integrations/supabase/client");

        const { data: { subscription: sub } } = supabase.auth.onAuthStateChange(
          (_event, session) => {
            setSession(session);
            setUser(session?.user ?? null);
            setLoading(false);
          }
        );
        subscription = sub;

        const { data: { session } } = await supabase.auth.getSession();
        setSession(session);
        setUser(session?.user ?? null);
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
  }, []);

  const signInWithGoogle = async () => {
    try {
      const { lovable } = await import("@/integrations/lovable/index");
      const result = await lovable.auth.signInWithOAuth("google", {
        redirect_uri: window.location.origin,
      });
      return { error: result.error };
    } catch (error) {
      return { error };
    }
  };

  const signInWithApple = async () => {
    try {
      const { lovable } = await import("@/integrations/lovable/index");
      const result = await lovable.auth.signInWithOAuth("apple", {
        redirect_uri: window.location.origin,
      });
      return { error: result.error };
    } catch (error) {
      return { error };
    }
  };

  const signUpWithEmail = async (email: string, password: string) => {
    try {
      const { supabase } = await import("@/integrations/supabase/client");
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/make-2500-with-1-ai-clip`,
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
