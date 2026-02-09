import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { phone, friends, gratitudeMemory, fullMessage } = await req.json();

    // ── Validate ──
    if (!phone || typeof phone !== "string" || phone.length < 10) {
      return new Response(
        JSON.stringify({ error: "Valid phone number required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    if (!friends?.friend1 || typeof friends.friend1 !== "string") {
      return new Response(
        JSON.stringify({ error: "At least one friend name required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    if (!fullMessage || typeof fullMessage !== "string") {
      return new Response(
        JSON.stringify({ error: "Message body required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // ── Get auth user if available ──
    let userId: string | null = null;
    const authHeader = req.headers.get("Authorization");
    if (authHeader) {
      const { data: { user } } = await supabase.auth.getUser(
        authHeader.replace("Bearer ", "")
      );
      userId = user?.id ?? null;
    }

    // ── Create participant ──
    const tomorrowDate = new Date(Date.now() + 86_400_000)
      .toISOString()
      .split("T")[0];

    const { data: participant, error: pErr } = await supabase
      .from("challenge_participants")
      .insert({
        user_id: userId,
        phone: phone.trim(),
        friend_1_name: friends.friend1.trim().slice(0, 100),
        friend_2_name: friends.friend2?.trim().slice(0, 100) || null,
        friend_3_name: friends.friend3?.trim().slice(0, 100) || null,
        opted_in_sms: true,
        challenge_start_date: tomorrowDate,
        challenge_status: "active",
      })
      .select()
      .single();

    if (pErr) throw pErr;

    // ── Create scheduled messages ──
    const now = new Date();
    const messages: Array<{
      participant_id: string;
      day_number: number;
      friend_name: string;
      message_body: string;
      scheduled_send_at: string;
      reminder_send_at: string;
      status: string;
    }> = [];

    // Day 1 — best friend (message already written)
    messages.push({
      participant_id: participant.id,
      day_number: 1,
      friend_name: friends.friend1.trim(),
      message_body: fullMessage,
      scheduled_send_at: getNextDateTime(now, 1, 11, 11),
      reminder_send_at: getNextDateTime(now, 0, 15, 0),
      status: "scheduled",
    });

    // Day 2 (draft — user will write via 3PM reminder)
    if (friends.friend2) {
      messages.push({
        participant_id: participant.id,
        day_number: 2,
        friend_name: friends.friend2.trim(),
        message_body: "",
        scheduled_send_at: getNextDateTime(now, 2, 11, 11),
        reminder_send_at: getNextDateTime(now, 1, 15, 0),
        status: "draft",
      });
    }

    // Day 3 (draft)
    if (friends.friend3) {
      messages.push({
        participant_id: participant.id,
        day_number: 3,
        friend_name: friends.friend3.trim(),
        message_body: "",
        scheduled_send_at: getNextDateTime(now, 3, 11, 11),
        reminder_send_at: getNextDateTime(now, 2, 15, 0),
        status: "draft",
      });
    }

    const { error: mErr } = await supabase
      .from("scheduled_gratitude_messages")
      .insert(messages);
    if (mErr) throw mErr;

    // ── Twilio setup ──
    const twilioSid = Deno.env.get("TWILIO_ACCOUNT_SID");
    const twilioAuth = Deno.env.get("TWILIO_AUTH_TOKEN");
    const twilioPhone = Deno.env.get("TWILIO_PHONE_NUMBER");
    const msgServiceSid = Deno.env.get("TWILIO_MESSAGING_SERVICE_SID");

    if (twilioSid && twilioAuth) {
      const twilioUrl = `https://api.twilio.com/2010-04-01/Accounts/${twilioSid}/Messages.json`;
      const credentials = btoa(`${twilioSid}:${twilioAuth}`);
      const friendCount = [friends.friend1, friends.friend2, friends.friend3]
        .filter(Boolean).length;

      // ── 1. Send welcome SMS immediately ──
      const welcomeBody = [
        `🙏 Welcome to the Blessed AF 3-Day Gratitude Challenge!`,
        ``,
        `Your challenge starts tomorrow at 11:11 AM.`,
        `Day 1 message goes to ${friends.friend1}.`,
        friendCount > 1
          ? `You have ${friendCount} messages scheduled over ${friendCount} days.`
          : "",
        ``,
        `We'll text you at 3PM today to help you prepare.`,
        ``,
        `Reply STOP to opt out.`,
      ].filter(Boolean).join("\n");

      const welcomeForm = new URLSearchParams();
      welcomeForm.append("To", phone.trim());
      if (msgServiceSid) {
        welcomeForm.append("MessagingServiceSid", msgServiceSid);
      } else if (twilioPhone) {
        welcomeForm.append("From", twilioPhone);
      }
      welcomeForm.append("Body", welcomeBody);

      const welcomeRes = await fetch(twilioUrl, {
        method: "POST",
        headers: {
          Authorization: `Basic ${credentials}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: welcomeForm,
      });

      if (!welcomeRes.ok) {
        const errBody = await welcomeRes.text();
        console.error("Twilio welcome SMS failed:", errBody);
      }

      await supabase.from("sms_deliveries").insert({
        recipient_phone: phone.trim(),
        message: welcomeBody,
        source_page: "challenge-setup",
        status: welcomeRes.ok ? "sent" : "failed",
      });

      // ── 2. Native schedule Day 1 messages (if Messaging Service available) ──
      if (msgServiceSid) {
        for (const msg of messages) {
          const sendAt = new Date(msg.scheduled_send_at);
          const minsUntilSend = (sendAt.getTime() - Date.now()) / 60000;

          // Twilio requires 15min–35day window for scheduling
          if (minsUntilSend >= 15) {
            // Schedule the 11:11 message reminder to participant
            if (msg.message_body && msg.status === "scheduled") {
              const msgBody = `It's 11:11! 🙏 Time to send your gratitude to ${msg.friend_name}.\n\nHere's your message:\n\n"${msg.message_body}"\n\nCopy and send it now! Reply DONE when sent. 🧠\n\n— Blessed AF`;

              const schedForm = new URLSearchParams();
              schedForm.append("To", phone.trim());
              schedForm.append("MessagingServiceSid", msgServiceSid);
              schedForm.append("Body", msgBody);
              schedForm.append("ScheduleType", "fixed");
              schedForm.append("SendAt", sendAt.toISOString());

              const schedRes = await fetch(twilioUrl, {
                method: "POST",
                headers: {
                  Authorization: `Basic ${credentials}`,
                  "Content-Type": "application/x-www-form-urlencoded",
                },
                body: schedForm,
              });

              if (schedRes.ok) {
                const schedData = await schedRes.json();
                // Update DB with Twilio SID — cron will skip this one
                await supabase
                  .from("scheduled_gratitude_messages")
                  .update({ twilio_message_sid: schedData.sid, status: "scheduled" })
                  .eq("id", msg.participant_id) // Will update via cron fallback
                console.log(`Natively scheduled Day ${msg.day_number} for ${sendAt.toISOString()}`);
              } else {
                console.error(`Native schedule failed for Day ${msg.day_number}:`, await schedRes.text());
              }
            }
          }
          // Messages < 15min out will be picked up by pg_cron
        }
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        participantId: participant.id,
        messagesScheduled: messages.length,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("schedule-challenge-messages error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

/** Build an ISO timestamp for `daysAhead` days from `from`, at `hour:minute` */
function getNextDateTime(
  from: Date,
  daysAhead: number,
  hour: number,
  minute: number
): string {
  const d = new Date(from);
  d.setDate(d.getDate() + daysAhead);
  d.setHours(hour, minute, 0, 0);
  return d.toISOString();
}
