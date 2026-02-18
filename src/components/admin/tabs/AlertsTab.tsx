import { useClipperAdmin } from "@/hooks/useClipperAdmin";
import { useBudgetControl } from "@/hooks/useBudgetControl";
import AdminSectionDashboard from "@/components/admin/AdminSectionDashboard";
import { CheckCircle, AlertTriangle, AlertCircle, Bell } from "lucide-react";

export default function AlertsTab() {
  const budget = useBudgetControl();
  const admin = useClipperAdmin();

  const alerts: { level: "error" | "warning" | "info"; title: string; desc: string; time: string }[] = [];

  budget.segmentCycles.forEach(sc => {
    const seg = budget.segments.find(s => s.id === sc.segment_id);
    if (!seg) return;
    const pct = seg.weekly_limit_cents > 0 ? (sc.spent_cents / seg.weekly_limit_cents) * 100 : 0;
    if (pct >= 100) alerts.push({ level: "error", title: `${seg.name} at 100%`, desc: "Hard freeze active. Payouts blocked.", time: "Now" });
    else if (pct >= 95) alerts.push({ level: "error", title: `${seg.name} at ${pct.toFixed(0)}%`, desc: "Auto-throttle engaged.", time: "Now" });
    else if (pct >= 80) alerts.push({ level: "warning", title: `${seg.name} at ${pct.toFixed(0)}%`, desc: "Approaching weekly limit.", time: "Now" });
  });

  if (budget.cycle?.status === "pending_approval") {
    alerts.push({ level: "warning", title: "Cycle Pending Approval", desc: "Weekly cycle not yet approved. Friday payouts blocked.", time: "Now" });
  }

  if (admin.stats && admin.stats.pendingReviewCount > 10) {
    alerts.push({ level: "info", title: `${admin.stats.pendingReviewCount} Clips Pending Review`, desc: "Large queue of unreviewed clips.", time: "Now" });
  }

  return (
    <div className="space-y-6">
      <AdminSectionDashboard
        title="Alerts"
        description="Real-time KPI alerts for budget, fraud, and conversion drops"
        kpis={[
          { label: "Critical", value: alerts.filter(a => a.level === "error").length },
          { label: "Warnings", value: alerts.filter(a => a.level === "warning").length },
          { label: "Info", value: alerts.filter(a => a.level === "info").length },
          { label: "Total", value: alerts.length },
        ]}
      />
      {alerts.length === 0 ? (
        <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-xl p-8 text-center">
          <CheckCircle className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
          <p className="text-sm font-bold text-foreground">All Clear</p>
          <p className="text-xs text-muted-foreground">No active alerts. Systems nominal.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {alerts.map((a, i) => (
            <div key={i} className={`border rounded-xl p-4 flex items-start gap-3 ${
              a.level === "error" ? "border-red-500/30 bg-red-500/5" : a.level === "warning" ? "border-amber-500/30 bg-amber-500/5" : "border-blue-500/30 bg-blue-500/5"
            }`}>
              {a.level === "error" ? <AlertTriangle className="w-5 h-5 text-red-400 shrink-0" /> : a.level === "warning" ? <AlertCircle className="w-5 h-5 text-amber-400 shrink-0" /> : <Bell className="w-5 h-5 text-blue-400 shrink-0" />}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-foreground">{a.title}</p>
                <p className="text-xs text-muted-foreground">{a.desc}</p>
              </div>
              <span className="text-[10px] text-muted-foreground shrink-0">{a.time}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
