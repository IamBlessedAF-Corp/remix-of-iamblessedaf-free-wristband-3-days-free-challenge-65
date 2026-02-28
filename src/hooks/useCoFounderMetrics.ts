import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function useOrderMetrics() {
  return useQuery({
    queryKey: ["cofound-orders"],
    queryFn: async () => {
      const { data: orders } = await supabase
        .from("orders")
        .select("tier, amount_cents, status, created_at")
        .eq("status", "completed");

      const total = orders?.length ?? 0;
      const revenue = (orders ?? []).reduce((s, o) => s + (o.amount_cents ?? 0), 0);
      const tierBreakdown: Record<string, { count: number; revenue: number }> = {};
      for (const o of orders ?? []) {
        if (!tierBreakdown[o.tier]) tierBreakdown[o.tier] = { count: 0, revenue: 0 };
        tierBreakdown[o.tier].count++;
        tierBreakdown[o.tier].revenue += o.amount_cents ?? 0;
      }
      return { total, revenue, tierBreakdown };
    },
    staleTime: 30_000,
  });
}

export function useLeadMetrics() {
  return useQuery({
    queryKey: ["cofound-leads"],
    queryFn: async () => {
      const [experts, creators, participants, waitlist] = await Promise.all([
        supabase.from("expert_leads").select("id", { count: "exact", head: true }),
        supabase.from("creator_profiles").select("id", { count: "exact", head: true }),
        supabase.from("challenge_participants").select("id", { count: "exact", head: true }),
        supabase.from("smart_wristband_waitlist").select("id", { count: "exact", head: true }),
      ]);
      return {
        expertLeads: experts.count ?? 0,
        creators: creators.count ?? 0,
        challengeParticipants: participants.count ?? 0,
        waitlist: waitlist.count ?? 0,
        totalLeads: (experts.count ?? 0) + (creators.count ?? 0) + (participants.count ?? 0) + (waitlist.count ?? 0),
      };
    },
    staleTime: 30_000,
  });
}

export function useClipperMetrics() {
  return useQuery({
    queryKey: ["cofound-clippers"],
    queryFn: async () => {
      const [clips, payouts] = await Promise.all([
        supabase.from("clip_submissions").select("id, view_count, earnings_cents, status"),
        supabase.from("clipper_payouts").select("id, total_cents, status"),
      ]);
      const totalClips = clips.data?.length ?? 0;
      const totalViews = (clips.data ?? []).reduce((s, c) => s + (c.view_count ?? 0), 0);
      const verifiedClips = (clips.data ?? []).filter(c => c.status === "verified").length;
      const totalPayouts = (payouts.data ?? []).reduce((s, p) => s + (p.total_cents ?? 0), 0);
      return { totalClips, totalViews, verifiedClips, totalPayouts };
    },
    staleTime: 30_000,
  });
}

export function useOperationsMetrics() {
  return useQuery({
    queryKey: ["cofound-ops"],
    queryFn: async () => {
      const [cards, errors, roadmap] = await Promise.all([
        supabase.from("board_cards").select("id, column_id, priority, completed_at"),
        supabase.from("error_events").select("id, level, resolved_at", { count: "exact" }).is("resolved_at", null),
        supabase.from("roadmap_items").select("id, phase, is_active"),
      ]);
      const totalCards = cards.data?.length ?? 0;
      const completedCards = (cards.data ?? []).filter(c => c.completed_at).length;
      const unresolvedErrors = errors.count ?? 0;
      const activeRoadmap = (roadmap.data ?? []).filter(r => r.is_active).length;
      return { totalCards, completedCards, unresolvedErrors, activeRoadmap };
    },
    staleTime: 30_000,
  });
}

export function useReferralMetrics() {
  return useQuery({
    queryKey: ["cofound-referrals"],
    queryFn: async () => {
      const [nominations, chains, affiliates, blessings] = await Promise.all([
        supabase.from("nominations").select("id, status", { count: "exact" }),
        supabase.from("nomination_chains").select("id, total_nominations, total_acceptances"),
        supabase.from("affiliate_tiers").select("id, current_tier, wristbands_distributed"),
        supabase.from("blessings").select("id, confirmed_at"),
      ]);
      const totalNominations = nominations.count ?? 0;
      const totalChains = chains.data?.length ?? 0;
      const avgAcceptRate = chains.data?.length
        ? (chains.data.reduce((s, c) => s + (c.total_acceptances ?? 0), 0) / Math.max(chains.data.reduce((s, c) => s + (c.total_nominations ?? 0), 0), 1)) * 100
        : 0;
      const totalAffiliates = affiliates.data?.length ?? 0;
      const totalBlessings = blessings.data?.length ?? 0;
      const confirmedBlessings = (blessings.data ?? []).filter(b => b.confirmed_at).length;
      return { totalNominations, totalChains, avgAcceptRate, totalAffiliates, totalBlessings, confirmedBlessings };
    },
    staleTime: 30_000,
  });
}

export function useAbandonedCartMetrics() {
  return useQuery({
    queryKey: ["cofound-abandoned"],
    queryFn: async () => {
      const { data } = await supabase.from("abandoned_carts").select("id, status, tier");
      const total = data?.length ?? 0;
      const recovered = (data ?? []).filter(c => c.status === "recovered" || c.status === "completed").length;
      return { total, recovered, recoveryRate: total > 0 ? (recovered / total) * 100 : 0 };
    },
    staleTime: 30_000,
  });
}
