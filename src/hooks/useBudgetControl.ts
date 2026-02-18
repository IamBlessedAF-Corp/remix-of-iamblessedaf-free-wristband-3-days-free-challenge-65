import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface BudgetCycle {
  id: string;
  start_date: string;
  end_date: string;
  status: string;
  approved_at: string | null;
  approved_by: string | null;
  global_weekly_limit_cents: number;
  global_monthly_limit_cents: number;
  emergency_reserve_cents: number;
  max_payout_per_clip_cents: number;
  max_payout_per_clipper_week_cents: number;
  notes: string | null;
  created_at: string;
}

export interface BudgetSegment {
  id: string;
  name: string;
  rules: Record<string, any>;
  weekly_limit_cents: number;
  monthly_limit_cents: number;
  priority: number;
  soft_throttle_config: Record<string, any>;
  is_active: boolean;
  created_at: string;
}

export interface SegmentCycle {
  id: string;
  segment_id: string;
  cycle_id: string;
  status: string;
  spent_cents: number;
  projected_cents: number;
  remaining_cents: number;
  approved_at: string | null;
  segment_name?: string;
}

export interface BudgetEvent {
  id: string;
  created_at: string;
  actor: string | null;
  action: string;
  before_state: any;
  after_state: any;
  impacted_segments: string[] | null;
  rollback_token: string;
  estimated_impact_cents: number;
  notes: string | null;
}

export interface SegmentMember {
  id: string;
  user_id: string;
  segment_id: string;
  assigned_at: string;
  display_name?: string;
}

const getWeekBounds = () => {
  const now = new Date();
  const day = now.getUTCDay();
  const diff = day === 0 ? 6 : day - 1;
  const monday = new Date(now);
  monday.setUTCDate(now.getUTCDate() - diff);
  monday.setUTCHours(0, 0, 0, 0);
  const sunday = new Date(monday);
  sunday.setUTCDate(monday.getUTCDate() + 6);
  sunday.setUTCHours(23, 59, 59, 999);
  return { start: monday.toISOString(), end: sunday.toISOString() };
};

export function useBudgetControl() {
  const [cycle, setCycle] = useState<BudgetCycle | null>(null);
  const [segments, setSegments] = useState<BudgetSegment[]>([]);
  const [segmentCycles, setSegmentCycles] = useState<SegmentCycle[]>([]);
  const [events, setEvents] = useState<BudgetEvent[]>([]);
  const [members, setMembers] = useState<SegmentMember[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const { start, end } = getWeekBounds();

      // Fetch or create current cycle
      const { data: cycles } = await (supabase.from("budget_cycles" as any) as any)
        .select("*")
        .gte("start_date", start)
        .lte("start_date", end)
        .order("created_at", { ascending: false })
        .limit(1);

      let currentCycle = cycles?.[0] || null;
      if (!currentCycle) {
        const { data: newCycle } = await (supabase.from("budget_cycles" as any) as any)
          .insert({
            start_date: start,
            end_date: end,
            status: "pending_approval",
          })
          .select()
          .single();
        currentCycle = newCycle;
      }
      setCycle(currentCycle);

      // Fetch segments
      const { data: segs } = await (supabase.from("budget_segments" as any) as any)
        .select("*")
        .order("priority", { ascending: false });
      setSegments(segs || []);

      // Fetch segment cycles for current cycle
      if (currentCycle) {
        const { data: sc } = await (supabase.from("budget_segment_cycles" as any) as any)
          .select("*")
          .eq("cycle_id", currentCycle.id);
        
        // Enrich with segment names
        const enriched = (sc || []).map((s: any) => ({
          ...s,
          segment_name: (segs || []).find((seg: any) => seg.id === s.segment_id)?.name || "Unknown",
        }));
        setSegmentCycles(enriched);
      }

      // Fetch events
      const { data: evts } = await (supabase.from("budget_events_log" as any) as any)
        .select("*")
        .order("created_at", { ascending: false })
        .limit(50);
      setEvents(evts || []);

      // Fetch members
      const { data: mems } = await (supabase.from("clipper_segment_membership" as any) as any)
        .select("*");
      
      // Enrich with display names
      const { data: profiles } = await supabase.from("creator_profiles").select("user_id, display_name");
      const nameMap = new Map(profiles?.map((p) => [p.user_id, p.display_name]) || []);
      const enrichedMembers = (mems || []).map((m: any) => ({
        ...m,
        display_name: nameMap.get(m.user_id) || `User ${m.user_id.slice(0, 6)}`,
      }));
      setMembers(enrichedMembers);
    } catch (err) {
      console.error("Budget control fetch error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  // ── Actions ──

  const updateCycleStatus = useCallback(async (status: string) => {
    if (!cycle) return;
    await logEvent("cycle_status_change", { status: cycle.status }, { status }, []);
    await (supabase.from("budget_cycles" as any) as any)
      .update({ status, approved_at: status === "approved" ? new Date().toISOString() : null })
      .eq("id", cycle.id);
    await fetchAll();
  }, [cycle, fetchAll]);

  const updateCycleLimits = useCallback(async (limits: Partial<BudgetCycle>) => {
    if (!cycle) return;
    await logEvent("cycle_limits_change", cycle, { ...cycle, ...limits }, []);
    await (supabase.from("budget_cycles" as any) as any)
      .update(limits)
      .eq("id", cycle.id);
    await fetchAll();
  }, [cycle, fetchAll]);

  const createSegment = useCallback(async (seg: Partial<BudgetSegment>) => {
    const { data } = await (supabase.from("budget_segments" as any) as any)
      .insert(seg)
      .select()
      .single();
    if (data && cycle) {
      await (supabase.from("budget_segment_cycles" as any) as any)
        .insert({
          segment_id: data.id,
          cycle_id: cycle.id,
          remaining_cents: seg.weekly_limit_cents || 100000,
        });
    }
    await logEvent("segment_created", null, data, [data?.id]);
    await fetchAll();
    return data;
  }, [cycle, fetchAll]);

  const updateSegment = useCallback(async (id: string, updates: Partial<BudgetSegment>) => {
    const before = segments.find((s) => s.id === id);
    await logEvent("segment_updated", before, { ...before, ...updates }, [id]);
    await (supabase.from("budget_segments" as any) as any)
      .update(updates)
      .eq("id", id);
    await fetchAll();
  }, [segments, fetchAll]);

  const deleteSegment = useCallback(async (id: string) => {
    const before = segments.find((s) => s.id === id);
    await logEvent("segment_deleted", before, null, [id]);
    await (supabase.from("budget_segments" as any) as any)
      .delete()
      .eq("id", id);
    await fetchAll();
  }, [segments, fetchAll]);

  const updateSegmentCycleStatus = useCallback(async (segCycleId: string, status: string) => {
    const before = segmentCycles.find((s) => s.id === segCycleId);
    await logEvent("segment_cycle_status_change", { status: before?.status }, { status }, [before?.segment_id || ""]);
    await (supabase.from("budget_segment_cycles" as any) as any)
      .update({
        status,
        approved_at: status === "approved" ? new Date().toISOString() : null,
      })
      .eq("id", segCycleId);
    await fetchAll();
  }, [segmentCycles, fetchAll]);

  const assignMember = useCallback(async (userId: string, segmentId: string) => {
    await (supabase.from("clipper_segment_membership" as any) as any)
      .upsert({ user_id: userId, segment_id: segmentId }, { onConflict: "user_id,segment_id" });
    await logEvent("member_assigned", null, { user_id: userId, segment_id: segmentId }, [segmentId]);
    await fetchAll();
  }, [fetchAll]);

  const removeMember = useCallback(async (membershipId: string) => {
    const m = members.find((x) => x.id === membershipId);
    await logEvent("member_removed", m, null, [m?.segment_id || ""]);
    await (supabase.from("clipper_segment_membership" as any) as any)
      .delete()
      .eq("id", membershipId);
    await fetchAll();
  }, [members, fetchAll]);

  const logEvent = async (action: string, before: any, after: any, impactedSegments: string[]) => {
    await (supabase.from("budget_events_log" as any) as any)
      .insert({
        action,
        before_state: before,
        after_state: after,
        impacted_segments: impactedSegments,
      });
  };

  // ── Real spend data ──
  const [realSpendCents, setRealSpendCents] = useState(0);

  useEffect(() => {
    const fetchRealSpend = async () => {
      try {
        const { start, end } = getWeekBounds();
        const { data } = await (supabase.from("clipper_payouts" as any) as any)
          .select("total_cents")
          .gte("created_at", start)
          .lte("created_at", end);
        const total = (data || []).reduce((sum: number, r: any) => sum + (r.total_cents || 0), 0);
        setRealSpendCents(total);
      } catch { /* ignore */ }
    };
    fetchRealSpend();
  }, []);

  // ── Simulation ──
  const simulate = useCallback((params: {
    rpm?: number;
    weeklyLimit?: number;
    bonusChange?: number;
    segmentIds?: string[];
  }) => {
    const rpm = params.rpm || 0.22;
    const weeklyLimitCents = params.weeklyLimit || cycle?.global_weekly_limit_cents || 500000;
    const weeklyLimitDollars = weeklyLimitCents / 100;

    // Core math: how many views can the budget support at this RPM?
    const maxViews = Math.round(weeklyLimitDollars / rpm * 1000);
    // Average earnings per clip = RPM * (avgViews / 1000)
    // With $0.22 RPM and ~13,636 views per clip → ~$3 per clip
    const avgEarningsPerClipCents = Math.round(rpm * 1000 * (maxViews / 1000 / Math.max(1, Math.round(weeklyLimitDollars / 3))) / 1000 * 100);
    const effectiveAvgPerClip = avgEarningsPerClipCents > 0 ? avgEarningsPerClipCents : Math.round(rpm * 13636 / 1000 * 100);
    const totalClips = effectiveAvgPerClip > 0 ? Math.floor(weeklyLimitCents / effectiveAvgPerClip) : 0;
    
    // Distribute across segments
    const segDistribution = segments.map(seg => {
      const segPct = seg.weekly_limit_cents / Math.max(1, segments.reduce((s, x) => s + x.weekly_limit_cents, 0));
      const segClips = Math.round(totalClips * segPct);
      const segSpendCents = segClips * effectiveAvgPerClip;
      return {
        name: seg.name,
        clips: segClips,
        spendCents: Math.min(segSpendCents, seg.weekly_limit_cents),
        limitCents: seg.weekly_limit_cents,
        pctUsed: Math.round(Math.min(segSpendCents, seg.weekly_limit_cents) / seg.weekly_limit_cents * 100),
      };
    });

    const day7 = weeklyLimitCents;
    const day30 = day7 * 4;
    const worstCase = Math.round(day30 * 1.5);
    const riskAdj = Math.round(day30 * 0.8);

    return {
      day7Forecast: day7,
      day30Projection: day30,
      worstCase,
      riskAdjusted: riskAdj,
      safeLimit: Math.round(riskAdj * 1.1),
      maxViews,
      totalClips,
      avgEarningsPerClipCents: effectiveAvgPerClip,
      segDistribution,
      realSpendCents,
    };
  }, [cycle, realSpendCents, segments]);

  return {
    cycle, segments, segmentCycles, events, members, loading,
    realSpendCents,
    refresh: fetchAll,
    updateCycleStatus, updateCycleLimits,
    createSegment, updateSegment, deleteSegment,
    updateSegmentCycleStatus,
    assignMember, removeMember,
    simulate,
  };
}
