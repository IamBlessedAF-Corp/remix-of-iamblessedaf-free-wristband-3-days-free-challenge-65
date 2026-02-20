import { useState } from "react";
import { useTrafficAnalytics } from "@/hooks/useTrafficAnalytics";
import { useLiveFunnelData } from "@/hooks/useLiveFunnelData";
import AdminSectionDashboard from "@/components/admin/AdminSectionDashboard";
import LinkPieCharts from "@/components/admin/LinkPieCharts";
import SankeyFunnelDiagram from "@/components/admin/SankeyFunnelDiagram";
import CtaVariantReport from "@/components/admin/CtaVariantReport";
import { Button } from "@/components/ui/button";
import {
  RefreshCw, Eye, Users, MousePointerClick, TrendingDown, Globe, MapPin,
  BarChart3, Mail, Activity, Clock, ArrowUpRight, ArrowDownRight, Percent, MousePointer2,
} from "lucide-react";
import ExportCsvButton from "@/components/admin/ExportCsvButton";
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend,
} from "recharts";

const COLORS = [
  "hsl(var(--primary))",
  "hsl(210, 60%, 55%)",
  "hsl(150, 50%, 45%)",
  "hsl(35, 80%, 55%)",
  "hsl(0, 60%, 55%)",
  "hsl(270, 50%, 55%)",
  "hsl(180, 50%, 45%)",
  "hsl(330, 60%, 55%)",
];

const chartTooltipStyle = {
  background: "hsl(var(--card))",
  border: "1px solid hsl(var(--border))",
  borderRadius: "8px",
  fontSize: "12px",
};

function StatCard({ icon: Icon, label, value, sub, trend }: {
  icon: any; label: string; value: string | number; sub?: string;
  trend?: "up" | "down" | "neutral";
}) {
  return (
    <div className="bg-card border border-border/50 rounded-xl p-4">
      <div className="flex items-center gap-2 mb-1.5">
        <Icon className="w-4 h-4 text-primary" />
        <span className="text-xs text-muted-foreground font-medium">{label}</span>
        {trend === "up" && <ArrowUpRight className="w-3 h-3 text-green-500 ml-auto" />}
        {trend === "down" && <ArrowDownRight className="w-3 h-3 text-red-500 ml-auto" />}
      </div>
      <p className="text-2xl font-bold text-foreground">{typeof value === "number" ? value.toLocaleString() : value}</p>
      {sub && <p className="text-[10px] text-muted-foreground mt-0.5">{sub}</p>}
    </div>
  );
}

function RankTable({ title, icon: Icon, rows, labelKey, valueKey, showPct }: {
  title: string; icon: any; rows: any[]; labelKey: string; valueKey: string; showPct?: boolean;
}) {
  if (rows.length === 0) return null;
  return (
    <div className="bg-card border border-border/50 rounded-xl p-4">
      <div className="flex items-center gap-2 mb-3">
        <Icon className="w-4 h-4 text-primary" />
        <h3 className="text-sm font-bold text-foreground">{title}</h3>
      </div>
      <div className="space-y-1.5">
        {rows.map((r, i) => (
          <div key={i} className="flex items-center gap-2 text-xs">
            <span className="w-5 text-muted-foreground font-mono">{i + 1}.</span>
            <span className="flex-1 text-foreground truncate">{r[labelKey]}</span>
            <span className="font-semibold text-foreground">{r[valueKey].toLocaleString()}</span>
            {showPct && <span className="text-muted-foreground w-10 text-right">{r.pct}%</span>}
          </div>
        ))}
      </div>
    </div>
  );
}

function DeliverabilityPanel({ d }: { d: NonNullable<ReturnType<typeof useTrafficAnalytics>["stats"]>["deliverability"] }) {
  const pieData = [
    { name: "Delivered", value: d.delivered },
    { name: "Failed", value: d.failed },
    { name: "Pending", value: d.pending },
  ].filter((r) => r.value > 0);

  return (
    <div className="bg-card border border-border/50 rounded-xl p-4 space-y-4">
      <div className="flex items-center gap-2">
        <Mail className="w-4 h-4 text-primary" />
        <h3 className="text-sm font-bold text-foreground">SMS/Email Deliverability</h3>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="text-center">
          <p className="text-lg font-bold text-foreground">{d.totalSent.toLocaleString()}</p>
          <p className="text-[10px] text-muted-foreground">Total Sent</p>
        </div>
        <div className="text-center">
          <p className="text-lg font-bold text-green-500">{d.delivered.toLocaleString()}</p>
          <p className="text-[10px] text-muted-foreground">Delivered</p>
        </div>
        <div className="text-center">
          <p className="text-lg font-bold text-red-500">{d.failed.toLocaleString()}</p>
          <p className="text-[10px] text-muted-foreground">Failed</p>
        </div>
        <div className="text-center">
          <p className="text-lg font-bold text-primary">{d.deliveryRate}%</p>
          <p className="text-[10px] text-muted-foreground">Delivery Rate</p>
        </div>
      </div>

      {pieData.length > 0 && (
        <div className="flex flex-col sm:flex-row gap-4 items-center">
          <ResponsiveContainer width={180} height={180}>
            <PieChart>
              <Pie data={pieData} cx="50%" cy="50%" innerRadius={40} outerRadius={70} dataKey="value" strokeWidth={1} stroke="hsl(var(--border))">
                {pieData.map((_, i) => <Cell key={i} fill={[`hsl(150, 50%, 45%)`, `hsl(0, 60%, 55%)`, `hsl(35, 80%, 55%)`][i]} />)}
              </Pie>
              <Tooltip contentStyle={chartTooltipStyle} />
              <Legend wrapperStyle={{ fontSize: "11px" }} />
            </PieChart>
          </ResponsiveContainer>

          {d.byChannel.length > 0 && (
            <div className="flex-1 space-y-2 w-full">
              <p className="text-xs font-semibold text-muted-foreground">By Channel</p>
              {d.byChannel.map((ch) => (
                <div key={ch.channel} className="flex items-center gap-2 text-xs">
                  <span className="capitalize text-foreground font-medium w-24 truncate">{ch.channel}</span>
                  <div className="flex-1 h-2 bg-secondary rounded-full overflow-hidden">
                    <div className="h-full bg-primary rounded-full" style={{ width: `${ch.rate}%` }} />
                  </div>
                  <span className="text-muted-foreground w-16 text-right">{ch.rate}% ({ch.sent})</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function TrafficTab() {
  const [days, setDays] = useState(30);
  const { stats, loading, refetch } = useTrafficAnalytics(days);
  const {
    trafficData,
    signupCount,
    challengeCount,
    orderData,
    shareCount,
    isLoading: funnelLoading,
  } = useLiveFunnelData();

  if (loading && !stats)
    return <div className="flex justify-center py-20"><RefreshCw className="w-6 h-6 animate-spin text-primary" /></div>;
  if (!stats)
    return <p className="text-center text-muted-foreground py-20">No traffic data yet.</p>;

  return (
    <div className="space-y-6">
      <AdminSectionDashboard
        title="Traffic Intelligence"
        description="Visitors, sources, deliverability, engagement heatmap"
        kpis={[
          { label: "Page Views", value: stats.totalPageViews },
          { label: "Unique Visitors", value: stats.uniqueVisitors },
          { label: "Bounce Rate", value: `${stats.bounceRate}%` },
          { label: "Delivery Rate", value: `${stats.deliverability.deliveryRate}%` },
        ]}
      />

      {/* ── Real-time Conversion Funnel Sankey ── */}
      {funnelLoading ? (
        <div className="flex justify-center py-8"><RefreshCw className="w-5 h-5 animate-spin text-primary" /></div>
      ) : (
        <SankeyFunnelDiagram
          clicks={trafficData?.totalClicks ?? 0}
          visitors={trafficData?.uniqueVisitors ?? 0}
          challengeJoined={challengeCount}
          signups={signupCount}
          orders={orderData?.totalOrders ?? 0}
          shares={shareCount}
          totalRevenueCents={orderData?.totalRevenueCents ?? 0}
        />
      )}

      {/* ── CTA Variant Conversion Breakdown ── */}
      <CtaVariantReport />

      {/* Period selector */}
      <div className="flex items-center gap-2">
        {[7, 30, 90].map((d) => (
          <button
            key={d}
            onClick={() => setDays(d)}
            className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors ${
              days === d ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground bg-secondary"
            }`}
          >
            {d}d
          </button>
        ))}
        <ExportCsvButton data={stats.dailyTraffic.map(d => ({ date: d.date, views: d.views, unique: d.unique }))} filename="traffic-daily.csv" columns={["date", "views", "unique"]} />
        <Button variant="outline" size="sm" onClick={refetch} className="gap-1.5 ml-auto">
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        <StatCard icon={Eye} label="Page Views" value={stats.totalPageViews} />
        <StatCard icon={Users} label="Unique Visitors" value={stats.uniqueVisitors} />
        <StatCard icon={MousePointerClick} label="Avg Clicks/Session" value={stats.avgSessionClicks} />
        <StatCard icon={TrendingDown} label="Bounce Rate" value={`${stats.bounceRate}%`} trend={stats.bounceRate > 60 ? "down" : "up"} />
        <StatCard icon={Percent} label="New vs Returning" value={`${stats.newVsReturning.new} / ${stats.newVsReturning.returning}`} sub="New / Returning" />
      </div>

      {/* Daily traffic chart */}
      <div className="bg-card border border-border/50 rounded-xl p-5">
        <h3 className="text-sm font-bold text-foreground mb-4">Daily Traffic (Views vs Unique)</h3>
        {stats.dailyTraffic.length > 0 ? (
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={stats.dailyTraffic}>
              <defs>
                <linearGradient id="viewsGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="uniqueGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(150, 50%, 45%)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(150, 50%, 45%)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
              <XAxis dataKey="date" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} tickFormatter={(v) => v.substring(5)} />
              <YAxis tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} allowDecimals={false} />
              <Tooltip contentStyle={chartTooltipStyle} />
              <Area type="monotone" dataKey="views" stroke="hsl(var(--primary))" fill="url(#viewsGrad)" strokeWidth={2} name="Views" />
              <Area type="monotone" dataKey="unique" stroke="hsl(150, 50%, 45%)" fill="url(#uniqueGrad)" strokeWidth={2} name="Unique" />
              <Legend wrapperStyle={{ fontSize: "11px" }} />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <p className="text-xs text-muted-foreground text-center py-10">No data yet</p>
        )}
      </div>

      {/* Hourly heatmap */}
      <div className="bg-card border border-border/50 rounded-xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <Clock className="w-4 h-4 text-primary" />
          <h3 className="text-sm font-bold text-foreground">Hourly Activity Heatmap</h3>
        </div>
        <ResponsiveContainer width="100%" height={180}>
          <BarChart data={stats.hourlyHeatmap}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
            <XAxis dataKey="hour" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }} tickFormatter={(h) => `${h}h`} />
            <YAxis tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }} allowDecimals={false} />
            <Tooltip contentStyle={chartTooltipStyle} />
            <Bar dataKey="clicks" fill="hsl(var(--primary))" radius={[3, 3, 0, 0]} name="Clicks" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Sources, Geo, Campaigns */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <RankTable title="Top Sources" icon={Activity} rows={stats.topSources} labelKey="source" valueKey="visits" showPct />
        <RankTable title="Top Countries" icon={Globe} rows={stats.topCountries} labelKey="country" valueKey="visits" showPct />
        <RankTable title="Top Cities" icon={MapPin} rows={stats.topCities} labelKey="city" valueKey="visits" showPct />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <RankTable title="Top Pages" icon={BarChart3} rows={stats.topPages} labelKey="page" valueKey="visits" showPct />
        <RankTable title="UTM Campaigns" icon={Activity} rows={stats.utmCampaigns} labelKey="campaign" valueKey="clicks" showPct />
        <RankTable title="UTM Mediums" icon={Activity} rows={stats.utmMediums} labelKey="medium" valueKey="clicks" showPct />
      </div>

      {/* Device/Browser/OS */}
      <LinkPieCharts
        deviceBreakdown={stats.deviceBreakdown}
        browserBreakdown={stats.browserBreakdown}
        osBreakdown={stats.osBreakdown}
      />

      {/* CTA Variant Conversions */}
      {stats.ctaConversions.length > 0 && (
        <div className="bg-card border border-border/50 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <MousePointer2 className="w-4 h-4 text-primary" />
            <h3 className="text-sm font-bold text-foreground">CTA Variant Conversions</h3>
            <span className="ml-auto text-xs text-muted-foreground">{stats.ctaConversions.reduce((s, r) => s + r.conversions, 0)} total</span>
          </div>
          <div className="space-y-2">
            {stats.ctaConversions.map((r) => (
              <div key={r.variant} className="flex items-center gap-2 text-xs">
                <span className="w-20 capitalize text-foreground font-medium">{r.variant}</span>
                <div className="flex-1 h-2 bg-secondary rounded-full overflow-hidden">
                  <div className="h-full bg-primary rounded-full" style={{ width: `${r.pct}%` }} />
                </div>
                <span className="text-muted-foreground w-20 text-right">{r.pct}% ({r.conversions})</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Deliverability */}
      <DeliverabilityPanel d={stats.deliverability} />

      {/* New vs Returning donut */}
      <div className="bg-card border border-border/50 rounded-xl p-5">
        <div className="flex items-center gap-2 mb-3">
          <Users className="w-4 h-4 text-primary" />
          <h3 className="text-sm font-bold text-foreground">New vs Returning Visitors</h3>
        </div>
        <div className="flex items-center justify-center">
          <ResponsiveContainer width={220} height={220}>
            <PieChart>
              <Pie
                data={[
                  { name: "New", value: stats.newVsReturning.new },
                  { name: "Returning", value: stats.newVsReturning.returning },
                ]}
                cx="50%" cy="50%" innerRadius={50} outerRadius={85} dataKey="value"
                stroke="hsl(var(--border))" strokeWidth={1}
              >
                <Cell fill="hsl(var(--primary))" />
                <Cell fill="hsl(150, 50%, 45%)" />
              </Pie>
              <Tooltip contentStyle={chartTooltipStyle} />
              <Legend wrapperStyle={{ fontSize: "11px" }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
