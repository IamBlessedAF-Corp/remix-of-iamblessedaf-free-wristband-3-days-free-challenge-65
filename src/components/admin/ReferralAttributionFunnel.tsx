import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import AdminSectionDashboard from "./AdminSectionDashboard";
import { RefreshCw, TrendingUp, ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import ExportCsvButton from "./ExportCsvButton";

interface CreatorRow {
  user_id: string;
  referral_code: string;
  display_name: string | null;
  email: string;
  referred_by_code: string | null;
  referred_by_user_id: string | null;
  created_at: string;
}

interface OrderRow {
  id: string;
  referral_code: string | null;
  amount_cents: number;
  tier: string;
  customer_email: string | null;
  created_at: string;
  status: string;
}

interface LinkClickRow {
  id: string;
  link_id: string;
  clicked_at: string;
  utm_source: string | null;
  utm_campaign: string | null;
  country: string | null;
}

interface ShortLinkRow {
  id: string;
  short_code: string;
  destination_url: string;
  click_count: number;
  created_by: string | null;
  campaign: string | null;
}

interface ReferrerStats {
  code: string;
  name: string;
  email: string;
  clicks: number;
  signups: number;
  purchases: number;
  revenue: number;
  conversionRate: number;
}

/**
 * Referral Attribution Funnel Dashboard
 * Tracks the full chain: referral_code → link click → signup → purchase
 * with per-creator attribution and conversion metrics.
 */
export default function ReferralAttributionFunnel() {
  const { data: creators = [], isLoading: loadingCreators } = useQuery({
    queryKey: ["admin-referral-creators"],
    queryFn: async () => {
      const { data } = await supabase
        .from("creator_profiles")
        .select("user_id, referral_code, display_name, email, referred_by_code, referred_by_user_id, created_at")
        .order("created_at", { ascending: false });
      return (data || []) as CreatorRow[];
    },
  });

  const { data: orders = [], isLoading: loadingOrders } = useQuery({
    queryKey: ["admin-referral-orders"],
    queryFn: async () => {
      const { data } = await supabase
        .from("orders")
        .select("id, referral_code, amount_cents, tier, customer_email, created_at, status")
        .eq("status", "completed")
        .order("created_at", { ascending: false });
      return (data || []) as OrderRow[];
    },
  });

  const { data: shortLinks = [], isLoading: loadingLinks } = useQuery({
    queryKey: ["admin-referral-short-links"],
    queryFn: async () => {
      const { data } = await supabase
        .from("short_links")
        .select("id, short_code, destination_url, click_count, created_by, campaign")
        .order("click_count", { ascending: false })
        .limit(500);
      return (data || []) as ShortLinkRow[];
    },
  });

  const loading = loadingCreators || loadingOrders || loadingLinks;

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <RefreshCw className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  // ─── Build referrer-code → creator map ───
  const codeToCreator = new Map<string, CreatorRow>();
  creators.forEach((c) => {
    if (c.referral_code) codeToCreator.set(c.referral_code, c);
  });

  // ─── Build creator → link clicks map (via short_links.created_by) ───
  const userClickMap = new Map<string, number>();
  shortLinks.forEach((link) => {
    if (link.created_by) {
      userClickMap.set(link.created_by, (userClickMap.get(link.created_by) || 0) + link.click_count);
    }
  });

  // ─── Count signups per referrer code ───
  const codeSignups = new Map<string, number>();
  creators.forEach((c) => {
    if (c.referred_by_code) {
      codeSignups.set(c.referred_by_code, (codeSignups.get(c.referred_by_code) || 0) + 1);
    }
  });

  // ─── Count purchases & revenue per referrer code ───
  const codePurchases = new Map<string, number>();
  const codeRevenue = new Map<string, number>();
  orders.forEach((o) => {
    if (o.referral_code) {
      codePurchases.set(o.referral_code, (codePurchases.get(o.referral_code) || 0) + 1);
      codeRevenue.set(o.referral_code, (codeRevenue.get(o.referral_code) || 0) + o.amount_cents);
    }
  });

  // ─── Aggregate per-referrer stats ───
  const referrerStats: ReferrerStats[] = [];
  codeToCreator.forEach((creator, code) => {
    const clicks = userClickMap.get(creator.user_id) || 0;
    const signups = codeSignups.get(code) || 0;
    const purchases = codePurchases.get(code) || 0;
    const revenue = codeRevenue.get(code) || 0;
    const conversionRate = clicks > 0 ? Math.round((purchases / clicks) * 10000) / 100 : 0;

    if (clicks > 0 || signups > 0 || purchases > 0) {
      referrerStats.push({
        code,
        name: creator.display_name || creator.email.split("@")[0],
        email: creator.email,
        clicks,
        signups,
        purchases,
        revenue,
        conversionRate,
      });
    }
  });

  referrerStats.sort((a, b) => b.revenue - a.revenue || b.signups - a.signups || b.clicks - a.clicks);

  // ─── Funnel totals ───
  const totalClicks = shortLinks.reduce((s, l) => s + l.click_count, 0);
  const totalReferredSignups = creators.filter((c) => c.referred_by_code).length;
  const totalReferredOrders = orders.filter((o) => o.referral_code).length;
  const totalReferredRevenue = orders
    .filter((o) => o.referral_code)
    .reduce((s, o) => s + o.amount_cents, 0);
  const overallConversion = totalClicks > 0 ? ((totalReferredOrders / totalClicks) * 100).toFixed(2) : "0";

  // ─── Funnel stage data for chart ───
  const funnelData = [
    { name: "Link Clicks", value: totalClicks },
    { name: "Referred Signups", value: totalReferredSignups },
    { name: "Referred Purchases", value: totalReferredOrders },
  ];

  // ─── Top referral codes by revenue ───
  const topByRevenue = referrerStats.slice(0, 8).map((r) => ({
    name: r.code.length > 12 ? r.code.slice(0, 12) + "…" : r.code,
    value: Math.round(r.revenue / 100),
  }));

  // ─── Monthly referred signups ───
  const monthlySignups: Record<string, number> = {};
  creators
    .filter((c) => c.referred_by_code)
    .forEach((c) => {
      const month = c.created_at.slice(0, 7);
      monthlySignups[month] = (monthlySignups[month] || 0) + 1;
    });
  const monthlyData = Object.entries(monthlySignups)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([name, value]) => ({ name, value }));

  // CSV export data
  const csvData = referrerStats.map((r) => ({
    referral_code: r.code,
    creator_name: r.name,
    email: r.email,
    clicks: r.clicks,
    signups: r.signups,
    purchases: r.purchases,
    revenue_usd: (r.revenue / 100).toFixed(2),
    conversion_pct: r.conversionRate,
  }));

  return (
    <div className="space-y-4">
      <AdminSectionDashboard
        title="Referral Attribution Funnel"
        description="Full-chain tracking: referral → click → signup → purchase"
        kpis={[
          { label: "Total Clicks", value: totalClicks.toLocaleString() },
          { label: "Referred Signups", value: totalReferredSignups },
          { label: "Referred Orders", value: totalReferredOrders },
          {
            label: "Referred Revenue",
            value: `$${(totalReferredRevenue / 100).toLocaleString()}`,
          },
          { label: "Conversion Rate", value: `${overallConversion}%` },
          { label: "Active Referrers", value: referrerStats.length },
        ]}
        charts={[
          { type: "bar", title: "Attribution Funnel", data: funnelData },
          ...(topByRevenue.length > 0
            ? [{ type: "bar" as const, title: "Top Referrers ($)", data: topByRevenue }]
            : []),
          ...(monthlyData.length > 0
            ? [{ type: "area" as const, title: "Monthly Referred Signups", data: monthlyData }]
            : []),
        ]}
      />

      {/* ─── Visual Funnel Flow ─── */}
      <div className="bg-card border border-border/40 rounded-xl p-4">
        <h3 className="text-xs font-bold text-foreground uppercase mb-3">
          Attribution Flow
        </h3>
        <div className="flex flex-wrap items-center justify-center gap-2 text-xs">
          <FunnelStage label="Referral Links" count={shortLinks.filter((l) => l.created_by).length} color="bg-primary/10 text-primary" />
          <ArrowRight className="w-4 h-4 text-muted-foreground shrink-0" />
          <FunnelStage label="Clicks" count={totalClicks} color="bg-blue-500/10 text-blue-400" />
          <ArrowRight className="w-4 h-4 text-muted-foreground shrink-0" />
          <FunnelStage label="Signups" count={totalReferredSignups} color="bg-amber-500/10 text-amber-400" />
          <ArrowRight className="w-4 h-4 text-muted-foreground shrink-0" />
          <FunnelStage label="Purchases" count={totalReferredOrders} color="bg-emerald-500/10 text-emerald-400" />
          <ArrowRight className="w-4 h-4 text-muted-foreground shrink-0" />
          <FunnelStage
            label="Revenue"
            count={`$${(totalReferredRevenue / 100).toLocaleString()}`}
            color="bg-emerald-500/10 text-emerald-300 font-bold"
          />
        </div>
      </div>

      {/* ─── Per-Referrer Table ─── */}
      <div className="bg-card border border-border/40 rounded-xl overflow-x-auto">
        <div className="px-4 py-3 border-b border-border/20 bg-secondary/20 flex items-center justify-between">
          <span className="text-xs font-bold text-foreground uppercase flex items-center gap-1.5">
            <TrendingUp className="w-3.5 h-3.5" /> Per-Creator Attribution
          </span>
          <ExportCsvButton
            data={csvData}
            filename="referral-attribution.csv"
            columns={["referral_code", "creator_name", "email", "clicks", "signups", "purchases", "revenue_usd", "conversion_pct"]}
          />
        </div>
        <table className="w-full text-xs">
          <thead>
            <tr className="text-[10px] text-muted-foreground uppercase tracking-wider border-b border-border/20 bg-secondary/30">
              <th className="text-left py-2 px-3">Creator</th>
              <th className="text-left py-2 px-3">Code</th>
              <th className="text-right py-2 px-3">Clicks</th>
              <th className="text-right py-2 px-3">Signups</th>
              <th className="text-right py-2 px-3">Purchases</th>
              <th className="text-right py-2 px-3">Revenue</th>
              <th className="text-right py-2 px-3">Conv %</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/10">
            {referrerStats.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-8 text-center text-muted-foreground">
                  No referral activity yet. Attribution data will appear as creators share their links.
                </td>
              </tr>
            ) : (
              referrerStats.map((r) => (
                <tr key={r.code} className="hover:bg-secondary/20">
                  <td className="py-2 px-3">
                    <div>
                      <p className="font-medium text-foreground">{r.name}</p>
                      <p className="text-[10px] text-muted-foreground">{r.email}</p>
                    </div>
                  </td>
                  <td className="py-2 px-3">
                    <Badge variant="outline" className="text-[10px] font-mono">
                      {r.code}
                    </Badge>
                  </td>
                  <td className="py-2 px-3 text-right font-mono">{r.clicks.toLocaleString()}</td>
                  <td className="py-2 px-3 text-right font-mono">{r.signups}</td>
                  <td className="py-2 px-3 text-right font-mono">{r.purchases}</td>
                  <td className="py-2 px-3 text-right font-bold text-emerald-400">
                    ${(r.revenue / 100).toLocaleString()}
                  </td>
                  <td className="py-2 px-3 text-right">
                    <Badge
                      variant="outline"
                      className={`text-[10px] ${
                        r.conversionRate > 5
                          ? "border-emerald-500/30 text-emerald-400"
                          : r.conversionRate > 1
                          ? "border-amber-500/30 text-amber-400"
                          : "border-border"
                      }`}
                    >
                      {r.conversionRate}%
                    </Badge>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/** Visual funnel stage block */
function FunnelStage({ label, count, color }: { label: string; count: number | string; color: string }) {
  return (
    <div className={`rounded-lg px-4 py-3 text-center ${color}`}>
      <p className="text-lg font-bold">{typeof count === "number" ? count.toLocaleString() : count}</p>
      <p className="text-[10px] uppercase tracking-wider opacity-80">{label}</p>
    </div>
  );
}
