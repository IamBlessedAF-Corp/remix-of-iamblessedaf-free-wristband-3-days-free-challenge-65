import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    // Get all active segments with rules
    const { data: segments } = await supabase
      .from("budget_segments")
      .select("*")
      .eq("is_active", true)
      .order("priority", { ascending: false });

    if (!segments || segments.length === 0) {
      return new Response(JSON.stringify({ ok: true, message: "No active segments" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Get all clippers with their clips for rule matching
    const { data: clips } = await supabase
      .from("clip_submissions")
      .select("user_id, platform, view_count, baseline_view_count, status");

    if (!clips || clips.length === 0) {
      return new Response(JSON.stringify({ ok: true, message: "No clips found" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Get existing memberships
    const { data: existingMemberships } = await supabase
      .from("clipper_segment_membership")
      .select("user_id, segment_id");

    const existingSet = new Set(
      (existingMemberships || []).map((m: any) => `${m.user_id}:${m.segment_id}`)
    );

    // Get creator profiles for tier info
    const { data: profiles } = await supabase
      .from("creator_profiles")
      .select("user_id, display_name");

    // Get monthly bonuses for tier classification
    const { data: bonuses } = await supabase
      .from("clipper_monthly_bonuses")
      .select("user_id, bonus_tier, monthly_views")
      .order("created_at", { ascending: false });

    // Build per-user stats
    const userStats: Record<string, {
      totalViews: number;
      platforms: Set<string>;
      clipCount: number;
      verifiedCount: number;
      bonusTier: string;
    }> = {};

    for (const clip of clips) {
      if (!userStats[clip.user_id]) {
        userStats[clip.user_id] = {
          totalViews: 0,
          platforms: new Set(),
          clipCount: 0,
          verifiedCount: 0,
          bonusTier: "none",
        };
      }
      const stats = userStats[clip.user_id];
      stats.totalViews += Math.max(0, (clip.view_count || 0) - (clip.baseline_view_count || 0));
      stats.platforms.add(clip.platform || "tiktok");
      stats.clipCount++;
      if (clip.status === "verified") stats.verifiedCount++;
    }

    // Apply bonus tier from most recent month
    for (const bonus of bonuses || []) {
      if (userStats[bonus.user_id]) {
        userStats[bonus.user_id].bonusTier = bonus.bonus_tier || "none";
      }
    }

    // Classify tiers based on monthly views
    const classifyTier = (views: number): string => {
      if (views >= 1_000_000) return "super";
      if (views >= 500_000) return "proven";
      if (views >= 100_000) return "verified";
      if (views >= 10_000) return "active";
      return "starter";
    };

    let assigned = 0;
    const assignments: { user_id: string; segment_id: string }[] = [];

    for (const [userId, stats] of Object.entries(userStats)) {
      const userTier = classifyTier(stats.totalViews);

      // Find highest-priority matching segment
      for (const segment of segments) {
        const rules = segment.rules as Record<string, any>;
        if (!rules || Object.keys(rules).length === 0) continue;

        let matches = true;

        // Rule: tier match
        if (rules.tier) {
          const tiers = Array.isArray(rules.tier) ? rules.tier : [rules.tier];
          if (!tiers.includes(userTier) && !tiers.includes(stats.bonusTier)) {
            matches = false;
          }
        }

        // Rule: platform match
        if (rules.platform && matches) {
          const platforms = Array.isArray(rules.platform) ? rules.platform : [rules.platform];
          const hasMatch = platforms.some((p: string) => stats.platforms.has(p));
          if (!hasMatch) matches = false;
        }

        // Rule: min_views
        if (rules.min_views && matches) {
          if (stats.totalViews < rules.min_views) matches = false;
        }

        // Rule: min_clips
        if (rules.min_clips && matches) {
          if (stats.verifiedCount < rules.min_clips) matches = false;
        }

        // Rule: tags (custom tags - future extensibility)
        if (rules.tags && matches) {
          // Tags would be matched against user profile metadata
          // For now, this is a placeholder for future tag-based rules
        }

        if (matches) {
          const key = `${userId}:${segment.id}`;
          if (!existingSet.has(key)) {
            assignments.push({ user_id: userId, segment_id: segment.id });
            existingSet.add(key);
            assigned++;
          }
          break; // Highest priority segment wins
        }
      }
    }

    // Batch insert assignments
    if (assignments.length > 0) {
      await supabase.from("clipper_segment_membership").upsert(
        assignments.map((a) => ({
          user_id: a.user_id,
          segment_id: a.segment_id,
        })),
        { onConflict: "user_id,segment_id" }
      );

      // Log the auto-assignment event
      await supabase.from("budget_events_log").insert({
        action: "auto_assign_segments",
        after_state: { assignments_count: assignments.length },
        impacted_segments: [...new Set(assignments.map((a) => a.segment_id))],
        notes: `Auto-assigned ${assignments.length} clippers to segments based on rules`,
      });
    }

    return new Response(
      JSON.stringify({ ok: true, evaluated: Object.keys(userStats).length, assigned }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
