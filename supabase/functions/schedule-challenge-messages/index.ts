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

    // ── Send welcome SMS via Twilio ──
    const twilioSid = Deno.env.get("TWILIO_ACCOUNT_SID");
    const twilioAuth = Deno.env.get("TWILIO_AUTH_TOKEN");
    const twilioPhone = Deno.env.get("TWILIO_PHONE_NUMBER");

    if (twilioSid && twilioAuth && twilioPhone) {
      const friendCount = [friends.friend1, friends.friend2, friends.friend3]
        .filter(Boolean).length;

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
      ]
        .filter(Boolean)
        .join("\n");

      const twilioUrl = `https://api.twilio.com/2010-04-01/Accounts/${twilioSid}/Messages.json`;
      const formData = new URLSearchParams();
      formData.append("To", phone.trim());
      formData.append("From", twilioPhone);
      formData.append("Body", welcomeBody);

      const twilioRes = await fetch(twilioUrl, {
        method: "POST",
        headers: {
          Authorization: `Basic ${btoa(`${twilioSid}:${twilioAuth}`)}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: formData,
      });

      if (!twilioRes.ok) {
        const errBody = await twilioRes.text();
        console.error("Twilio welcome SMS failed:", errBody);
      }

      // Log to sms_deliveries for tracking
      await supabase.from("sms_deliveries").insert({
        recipient_phone: phone.trim(),
        recipient_name: null,
        message: welcomeBody,
        source_page: "challenge-setup",
        status: twilioRes.ok ? "sent" : "failed",
      });
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
