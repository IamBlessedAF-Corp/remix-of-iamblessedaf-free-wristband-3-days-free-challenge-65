import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import AdminSectionDashboard from "./AdminSectionDashboard";
import { Badge } from "@/components/ui/badge";
import { RefreshCw } from "lucide-react";
import ExportCsvButton from "./ExportCsvButton";

export default function BlessingsTab() {
  const { data: blessings = [], isLoading } = useQuery({
    queryKey: ["admin-blessings"],
    queryFn: async () => {
      const { data } = await supabase.from("blessings").select("*").order("created_at", { ascending: false }).limit(200);
      return data || [];
    },
  });

  const { data: creators = [] } = useQuery({
    queryKey: ["admin-creators-blessings"],
    queryFn: async () => {
      const { data } = await supabase.from("creator_profiles").select("user_id, display_name, blessings_confirmed, email, referral_code").order("blessings_confirmed", { ascending: false });
      return data || [];
    },
  });

  const confirmed = blessings.filter(b => b.confirmed_at);
  const pending = blessings.filter(b => !b.confirmed_at && new Date(b.expires_at) > new Date());
  const expired = blessings.filter(b => !b.confirmed_at && new Date(b.expires_at) <= new Date());

  if (isLoading) return <div className="flex justify-center py-20"><RefreshCw className="w-6 h-6 animate-spin text-primary" /></div>;

  return (
    <div className="space-y-4">
      <AdminSectionDashboard
        title="Blessings & Creators"
        description="Blessing confirmations + creator profiles"
        kpis={[
          { label: "Total Blessings", value: blessings.length },
          { label: "Confirmed", value: confirmed.length },
          { label: "Pending", value: pending.length },
          { label: "Expired", value: expired.length },
          { label: "Creators", value: creators.length },
          { label: "Top Blesser", value: creators[0]?.display_name || "—" },
        ]}
        charts={[
          { type: "pie", title: "Blessing Status", data: [{ name: "Confirmed", value: confirmed.length || 1 }, { name: "Pending", value: pending.length || 1 }, { name: "Expired", value: expired.length || 1 }] },
        ]}
      />

      {/* Creator Profiles Table */}
      <div className="bg-card border border-border/40 rounded-xl overflow-x-auto">
        <div className="px-4 py-3 border-b border-border/20 bg-secondary/20 flex items-center justify-between">
          <h3 className="text-xs font-bold text-foreground uppercase">Creator Profiles</h3>
          <ExportCsvButton data={creators} filename="creators.csv" columns={["display_name", "email", "referral_code", "blessings_confirmed"]} />
        </div>
        <table className="w-full text-xs">
          <thead><tr className="text-[10px] text-muted-foreground uppercase tracking-wider border-b border-border/20">
            <th className="text-left py-2 px-3">Name</th><th className="text-left py-2 px-3">Email</th><th className="text-left py-2 px-3">Referral Code</th>
            <th className="text-right py-2 px-3">Blessings</th>
          </tr></thead>
          <tbody className="divide-y divide-border/10">
            {creators.slice(0, 50).map(c => (
              <tr key={c.user_id} className="hover:bg-secondary/20">
                <td className="py-2 px-3 font-medium">{c.display_name || "—"}</td>
                <td className="py-2 px-3 text-muted-foreground">{c.email}</td>
                <td className="py-2 px-3"><Badge variant="outline" className="text-[10px] font-mono">{c.referral_code}</Badge></td>
                <td className="py-2 px-3 text-right font-bold">{c.blessings_confirmed}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Recent Blessings */}
      <div className="bg-card border border-border/40 rounded-xl overflow-x-auto">
        <div className="px-4 py-3 border-b border-border/20 bg-secondary/20">
          <h3 className="text-xs font-bold text-foreground uppercase">Recent Blessings</h3>
        </div>
        <table className="w-full text-xs">
          <thead><tr className="text-[10px] text-muted-foreground uppercase tracking-wider border-b border-border/20">
            <th className="text-left py-2 px-3">Recipient</th><th className="text-left py-2 px-3">Status</th><th className="text-left py-2 px-3">Created</th><th className="text-left py-2 px-3">Expires</th>
          </tr></thead>
          <tbody className="divide-y divide-border/10">
            {blessings.slice(0, 50).map(b => (
              <tr key={b.id} className="hover:bg-secondary/20">
                <td className="py-2 px-3 font-medium">{b.recipient_name || "—"}</td>
                <td className="py-2 px-3">
                  <Badge className={`text-[10px] ${b.confirmed_at ? "bg-emerald-500/15 text-emerald-400" : new Date(b.expires_at) > new Date() ? "bg-amber-500/15 text-amber-400" : "bg-red-500/15 text-red-400"}`}>
                    {b.confirmed_at ? "Confirmed" : new Date(b.expires_at) > new Date() ? "Pending" : "Expired"}
                  </Badge>
                </td>
                <td className="py-2 px-3 text-muted-foreground">{new Date(b.created_at).toLocaleDateString()}</td>
                <td className="py-2 px-3 text-muted-foreground">{new Date(b.expires_at).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
