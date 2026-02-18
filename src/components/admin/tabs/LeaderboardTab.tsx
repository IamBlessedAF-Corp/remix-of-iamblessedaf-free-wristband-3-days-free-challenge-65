import { useClipperAdmin } from "@/hooks/useClipperAdmin";
import AdminSectionDashboard from "@/components/admin/AdminSectionDashboard";
import { Badge } from "@/components/ui/badge";
import { RefreshCw } from "lucide-react";

export default function LeaderboardTab() {
  const admin = useClipperAdmin();
  if (admin.loading) return <div className="flex justify-center py-20"><RefreshCw className="w-6 h-6 animate-spin text-primary" /></div>;
  const fmt = (n: number) => n >= 1000 ? `${(n / 1000).toFixed(1)}k` : String(n);
  return (
    <div className="space-y-4">
      <AdminSectionDashboard
        title="Leaderboard"
        description="Rank clippers by views, earnings, consistency"
        kpis={[
          { label: "Total Clippers", value: admin.clippers.length },
          { label: "#1 Views", value: admin.clippers[0] ? fmt(admin.clippers[0].totalViews) : "—" },
          { label: "#1 Earned", value: admin.clippers[0] ? `$${(admin.clippers[0].totalEarningsCents / 100).toFixed(2)}` : "—" },
          { label: "Avg Clips", value: admin.clippers.length > 0 ? Math.round(admin.clippers.reduce((s, c) => s + c.totalClips, 0) / admin.clippers.length) : 0 },
        ]}
        charts={[
          { type: "bar", title: "Top 5 by Views", data: admin.clippers.slice(0, 5).map(c => ({ name: c.display_name.slice(0, 10), value: c.totalViews })) },
        ]}
      />
      <div className="bg-card border border-border/50 rounded-xl overflow-hidden">
        <div className="grid grid-cols-[2.5rem_1fr_5rem_5rem_5rem_4.5rem] px-4 py-2 text-[10px] font-bold text-muted-foreground uppercase tracking-wider border-b border-border/20 bg-secondary/30">
          <span>#</span><span>Clipper</span><span className="text-right">Clips</span><span className="text-right">Views</span><span className="text-right">Earned</span><span className="text-right">Pending</span>
        </div>
        <div className="divide-y divide-border/15">
          {admin.clippers.map((u, i) => (
            <div key={u.user_id} className="grid grid-cols-[2.5rem_1fr_5rem_5rem_5rem_4.5rem] items-center px-4 py-3 text-sm hover:bg-secondary/20">
              <span className="text-xs font-bold text-muted-foreground">{i + 1}</span>
              <div><p className="font-semibold text-foreground text-xs">{u.display_name}</p></div>
              <span className="text-right text-xs font-semibold">{u.totalClips}</span>
              <span className="text-right text-xs">{fmt(u.totalViews)}</span>
              <span className="text-right text-xs font-bold">${(u.totalEarningsCents / 100).toFixed(2)}</span>
              <span className="text-right">{u.pendingClips > 0 && <Badge className="text-[10px] bg-amber-500/15 text-amber-400 border-amber-500/30">{u.pendingClips}</Badge>}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
