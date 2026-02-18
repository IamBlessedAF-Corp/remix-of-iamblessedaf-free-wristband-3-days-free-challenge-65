import { useClipperAdmin } from "@/hooks/useClipperAdmin";
import { useBudgetControl } from "@/hooks/useBudgetControl";
import { useRealEconomyMetrics } from "@/hooks/useRealEconomyMetrics";
import AdminSectionDashboard from "@/components/admin/AdminSectionDashboard";

export default function ForecastTab() {
  const admin = useClipperAdmin();
  const budget = useBudgetControl();
  const { realRpm, worstCaseMultiplier, riskAdjMultiplier } = useRealEconomyMetrics();

  const realTotalViews = admin.stats?.totalViews || 0;
  const realWeeklyViews = admin.clips
    .filter(c => {
      const d = new Date(c.submitted_at);
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return d >= weekAgo;
    })
    .reduce((s, c) => s + c.view_count, 0);

  // RPM derived from real payout data (dollars per 1K views)
  const rpm = realRpm > 0 ? realRpm : 0;
  const weeklyLimit = budget.cycle?.global_weekly_limit_cents || 0;
  const weeklyBase = Math.round((realWeeklyViews / 1000) * rpm * 100);
  const day7 = Math.min(weeklyBase, weeklyLimit);
  const day30 = day7 * 4;
  // Multipliers derived from real payout variance
  const worstCase = Math.round(day30 * worstCaseMultiplier);
  const riskAdj = Math.round(day30 * riskAdjMultiplier);

  const forecastData = [
    { name: "Week 1", value: day7 / 100 },
    { name: "Week 2", value: (day7 * 2) / 100 },
    { name: "Week 3", value: (day7 * 3) / 100 },
    { name: "Week 4", value: day30 / 100 },
  ];

  const rpmLabel = realRpm > 0 ? `$${realRpm.toFixed(2)}` : "no data";

  return (
    <div className="space-y-6">
      <AdminSectionDashboard
        title="Forecast AI"
        description={`Based on ${realWeeklyViews.toLocaleString()} weekly views · ${realTotalViews.toLocaleString()} lifetime · RPM: ${rpmLabel} (real) · Worst×${worstCaseMultiplier.toFixed(2)} · Risk×${riskAdjMultiplier.toFixed(2)}`}
        kpis={[
          { label: "Weekly Views", value: realWeeklyViews.toLocaleString() },
          { label: "7-Day Forecast", value: `$${(day7 / 100).toFixed(0)}` },
          { label: "30-Day Projection", value: `$${(day30 / 100).toFixed(0)}` },
          { label: "Worst Case", value: `$${(worstCase / 100).toFixed(0)}` },
          { label: "Risk-Adjusted", value: `$${(riskAdj / 100).toFixed(0)}` },
          { label: "Budget Limit", value: weeklyLimit > 0 ? `$${(weeklyLimit / 100).toFixed(0)}/wk` : "—" },
        ]}
        charts={[
          { type: "area", title: "Revenue Forecast (4 Weeks)", data: forecastData },
          { type: "bar", title: "Scenario Analysis", data: [
            { name: "Best", value: day30 * worstCaseMultiplier / 100 },
            { name: "Base", value: day30 / 100 },
            { name: "Worst", value: worstCase / 100 },
          ]},
          { type: "pie", title: "Views: This Week vs Rest", data: [
            { name: "This Week", value: realWeeklyViews || 1 },
            { name: "Older", value: Math.max(realTotalViews - realWeeklyViews, 1) },
          ]},
        ]}
      />
    </div>
  );
}
