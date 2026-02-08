import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface SmsDelivery {
  id: string;
  recipient_phone: string;
  recipient_name: string | null;
  message: string;
  twilio_sid: string | null;
  status: string;
  error_message: string | null;
  source_page: string | null;
  created_at: string;
  updated_at: string;
}

const from = (table: string) => supabase.from(table as any);

export function useSmsDeliveries() {
  const [deliveries, setDeliveries] = useState<SmsDelivery[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchDeliveries = useCallback(async () => {
    setLoading(true);
    const { data, error } = await from("sms_deliveries")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(50);

    if (error) {
      console.error("Error fetching SMS deliveries:", error);
    }
    if (data) setDeliveries(data as unknown as SmsDelivery[]);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchDeliveries();
  }, [fetchDeliveries]);

  const stats = {
    total: deliveries.length,
    delivered: deliveries.filter((d) => d.status === "delivered").length,
    failed: deliveries.filter((d) => d.status === "failed" || d.status === "undelivered").length,
    pending: deliveries.filter((d) => ["queued", "sent"].includes(d.status)).length,
  };

  return { deliveries, loading, stats, refetch: fetchDeliveries };
}
