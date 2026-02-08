import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

/**
 * Twilio SMS Webhook — handles BOTH:
 * 1. Status callbacks (delivery updates) — has MessageStatus
 * 2. Inbound messages (user replies) — has Body, no MessageStatus
 */
serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const supabase = createClient(supabaseUrl, serviceRoleKey);

  try {
    const formData = await req.formData();
    const messageStatus = formData.get("MessageStatus") as string | null;
    const body = formData.get("Body") as string | null;
    const from = formData.get("From") as string | null;
    const messageSid = formData.get("MessageSid") as string | null;

    // ── INBOUND MESSAGE (user replied) ──
    if (body && from && !messageStatus) {
      console.log(`Inbound SMS from ${from}: ${body.slice(0, 50)}`);
      await handleInboundMessage(supabase, from, body.trim());
      return new Response("OK", { status: 200, headers: corsHeaders });
    }

    // ── STATUS CALLBACK (delivery update) ──
    if (messageSid && messageStatus) {
      console.log(`SMS status update: ${messageSid} → ${messageStatus}`);

      const updatePayload: Record<string, string | null> = {
        status: messageStatus,
      };

      const errorCode = formData.get("ErrorCode") as string | null;
      const errorMessage = formData.get("ErrorMessage") as string | null;
      if (errorCode || errorMessage) {
        updatePayload.error_message = `${errorCode || ""}: ${errorMessage || ""}`.trim();
      }

      // Update sms_deliveries
      await supabase
        .from("sms_deliveries")
        .update(updatePayload)
        .eq("twilio_sid", messageSid);

      // Also update scheduled_gratitude_messages if this was a challenge message
      if (messageStatus === "delivered") {
        await supabase
          .from("scheduled_gratitude_messages")
          .update({ status: "delivered" })
          .eq("twilio_message_sid", messageSid);
      }

      return new Response("OK", { status: 200, headers: corsHeaders });
    }

    return new Response("Bad Request", { status: 400 });
  } catch (err) {
    console.error("sms-status-webhook error:", err);
    return new Response("Internal Error", { status: 500 });
  }
});

/**
 * Handle inbound SMS from a participant.
 * Responses: STOP, DONE, or gratitude memory text.
 */
async function handleInboundMessage(
  supabase: ReturnType<typeof createClient>,
  from: string,
  body: string
) {
  const upperBody = body.toUpperCase().trim();

  // ── STOP — opt out ──
  if (upperBody === "STOP" || upperBody === "CANCEL" || upperBody === "UNSUBSCRIBE") {
    await supabase
      .from("challenge_participants")
      .update({ opted_in_sms: false })
      .eq("phone", from);
    console.log(`Opted out: ${from}`);
    return; // Twilio handles STOP auto-reply
  }

  // Find active participant by phone
  const { data: participant } = await supabase
    .from("challenge_participants")
    .select("id, display_name, friend_1_name, friend_2_name, friend_3_name")
    .eq("phone", from)
    .eq("challenge_status", "active")
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  if (!participant) {
    console.log(`No active participant found for ${from}`);
    return;
  }

  // ── DONE — user sent their message to their friend ──
  if (upperBody === "DONE" || upperBody === "SENT" || upperBody === "YES") {
    // Find the latest sent (but not completed) message
    const { data: sentMsg } = await supabase
      .from("scheduled_gratitude_messages")
      .select("id, day_number, friend_name")
      .eq("participant_id", participant.id)
      .eq("status", "sent")
      .order("day_number")
      .limit(1)
      .single();

    if (sentMsg) {
      // Mark as completed
      await supabase
        .from("scheduled_gratitude_messages")
        .update({ status: "completed" })
        .eq("id", sentMsg.id);

      // Check how many days completed
      const { count } = await supabase
        .from("scheduled_gratitude_messages")
        .select("id", { count: "exact", head: true })
        .eq("participant_id", participant.id)
        .eq("status", "completed");

      const completed = count || 0;
      const totalDays = [participant.friend_1_name, participant.friend_2_name, participant.friend_3_name]
        .filter(Boolean).length;

      let replyMsg: string;
      if (completed >= totalDays) {
        // Challenge complete!
        replyMsg = `🏆 CHALLENGE COMPLETE! You sent gratitude to ${completed} people!\n\nYour brain has literally rewired its gratitude circuits. 🧠\n\n🎁 Share the challenge with a friend:\nhttps://funnel-architect-ai-30.lovable.app/challenge\n\n— Blessed AF`;

        await supabase
          .from("challenge_participants")
          .update({ challenge_status: "completed" })
          .eq("id", participant.id);
      } else {
        replyMsg = `🎉 Amazing! Day ${sentMsg.day_number}/3 complete!\n\nYou sent gratitude to ${sentMsg.friend_name}. 🙏\n\n🔥 Streak: ${completed}/${totalDays} days!\n\n${completed < totalDays ? "Tomorrow's 11:11 is coming. Your brain is rewiring! 🧠" : ""}\n\n— Blessed AF`;
      }

      // Award XP: store in participant metadata or via BC wallet
      // For now, log it
      console.log(`Day ${sentMsg.day_number} completed by participant ${participant.id}`);

      await sendReply(from, replyMsg);
    }
    return;
  }

  // ── GRATITUDE MEMORY — user replying with content for next day's message ──
  const { data: draftMsg } = await supabase
    .from("scheduled_gratitude_messages")
    .select("id, day_number, friend_name")
    .eq("participant_id", participant.id)
    .eq("status", "draft")
    .order("day_number")
    .limit(1)
    .single();

  if (draftMsg) {
    // Format the 11:11 message with their memory
    const fullMessage = `It's 11:11! 🙏 I feel Blessed And Fortunate to have u in my life.\n\n${draftMsg.friend_name}, I'll never forget when you ${body}\n\nI just got a cool wristband to remind myself to be more grateful and I'm sending you one as a gift too! Want the link to get it by mail? 🎁`;

    await supabase
      .from("scheduled_gratitude_messages")
      .update({ message_body: fullMessage, status: "scheduled" })
      .eq("id", draftMsg.id);

    const preview = fullMessage.length > 120 ? fullMessage.slice(0, 120) + "..." : fullMessage;
    await sendReply(
      from,
      `✅ Your Day ${draftMsg.day_number} message to ${draftMsg.friend_name} is set for 11:11 AM!\n\nPreview:\n"${preview}"\n\nWant to change it? Just reply again.\n\n— Blessed AF`
    );
  } else {
    // No draft found — maybe they're just chatting
    console.log(`No draft message found for participant ${participant.id}, ignoring reply.`);
  }
}

/** Send a reply SMS via Twilio */
async function sendReply(to: string, body: string) {
  const twilioSid = Deno.env.get("TWILIO_ACCOUNT_SID");
  const twilioAuth = Deno.env.get("TWILIO_AUTH_TOKEN");
  const twilioPhone = Deno.env.get("TWILIO_PHONE_NUMBER");

  if (!twilioSid || !twilioAuth || !twilioPhone) {
    console.error("Twilio not configured for reply");
    return;
  }

  const url = `https://api.twilio.com/2010-04-01/Accounts/${twilioSid}/Messages.json`;
  const formData = new URLSearchParams();
  formData.append("To", to);
  formData.append("From", twilioPhone);
  formData.append("Body", body);

  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Basic ${btoa(`${twilioSid}:${twilioAuth}`)}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: formData,
  });

  if (!res.ok) {
    const errText = await res.text();
    console.error("Reply send failed:", errText);
  }
}
