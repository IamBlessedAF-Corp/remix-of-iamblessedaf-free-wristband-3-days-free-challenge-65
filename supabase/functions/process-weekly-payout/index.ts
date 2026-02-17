import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Activation thresholds
const THRESHOLDS = {
  views: 1000,
  ctr: 0.01,
  regRate: 0.15,
  day1PostRate: 0.25,
};

const PROTECTION_THRESHOLDS = {
  ctr: 0.008,
  regRate: 0.12,
  day1PostRate: 0.20,
};

const DEFAULT_RPM = 0.22;
const PROTECTION_RPM = 0.18;
const MIN_PAYOUT_CENTS = 222; // $2.22

const MONTHLY_BONUS_TIERS = [
  { views: 1_000_000, bonus: 111100, tier: "super" },
  { views: 500_000, bonus: 44400, tier: "proven" },
  { views: 100_000, bonus: 11100, tier: "verified" },
];

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    const { action } = await req.json().catch(() => ({ action: "freeze" }));

    // Get current ISO week key
    const now = new Date();
    const day = now.getUTCDay();
    const diff = day === 0 ? 6 : day - 1;
    const monday = new Date(now);
    monday.setUTCDate(now.getUTCDate() - diff);
    monday.setUTCHours(0, 0, 0, 0);
    const weekNum = Math.ceil(
      ((monday.getTime() - new Date(monday.getUTCFullYear(), 0, 1).getTime()) / 86400000 + 1) / 7
    );
    const weekKey = `${monday.getUTCFullYear()}-W${String(weekNum).padStart(2, "0")}`;
    const lastWeekMonday = new Date(monday);
    lastWeekMonday.setUTCDate(lastWeekMonday.getUTCDate() - 7);
    const lastWeekEnd = new Date(monday);

    // Get throttle state
    const { data: throttle } = await supabase
      .from("clipper_risk_throttle")
      .select("*")
      .limit(1)
      .single();

    const isProtection = throttle?.is_active || false;
    const rpm = isProtection ? PROTECTION_RPM : DEFAULT_RPM;

    if (action === "freeze") {
      // MONDAY: Freeze earnings snapshot
      // Get all clips from last week
      const { data: clips } = await supabase
        .from("clip_submissions")
        .select("id, user_id, view_count, baseline_view_count, ctr, reg_rate, day1_post_rate, earnings_cents")
        .gte("submitted_at", lastWeekMonday.toISOString())
        .lt("submitted_at", lastWeekEnd.toISOString());

      if (!clips || clips.length === 0) {
        return new Response(JSON.stringify({ ok: true, message: "No clips to process" }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Group by user
      const userClips: Record<string, typeof clips> = {};
      clips.forEach((c) => {
        if (!userClips[c.user_id]) userClips[c.user_id] = [];
        userClips[c.user_id].push(c);
      });

      const payoutRecords: any[] = [];

      for (const [userId, uClips] of Object.entries(userClips)) {
        let totalNetViews = 0;
        let activatedClips = 0;

        for (const clip of uClips) {
          const netViews = Math.max(0, (clip.view_count || 0) - (clip.baseline_view_count || 0));
          const ctr = clip.ctr || 0;
          const regRate = clip.reg_rate || 0;
          const day1 = clip.day1_post_rate || 0;

          // Check activation gate
          const activated =
            netViews >= THRESHOLDS.views &&
            ctr >= THRESHOLDS.ctr &&
            regRate >= THRESHOLDS.regRate &&
            day1 >= THRESHOLDS.day1PostRate;

          if (activated) {
            totalNetViews += netViews;
            activatedClips++;
          }

          // Update clip activation status
          await supabase
            .from("clip_submissions")
            .update({
              is_activated: activated,
              net_views: netViews,
              payout_week: weekKey,
            })
            .eq("id", clip.id);
        }

        // Calculate base earnings
        let baseCents = Math.round((totalNetViews / 1000) * rpm * 100);
        if (baseCents > 0 && baseCents < MIN_PAYOUT_CENTS) {
          baseCents = MIN_PAYOUT_CENTS;
        }

        payoutRecords.push({
          user_id: userId,
          week_key: weekKey,
          clips_count: activatedClips,
          total_net_views: totalNetViews,
          base_earnings_cents: baseCents,
          bonus_cents: 0,
          total_cents: baseCents,
          status: "frozen",
        });
      }

      // Upsert payout records
      if (payoutRecords.length > 0) {
        await supabase.from("clipper_payouts").upsert(payoutRecords, {
          onConflict: "user_id,week_key",
        });
      }

      return new Response(
        JSON.stringify({ ok: true, processed: payoutRecords.length, weekKey }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (action === "review") {
      // MONDAY-THURSDAY: Re-verify and update status
      const { data: payouts } = await supabase
        .from("clipper_payouts")
        .select("*")
        .eq("week_key", weekKey)
        .eq("status", "frozen");

      if (!payouts) {
        return new Response(JSON.stringify({ ok: true, message: "Nothing to review" }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      for (const payout of payouts) {
        // Re-check clips still pass activation
        const { data: clips } = await supabase
          .from("clip_submissions")
          .select("view_count, baseline_view_count, ctr, reg_rate, day1_post_rate")
          .eq("user_id", payout.user_id)
          .eq("payout_week", weekKey);

        let totalNetViews = 0;
        let activatedClips = 0;

        (clips || []).forEach((clip: any) => {
          const netViews = Math.max(0, (clip.view_count || 0) - (clip.baseline_view_count || 0));
          const activated =
            netViews >= THRESHOLDS.views &&
            (clip.ctr || 0) >= THRESHOLDS.ctr &&
            (clip.reg_rate || 0) >= THRESHOLDS.regRate &&
            (clip.day1_post_rate || 0) >= THRESHOLDS.day1PostRate;

          if (activated) {
            totalNetViews += netViews;
            activatedClips++;
          }
        });

        let baseCents = Math.round((totalNetViews / 1000) * rpm * 100);
        if (baseCents > 0 && baseCents < MIN_PAYOUT_CENTS) baseCents = MIN_PAYOUT_CENTS;

        await supabase
          .from("clipper_payouts")
          .update({
            clips_count: activatedClips,
            total_net_views: totalNetViews,
            base_earnings_cents: baseCents,
            total_cents: baseCents,
            status: "reviewing",
            reviewed_at: new Date().toISOString(),
          })
          .eq("id", payout.id);
      }

      return new Response(
        JSON.stringify({ ok: true, reviewed: payouts.length }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (action === "payout") {
      // FRIDAY: Approve and mark as paid
      const { data: payouts } = await supabase
        .from("clipper_payouts")
        .select("*")
        .eq("week_key", weekKey)
        .in("status", ["frozen", "reviewing"]);

      if (!payouts) {
        return new Response(JSON.stringify({ ok: true, message: "Nothing to pay" }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Calculate monthly bonuses
      const monthKey = `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, "0")}`;

      for (const payout of payouts) {
        // Get monthly views for this user
        const monthStart = new Date(now.getUTCFullYear(), now.getUTCMonth(), 1);
        const { data: monthClips } = await supabase
          .from("clip_submissions")
          .select("view_count, baseline_view_count")
          .eq("user_id", payout.user_id)
          .gte("submitted_at", monthStart.toISOString());

        const monthlyViews = (monthClips || []).reduce(
          (s: number, c: any) => s + Math.max(0, (c.view_count || 0) - (c.baseline_view_count || 0)),
          0
        );

        // Determine monthly bonus
        let bonusCents = 0;
        let bonusTier = "none";
        if (!isProtection) {
          for (const tier of MONTHLY_BONUS_TIERS) {
            if (monthlyViews >= tier.views) {
              bonusCents = tier.bonus;
              bonusTier = tier.tier;
              break;
            }
          }
        }

        const totalCents = payout.base_earnings_cents + bonusCents;

        await supabase
          .from("clipper_payouts")
          .update({
            bonus_cents: bonusCents,
            total_cents: totalCents,
            status: "approved",
            paid_at: new Date().toISOString(),
          })
          .eq("id", payout.id);

        // Upsert monthly bonus record
        await supabase.from("clipper_monthly_bonuses").upsert(
          {
            user_id: payout.user_id,
            month_key: monthKey,
            monthly_views: monthlyViews,
            bonus_tier: bonusTier,
            bonus_cents: bonusCents,
          },
          { onConflict: "user_id,month_key" }
        );
      }

      return new Response(
        JSON.stringify({ ok: true, paid: payouts.length }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (action === "check_throttle") {
      // Check global metrics and toggle protection mode
      const { data: recentClips } = await supabase
        .from("clip_submissions")
        .select("ctr, reg_rate, day1_post_rate")
        .eq("status", "verified")
        .gte("submitted_at", new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

      if (!recentClips || recentClips.length < 5) {
        return new Response(JSON.stringify({ ok: true, message: "Not enough data" }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const avgCtr = recentClips.reduce((s, c) => s + (c.ctr || 0), 0) / recentClips.length;
      const avgReg = recentClips.reduce((s, c) => s + (c.reg_rate || 0), 0) / recentClips.length;
      const avgDay1 = recentClips.reduce((s, c) => s + (c.day1_post_rate || 0), 0) / recentClips.length;

      const metricsLow =
        avgCtr < PROTECTION_THRESHOLDS.ctr &&
        avgReg < PROTECTION_THRESHOLDS.regRate &&
        avgDay1 < PROTECTION_THRESHOLDS.day1PostRate;

      const currentLowDays = throttle?.consecutive_low_days || 0;
      const currentRecoveryDays = throttle?.consecutive_recovery_days || 0;

      let newIsActive = isProtection;
      let newLowDays = metricsLow ? currentLowDays + 1 : 0;
      let newRecoveryDays = !metricsLow && isProtection ? currentRecoveryDays + 1 : 0;

      // Activate after 3 consecutive low days
      if (newLowDays >= 3 && !isProtection) {
        newIsActive = true;
      }

      // Deactivate after 3 consecutive recovery days
      if (newRecoveryDays >= 3 && isProtection) {
        newIsActive = false;
        newRecoveryDays = 0;
      }

      await supabase
        .from("clipper_risk_throttle")
        .update({
          is_active: newIsActive,
          activated_at: newIsActive && !isProtection ? new Date().toISOString() : throttle?.activated_at,
          deactivated_at: !newIsActive && isProtection ? new Date().toISOString() : throttle?.deactivated_at,
          consecutive_low_days: newLowDays,
          consecutive_recovery_days: newRecoveryDays,
          current_avg_ctr: avgCtr,
          current_avg_reg_rate: avgReg,
          current_avg_day1_rate: avgDay1,
          rpm_override: newIsActive ? PROTECTION_RPM : null,
        })
        .eq("id", throttle?.id);

      return new Response(
        JSON.stringify({
          ok: true,
          protection: newIsActive,
          avgCtr,
          avgReg,
          avgDay1,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ error: "Unknown action. Use: freeze, review, payout, check_throttle" }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
