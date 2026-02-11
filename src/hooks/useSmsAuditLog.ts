import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface SmsAuditEntry {
  id: string;
  created_at: string;
  recipient_phone: string;
  traffic_type: string;
  template_key: string;
  messaging_service_sid: string;
  twilio_sid: string | null;
  status: string;
  error_message: string | null;
  metadata: Record<string, unknown> | null;
}

const from = (table: string) => supabase.from(table as any);

export function useSmsAuditLog() {
  const [entries, setEntries] = useState<SmsAuditEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchEntries = useCallback(async () => {
    setLoading(true);
    const { data, error } = await from("sms_audit_log")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(100);

    if (error) {
      console.error("Error fetching SMS audit log:", error);
    }
    if (data) setEntries(data as unknown as SmsAuditEntry[]);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchEntries();
  }, [fetchEntries]);

  const stats = {
    total: entries.length,
    byLane: {
      otp: entries.filter((e) => e.traffic_type === "otp").length,
      transactional: entries.filter((e) => e.traffic_type === "transactional").length,
      marketing: entries.filter((e) => e.traffic_type === "marketing").length,
    },
    byStatus: {
      sent: entries.filter((e) => ["queued", "sent", "delivered"].includes(e.status)).length,
      failed: entries.filter((e) => e.status === "failed").length,
    },
    templateUsage: entries.reduce((acc, e) => {
      acc[e.template_key] = (acc[e.template_key] || 0) + 1;
      return acc;
    }, {} as Record<string, number>),
  };

  return { entries, loading, stats, refetch: fetchEntries };
}
