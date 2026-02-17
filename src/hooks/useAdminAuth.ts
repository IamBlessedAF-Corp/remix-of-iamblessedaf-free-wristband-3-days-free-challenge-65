import { useState, useEffect } from "react";
import { useAuth } from "./useAuth";
import { supabase } from "@/integrations/supabase/client";

export function useAdminAuth() {
  const { user, session, loading: authLoading, signInWithEmail, signOut } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      setIsAdmin(false);
      setChecking(false);
      return;
    }

    const checkAdmin = async () => {
      const { data } = await (supabase.from("user_roles" as any) as any)
        .select("role")
        .eq("user_id", user.id)
        .in("role", ["admin", "super_admin"]);
      setIsAdmin(!!data && data.length > 0);
      setChecking(false);
    };

    checkAdmin();
  }, [user, authLoading]);

  return {
    user,
    session,
    isAdmin,
    loading: authLoading || checking,
    signInWithEmail,
    signOut,
  };
}
