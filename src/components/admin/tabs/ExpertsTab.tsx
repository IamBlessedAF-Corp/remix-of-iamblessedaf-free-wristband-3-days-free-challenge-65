import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import AdminSectionDashboard from "@/components/admin/AdminSectionDashboard";
import { Badge } from "@/components/ui/badge";
import { RefreshCw } from "lucide-react";
import ExportCsvButton from "@/components/admin/ExportCsvButton";

export default function ExpertsTab() {
  const { data: leads = [], isLoading } = useQuery({
    queryKey: ["expert-leads-admin"],
    queryFn: async () => {
      const { data, error } = await supabase.from("expert_leads").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });
  if (isLoading) return <div className="flex justify-center py-20"><RefreshCw className="w-6 h-6 animate-spin text-primary" /></div>;
  const stats = { total: leads.length, new: leads.filter(l => l.status === "new").length, contacted: leads.filter(l => l.status === "contacted").length, converted: leads.filter(l => l.status === "converted").length };

  const nicheMap: Record<string, number> = {};
  leads.forEach(l => { const n = l.niche || "Unknown"; nicheMap[n] = (nicheMap[n] || 0) + 1; });

  return (
    <div className="space-y-4">
      <AdminSectionDashboard
        title="Expert Leads"
        description="Revenue share partners, coaches & consultants"
        kpis={[
          { label: "Total Leads", value: stats.total },
          { label: "New", value: stats.new },
          { label: "Contacted", value: stats.contacted },
          { label: "Converted", value: stats.converted },
          { label: "Conv Rate", value: stats.total > 0 ? `${((stats.converted / stats.total) * 100).toFixed(1)}%` : "0%" },
        ]}
        charts={[
          { type: "pie", title: "Status Distribution", data: [
            { name: "New", value: stats.new || 1 },
            { name: "Contacted", value: stats.contacted || 1 },
            { name: "Converted", value: stats.converted || 1 },
          ]},
          { type: "bar", title: "By Niche", data: Object.entries(nicheMap).slice(0, 5).map(([name, value]) => ({ name: name.slice(0, 12), value })) },
        ]}
      />
      <div className="bg-card border border-border/40 rounded-xl overflow-hidden">
        <div className="px-4 py-3 border-b border-border/20 bg-secondary/20 flex items-center justify-between">
          <span className="text-xs font-bold text-foreground uppercase">Expert Leads</span>
          <ExportCsvButton data={leads} filename="expert-leads.csv" columns={["full_name", "email", "niche", "status", "source_page", "created_at"]} />
        </div>
        <table className="w-full text-sm">
          <thead><tr className="text-[10px] text-muted-foreground uppercase tracking-wider border-b border-border/20 bg-secondary/30">
            <th className="text-left py-2 px-3">Name</th><th className="text-left py-2 px-3">Email</th><th className="text-left py-2 px-3">Niche</th><th className="text-left py-2 px-3">Status</th><th className="text-left py-2 px-3">Date</th>
          </tr></thead>
          <tbody className="divide-y divide-border/10">
            {leads.map(l => (
              <tr key={l.id} className="hover:bg-secondary/20"><td className="py-2 px-3 font-medium">{l.full_name}</td><td className="py-2 px-3 text-muted-foreground">{l.email}</td><td className="py-2 px-3 text-muted-foreground">{l.niche || "—"}</td>
                <td className="py-2 px-3"><Badge variant="outline" className="text-[10px]">{l.status}</Badge></td>
                <td className="py-2 px-3 text-muted-foreground text-xs">{new Date(l.created_at).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
