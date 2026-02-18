import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import AdminSectionDashboard from "@/components/admin/AdminSectionDashboard";

export default function CongratsTab() {
  const [totals, setTotals] = useState({ shown: 0, accepted: 0, declined: 0 });
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    (async () => {
      setFetching(true);
      const { data } = await (supabase.from("exit_intent_events" as any) as any).select("event_type, created_at").eq("page", "congrats-neuro-hacker").order("created_at", { ascending: true });
      if (!data) { setFetching(false); return; }
      const counts = { shown: 0, accepted: 0, declined: 0 };
      (data as any[]).forEach((row: any) => { const t = row.event_type as keyof typeof counts; if (counts[t] !== undefined) counts[t]++; });
      setTotals(counts);
      setFetching(false);
    })();
  }, []);

  const shareRate = totals.shown ? ((totals.accepted / totals.shown) * 100).toFixed(1) : "0";

  return (
    <div className="space-y-6">
      <AdminSectionDashboard
        title="Congrats & Viral Share"
        description="Post-purchase viral activation metrics"
        kpis={[
          { label: "Page Views", value: fetching ? "…" : totals.shown },
          { label: "Viral Shares", value: fetching ? "…" : totals.accepted },
          { label: "Skips", value: fetching ? "…" : totals.declined },
          { label: "Share Rate", value: fetching ? "…" : `${shareRate}%` },
        ]}
        charts={[
          { type: "pie", title: "Share vs Skip", data: [
            { name: "Shared", value: totals.accepted || 1 },
            { name: "Skipped", value: totals.declined || 1 },
          ]},
        ]}
      />
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-card border border-border/40 rounded-xl p-6 text-center">
          <p className="text-3xl font-black text-primary">{shareRate}%</p>
          <p className="text-xs text-muted-foreground">Viral Share Rate</p>
        </div>
        <div className="bg-card border border-border/40 rounded-xl p-6 text-center">
          <p className="text-3xl font-black text-destructive">{totals.shown ? ((totals.declined / totals.shown) * 100).toFixed(1) : "0"}%</p>
          <p className="text-xs text-muted-foreground">Skip Rate</p>
        </div>
      </div>
    </div>
  );
}
