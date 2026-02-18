import { useState, useEffect } from "react";
import { useAuth } from "./useAuth";
import { supabase } from "@/integrations/supabase/client";

export function useAdminAuth() {
  const { user, session, loading: authLoading, signInWithEmail, signOut } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      setIsAdmin(false);
      setUserRole(null);
      setChecking(false);
      return;
    }

    const checkAdmin = async () => {
      const { data } = await (supabase.from("user_roles" as any) as any)
        .select("role")
        .eq("user_id", user.id)
        .in("role", ["admin", "super_admin", "developer"]);
      
      if (data && data.length > 0) {
        // Priority: super_admin > admin > developer
        const roles = data.map((r: any) => r.role);
        const role = roles.includes("super_admin") ? "super_admin"
          : roles.includes("admin") ? "admin"
          : "developer";
        setUserRole(role);
        setIsAdmin(true);
      } else {
        setIsAdmin(false);
        setUserRole(null);
      }
      setChecking(false);
    };

    checkAdmin();
  }, [user, authLoading]);

  return {
    user,
    session,
    isAdmin,
    userRole,
    loading: authLoading || checking,
    signInWithEmail,
    signOut,
  };
}
