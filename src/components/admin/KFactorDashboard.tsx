/**
 * KFactorDashboard — Viral Coefficient Real-Time Dashboard
 *
 * K = (avg invites per user) × (conversion rate)
 * Sources:
 *   - Invites: blessings sent + link_clicks with utm_source=referral
 *   - Inviters: unique sender_id in blessings + creator_profiles with referred_by_code
 *   - Conversions: creator_profiles with referred_by_user_id set
 */
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine,
} from "recharts";
import {
  TrendingUp, Users, Share2, Target, Zap, ArrowUp, ArrowDown, Minus,
} from "lucide-react";
import { format, subDays, eachDayOfInterval } from "date-fns";

// ─── Types ────────────────────────────────────────────────────────────────────
type DailyPoint = {
  date: string;
  invites: number;
  conversions: number;
  kFactor: number;
};

type KFactorMetrics = {
  currentK: number;
  avgK7d: number;
  totalInvites: number;
  totalConversions: number;
  invitesPerUser: number;
  conversionRate: number;
  trend: "up" | "down" | "flat";
  daily: DailyPoint[];
};

// ─── Data hook ────────────────────────────────────────────────────────────────
function useKFactorMetrics(): { data: KFactorMetrics | undefined; isLoading: boolean } {
  return useQuery<KFactorMetrics>({
    queryKey: ["kfactor-metrics"],
    staleTime: 5 * 60 * 1000,
    queryFn: async () => {
      const thirtyDaysAgo = subDays(new Date(), 30).toISOString();

      // Fetch all data in parallel
      const [blessingsRes, profilesRes, referredRes] = await Promise.all([
        // Invites sent = blessings sent per day
        supabase
          .from("blessings")
          .select("created_at, sender_id")
          .gte("created_at", thirtyDaysAgo),
        // New signups (potential inviters)
        supabase
          .from("creator_profiles")
          .select("created_at, referred_by_user_id")
          .gte("created_at", thirtyDaysAgo),
        // Conversions = profiles with a referral code attribution
        supabase
          .from("creator_profiles")
          .select("created_at")
          .not("referred_by_user_id", "is", null)
          .gte("created_at", thirtyDaysAgo),
      ]);

      const blessings = blessingsRes.data ?? [];
      const profiles = profilesRes.data ?? [];
      const referred = referredRes.data ?? [];

      // Build day buckets for last 30 days
      const days = eachDayOfInterval({
        start: subDays(new Date(), 29),
        end: new Date(),
      });

      const daily: DailyPoint[] = days.map((d) => {
        const key = format(d, "yyyy-MM-dd");

        const dayInvites = blessings.filter(
          (b) => format(new Date(b.created_at), "yyyy-MM-dd") === key
        ).length;

        const dayConversions = referred.filter(
          (r) => format(new Date(r.created_at), "yyyy-MM-dd") === key
        ).length;

        // New users that day = denominator for invites-per-user
        const dayUsers = profiles.filter(
          (p) => format(new Date(p.created_at), "yyyy-MM-dd") === key
        ).length;

        const invitesPerUser = dayUsers > 0 ? dayInvites / dayUsers : 0;
        const convRate = dayInvites > 0 ? dayConversions / dayInvites : 0;
        const k = parseFloat((invitesPerUser * convRate).toFixed(3));

        return { date: format(d, "MMM d"), invites: dayInvites, conversions: dayConversions, kFactor: k };
      });

      // Aggregate totals
      const totalInvites = blessings.length;
      const totalConversions = referred.length;
      const uniqueInviters = new Set(blessings.map((b) => b.sender_id)).size;
      const invitesPerUser = uniqueInviters > 0 ? totalInvites / uniqueInviters : 0;
      const conversionRate = totalInvites > 0 ? totalConversions / totalInvites : 0;
      const currentK = parseFloat((invitesPerUser * conversionRate).toFixed(3));

      // 7-day avg
      const last7 = daily.slice(-7);
      const avgK7d = parseFloat(
        (last7.reduce((s, d) => s + d.kFactor, 0) / Math.max(last7.length, 1)).toFixed(3)
      );

      // Trend: compare last 3d to prior 3d
      const last3Avg = daily.slice(-3).reduce((s, d) => s + d.kFactor, 0) / 3;
      const prior3Avg = daily.slice(-6, -3).reduce((s, d) => s + d.kFactor, 0) / 3;
      const trend: "up" | "down" | "flat" =
        last3Avg > prior3Avg + 0.01 ? "up" : last3Avg < prior3Avg - 0.01 ? "down" : "flat";

      return {
        currentK, avgK7d, totalInvites, totalConversions,
        invitesPerUser: parseFloat(invitesPerUser.toFixed(2)),
        conversionRate: parseFloat((conversionRate * 100).toFixed(1)),
        trend, daily,
      };
    },
  });
}

// ─── Sub-components ───────────────────────────────────────────────────────────
function KpiCard({
  icon: Icon, label, value, sub, highlight = false,
}: {
  icon: React.ElementType;
  label: string;
  value: string | number;
  sub?: string;
  highlight?: boolean;
}) {
  return (
    <Card className={highlight ? "border-primary/30 bg-primary/5" : ""}>
      <CardContent className="flex items-center gap-4 pt-5">
        <div className={`p-2 rounded-lg ${highlight ? "bg-primary/10" : "bg-muted"}`}>
          <Icon className={`w-5 h-5 ${highlight ? "text-primary" : "text-muted-foreground"}`} />
        </div>
        <div>
          <p className="text-xs text-muted-foreground">{label}</p>
          <p className={`text-2xl font-bold ${highlight ? "text-primary" : "text-foreground"}`}>
            {value}
          </p>
          {sub && <p className="text-xs text-muted-foreground">{sub}</p>}
        </div>
      </CardContent>
    </Card>
  );
}

function TrendBadge({ trend }: { trend: "up" | "down" | "flat" }) {
  if (trend === "up") return (
    <Badge className="bg-primary/10 text-primary border-primary/20 gap-1">
      <ArrowUp className="w-3 h-3" /> Trending Up
    </Badge>
  );
  if (trend === "down") return (
    <Badge className="bg-destructive/10 text-destructive border-destructive/20 gap-1">
      <ArrowDown className="w-3 h-3" /> Trending Down
    </Badge>
  );
  return (
    <Badge variant="secondary" className="gap-1">
      <Minus className="w-3 h-3" /> Stable
    </Badge>
  );
}

type CustomTooltipProps = {
  active?: boolean;
  payload?: Array<{ value: number; name: string }>;
  label?: string;
};

function CustomTooltip({ active, payload, label }: CustomTooltipProps) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-card border border-border rounded-lg p-3 text-xs shadow-lg">
      <p className="font-semibold text-foreground mb-1">{label}</p>
      {payload.map((p) => (
        <p key={p.name} className="text-muted-foreground">
          {p.name}: <span className="text-foreground font-mono">{p.value}</span>
        </p>
      ))}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function KFactorDashboard() {
  const { data, isLoading } = useKFactorMetrics();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64 text-muted-foreground text-sm">
        <Zap className="w-4 h-4 mr-2 animate-pulse text-primary" />
        Computing viral coefficient…
      </div>
    );
  }

  if (!data) return null;

  const { currentK, avgK7d, totalInvites, totalConversions, invitesPerUser, conversionRate, trend, daily } = data;

  // K-factor benchmark labels
  const kLabel =
    currentK >= 1
      ? "🚀 Viral (K ≥ 1)"
      : currentK >= 0.5
      ? "📈 Growing (K ≥ 0.5)"
      : "📉 Sub-viral (K < 0.5)";

  const kColor =
    currentK >= 1 ? "text-primary" : currentK >= 0.5 ? "text-muted-foreground" : "text-destructive";

  return (
    <div className="space-y-6 p-4">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary" />
            Viral Coefficient (K-Factor)
          </h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            K = (avg invites per user) × (conversion rate) · Last 30 days
          </p>
        </div>
        <div className="flex items-center gap-2">
          <TrendBadge trend={trend} />
          <span className={`text-sm font-semibold ${kColor}`}>{kLabel}</span>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <KpiCard
          icon={Zap}
          label="Current K-Factor"
          value={currentK.toFixed(3)}
          sub="invites × conv rate"
          highlight
        />
        <KpiCard
          icon={TrendingUp}
          label="7-Day Avg K"
          value={avgK7d.toFixed(3)}
          sub="rolling average"
        />
        <KpiCard
          icon={Share2}
          label="Invites/User"
          value={invitesPerUser}
          sub="avg blessings sent"
        />
        <KpiCard
          icon={Target}
          label="Conversion Rate"
          value={`${conversionRate}%`}
          sub="invite → signup"
        />
      </div>

      {/* Secondary stat cards */}
      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardContent className="pt-5 flex items-center gap-4">
            <div className="p-2 rounded-lg bg-muted">
              <Share2 className="w-5 h-5 text-muted-foreground" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Total Invites Sent (30d)</p>
              <p className="text-2xl font-bold text-foreground">{totalInvites.toLocaleString()}</p>
              <p className="text-xs text-muted-foreground">blessings + referral links</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-5 flex items-center gap-4">
            <div className="p-2 rounded-lg bg-muted">
              <Users className="w-5 h-5 text-muted-foreground" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Referred Conversions (30d)</p>
              <p className="text-2xl font-bold text-foreground">{totalConversions.toLocaleString()}</p>
              <p className="text-xs text-muted-foreground">attributed signups</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Daily K-Factor Trend Chart */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold text-foreground flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-primary" />
            Daily K-Factor Trend (30 days)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={daily} margin={{ top: 8, right: 8, bottom: 0, left: -20 }}>
              <defs>
                <linearGradient id="kGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                interval={4}
              />
              <YAxis
                tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                domain={[0, "auto"]}
              />
              <Tooltip content={<CustomTooltip />} />
              {/* Viral threshold line at K=1 */}
              <ReferenceLine
                y={1}
                stroke="hsl(var(--destructive))"
                strokeDasharray="4 4"
                label={{ value: "K=1 Viral", position: "right", fontSize: 10, fill: "hsl(var(--destructive))" }}
              />
              <Area
                type="monotone"
                dataKey="kFactor"
                name="K-Factor"
                stroke="hsl(var(--primary))"
                strokeWidth={2}
                fill="url(#kGradient)"
                dot={false}
                activeDot={{ r: 4, fill: "hsl(var(--primary))" }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Invites vs Conversions bar context */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold text-foreground">
            Invites vs Conversions · Daily (30d)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={160}>
            <AreaChart data={daily} margin={{ top: 8, right: 8, bottom: 0, left: -20 }}>
              <defs>
                <linearGradient id="inviteGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="convGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--accent))" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(var(--accent))" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                interval={4}
              />
              <YAxis tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="invites"
                name="Invites"
                stroke="hsl(var(--primary))"
                strokeWidth={1.5}
                fill="url(#inviteGrad)"
                dot={false}
              />
              <Area
                type="monotone"
                dataKey="conversions"
                name="Conversions"
                stroke="hsl(var(--accent-foreground))"
                strokeWidth={1.5}
                fill="url(#convGrad)"
                dot={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Formula explainer */}
      <Card className="bg-muted/30">
        <CardContent className="pt-4 pb-4">
          <p className="text-xs text-muted-foreground font-mono">
            <span className="text-foreground font-bold">K = I × C</span>
            {"  "}·{"  "}
            <span className="text-primary">I</span> = avg invites per user (blessings sent / unique senders)
            {"  "}·{"  "}
            <span className="text-primary">C</span> = conv rate (referred signups / total invites)
            {"  "}·{"  "}
            <span className="text-primary font-semibold">K ≥ 1</span> = viral growth
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
