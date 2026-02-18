import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface FunnelStageData {
  stage: string;
  count: number;
  revenue?: number;
}

export interface TierRevenue {
  tier: string;
  count: number;
  revenue_cents: number;
  label: string;
}

export interface ClipperFunnelData {
  totalClippers: number;
  totalClips: number;
  pendingClips: number;
  verifiedClips: number;
  rejectedClips: number;
  totalNetViews: number;
  totalPaidCents: number;
}

const TIER_LABELS: Record<string, string> = {
  "free-wristband": "Free Wristband",
  "wristband-22": "$22 Starter",
  "pack-111": "$111 Identity",
  "pack-444": "$444 Habit Lock",
  "pack-1111": "$1,111 Kingdom",
  "pack-4444": "$4,444 Ambassador",
  "monthly-11": "$11/mo Subscription",
};

export function useLiveFunnelData() {
  // Total unique visitors (from link_clicks)
  const { data: trafficData } = useQuery({
    queryKey: ["funnel-traffic-live"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("link_clicks")
        .select("ip_hash, clicked_at");
      if (error) throw error;
      const uniqueIps = new Set(data?.map(d => d.ip_hash).filter(Boolean));
      return {
        totalClicks: data?.length || 0,
        uniqueVisitors: uniqueIps.size,
      };
    },
    staleTime: 60_000,
  });

  // Signups (creator_profiles)
  const { data: signupData } = useQuery({
    queryKey: ["funnel-signups-live"],
    queryFn: async () => {
      const { count, error } = await supabase
        .from("creator_profiles")
        .select("*", { count: "exact", head: true });
      if (error) throw error;
      return count || 0;
    },
    staleTime: 60_000,
  });

  // Orders by tier
  const { data: orderData } = useQuery({
    queryKey: ["funnel-orders-live"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("orders")
        .select("tier, amount_cents, status")
        .eq("status", "completed");
      if (error) throw error;

      const tierMap = new Map<string, { count: number; revenue_cents: number }>();
      for (const o of data || []) {
        const prev = tierMap.get(o.tier) || { count: 0, revenue_cents: 0 };
        prev.count++;
        prev.revenue_cents += o.amount_cents;
        tierMap.set(o.tier, prev);
      }

      const tiers: TierRevenue[] = Array.from(tierMap.entries()).map(([tier, d]) => ({
        tier,
        count: d.count,
        revenue_cents: d.revenue_cents,
        label: TIER_LABELS[tier] || tier,
      }));

      return {
        tiers,
        totalOrders: data?.length || 0,
        totalRevenueCents: data?.reduce((s, o) => s + o.amount_cents, 0) || 0,
      };
    },
    staleTime: 60_000,
  });

  // Clipper funnel
  const { data: clipperData } = useQuery<ClipperFunnelData>({
    queryKey: ["funnel-clippers-live"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("clip_submissions")
        .select("user_id, status, view_count, baseline_view_count, earnings_cents");
      if (error) throw error;

      const userIds = new Set(data?.map(d => d.user_id));
      const pending = data?.filter(d => d.status === "pending").length || 0;
      const verified = data?.filter(d => d.status === "verified").length || 0;
      const rejected = data?.filter(d => d.status !== "pending" && d.status !== "verified").length || 0;
      const totalNetViews = data?.reduce((s, d) => s + Math.max(0, (d.view_count || 0) - (d.baseline_view_count || 0)), 0) || 0;
      const totalPaid = data?.reduce((s, d) => s + (d.earnings_cents || 0), 0) || 0;

      return {
        totalClippers: userIds.size,
        totalClips: data?.length || 0,
        pendingClips: pending,
        verifiedClips: verified,
        rejectedClips: rejected,
        totalNetViews: totalNetViews,
        totalPaidCents: totalPaid,
      };
    },
    staleTime: 60_000,
  });

  // Challenge participants
  const { data: challengeCount } = useQuery({
    queryKey: ["funnel-challenge-live"],
    queryFn: async () => {
      const { count, error } = await supabase
        .from("challenge_participants")
        .select("*", { count: "exact", head: true });
      if (error) throw error;
      return count || 0;
    },
    staleTime: 60_000,
  });

  // Conversion funnel stages
  const conversionFunnel: FunnelStageData[] = [
    { stage: "Link Clicks", count: trafficData?.totalClicks || 0 },
    { stage: "Unique Visitors", count: trafficData?.uniqueVisitors || 0 },
    { stage: "Signups", count: signupData || 0 },
    { stage: "Challenge Joined", count: challengeCount || 0 },
    { stage: "Orders", count: orderData?.totalOrders || 0 },
  ];

  return {
    trafficData,
    signupCount: signupData || 0,
    orderData,
    clipperData,
    challengeCount: challengeCount || 0,
    conversionFunnel,
    isLoading: !trafficData || !orderData || !clipperData,
  };
}
