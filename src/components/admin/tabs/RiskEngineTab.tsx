import { useClipperAdmin } from "@/hooks/useClipperAdmin";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import AdminSectionDashboard from "@/components/admin/AdminSectionDashboard";
import { Gauge } from "lucide-react";

export default function RiskEngineTab() {
  const admin = useClipperAdmin();
  const clips = admin.clips.filter(c => c.status === "verified");
  const totalViews = clips.reduce((s, c) => s + c.view_count, 0);

  const { data: throttle } = useQuery({
    queryKey: ["risk-throttle-live"],
    queryFn: async () => {
      const { data } = await supabase.from("clipper_risk_throttle").select("*").limit(1).maybeSingle();
      return data;
    },
  });

  const clipsWithMetrics = clips.filter(c => (c as any).ctr != null);
  const avgCTR = clipsWithMetrics.length > 0
    ? clipsWithMetrics.reduce((s, c) => s + (Number((c as any).ctr) || 0), 0) / clipsWithMetrics.length
    : throttle?.current_avg_ctr ? Number(throttle.current_avg_ctr) : 0.012;
  const avgRegRate = throttle?.current_avg_reg_rate ? Number(throttle.current_avg_reg_rate) : 0.18;
  const avgDay1 = throttle?.current_avg_day1_rate ? Number(throttle.current_avg_day1_rate) : 0.28;
  const isThrottleActive = throttle?.is_active ?? false;
  const rpmOverride = throttle?.rpm_override ? Number(throttle.rpm_override) : null;

  let riskScore = 0;
  if (avgCTR < 0.008) riskScore += 30;
  else if (avgCTR < 0.01) riskScore += 15;
  if (avgRegRate < 0.1) riskScore += 30;
  else if (avgRegRate < 0.15) riskScore += 15;
  if (avgDay1 < 0.2) riskScore += 25;
  else if (avgDay1 < 0.25) riskScore += 10;
  if (isThrottleActive) riskScore += 15;

  const recentClips = clips.slice(0, 7);
  const trendData = recentClips.length > 0
    ? recentClips.map((c, i) => ({ name: `Clip ${i + 1}`, value: Math.round((Number((c as any).ctr) || avgCTR) * 10000) / 100 }))
    : Array.from({ length: 7 }, (_, i) => ({ name: `Day ${i + 1}`, value: Math.round(avgCTR * 10000) / 100 }));

  const lowRisk = admin.clippers.filter(c => c.totalViews > 1000).length;
  const medRisk = admin.clippers.filter(c => c.totalViews > 0 && c.totalViews <= 1000).length;
  const highRisk = admin.clippers.filter(c => c.totalViews === 0).length;

  return (
    <div className="space-y-6">
      <AdminSectionDashboard
        title="Risk Engine"
        description="Live conversion averages from DB, throttle state, risk scoring"
        kpis={[
          { label: "Avg CTR", value: `${(avgCTR * 100).toFixed(2)}%`, delta: avgCTR < 0.01 ? "⚠️ Below threshold" : "✅ Healthy" },
          { label: "Avg Reg Rate", value: `${(avgRegRate * 100).toFixed(1)}%` },
          { label: "Avg Day-1", value: `${(avgDay1 * 100).toFixed(1)}%` },
          { label: "Risk Score", value: `${riskScore}/100`, delta: riskScore > 50 ? "⚠️ Elevated" : "✅ Normal" },
          { label: "Throttle", value: isThrottleActive ? "🔴 Active" : "🟢 Off" },
          { label: "RPM Override", value: rpmOverride ? `$${rpmOverride}` : "Default" },
        ]}
        charts={[
          { type: "area", title: "CTR Trend (Recent Clips)", data: trendData },
          { type: "bar", title: "Clipper Risk Distribution", data: [
            { name: "Low (>1K views)", value: lowRisk },
            { name: "Medium (<1K)", value: medRisk },
            { name: "High (0 views)", value: highRisk },
          ]},
          { type: "pie", title: "Verified vs Total", data: [
            { name: "Verified", value: clips.length || 1 },
            { name: "Other", value: Math.max(admin.clips.length - clips.length, 1) },
          ]},
        ]}
      />
      <div className={`rounded-xl p-4 border-2 ${riskScore > 60 ? "border-red-500/30 bg-red-500/5" : riskScore > 40 ? "border-amber-500/30 bg-amber-500/5" : "border-emerald-500/30 bg-emerald-500/5"}`}>
        <div className="flex items-center gap-2 mb-2">
          <Gauge className="w-5 h-5" />
          <span className="text-sm font-black uppercase">System Risk Level: {riskScore}/100</span>
        </div>
        <p className="text-xs text-muted-foreground">
          {isThrottleActive
            ? `Auto-throttle ACTIVE since ${throttle?.activated_at ? new Date(throttle.activated_at).toLocaleDateString() : "—"}. ${rpmOverride ? `RPM overridden to $${rpmOverride}` : "RPM reduced."}`
            : riskScore > 40
              ? "Warning zone. Monitoring closely."
              : `All systems nominal. ${clips.length} verified clips, ${totalViews.toLocaleString()} total views.`}
        </p>
      </div>
    </div>
  );
}
