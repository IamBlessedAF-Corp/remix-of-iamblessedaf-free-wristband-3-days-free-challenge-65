import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

/**
 * send-joy-keys-nudges
 * Called by pg_cron every 30 minutes.
 * Sends SMS nudges to users stalled on Joy Keys progression.
 *
 * Logic:
 * - Key 0 stalled > 2h  → remind to activate
 * - Key 1 stalled > 24h → remind to share clip/referral
 * - Key 2 stalled > 24h → remind to share story
 * - Key 3 stalled > 24h → remind to invite friends
 * - Stalled > 48h on any key → generic re-engagement
 *
 * Each user gets max 1 nudge per 24h (tracked in joy_keys_nudge_log).
 */
Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const supabase = createClient(supabaseUrl, serviceKey);

  // ── PAUSE GUARD ──
  const { data: pauseConfig } = await supabase
    .from("campaign_config")
    .select("value")
    .eq("key", "engagement_joy_keys_nudges")
    .maybeSingle();

  if (pauseConfig?.value === "paused") {
    console.log("send-joy-keys-nudges: PAUSED via campaign_config — skipping");
    return new Response(
      JSON.stringify({ paused: true, reason: "Joy Keys nudges disabled" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  const now = new Date();
  const nowISO = now.toISOString();
  const results = { nudgesSent: 0, skipped: 0, failed: 0, errors: [] as string[] };

  try {
    // ── Fetch stalled Joy Keys users ──
    // Get users who haven't completed master key and were updated > 2h ago
    const twoHoursAgo = new Date(now.getTime() - 2 * 60 * 60 * 1000).toISOString();
    const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString();

    const { data: stalledUsers, error: sErr } = await supabase
      .from("joy_keys_status")
      .select("id, user_id, current_key, coins_earned, friends_joined, updated_at")
      .eq("master_key_unlocked", false)
      .lte("updated_at", twoHoursAgo)
      .limit(20);

    if (sErr) {
      console.error("Error fetching stalled users:", sErr);
      return new Response(
        JSON.stringify({ error: sErr.message }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!stalledUsers || stalledUsers.length === 0) {
      console.log("send-joy-keys-nudges: No stalled users found");
      return new Response(
        JSON.stringify({ ...results, message: "No stalled users" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    for (const user of stalledUsers) {
      // ── Check nudge cooldown (max 1 per 24h) ──
      const { data: recentNudge } = await supabase
        .from("joy_keys_nudge_log")
        .select("id")
        .eq("user_id", user.user_id)
        .gte("sent_at", twentyFourHoursAgo)
        .limit(1);

      if (recentNudge && recentNudge.length > 0) {
        results.skipped++;
        continue;
      }

      // ── Get participant info for phone number ──
      const { data: participant } = await supabase
        .from("challenge_participants")
        .select("id, phone, display_name, opted_in_sms")
        .eq("user_id", user.user_id)
        .single();

      if (!participant || !participant.opted_in_sms || !participant.phone) {
        results.skipped++;
        continue;
      }

      if (participant.phone.startsWith("PAUSED")) {
        results.skipped++;
        continue;
      }

      // ── Determine which nudge to send ──
      const name = participant.display_name || "Friend";
      const currentKey = user.current_key;
      const percentage = Math.round((currentKey / 4) * 100);
      const stalledHours = (now.getTime() - new Date(user.updated_at).getTime()) / (1000 * 60 * 60);

      let templateKey = "";
      let variables: Record<string, string> = {};

      if (currentKey === 0 && stalledHours >= 2) {
        // Stalled before even activating — rare but possible
        templateKey = "joy-key1-reminder";
        variables = { name, percentage: String(percentage) };
      } else if (currentKey === 1 && stalledHours >= 24) {
        templateKey = "joy-key1-reminder";
        variables = { name, percentage: String(percentage) };
      } else if (currentKey === 2 && stalledHours >= 24) {
        templateKey = "joy-key2-story-nudge";
        variables = { name };
      } else if (currentKey === 3 && stalledHours >= 24) {
        const friendsNeeded = Math.max(0, 3 - (user.friends_joined || 0));
        const { data: inviteData } = await supabase
          .from("joy_keys_invites")
          .select("invite_code")
          .eq("inviter_id", user.user_id)
          .limit(1);
        const inviteCode = inviteData?.[0]?.invite_code || "";
        const inviteLink = inviteCode
          ? `https://iamblessedaf.com/r/${inviteCode}`
          : "https://iamblessedaf.com/challenge/invite";

        templateKey = "joy-key3-invite-reminder";
        variables = { name, friendsNeeded: String(friendsNeeded), inviteLink };
      } else if (stalledHours >= 48) {
        // Generic re-engagement for anyone stalled 48h+
        const nextActions: Record<number, string> = {
          0: "Activate your challenge to start earning coins!",
          1: "Share your clip or referral link to unlock Key 1.",
          2: "Share your gratitude story to unlock Key 2.",
          3: "Invite friends to unlock Key 3 and get FREE shipping!",
        };
        templateKey = "joy-stalled-24h";
        variables = {
          name,
          percentage: String(percentage),
          currentKey: String(currentKey),
          nextAction: nextActions[currentKey] || "Keep going!",
        };
      } else {
        // Not stalled long enough yet
        results.skipped++;
        continue;
      }

      // ── Send via sms-router ──
      const routerRes = await callRouter(supabaseUrl, serviceKey, {
        to: participant.phone,
        trafficType: "transactional",
        templateKey,
        variables,
      });

      if (routerRes.success) {
        // ── Log nudge (prevents re-sending within 24h) ──
        await supabase.from("joy_keys_nudge_log").insert({
          user_id: user.user_id,
          current_key: currentKey,
          template_key: templateKey,
          twilio_sid: routerRes.sid,
          sent_at: nowISO,
          status: "sent",
        });
        results.nudgesSent++;
      } else {
        // ── Mark as FAILED — never leave pending ──
        console.error(`Joy Keys nudge failed for ${user.user_id}:`, routerRes.error);
        await supabase.from("joy_keys_nudge_log").insert({
          user_id: user.user_id,
          current_key: currentKey,
          template_key: templateKey,
          sent_at: nowISO,
          status: "failed",
          error_message: routerRes.error,
        });
        results.failed++;
        results.errors.push(`${user.user_id}: ${routerRes.error}`);
      }
    }

    console.log(
      `Joy Keys nudges complete: ${results.nudgesSent} sent, ${results.skipped} skipped, ${results.failed} failed`
    );
    return new Response(JSON.stringify(results), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("send-joy-keys-nudges error:", err);
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

/** Call the centralized sms-router */
async function callRouter(
  supabaseUrl: string,
  serviceKey: string,
  payload: Record<string, unknown>
): Promise<{ success: boolean; sid?: string; error?: string }> {
  try {
    const res = await fetch(`${supabaseUrl}/functions/v1/sms-router`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${serviceKey}`,
      },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (res.ok && data.success) {
      return { success: true, sid: data.sid };
    }
    return { success: false, error: data.error || "Router returned error" };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Router call failed" };
  }
}
