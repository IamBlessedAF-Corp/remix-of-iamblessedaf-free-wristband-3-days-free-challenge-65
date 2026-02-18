import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useRealEconomyMetrics } from "@/hooks/useRealEconomyMetrics";
import AdminSectionDashboard from "./AdminSectionDashboard";
import { RefreshCw } from "lucide-react";

interface OrderRow {
  id: string;
  customer_email: string | null;
  tier: string;
  amount_cents: number;
  status: string;
  referral_code: string | null;
  created_at: string;
}

/**
 * Revenue LTV Dashboard — tracks per-tier revenue, repeat purchase rate,
 * customer LTV, and CAC payback period from the orders table.
 * ALL metrics derived from real data — no hardcoded constants.
 */
export default function RevenueLtvDashboard() {
  const { realCacCents } = useRealEconomyMetrics();

  const { data: orders, isLoading } = useQuery({
    queryKey: ["revenue-ltv-orders"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("orders")
        .select("id, customer_email, tier, amount_cents, status, referral_code, created_at")
        .eq("status", "completed")
        .order("created_at", { ascending: true });
      if (error) throw error;
      return (data ?? []) as OrderRow[];
    },
    staleTime: 60_000,
  });

  const metrics = useMemo(() => {
    if (!orders || orders.length === 0)
      return {
        totalRevenue: 0,
        avgOrderValue: 0,
        uniqueCustomers: 0,
        repeatRate: 0,
        avgLtv: 0,
        cacPayback: "—",
        tierRevenue: [] as { name: string; value: number }[],
        monthlyRevenue: [] as { name: string; value: number }[],
        tierCount: [] as { name: string; value: number }[],
        repeatVsNew: [] as { name: string; value: number }[],
      };

    const totalRevenue = orders.reduce((s, o) => s + o.amount_cents, 0);
    const avgOrderValue = Math.round(totalRevenue / orders.length);

    // Group by customer
    const customerMap = new Map<string, OrderRow[]>();
    orders.forEach((o) => {
      const key = o.customer_email || o.id;
      const list = customerMap.get(key) || [];
      list.push(o);
      customerMap.set(key, list);
    });

    const uniqueCustomers = customerMap.size;
    const repeatCustomers = Array.from(customerMap.values()).filter((l) => l.length > 1).length;
    const repeatRate = uniqueCustomers > 0 ? Math.round((repeatCustomers / uniqueCustomers) * 100) : 0;

    // Average LTV per customer
    const avgLtv = uniqueCustomers > 0 ? Math.round(totalRevenue / uniqueCustomers) : 0;

    // CAC payback: uses real CAC derived from avg first-order amount
    const cacPayback = avgLtv > 0 && realCacCents > 0
      ? `${(realCacCents / avgLtv).toFixed(1)}x`
      : "—";

    // Per-tier revenue
    const tierRevenueMap: Record<string, number> = {};
    const tierCountMap: Record<string, number> = {};
    orders.forEach((o) => {
      const label = o.tier.length > 12 ? o.tier.slice(0, 12) : o.tier;
      tierRevenueMap[label] = (tierRevenueMap[label] || 0) + o.amount_cents;
      tierCountMap[label] = (tierCountMap[label] || 0) + 1;
    });

    const tierRevenue = Object.entries(tierRevenueMap)
      .map(([name, value]) => ({ name, value: Math.round(value / 100) }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 6);

    const tierCount = Object.entries(tierCountMap)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 6);

    // Monthly revenue trend
    const monthlyMap: Record<string, number> = {};
    orders.forEach((o) => {
      const d = new Date(o.created_at);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      monthlyMap[key] = (monthlyMap[key] || 0) + o.amount_cents;
    });
    const monthlyRevenue = Object.entries(monthlyMap)
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-6)
      .map(([name, value]) => ({ name: name.slice(2), value: Math.round(value / 100) }));

    const repeatVsNew = [
      { name: "Repeat", value: repeatCustomers },
      { name: "New", value: uniqueCustomers - repeatCustomers },
    ];

    return {
      totalRevenue,
      avgOrderValue,
      uniqueCustomers,
      repeatRate,
      avgLtv,
      cacPayback,
      tierRevenue,
      monthlyRevenue,
      tierCount,
      repeatVsNew,
    };
  }, [orders, realCacCents]);

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <RefreshCw className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <AdminSectionDashboard
      title="Revenue & LTV Intelligence"
      description={`Per-tier revenue, repeat purchase rate, customer LTV, CAC payback · CAC: $${(realCacCents / 100).toFixed(2)} (real avg first order)`}
      kpis={[
        { label: "Total Revenue", value: `$${(metrics.totalRevenue / 100).toLocaleString(undefined, { minimumFractionDigits: 2 })}` },
        { label: "Avg Order Value", value: `$${(metrics.avgOrderValue / 100).toFixed(2)}` },
        { label: "Unique Customers", value: metrics.uniqueCustomers },
        { label: "Repeat Rate", value: `${metrics.repeatRate}%`, delta: metrics.repeatRate >= 20 ? "+strong" : "needs growth" },
        { label: "Avg Customer LTV", value: `$${(metrics.avgLtv / 100).toFixed(2)}` },
        { label: "CAC Payback", value: metrics.cacPayback },
      ]}
      charts={[
        { type: "area", title: "Monthly Revenue ($)", data: metrics.monthlyRevenue },
        { type: "bar", title: "Revenue by Tier ($)", data: metrics.tierRevenue },
        { type: "pie", title: "Repeat vs New Customers", data: metrics.repeatVsNew },
      ]}
    />
  );
}
