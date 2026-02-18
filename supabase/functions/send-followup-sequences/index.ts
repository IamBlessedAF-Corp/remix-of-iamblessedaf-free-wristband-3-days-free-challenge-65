import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

/**
 * send-followup-sequences
 * Called by pg_cron every 30 minutes.
 * Sends SMS follow-ups to collect Friend 2 & 3 names.
 *
 * FIX HISTORY:
 * - 2026-02-18: Added PAUSE guard (was missing → infinite retry loop causing 29K+ messages)
 * - 2026-02-18: Route through sms-router instead of direct Twilio calls
 * - 2026-02-18: Mark sequences as 'failed' on send errors (was staying 'pending' forever)
 * - 2026-02-18: Skip participants with PAUSED- prefixed phone numbers
 */
Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const supabase = createClient(supabaseUrl, serviceKey);

  // ── PAUSE GUARD: Check campaign_config before doing anything ──
  const { data: pauseConfig } = await supabase
    .from("campaign_config")
    .select("value")
    .eq("key", "engagement_followup_friends")
    .maybeSingle();

  if (pauseConfig?.value === "paused") {
    console.log("send-followup-sequences: PAUSED via campaign_config — skipping all sends");
    return new Response(
      JSON.stringify({ paused: true, reason: "Flow disabled in Engagement Blueprint" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  const now = new Date().toISOString();
  const results = { smsSent: 0, skipped: 0, failed: 0, errors: [] as string[] };

  try {
    // Find due follow-up sequences (only 'pending', not 'paused' or 'failed')
    const { data: sequences, error: sErr } = await supabase
      .from("followup_sequences")
      .select("id, participant_id, step_number, channel")
      .eq("status", "pending")
      .lte("scheduled_at", now)
      .limit(20);

    if (sErr) {
      console.error("Error fetching sequences:", sErr);
      return new Response(
        JSON.stringify({ error: sErr.message }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!sequences || sequences.length === 0) {
      console.log("send-followup-sequences: No pending sequences found");
      return new Response(
        JSON.stringify({ ...results, message: "No pending sequences" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    for (const seq of sequences) {
      // Get participant info
      const { data: participant } = await supabase
        .from("challenge_participants")
        .select("phone, display_name, friend_1_name, friend_2_name, friend_3_name, opted_in_sms")
        .eq("id", seq.participant_id)
        .single();

      if (!participant) {
        // Participant deleted — mark sequence as failed
        await supabase
          .from("followup_sequences")
          .update({ status: "failed", sent_at: now })
          .eq("id", seq.id);
        results.failed++;
        continue;
      }

      // ── Skip PAUSED phone numbers (prefixed with PAUSED-) ──
      if (!participant.phone || participant.phone.startsWith("PAUSED")) {
        await supabase
          .from("followup_sequences")
          .update({ status: "paused", sent_at: now })
          .eq("id", seq.id);
        results.skipped++;
        continue;
      }

      // ── Skip if SMS opt-out ──
      if (!participant.opted_in_sms) {
        await supabase
          .from("followup_sequences")
          .update({ status: "skipped", sent_at: now })
          .eq("id", seq.id);
        results.skipped++;
        continue;
      }

      // Determine what we're asking for based on step
      const name = participant.display_name || "Friend";
      let templateKey = "";
      let variables: Record<string, string> = {};

      if (seq.step_number === 1 && !participant.friend_2_name) {
        templateKey = "custom-transactional";
        variables = {
          body: `Hey ${name}! 🙏\n\nYour gratitude to ${participant.friend_1_name} was powerful.\n\nDay 2 question: Who's someone who helped you when they didn't have to?\n\nReply with their name and we'll set up your next 11:11 message! 💛\n\n— Blessed AF`,
        };
      } else if (seq.step_number === 2 && !participant.friend_3_name) {
        templateKey = "custom-transactional";
        variables = {
          body: `Hey ${name}! 🙏\n\nYou're on a roll! Two friends, two gratitude texts.\n\nDay 3 question: Who's someone unexpected you're grateful for? A teacher, coworker, or someone who surprised you.\n\nReply with their name! 💛\n\n— Blessed AF`,
        };
      } else {
        // Already have the friend — skip
        await supabase
          .from("followup_sequences")
          .update({ status: "skipped", sent_at: now })
          .eq("id", seq.id);
        results.skipped++;
        continue;
      }

      // ── Route through sms-router (not direct Twilio) ──
      const routerRes = await callRouter(supabaseUrl, serviceKey, {
        to: participant.phone,
        trafficType: "transactional",
        templateKey,
        variables,
      });

      if (routerRes.success) {
        await supabase
          .from("followup_sequences")
          .update({ status: "sent", sent_at: now })
          .eq("id", seq.id);
        results.smsSent++;
      } else {
        // ── CRITICAL FIX: Mark as FAILED so we don't retry forever ──
        console.error(`Followup send failed for ${seq.id}:`, routerRes.error);
        await supabase
          .from("followup_sequences")
          .update({ status: "failed", sent_at: now })
          .eq("id", seq.id);
        results.failed++;
        results.errors.push(`${seq.id}: ${routerRes.error}`);
      }
    }

    console.log(
      `Followup sequences complete: ${results.smsSent} sent, ${results.skipped} skipped, ${results.failed} failed`
    );
    return new Response(JSON.stringify(results), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("send-followup-sequences error:", err);
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
