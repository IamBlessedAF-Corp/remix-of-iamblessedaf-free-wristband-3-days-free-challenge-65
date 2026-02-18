import { useClipperAdmin } from "@/hooks/useClipperAdmin";
import { useBudgetControl } from "@/hooks/useBudgetControl";
import AdminSectionDashboard from "@/components/admin/AdminSectionDashboard";

export default function ForecastTab() {
  const admin = useClipperAdmin();
  const budget = useBudgetControl();

  const realTotalViews = admin.stats?.totalViews || 0;
  const realWeeklyViews = admin.clips
    .filter(c => {
      const d = new Date(c.submitted_at);
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return d >= weekAgo;
    })
    .reduce((s, c) => s + c.view_count, 0);

  const rpm = 0.22;
  const weeklyLimit = budget.cycle?.global_weekly_limit_cents || 500000;
  const weeklyBase = Math.round((realWeeklyViews / 1000) * rpm * 100);
  const day7 = Math.min(weeklyBase, weeklyLimit);
  const day30 = day7 * 4;
  const worstCase = Math.round(day30 * 1.5);
  const riskAdj = Math.round(day30 * 0.8);

  const forecastData = [
    { name: "Week 1", value: day7 / 100 },
    { name: "Week 2", value: (day7 * 2) / 100 },
    { name: "Week 3", value: (day7 * 3) / 100 },
    { name: "Week 4", value: day30 / 100 },
  ];

  return (
    <div className="space-y-6">
      <AdminSectionDashboard
        title="Forecast AI"
        description={`Based on ${realWeeklyViews.toLocaleString()} weekly views · ${realTotalViews.toLocaleString()} lifetime views`}
        kpis={[
          { label: "Weekly Views", value: realWeeklyViews.toLocaleString() },
          { label: "7-Day Forecast", value: `$${(day7 / 100).toFixed(0)}` },
          { label: "30-Day Projection", value: `$${(day30 / 100).toFixed(0)}` },
          { label: "Worst Case", value: `$${(worstCase / 100).toFixed(0)}` },
          { label: "Risk-Adjusted", value: `$${(riskAdj / 100).toFixed(0)}` },
          { label: "Budget Limit", value: `$${(weeklyLimit / 100).toFixed(0)}/wk` },
        ]}
        charts={[
          { type: "area", title: "Revenue Forecast (4 Weeks)", data: forecastData },
          { type: "bar", title: "Scenario Analysis", data: [
            { name: "Best", value: day30 * 1.4 / 100 },
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
