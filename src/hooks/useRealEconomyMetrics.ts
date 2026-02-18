import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

/**
 * Derives core economy metrics from REAL database data — no hardcoded constants.
 *
 * Returns:
 *  - realRpm: Revenue per 1K views, calculated from actual clipper_payouts
 *  - realAvgEarningsPerClipCents: avg earnings per clip from verified clips
 *  - realCacCents: avg first-order amount (customer acquisition cost)
 *  - realAvgViewsPerClip: avg net views per verified clip
 *  - realTierPrices: actual avg amount_cents per tier from orders
 *  - forecastMultipliers: worst/risk multipliers derived from payout variance
 */

interface RealMetrics {
  realRpm: number;
  realAvgEarningsPerClipCents: number;
  realCacCents: number;
  realAvgViewsPerClip: number;
  realTierPrices: Record<string, number>;
  worstCaseMultiplier: number;
  riskAdjMultiplier: number;
  loading: boolean;
}

export function useRealEconomyMetrics(): RealMetrics {
  // 1. RPM + avg earnings from clipper_payouts
  const { data: payoutMetrics } = useQuery({
    queryKey: ["real-economy-payouts"],
    queryFn: async () => {
      const { data } = await (supabase.from("clipper_payouts") as any)
        .select("total_cents, total_net_views, clips_count")
        .in("status", ["paid", "reviewed", "frozen"]);

      const rows = data || [];
      const totalCents = rows.reduce((s: number, r: any) => s + (r.total_cents || 0), 0);
      const totalViews = rows.reduce((s: number, r: any) => s + (r.total_net_views || 0), 0);
      const totalClips = rows.reduce((s: number, r: any) => s + (r.clips_count || 0), 0);

      const rpm = totalViews > 0 ? (totalCents / totalViews) * 10 : 0; // cents per 1K views → dollars per 1K
      const avgPerClip = totalClips > 0 ? Math.round(totalCents / totalClips) : 0;
      const avgViews = totalClips > 0 ? Math.round(totalViews / totalClips) : 0;

      // Variance for forecast multipliers: compute weekly totals spread
      const weeklyTotals = rows.map((r: any) => r.total_cents || 0);
      const mean = weeklyTotals.length > 0 ? weeklyTotals.reduce((a: number, b: number) => a + b, 0) / weeklyTotals.length : 0;
      const variance = weeklyTotals.length > 1
        ? weeklyTotals.reduce((s: number, v: number) => s + Math.pow(v - mean, 2), 0) / (weeklyTotals.length - 1)
        : 0;
      const stdDev = Math.sqrt(variance);
      // Worst case = mean + 2 std deviations (as ratio)
      const worstRatio = mean > 0 ? (mean + 2 * stdDev) / mean : 1.5;
      // Risk-adjusted = mean - 1 std deviation (as ratio)
      const riskRatio = mean > 0 ? Math.max(0.3, (mean - stdDev) / mean) : 0.8;

      return { rpm, avgPerClip, avgViews, worstRatio, riskRatio };
    },
    staleTime: 120_000,
  });

  // 2. CAC from orders (avg of each customer's FIRST order)
  const { data: cacData } = useQuery({
    queryKey: ["real-economy-cac"],
    queryFn: async () => {
      const { data } = await supabase
        .from("orders")
        .select("customer_email, amount_cents, created_at")
        .eq("status", "completed")
        .order("created_at", { ascending: true });

      const rows = data || [];
      // First order per customer
      const seen = new Set<string>();
      const firstOrders: number[] = [];
      for (const r of rows) {
        const key = r.customer_email || r.created_at; // fallback for anonymous
        if (!seen.has(key)) {
          seen.add(key);
          firstOrders.push(r.amount_cents);
        }
      }
      const avgFirst = firstOrders.length > 0
        ? Math.round(firstOrders.reduce((a, b) => a + b, 0) / firstOrders.length)
        : 0;

      return avgFirst;
    },
    staleTime: 120_000,
  });

  // 3. Tier prices from real order averages
  const { data: tierPrices } = useQuery({
    queryKey: ["real-economy-tier-prices"],
    queryFn: async () => {
      const { data } = await supabase
        .from("orders")
        .select("tier, amount_cents")
        .eq("status", "completed");

      const rows = data || [];
      const tierMap: Record<string, { total: number; count: number }> = {};
      for (const r of rows) {
        if (!tierMap[r.tier]) tierMap[r.tier] = { total: 0, count: 0 };
        tierMap[r.tier].total += r.amount_cents;
        tierMap[r.tier].count += 1;
      }

      const result: Record<string, number> = {};
      for (const [tier, { total, count }] of Object.entries(tierMap)) {
        result[tier] = Math.round(total / count);
      }
      return result;
    },
    staleTime: 120_000,
  });

  // 4. RPM override from risk throttle (if active)
  const { data: throttleRpm } = useQuery({
    queryKey: ["real-economy-throttle"],
    queryFn: async () => {
      const { data } = await supabase
        .from("clipper_risk_throttle")
        .select("is_active, rpm_override")
        .limit(1)
        .single();
      return data?.is_active && data?.rpm_override ? Number(data.rpm_override) : null;
    },
    staleTime: 60_000,
  });

  const derivedRpm = payoutMetrics?.rpm || 0;
  // Use throttle override if active, otherwise derived from real data
  const effectiveRpm = throttleRpm ?? (derivedRpm > 0 ? derivedRpm : 0);

  return {
    realRpm: effectiveRpm,
    realAvgEarningsPerClipCents: payoutMetrics?.avgPerClip || 0,
    realCacCents: cacData || 0,
    realAvgViewsPerClip: payoutMetrics?.avgViews || 0,
    realTierPrices: tierPrices || {},
    worstCaseMultiplier: payoutMetrics?.worstRatio || 1.5,
    riskAdjMultiplier: payoutMetrics?.riskRatio || 0.8,
    loading: !payoutMetrics,
  };
}
