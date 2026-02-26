import { TrendingUp, TrendingDown } from "lucide-react";

const STATS = [
  { label: "Rocks On Track", value: "87%", change: "+12% vs last quarter", up: true },
  { label: "To-Dos Complete", value: "91%", change: "+5% vs last week", up: true },
  { label: "Weekly Revenue", value: "$128K", change: "+18% vs target", up: true },
  { label: "Avg L10 Rating", value: "8.4", change: "+0.6 vs Q4", up: true },
];

const SCORECARD_SNAPSHOT = [
  { name: "Revenue", goal: "$108K", actual: "$128K", onTrack: true },
  { name: "New Users", goal: "1,200", actual: "947", onTrack: false },
  { name: "Churn Rate", goal: "<3%", actual: "2.1%", onTrack: true },
  { name: "NPS Score", goal: "60", actual: "72", onTrack: true },
];

const OPEN_ISSUES = [
  { title: "Onboarding drop-off at step 3", priority: "High", status: "Discussing", priorityColor: "text-red-400 bg-red-500/10", statusColor: "text-yellow-400 bg-yellow-500/10" },
  { title: "Affiliate payout delays", priority: "Medium", status: "Identified", priorityColor: "text-yellow-400 bg-yellow-500/10", statusColor: "text-purple-400 bg-purple-500/10" },
  { title: "Slack bot response latency", priority: "Low", status: "Identified", priorityColor: "text-muted-foreground bg-muted", statusColor: "text-purple-400 bg-purple-500/10" },
];

export default function EosDashboardTab() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-foreground">Dashboard</h1>
        <p className="text-xs text-muted-foreground mt-1">Q1 2026 Overview — IamBlessedAF</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {STATS.map((stat) => (
          <div key={stat.label} className="bg-card border border-border rounded-xl p-4">
            <div className="text-2xl font-extrabold bg-gradient-to-r from-purple-400 to-emerald-400 bg-clip-text text-transparent">
              {stat.value}
            </div>
            <div className="text-xs text-muted-foreground mt-1">{stat.label}</div>
            <div className={`text-[11px] mt-1.5 flex items-center gap-1 ${stat.up ? "text-emerald-400" : "text-red-400"}`}>
              {stat.up ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
              {stat.change}
            </div>
          </div>
        ))}
      </div>

      {/* Two-column section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Scorecard Snapshot */}
        <div className="bg-card border border-border rounded-xl p-5">
          <h3 className="text-sm font-bold text-foreground mb-3">Scorecard Snapshot</h3>
          <table className="w-full">
            <thead>
              <tr className="text-[11px] font-semibold text-muted-foreground uppercase">
                <th className="text-left pb-2">Measurable</th>
                <th className="text-left pb-2">Goal</th>
                <th className="text-left pb-2">Actual</th>
                <th className="text-left pb-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {SCORECARD_SNAPSHOT.map((row) => (
                <tr key={row.name} className="border-t border-border/50">
                  <td className="py-2.5 text-xs text-foreground">{row.name}</td>
                  <td className="py-2.5 text-xs text-muted-foreground">{row.goal}</td>
                  <td className="py-2.5 text-xs text-foreground">{row.actual}</td>
                  <td className="py-2.5">
                    <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${row.onTrack ? "text-emerald-400 bg-emerald-500/10" : "text-red-400 bg-red-500/10"}`}>
                      {row.onTrack ? "On Track" : "Off Track"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Open Issues */}
        <div className="bg-card border border-border rounded-xl p-5">
          <h3 className="text-sm font-bold text-foreground mb-3">Open Issues</h3>
          <table className="w-full">
            <thead>
              <tr className="text-[11px] font-semibold text-muted-foreground uppercase">
                <th className="text-left pb-2">Issue</th>
                <th className="text-left pb-2">Priority</th>
                <th className="text-left pb-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {OPEN_ISSUES.map((issue) => (
                <tr key={issue.title} className="border-t border-border/50">
                  <td className="py-2.5 text-xs text-foreground">{issue.title}</td>
                  <td className="py-2.5">
                    <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${issue.priorityColor}`}>
                      {issue.priority}
                    </span>
                  </td>
                  <td className="py-2.5">
                    <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${issue.statusColor}`}>
                      {issue.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
