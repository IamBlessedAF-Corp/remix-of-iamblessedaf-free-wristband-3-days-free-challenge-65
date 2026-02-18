import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, FunnelChart, PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import {
  TrendingUp, Users, DollarSign, Eye, ArrowDown, Target,
  RefreshCw, Gift, Brain, Share2, Crown, ChevronDown,
  UserPlus, ShoppingBag, Video, Zap, Trophy, Gauge,
} from "lucide-react";
import { motion } from "framer-motion";
import AdminSectionDashboard from "@/components/admin/AdminSectionDashboard";
import { useLiveFunnelData } from "@/hooks/useLiveFunnelData";
import SankeyFunnelDiagram from "@/components/admin/SankeyFunnelDiagram";

const FUNNEL_COLORS = [
  "hsl(var(--primary))",
  "hsl(217 91% 60%)",
  "hsl(142 71% 45%)",
  "hsl(47 96% 53%)",
  "hsl(25 95% 53%)",
  "hsl(330 81% 60%)",
  "hsl(271 91% 65%)",
];

const TIER_ORDER = ["free-wristband", "wristband-22", "pack-111", "pack-444", "pack-1111", "pack-4444", "monthly-11"];

export default function FunnelMap() {
  const {
    trafficData,
    signupCount,
    orderData,
    clipperData,
    challengeCount,
    shareCount,
    conversionFunnel,
    isLoading,
  } = useLiveFunnelData();

  const conversionRates = useMemo(() => {
    if (!trafficData || !orderData) return [];
    const stages = conversionFunnel;
    return stages.map((s, i) => ({
      ...s,
      convRate: i > 0 && stages[i - 1].count > 0
        ? ((s.count / stages[i - 1].count) * 100).toFixed(1)
        : "100",
    }));
  }, [conversionFunnel, trafficData, orderData]);

  const sortedTiers = useMemo(() => {
    if (!orderData) return [];
    return [...orderData.tiers].sort((a, b) => {
      const ai = TIER_ORDER.indexOf(a.tier);
      const bi = TIER_ORDER.indexOf(b.tier);
      return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi);
    });
  }, [orderData]);

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <RefreshCw className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  const totalRevenue = orderData?.totalRevenueCents || 0;
  const totalOrders = orderData?.totalOrders || 0;
  const aov = totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0;

  return (
    <div className="space-y-6">
      {/* ═══ Top KPIs ═══ */}
      <AdminSectionDashboard
        title="Live Conversion Funnel"
        description="Real-time data from all systems — no projections"
        kpis={[
          { label: "Total Clicks", value: trafficData?.totalClicks?.toLocaleString() || "0" },
          { label: "Unique Visitors", value: trafficData?.uniqueVisitors?.toLocaleString() || "0" },
          { label: "Signups", value: signupCount.toLocaleString() },
          { label: "Orders", value: totalOrders.toLocaleString() },
          { label: "Revenue", value: `$${(totalRevenue / 100).toLocaleString()}` },
          { label: "AOV", value: `$${(aov / 100).toFixed(2)}` },
        ]}
      />
      {/* ═══ Sankey Flow Diagram ═══ */}
      <SankeyFunnelDiagram
        clicks={trafficData?.totalClicks || 0}
        visitors={trafficData?.uniqueVisitors || 0}
        challengeJoined={challengeCount}
        signups={signupCount}
        orders={totalOrders}
        shares={shareCount}
        totalRevenueCents={totalRevenue}
      />

      {/* ═══ Conversion Funnel ═══ */}
      <Card className="border-border/40">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Target className="w-4 h-4 text-primary" />
            Conversion Funnel — Live Data
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-1">
            {conversionRates.map((stage, i) => {
              const maxCount = conversionRates[0]?.count || 1;
              const widthPct = Math.max(5, (stage.count / maxCount) * 100);
              return (
                <motion.div
                  key={stage.stage}
                  className="flex items-center gap-3"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <span className="text-[10px] font-semibold text-muted-foreground w-28 shrink-0 text-right">{stage.stage}</span>
                  <div className="flex-1 relative h-10">
                    <div
                      className="absolute inset-y-0 left-0 rounded-lg flex items-center px-3 transition-all"
                      style={{
                        width: `${widthPct}%`,
                        background: FUNNEL_COLORS[i % FUNNEL_COLORS.length],
                        opacity: 0.85,
                      }}
                    >
                      <span className="text-xs font-bold text-white">{stage.count.toLocaleString()}</span>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold text-foreground w-14 shrink-0">
                    {i > 0 ? `${stage.convRate}%` : "—"}
                  </span>
                </motion.div>
              );
            })}
          </div>
          {conversionRates.length >= 2 && (
            <div className="mt-4 bg-primary/5 rounded-lg p-3 flex items-center gap-2">
              <Gauge className="w-4 h-4 text-primary" />
              <span className="text-xs text-foreground">
                Overall conversion: <strong className="text-primary">
                  {((conversionRates[conversionRates.length - 1]?.count || 0) / Math.max(1, conversionRates[0]?.count) * 100).toFixed(2)}%
                </strong> (Clicks → Orders)
              </span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* ═══ Revenue by Tier ═══ */}
      <Card className="border-border/40">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-primary" />
            Revenue by Tier — Live
          </CardTitle>
        </CardHeader>
        <CardContent>
          {sortedTiers.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">No orders yet</p>
          ) : (
            <div className="space-y-3">
              {sortedTiers.map((tier, i) => (
                <div key={tier.tier} className="flex items-center gap-3">
                  <div className="w-36 shrink-0">
                    <p className="text-xs font-semibold text-foreground">{tier.label}</p>
                    <p className="text-[10px] text-muted-foreground">{tier.count} orders</p>
                  </div>
                  <div className="flex-1 bg-secondary/30 rounded-lg h-8 relative overflow-hidden">
                    <motion.div
                      className="absolute inset-y-0 left-0 rounded-lg"
                      style={{ background: FUNNEL_COLORS[i % FUNNEL_COLORS.length] }}
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.max(5, (tier.revenue_cents / Math.max(1, totalRevenue)) * 100)}%` }}
                      transition={{ duration: 0.6, delay: i * 0.08 }}
                    />
                    <span className="absolute inset-0 flex items-center px-3 text-xs font-bold text-foreground">
                      ${(tier.revenue_cents / 100).toLocaleString()}
                    </span>
                  </div>
                  <span className="text-[10px] font-bold text-muted-foreground w-12 shrink-0 text-right">
                    {((tier.revenue_cents / Math.max(1, totalRevenue)) * 100).toFixed(0)}%
                  </span>
                </div>
              ))}
              <Separator />
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-foreground">Total Revenue</span>
                <span className="text-lg font-black text-primary">${(totalRevenue / 100).toLocaleString()}</span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* ═══ Clipper Funnel ═══ */}
      {clipperData && (
        <Card className="border-border/40">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Video className="w-4 h-4 text-primary" />
              Clipper Growth Funnel — Live
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
              <MetricCard label="Active Clippers" value={clipperData.totalClippers} icon={Users} />
              <MetricCard label="Total Clips" value={clipperData.totalClips} icon={Video} />
              <MetricCard label="Net Views" value={clipperData.totalNetViews >= 1000 ? `${(clipperData.totalNetViews / 1000).toFixed(1)}k` : String(clipperData.totalNetViews)} icon={Eye} />
              <MetricCard label="Total Paid" value={`$${(clipperData.totalPaidCents / 100).toFixed(2)}`} icon={DollarSign} />
            </div>

            <div className="space-y-1">
              {[
                { label: "Clips Submitted", value: clipperData.totalClips, color: FUNNEL_COLORS[0] },
                { label: "Pending Review", value: clipperData.pendingClips, color: FUNNEL_COLORS[3] },
                { label: "Verified", value: clipperData.verifiedClips, color: FUNNEL_COLORS[2] },
                { label: "Rejected", value: clipperData.rejectedClips, color: FUNNEL_COLORS[5] },
              ].map((item, i) => {
                const maxVal = clipperData.totalClips || 1;
                return (
                  <div key={item.label} className="flex items-center gap-3">
                    <span className="text-[10px] font-semibold text-muted-foreground w-28 shrink-0 text-right">{item.label}</span>
                    <div className="flex-1 relative h-8">
                      <motion.div
                        className="absolute inset-y-0 left-0 rounded-lg flex items-center px-3"
                        style={{ background: item.color, opacity: 0.85 }}
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.max(3, (item.value / maxVal) * 100)}%` }}
                        transition={{ duration: 0.5 }}
                      >
                        <span className="text-xs font-bold text-white">{item.value}</span>
                      </motion.div>
                    </div>
                  </div>
                );
              })}
            </div>

            {clipperData.totalClips > 0 && clipperData.totalNetViews > 0 && (
              <div className="mt-4 grid grid-cols-2 gap-3">
                <div className="bg-primary/5 rounded-lg p-3 text-center">
                  <p className="text-lg font-black text-primary">{Math.round(clipperData.totalNetViews / clipperData.totalClips).toLocaleString()}</p>
                  <p className="text-[10px] text-muted-foreground">Avg Views/Clip</p>
                </div>
                <div className="bg-primary/5 rounded-lg p-3 text-center">
                  <p className="text-lg font-black text-primary">
                    {clipperData.totalNetViews > 0 ? `$${((clipperData.totalPaidCents / clipperData.totalNetViews) * 1000 / 100).toFixed(2)}` : "$0"}
                  </p>
                  <p className="text-[10px] text-muted-foreground">Effective RPM</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* ═══ Challenge Participants ═══ */}
      <Card className="border-border/40">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Trophy className="w-4 h-4 text-primary" />
            Engagement Pipeline
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <MetricCard label="Challenge Participants" value={challengeCount} icon={UserPlus} />
            <MetricCard label="Total Signups" value={signupCount} icon={Users} />
            <MetricCard label="Signup→Order %" value={signupCount > 0 ? `${((totalOrders / signupCount) * 100).toFixed(1)}%` : "0%"} icon={TrendingUp} />
            <MetricCard label="Signup→Challenge %" value={signupCount > 0 ? `${((challengeCount / signupCount) * 100).toFixed(1)}%` : "0%"} icon={Zap} />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function MetricCard({ label, value, icon: Icon }: { label: string; value: string | number; icon: any }) {
  return (
    <div className="bg-secondary/30 rounded-lg p-3 text-center">
      <Icon className="w-4 h-4 text-primary mx-auto mb-1" />
      <p className="text-lg font-bold text-foreground">{value}</p>
      <p className="text-[9px] text-muted-foreground uppercase tracking-wider">{label}</p>
    </div>
  );
}
