import { useClipperAdmin } from "@/hooks/useClipperAdmin";
import AdminSectionDashboard from "@/components/admin/AdminSectionDashboard";
import { Badge } from "@/components/ui/badge";

export default function FraudMonitorTab() {
  const admin = useClipperAdmin();

  const fraudData = admin.clippers.map(c => {
    let score = 0;
    const userClips = admin.clips.filter(cl => cl.user_id === c.user_id);
    if (c.totalViews > 5000 && c.totalEarningsCents === 0) score += 20;
    if (c.pendingClips === c.totalClips && c.totalClips > 3) score += 15;
    if (c.totalClips > 0 && c.totalViews / c.totalClips > 10000) score += 25;
    const ctrs = userClips.map(cl => Number((cl as any).ctr) || 0).filter(v => v > 0);
    if (ctrs.length > 0) {
      const avgCtr = ctrs.reduce((a, b) => a + b, 0) / ctrs.length;
      if (avgCtr > 0.05) score += 20;
    }
    if (userClips.length >= 3) {
      const dates = userClips.map(cl => new Date(cl.submitted_at).getTime()).sort();
      const span = (dates[dates.length - 1] - dates[0]) / (1000 * 60 * 60);
      if (span < 1 && userClips.length > 5) score += 20;
    }
    return { name: c.display_name.slice(0, 12), user_id: c.user_id, score: Math.min(score, 100), views: c.totalViews, clips: c.totalClips, pending: c.pendingClips };
  });

  const flagged = fraudData.filter(f => f.score > 30);
  const highRisk = fraudData.filter(f => f.score > 60);
  const avgScore = fraudData.length > 0 ? Math.round(fraudData.reduce((s, f) => s + f.score, 0) / fraudData.length) : 0;

  return (
    <div className="space-y-6">
      <AdminSectionDashboard
        title="Fraud Monitor"
        description="Anomaly detection from real clip metrics — view velocity, CTR spikes, burst patterns"
        kpis={[
          { label: "Monitored", value: admin.clippers.length },
          { label: "Flagged", value: flagged.length, delta: flagged.length > 0 ? "⚠️ Needs review" : "✅ Clear" },
          { label: "High Risk", value: highRisk.length },
          { label: "Avg Score", value: `${avgScore}/100` },
          { label: "Total Views", value: admin.stats?.totalViews?.toLocaleString() || "0" },
          { label: "Total Clips", value: admin.stats?.totalClips || 0 },
        ]}
        charts={[
          { type: "bar", title: "Risk Scores (Top 8)", data: fraudData.sort((a, b) => b.score - a.score).slice(0, 8).map(f => ({ name: f.name, value: f.score })) },
          { type: "pie", title: "Risk Breakdown", data: [
            { name: "Clean (<30)", value: fraudData.filter(f => f.score < 30).length || 1 },
            { name: "Flagged (30-60)", value: flagged.filter(f => f.score <= 60).length || 1 },
            { name: "High (>60)", value: highRisk.length || 1 },
          ]},
        ]}
      />
      <div className="bg-card border border-border/40 rounded-xl overflow-hidden">
        <div className="px-4 py-3 border-b border-border/20 bg-secondary/20">
          <h3 className="text-xs font-bold text-foreground uppercase">Clipper Risk Scores (Live)</h3>
        </div>
        <div className="divide-y divide-border/10">
          {fraudData.sort((a, b) => b.score - a.score).map(f => (
            <div key={f.user_id} className="flex items-center justify-between px-4 py-3 text-sm">
              <div>
                <p className="font-medium text-foreground text-xs">{f.name}</p>
                <p className="text-[10px] text-muted-foreground">{f.clips} clips · {f.pending} pending</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs text-muted-foreground">{f.views.toLocaleString()} views</span>
                <Badge className={`text-[10px] ${f.score > 60 ? "bg-red-500/15 text-red-400" : f.score > 30 ? "bg-amber-500/15 text-amber-400" : "bg-emerald-500/15 text-emerald-400"}`}>
                  {f.score}/100
                </Badge>
              </div>
            </div>
          ))}
          {fraudData.length === 0 && <p className="text-sm text-muted-foreground text-center py-6">No clippers to monitor yet.</p>}
        </div>
      </div>
    </div>
  );
}
