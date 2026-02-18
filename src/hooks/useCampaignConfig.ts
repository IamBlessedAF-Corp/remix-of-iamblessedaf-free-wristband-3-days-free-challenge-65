import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface CampaignConfigItem {
  id: string;
  key: string;
  value: string;
  label: string;
  category: string;
  description: string | null;
  affected_areas: string[];
  updated_at: string;
}

export interface PendingChange {
  key: string;
  label: string;
  oldValue: string;
  newValue: string;
  affected_areas: string[];
  category: string;
}

export function useCampaignConfig() {
  const [configs, setConfigs] = useState<CampaignConfigItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase
      .from("campaign_config")
      .select("*")
      .order("category")
      .order("key");
    setConfigs((data as unknown as CampaignConfigItem[]) || []);
    setLoading(false);
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const getValue = useCallback((key: string, fallback = "") => {
    return configs.find(c => c.key === key)?.value ?? fallback;
  }, [configs]);

  const getNumber = useCallback((key: string, fallback = 0) => {
    const v = configs.find(c => c.key === key)?.value;
    return v ? Number(v) : fallback;
  }, [configs]);

  const saveChanges = useCallback(async (changes: PendingChange[]) => {
    const promises = changes.map(ch => {
      const exists = configs.find(c => c.key === ch.key);
      if (exists) {
        return (supabase.from("campaign_config") as any)
          .update({ value: ch.newValue, updated_at: new Date().toISOString() })
          .eq("key", ch.key);
      }
      return (supabase.from("campaign_config") as any)
        .insert({
          key: ch.key,
          value: ch.newValue,
          label: ch.label,
          category: ch.category,
          affected_areas: ch.affected_areas || [],
        });
    });
    await Promise.all(promises);
    await fetchAll();
  }, [fetchAll, configs]);

  // Helpers by category
  const byCategory = useCallback((cat: string) => configs.filter(c => c.category === cat), [configs]);

  return {
    configs,
    loading,
    refresh: fetchAll,
    getValue,
    getNumber,
    saveChanges,
    byCategory,
  };
}
