import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import AdminSectionDashboard from "./AdminSectionDashboard";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RefreshCw, MessageCircle, Shield } from "lucide-react";

export default function SmsTab() {
  const { data: deliveries = [], isLoading: dLoad } = useQuery({
    queryKey: ["admin-sms-deliveries"],
    queryFn: async () => {
      const { data } = await supabase.from("sms_deliveries").select("*").order("created_at", { ascending: false }).limit(200);
      return data || [];
    },
  });

  const { data: auditLogs = [], isLoading: aLoad } = useQuery({
    queryKey: ["admin-sms-audit"],
    queryFn: async () => {
      const { data } = await supabase.from("sms_audit_log").select("*").order("created_at", { ascending: false }).limit(200);
      return data || [];
    },
  });

  const delivered = deliveries.filter(d => d.status === "delivered").length;
  const failed = deliveries.filter(d => d.status === "failed").length;
  const queued = deliveries.filter(d => d.status === "queued").length;

  const trafficTypes: Record<string, number> = {};
  auditLogs.forEach(l => { trafficTypes[l.traffic_type] = (trafficTypes[l.traffic_type] || 0) + 1; });

  if (dLoad || aLoad) return <div className="flex justify-center py-20"><RefreshCw className="w-6 h-6 animate-spin text-primary" /></div>;

  return (
    <div className="space-y-4">
      <AdminSectionDashboard
        title="SMS Intelligence"
        description="Delivery tracking + audit log"
        kpis={[
          { label: "Total Sent", value: deliveries.length },
          { label: "Delivered", value: delivered },
          { label: "Failed", value: failed, delta: failed > 0 ? "⚠️" : "✅" },
          { label: "Queued", value: queued },
          { label: "Audit Entries", value: auditLogs.length },
          { label: "Traffic Types", value: Object.keys(trafficTypes).length },
        ]}
        charts={[
          { type: "pie", title: "Delivery Status", data: [{ name: "Delivered", value: delivered || 1 }, { name: "Failed", value: failed || 1 }, { name: "Queued", value: queued || 1 }] },
          { type: "bar", title: "Traffic Types", data: Object.entries(trafficTypes).slice(0, 5).map(([name, value]) => ({ name: name.slice(0, 12), value })) },
        ]}
      />

      <Tabs defaultValue="deliveries" className="space-y-4">
        <TabsList>
          <TabsTrigger value="deliveries" className="gap-1 text-xs"><MessageCircle className="w-3.5 h-3.5" /> Deliveries</TabsTrigger>
          <TabsTrigger value="audit" className="gap-1 text-xs"><Shield className="w-3.5 h-3.5" /> Audit Log</TabsTrigger>
        </TabsList>

        <TabsContent value="deliveries">
          <div className="bg-card border border-border/40 rounded-xl overflow-x-auto">
            <table className="w-full text-xs">
              <thead><tr className="text-[10px] text-muted-foreground uppercase tracking-wider border-b border-border/20 bg-secondary/30">
                <th className="text-left py-2 px-3">Recipient</th><th className="text-left py-2 px-3">Phone</th><th className="text-left py-2 px-3">Message</th>
                <th className="text-left py-2 px-3">Status</th><th className="text-left py-2 px-3">Source</th><th className="text-left py-2 px-3">Date</th>
              </tr></thead>
              <tbody className="divide-y divide-border/10">
                {deliveries.map(d => (
                  <tr key={d.id} className="hover:bg-secondary/20">
                    <td className="py-2 px-3 font-medium">{d.recipient_name || "—"}</td>
                    <td className="py-2 px-3 font-mono text-muted-foreground">{d.recipient_phone}</td>
                    <td className="py-2 px-3 text-muted-foreground max-w-[200px] truncate">{d.message}</td>
                    <td className="py-2 px-3">
                      <Badge className={`text-[10px] ${d.status === "delivered" ? "bg-emerald-500/15 text-emerald-400" : d.status === "failed" ? "bg-red-500/15 text-red-400" : "bg-amber-500/15 text-amber-400"}`}>{d.status}</Badge>
                    </td>
                    <td className="py-2 px-3 text-muted-foreground">{d.source_page || "—"}</td>
                    <td className="py-2 px-3 text-muted-foreground">{new Date(d.created_at).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </TabsContent>

        <TabsContent value="audit">
          <div className="bg-card border border-border/40 rounded-xl overflow-x-auto">
            <table className="w-full text-xs">
              <thead><tr className="text-[10px] text-muted-foreground uppercase tracking-wider border-b border-border/20 bg-secondary/30">
                <th className="text-left py-2 px-3">Template</th><th className="text-left py-2 px-3">Traffic Type</th><th className="text-left py-2 px-3">Phone</th>
                <th className="text-left py-2 px-3">Status</th><th className="text-left py-2 px-3">Error</th><th className="text-left py-2 px-3">Date</th>
              </tr></thead>
              <tbody className="divide-y divide-border/10">
                {auditLogs.map(l => (
                  <tr key={l.id} className="hover:bg-secondary/20">
                    <td className="py-2 px-3 font-medium">{l.template_key}</td>
                    <td className="py-2 px-3"><Badge variant="outline" className="text-[10px]">{l.traffic_type}</Badge></td>
                    <td className="py-2 px-3 font-mono text-muted-foreground">{l.recipient_phone}</td>
                    <td className="py-2 px-3"><Badge variant="outline" className="text-[10px]">{l.status}</Badge></td>
                    <td className="py-2 px-3 text-red-400 max-w-[150px] truncate">{l.error_message || "—"}</td>
                    <td className="py-2 px-3 text-muted-foreground">{new Date(l.created_at).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
