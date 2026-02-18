import { useClipperAdmin } from "@/hooks/useClipperAdmin";
import { useBudgetControl } from "@/hooks/useBudgetControl";
import AdminSectionDashboard from "@/components/admin/AdminSectionDashboard";
import { Badge } from "@/components/ui/badge";
import ExportCsvButton from "@/components/admin/ExportCsvButton";

export default function PaymentsTab() {
  const admin = useClipperAdmin();
  const budget = useBudgetControl();
  const verifiedClips = admin.clips.filter(c => c.status === "verified");
  const totalEarnings = verifiedClips.reduce((s, c) => s + c.earnings_cents, 0);
  const pendingPayout = admin.clips.filter(c => c.status === "pending").reduce((s, c) => s + c.earnings_cents, 0);

  return (
    <div className="space-y-6">
      <AdminSectionDashboard
        title="Payments"
        description="Weekly payout batch, pending verification, Friday queue"
        kpis={[
          { label: "Approved Payouts", value: `$${(totalEarnings / 100).toFixed(2)}` },
          { label: "Pending Review", value: `$${(pendingPayout / 100).toFixed(2)}` },
          { label: "Cycle Status", value: budget.cycle?.status || "—" },
          { label: "Segments", value: budget.segments.length },
          { label: "Friday Ready", value: budget.cycle?.status === "approved" ? "✅ Yes" : "❌ No" },
        ]}
        charts={[
          { type: "bar", title: "Payouts by Clipper (Top 5)", data: admin.clippers.slice(0, 5).map(c => ({ name: c.display_name.slice(0, 10), value: c.totalEarningsCents / 100 })) },
        ]}
      />
      <div className="bg-card border border-border/40 rounded-xl overflow-hidden">
        <div className="px-4 py-3 border-b border-border/20 bg-secondary/20 flex items-center justify-between">
          <h3 className="text-xs font-bold text-foreground uppercase">Payout Queue</h3>
          <ExportCsvButton data={admin.clippers.filter(c => c.totalEarningsCents > 0).map(c => ({ name: c.display_name, clips: c.totalClips, views: c.totalViews, earnings: (c.totalEarningsCents / 100).toFixed(2), pending: c.pendingClips }))} filename="payout-queue.csv" columns={["name", "clips", "views", "earnings", "pending"]} />
        </div>
        <div className="divide-y divide-border/10">
          {admin.clippers.filter(c => c.totalEarningsCents > 0).map(c => (
            <div key={c.user_id} className="flex items-center justify-between px-4 py-3 text-sm">
              <div>
                <p className="font-medium text-foreground text-xs">{c.display_name}</p>
                <p className="text-[10px] text-muted-foreground">{c.totalClips} clips · {c.totalViews.toLocaleString()} views</p>
              </div>
              <div className="text-right">
                <p className="font-bold text-foreground text-sm">${(c.totalEarningsCents / 100).toFixed(2)}</p>
                <Badge variant="outline" className="text-[9px]">{c.pendingClips > 0 ? "Pending" : "Ready"}</Badge>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
