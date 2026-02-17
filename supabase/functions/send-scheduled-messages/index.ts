import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

/**
 * send-scheduled-messages
 * Called by pg_cron every minute.
 * Routes all messages through sms-router for A2P 10DLC compliance.
 */
serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const supabase = createClient(supabaseUrl, serviceKey);

  const now = new Date().toISOString();
  const results = { remindersSent: 0, messagesSent: 0, errors: [] as string[] };

  try {
    // 🚫 Daily reminders & messages PAUSED — re-enable when A2P registration is complete
    console.log("send-scheduled-messages: PAUSED — skipping all sends");
    return new Response(JSON.stringify({ paused: true, reason: "Daily reminders disabled" }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

    // ── 1. Send 3PM Reminders ──
    const { data: reminders, error: rErr } = await supabase
      .from("scheduled_gratitude_messages")
      .select("id, day_number, friend_name, message_body, status, participant_id")
      .lte("reminder_send_at", now)
      .is("twilio_reminder_sid", null)
      .in("status", ["draft", "scheduled"])
      .limit(20);

    if (rErr) {
      console.error("Error fetching reminders:", rErr);
      results.errors.push(`Reminder query: ${rErr.message}`);
    }

    for (const r of reminders || []) {
      const { data: participant } = await supabase
        .from("challenge_participants")
        .select("phone, display_name, opted_in_sms")
        .eq("id", r.participant_id)
        .single();

      if (!participant || !participant.opted_in_sms) continue;

      const hasMessage = r.message_body && r.message_body.trim().length > 0;

      const routerRes = await callRouter(supabaseUrl, serviceKey, {
        to: participant.phone,
        trafficType: "transactional",
        templateKey: "challenge-reminder-3pm",
        variables: {
          dayNumber: String(r.day_number),
          friendName: r.friend_name,
        },
      });

      if (routerRes.success) {
        await supabase
          .from("scheduled_gratitude_messages")
          .update({ twilio_reminder_sid: routerRes.sid })
          .eq("id", r.id);
        results.remindersSent++;
      } else {
        console.error(`Reminder failed for ${r.id}:`, routerRes.error);
        results.errors.push(`Reminder ${r.id}: ${routerRes.error}`);
      }
    }

    // ── 2. Send 11:11 Messages ──
    const { data: messages, error: mErr } = await supabase
      .from("scheduled_gratitude_messages")
      .select("id, day_number, friend_name, message_body, participant_id")
      .eq("status", "scheduled")
      .lte("scheduled_send_at", now)
      .is("message_sent_at", null)
      .neq("message_body", "")
      .limit(20);

    if (mErr) {
      console.error("Error fetching messages:", mErr);
      results.errors.push(`Message query: ${mErr.message}`);
    }

    for (const m of messages || []) {
      if (!m.message_body || m.message_body.trim().length === 0) continue;

      const { data: participant } = await supabase
        .from("challenge_participants")
        .select("phone, display_name, opted_in_sms")
        .eq("id", m.participant_id)
        .single();

      if (!participant || !participant.opted_in_sms) continue;

      const routerRes = await callRouter(supabaseUrl, serviceKey, {
        to: participant.phone,
        trafficType: "transactional",
        templateKey: "challenge-1111-send",
        variables: {
          friendName: m.friend_name,
          messageBody: m.message_body,
        },
      });

      if (routerRes.success) {
        await supabase
          .from("scheduled_gratitude_messages")
          .update({
            status: "sent",
            message_sent_at: now,
            twilio_message_sid: routerRes.sid,
          })
          .eq("id", m.id);
        results.messagesSent++;
      } else {
        console.error(`11:11 send failed for ${m.id}:`, routerRes.error);
        results.errors.push(`Message ${m.id}: ${routerRes.error}`);
      }
    }

    console.log(`Cron complete: ${results.remindersSent} reminders, ${results.messagesSent} messages sent`);

    return new Response(JSON.stringify(results), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("send-scheduled-messages error:", err);
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
