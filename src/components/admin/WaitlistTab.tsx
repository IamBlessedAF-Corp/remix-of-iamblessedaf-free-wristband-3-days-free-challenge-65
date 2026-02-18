import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import AdminSectionDashboard from "./AdminSectionDashboard";
import { Badge } from "@/components/ui/badge";
import { RefreshCw } from "lucide-react";
import ExportCsvButton from "./ExportCsvButton";

export default function WaitlistTab() {
  const { data: waitlist = [], isLoading } = useQuery({
    queryKey: ["admin-waitlist"],
    queryFn: async () => {
      const { data } = await supabase.from("smart_wristband_waitlist").select("*").order("created_at", { ascending: false }).limit(200);
      return data || [];
    },
  });

  const { data: repostLogs = [] } = useQuery({
    queryKey: ["admin-repost-logs"],
    queryFn: async () => {
      const { data } = await supabase.from("repost_logs").select("*").order("created_at", { ascending: false }).limit(200);
      return data || [];
    },
  });

  if (isLoading) return <div className="flex justify-center py-20"><RefreshCw className="w-6 h-6 animate-spin text-primary" /></div>;

  return (
    <div className="space-y-4">
      <AdminSectionDashboard
        title="Waitlist & Reposts"
        description="Smart wristband waitlist signups + clip repost tracking"
        kpis={[
          { label: "Waitlist Size", value: waitlist.length },
          { label: "With Phone", value: waitlist.filter(w => w.phone).length },
          { label: "Repost Logs", value: repostLogs.length },
        ]}
      />

      {/* Waitlist */}
      <div className="bg-card border border-border/40 rounded-xl overflow-x-auto">
        <div className="px-4 py-3 border-b border-border/20 bg-secondary/20 flex items-center justify-between">
          <h3 className="text-xs font-bold text-foreground uppercase">Smart Wristband Waitlist</h3>
          <ExportCsvButton data={waitlist} filename="waitlist.csv" columns={["first_name", "email", "phone", "created_at"]} />
        </div>
        <table className="w-full text-xs">
          <thead><tr className="text-[10px] text-muted-foreground uppercase tracking-wider border-b border-border/20">
            <th className="text-left py-2 px-3">Name</th><th className="text-left py-2 px-3">Email</th><th className="text-left py-2 px-3">Phone</th><th className="text-left py-2 px-3">Joined</th>
          </tr></thead>
          <tbody className="divide-y divide-border/10">
            {waitlist.map(w => (
              <tr key={w.id} className="hover:bg-secondary/20">
                <td className="py-2 px-3 font-medium">{w.first_name || "—"}</td>
                <td className="py-2 px-3 text-muted-foreground">{w.email}</td>
                <td className="py-2 px-3 font-mono text-muted-foreground">{w.phone || "—"}</td>
                <td className="py-2 px-3 text-muted-foreground">{new Date(w.created_at).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Repost Logs */}
      {repostLogs.length > 0 && (
        <div className="bg-card border border-border/40 rounded-xl overflow-x-auto">
          <div className="px-4 py-3 border-b border-border/20 bg-secondary/20">
            <h3 className="text-xs font-bold text-foreground uppercase">Repost Logs</h3>
          </div>
          <table className="w-full text-xs">
            <thead><tr className="text-[10px] text-muted-foreground uppercase tracking-wider border-b border-border/20">
              <th className="text-left py-2 px-3">Clip Title</th><th className="text-left py-2 px-3">User</th><th className="text-left py-2 px-3">Referral</th><th className="text-left py-2 px-3">Date</th>
            </tr></thead>
            <tbody className="divide-y divide-border/10">
              {repostLogs.map(r => (
                <tr key={r.id} className="hover:bg-secondary/20">
                  <td className="py-2 px-3 font-medium">{r.clip_title || r.clip_id}</td>
                  <td className="py-2 px-3 font-mono text-muted-foreground text-[10px]">{r.user_id.slice(0, 8)}…</td>
                  <td className="py-2 px-3 text-muted-foreground truncate max-w-[150px]">{r.referral_link || "—"}</td>
                  <td className="py-2 px-3 text-muted-foreground">{new Date(r.created_at).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
