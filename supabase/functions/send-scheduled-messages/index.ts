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
 * Picks up due 3PM reminders and 11:11 messages, sends via Twilio.
 */
serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const supabase = createClient(supabaseUrl, serviceKey);

  const twilioSid = Deno.env.get("TWILIO_ACCOUNT_SID");
  const twilioAuth = Deno.env.get("TWILIO_AUTH_TOKEN");
  const twilioPhone = Deno.env.get("TWILIO_PHONE_NUMBER");
  const msgServiceSid = Deno.env.get("TWILIO_MESSAGING_SERVICE_SID");

  if (!twilioSid || !twilioAuth || (!twilioPhone && !msgServiceSid)) {
    return new Response(
      JSON.stringify({ error: "Twilio not configured" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  const now = new Date().toISOString();
  const results = { remindersSent: 0, messagesSent: 0, errors: [] as string[] };

  try {
    // ── 1. Send 3PM Reminders ──
    // Find messages where reminder is due but not yet sent
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
      // Get participant phone
      const { data: participant } = await supabase
        .from("challenge_participants")
        .select("phone, display_name, opted_in_sms")
        .eq("id", r.participant_id)
        .single();

      if (!participant || !participant.opted_in_sms) continue;

      const hasMessage = r.message_body && r.message_body.trim().length > 0;
      const reminderBody = hasMessage
        ? `🙏 Hey! Tomorrow is Day ${r.day_number} of your Gratitude Challenge.\n\nYour 11:11 message to ${r.friend_name} is ready! ✅\n\nWant to edit it? Just reply with a new memory.\n\n— Blessed AF`
        : `🙏 Hey! Tomorrow is Day ${r.day_number} of your Gratitude Challenge.\n\nYour 11:11 message goes to ${r.friend_name}.\n\nWhat moment are you grateful for? Reply with your memory and we'll format your message!\n\n— Blessed AF`;

      const res = await sendTwilio(twilioSid, twilioAuth, twilioPhone, participant.phone, reminderBody, msgServiceSid);

      if (res.ok) {
        const data = await res.json();
        await supabase
          .from("scheduled_gratitude_messages")
          .update({ twilio_reminder_sid: data.sid })
          .eq("id", r.id);

        await logSmsDelivery(supabase, participant.phone, reminderBody, data.sid, "sent", "challenge-reminder");
        results.remindersSent++;
      } else {
        const errText = await res.text();
        console.error(`Reminder send failed for ${r.id}:`, errText);
        results.errors.push(`Reminder ${r.id}: ${errText.slice(0, 100)}`);
        await logSmsDelivery(supabase, participant.phone, reminderBody, null, "failed", "challenge-reminder");
      }
    }

    // ── 2. Send 11:11 Messages ──
    // Find messages where send time is due, has content, not yet sent
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

      // Send to PARTICIPANT with their pre-written message to forward
      const msgBody = `It's 11:11! 🙏 Time to send your gratitude to ${m.friend_name}.\n\nHere's your message:\n\n"${m.message_body}"\n\nCopy and send it now! Reply DONE when sent. 🧠\n\n— Blessed AF`;

      const res = await sendTwilio(twilioSid, twilioAuth, twilioPhone, participant.phone, msgBody, msgServiceSid);

      if (res.ok) {
        const data = await res.json();
        await supabase
          .from("scheduled_gratitude_messages")
          .update({
            status: "sent",
            message_sent_at: now,
            twilio_message_sid: data.sid,
          })
          .eq("id", m.id);

        await logSmsDelivery(supabase, participant.phone, msgBody, data.sid, "sent", "challenge-1111");
        results.messagesSent++;
      } else {
        const errText = await res.text();
        console.error(`11:11 send failed for ${m.id}:`, errText);
        results.errors.push(`Message ${m.id}: ${errText.slice(0, 100)}`);
        await logSmsDelivery(supabase, participant.phone, msgBody, null, "failed", "challenge-1111");
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

/** Send SMS via Twilio REST API — prefers Messaging Service if available */
async function sendTwilio(
  accountSid: string,
  authToken: string,
  from: string,
  to: string,
  body: string,
  messagingServiceSid?: string | null
): Promise<Response> {
  const url = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`;
  const formData = new URLSearchParams();
  formData.append("To", to);
  if (messagingServiceSid) {
    formData.append("MessagingServiceSid", messagingServiceSid);
  } else {
    formData.append("From", from);
  }
  formData.append("Body", body);

  return fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Basic ${btoa(`${accountSid}:${authToken}`)}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: formData,
  });
}

/** Log to sms_deliveries for admin tracking */
async function logSmsDelivery(
  supabase: ReturnType<typeof createClient>,
  phone: string,
  message: string,
  sid: string | null,
  status: string,
  source: string
) {
  await supabase.from("sms_deliveries").insert({
    recipient_phone: phone,
    message: message.slice(0, 1000),
    twilio_sid: sid,
    status,
    source_page: source,
  });
}
