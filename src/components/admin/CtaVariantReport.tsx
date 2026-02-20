import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { Target, TrendingUp, RefreshCw } from "lucide-react";

interface VariantStats {
  source: string;
  impressions: number;
  conversions: number;
  conversionRate: number;
  label: string;
  color: string;
}

const VARIANT_META: Record<string, { label: string; color: string }> = {
  paid:     { label: "Paid (CPC/Ads)",   color: "hsl(var(--primary))" },
  social:   { label: "Social Media",     color: "hsl(217 91% 60%)" },
  email:    { label: "Email / Newsletter",color: "hsl(142 71% 45%)" },
  referral: { label: "Referral",         color: "hsl(47 96% 53%)" },
  organic:  { label: "Organic",          color: "hsl(280 67% 55%)" },
};

const ALL_SOURCES = ["paid", "social", "email", "referral", "organic"] as const;

function useCtaVariantStats() {
  return useQuery<VariantStats[]>({
    queryKey: ["cta-variant-stats"],
    queryFn: async () => {
      // Pull all cta_* events — impressions = cta_shown_*, conversions = cta_conversion_*
      const { data, error } = await supabase
        .from("exit_intent_events")
        .select("event_type, created_at")
        .or(ALL_SOURCES.flatMap(s => [
          `event_type.eq.cta_shown_${s}`,
          `event_type.eq.cta_conversion_${s}`,
        ]).join(","));

      if (error) throw error;

      const impressionMap: Record<string, number> = {};
      const conversionMap: Record<string, number> = {};

      for (const row of data || []) {
        const match = row.event_type.match(/^cta_(shown|conversion)_(.+)$/);
        if (!match) continue;
        const [, type, source] = match;
        if (type === "shown") impressionMap[source] = (impressionMap[source] || 0) + 1;
        if (type === "conversion") conversionMap[source] = (conversionMap[source] || 0) + 1;
      }

      // Fall back: if no "shown" events, estimate from link_clicks grouped by utm_medium
      const hasImpressions = Object.keys(impressionMap).length > 0;
      if (!hasImpressions) {
        const { data: clicks } = await supabase
          .from("link_clicks")
          .select("utm_medium, utm_source");

        for (const c of clicks || []) {
          const medium = (c.utm_medium || "").toLowerCase();
          const src = (c.utm_source || "").toLowerCase();
          let source = "organic";
          if (["cpc", "paid", "ppc", "ads", "meta", "google", "tiktok", "youtube_ads"].includes(medium)) source = "paid";
          else if (["social", "instagram", "twitter", "facebook", "youtube", "tiktok_organic"].includes(medium)) source = "social";
          else if (["email", "newsletter", "digest"].includes(medium)) source = "email";
          else if (["referral", "affiliate", "partner"].includes(src)) source = "referral";
          impressionMap[source] = (impressionMap[source] || 0) + 1;
        }
      }

      return ALL_SOURCES.map(s => {
        const impressions = impressionMap[s] || 0;
        const conversions = conversionMap[s] || 0;
        const conversionRate = impressions > 0 ? (conversions / impressions) * 100 : 0;
        return {
          source: s,
          impressions,
          conversions,
          conversionRate,
          ...VARIANT_META[s],
        };
      }).sort((a, b) => b.impressions - a.impressions);
    },
    staleTime: 60_000,
  });
}

const tooltipStyle = {
  background: "hsl(var(--card))",
  border: "1px solid hsl(var(--border))",
  borderRadius: "8px",
  fontSize: "12px",
};

export default function CtaVariantReport() {
  const { data, isLoading, refetch } = useCtaVariantStats();

  const totalImpressions = data?.reduce((s, v) => s + v.impressions, 0) || 0;
  const totalConversions = data?.reduce((s, v) => s + v.conversions, 0) || 0;
  const overallRate = totalImpressions > 0 ? ((totalConversions / totalImpressions) * 100).toFixed(1) : "0.0";
  const bestVariant = data?.reduce((best, v) => v.conversionRate > (best?.conversionRate ?? -1) ? v : best, data[0]);

  if (isLoading) return (
    <div className="flex justify-center py-8">
      <RefreshCw className="w-5 h-5 animate-spin text-primary" />
    </div>
  );

  return (
    <Card className="border-border/40">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center gap-2">
          <Target className="w-4 h-4 text-primary" />
          CTA Variant Breakdown
          <span className="ml-auto flex items-center gap-2 text-xs font-normal text-muted-foreground">
            <TrendingUp className="w-3.5 h-3.5" />
            Overall CVR: <strong className="text-primary">{overallRate}%</strong>
            {bestVariant && bestVariant.impressions > 0 && (
              <Badge variant="secondary" className="text-[10px] h-4 px-1.5">
                Best: {bestVariant.label}
              </Badge>
            )}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Summary KPI row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: "Total Impressions", value: totalImpressions.toLocaleString() },
            { label: "Total Conversions", value: totalConversions.toLocaleString() },
            { label: "Overall CVR", value: `${overallRate}%` },
            { label: "Top Variant", value: bestVariant?.label ?? "—" },
          ].map(kpi => (
            <div key={kpi.label} className="bg-muted/30 rounded-lg p-3">
              <p className="text-[10px] text-muted-foreground mb-1">{kpi.label}</p>
              <p className="text-sm font-bold text-foreground truncate">{kpi.value}</p>
            </div>
          ))}
        </div>

        {/* Chart */}
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="label" tick={{ fontSize: 9, fill: "hsl(var(--muted-foreground))" }} />
              <YAxis tick={{ fontSize: 9, fill: "hsl(var(--muted-foreground))" }} />
              <Tooltip
                contentStyle={tooltipStyle}
                formatter={(value: number, name: string) => [
                  name === "conversionRate" ? `${value.toFixed(1)}%` : value.toLocaleString(),
                  name === "conversionRate" ? "CVR" : name === "impressions" ? "Impressions" : "Conversions",
                ]}
              />
              <Bar dataKey="impressions" name="impressions" radius={[3, 3, 0, 0]}>
                {data?.map((v, i) => <Cell key={i} fill={v.color} fillOpacity={0.5} />)}
              </Bar>
              <Bar dataKey="conversions" name="conversions" radius={[3, 3, 0, 0]}>
                {data?.map((v, i) => <Cell key={i} fill={v.color} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Detailed table */}
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-border/50">
                <th className="text-left py-2 font-medium text-muted-foreground">Variant</th>
                <th className="text-right py-2 font-medium text-muted-foreground">Impressions</th>
                <th className="text-right py-2 font-medium text-muted-foreground">Conversions</th>
                <th className="text-right py-2 font-medium text-muted-foreground">CVR</th>
                <th className="text-right py-2 font-medium text-muted-foreground">Share</th>
              </tr>
            </thead>
            <tbody>
              {data?.map((v) => (
                <tr key={v.source} className="border-b border-border/20 hover:bg-muted/20 transition-colors">
                  <td className="py-2 flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-sm flex-shrink-0" style={{ background: v.color }} />
                    <span className="font-medium text-foreground">{v.label}</span>
                  </td>
                  <td className="py-2 text-right text-foreground">{v.impressions.toLocaleString()}</td>
                  <td className="py-2 text-right text-foreground">{v.conversions.toLocaleString()}</td>
                  <td className="py-2 text-right">
                    <span className={cn(
                      "font-bold",
                      v.conversionRate >= 5 ? "text-green-500" :
                      v.conversionRate >= 1 ? "text-yellow-500" : "text-muted-foreground"
                    )}>
                      {v.conversionRate.toFixed(1)}%
                    </span>
                  </td>
                  <td className="py-2 text-right text-muted-foreground">
                    {totalImpressions > 0 ? ((v.impressions / totalImpressions) * 100).toFixed(0) : 0}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}

// cn utility inline (avoid extra import)
function cn(...classes: (string | boolean | undefined)[]): string {
  return classes.filter(Boolean).join(" ");
}
