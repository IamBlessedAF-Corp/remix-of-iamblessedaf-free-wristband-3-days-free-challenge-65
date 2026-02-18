import { useState } from "react";
import { useLinkAnalytics } from "@/hooks/useLinkAnalytics";
import AdminSectionDashboard from "@/components/admin/AdminSectionDashboard";
import LinkStatsCards from "@/components/admin/LinkStatsCards";
import DailyClicksChart from "@/components/admin/DailyClicksChart";
import LinkPieCharts from "@/components/admin/LinkPieCharts";
import TopLinksTable from "@/components/admin/TopLinksTable";
import UtmBuilder from "@/components/admin/UtmBuilder";
import PerLinkTrafficChart from "@/components/admin/PerLinkTrafficChart";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import ExportCsvButton from "@/components/admin/ExportCsvButton";

export default function LinksTab() {
  const [days, setDays] = useState(30);
  const { stats, links, clicks, loading, refetch } = useLinkAnalytics(days);
  if (loading && !stats) return <div className="flex justify-center py-20"><RefreshCw className="w-6 h-6 animate-spin text-primary" /></div>;
  if (!stats) return <p className="text-center text-muted-foreground py-20">No data.</p>;
  return (
    <div className="space-y-6">
      <AdminSectionDashboard
        title="Link Intelligence"
        description="UTM tracking, click analytics, conversion health"
        kpis={[
          { label: "Total Links", value: stats.totalLinks },
          { label: "Total Clicks", value: stats.totalClicks },
          { label: "Active Links", value: stats.activeLinks },
          { label: "Period Clicks", value: stats.dailyClicks.reduce((s: number, d: any) => s + d.clicks, 0) },
        ]}
      />
      <div className="flex items-center gap-2">
        {[7, 30, 90].map(d => (
          <button key={d} onClick={() => setDays(d)} className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors ${days === d ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground bg-secondary"}`}>{d}d</button>
        ))}
        <ExportCsvButton data={links.map(l => ({ short_code: l.short_code, destination: l.destination_url, campaign: l.campaign, clicks: l.click_count, active: l.is_active, created: l.created_at }))} filename="links.csv" columns={["short_code", "destination", "campaign", "clicks", "active", "created"]} />
        <Button variant="outline" size="sm" onClick={refetch} className="gap-1.5 ml-auto"><RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />Refresh</Button>
      </div>
      <LinkStatsCards totalLinks={stats.totalLinks} totalClicks={stats.totalClicks} activeLinks={stats.activeLinks} periodClicks={stats.dailyClicks.reduce((s: number, d: any) => s + d.clicks, 0)} />
      <DailyClicksChart dailyClicks={stats.dailyClicks} />
      <PerLinkTrafficChart links={links} clicks={clicks} />
      <LinkPieCharts deviceBreakdown={stats.deviceBreakdown} browserBreakdown={stats.browserBreakdown} osBreakdown={stats.osBreakdown} />
      <UtmBuilder />
      <TopLinksTable links={stats.topLinks} />
    </div>
  );
}
