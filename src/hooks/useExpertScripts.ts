import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { HeroProfile } from "@/data/expertFrameworks";
import { toast } from "sonner";

export const useExpertScripts = () => {
  const [outputs, setOutputs] = useState<Record<string, string>>({});
  const [heroProfile, setHeroProfile] = useState<HeroProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

  // Listen for auth state
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUserId(session?.user?.id ?? null);
    });
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUserId(session?.user?.id ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  // Load saved scripts when user is authenticated
  useEffect(() => {
    if (!userId) {
      setIsLoading(false);
      return;
    }

    const load = async () => {
      setIsLoading(true);
      const { data, error } = await supabase
        .from("expert_scripts")
        .select("framework_id, output, hero_profile")
        .eq("user_id", userId);

      if (error) {
        console.error("Failed to load scripts:", error);
        setIsLoading(false);
        return;
      }

      if (data && data.length > 0) {
        const loaded: Record<string, string> = {};
        data.forEach((row) => {
          loaded[row.framework_id] = row.output;
        });
        setOutputs(loaded);

        // Restore hero profile from the most recent script
        const latest = data[data.length - 1];
        if (latest.hero_profile && typeof latest.hero_profile === "object") {
          setHeroProfile(latest.hero_profile as unknown as HeroProfile);
        }
      }
      setIsLoading(false);
    };

    load();
  }, [userId]);

  const saveOutput = useCallback(
    async (frameworkId: string, output: string, profile: HeroProfile) => {
      setOutputs((prev) => ({ ...prev, [frameworkId]: output }));

      if (!userId) return; // Not logged in — keep in local state only

      const { error } = await supabase.from("expert_scripts").upsert(
        {
          user_id: userId,
          framework_id: frameworkId,
          output,
          hero_profile: profile as any,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "user_id,framework_id" }
      );

      if (error) {
        console.error("Failed to save script:", error);
        toast.error("Failed to save script");
      }
    },
    [userId]
  );

  return {
    outputs,
    heroProfile,
    setHeroProfile,
    saveOutput,
    isLoading,
    isAuthenticated: !!userId,
  };
};
