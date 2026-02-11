import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

/**
 * send-followup-sequences
 * Called by pg_cron every 30 minutes.
 * Sends SMS/email follow-ups to collect Friend 2 & 3 names
 * after the initial gratitude challenge signup.
 */
Deno.serve(async (req: Request) => {
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
  const resendApiKey = Deno.env.get("RESEND_API_KEY");

  if (!twilioSid || !twilioAuth || (!twilioPhone && !msgServiceSid)) {
    return new Response(
      JSON.stringify({ error: "Twilio not configured" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  const now = new Date().toISOString();
  const results = { smsSent: 0, emailsSent: 0, errors: [] as string[] };

  try {
    // Find due follow-up sequences
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

    for (const seq of sequences || []) {
      // Get participant info
      const { data: participant } = await supabase
        .from("challenge_participants")
        .select("phone, display_name, friend_1_name, friend_2_name, friend_3_name, opted_in_sms")
        .eq("id", seq.participant_id)
        .single();

      if (!participant) continue;

      // Determine what we're asking for based on step
      let msgBody = "";
      const name = participant.display_name || "Friend";

      if (seq.step_number === 1 && !participant.friend_2_name) {
        // Ask for Friend 2 — "Someone Who Helped You"
        msgBody = `Hey ${name}! 🙏\n\nYour gratitude to ${participant.friend_1_name} was powerful.\n\nDay 2 question: Who's someone who helped you when they didn't have to?\n\nReply with their name and we'll set up your next 11:11 message! 💛\n\n— Blessed AF`;
      } else if (seq.step_number === 2 && !participant.friend_3_name) {
        // Ask for Friend 3 — "Someone Unexpected"
        msgBody = `Hey ${name}! 🙏\n\nYou're on a roll! Two friends, two gratitude texts.\n\nDay 3 question: Who's someone unexpected you're grateful for? A teacher, coworker, or someone who surprised you.\n\nReply with their name! 💛\n\n— Blessed AF`;
      } else {
        // Already have the friend, skip
        await supabase
          .from("followup_sequences")
          .update({ status: "skipped", sent_at: now })
          .eq("id", seq.id);
        continue;
      }

      if (seq.channel === "sms" && participant.opted_in_sms) {
        // Send SMS
        const twilioUrl = `https://api.twilio.com/2010-04-01/Accounts/${twilioSid}/Messages.json`;
        const formData = new URLSearchParams();
        formData.append("To", participant.phone);
        if (msgServiceSid) {
          formData.append("MessagingServiceSid", msgServiceSid);
        } else {
          formData.append("From", twilioPhone!);
        }
        formData.append("Body", msgBody);

        const res = await fetch(twilioUrl, {
          method: "POST",
          headers: {
            Authorization: `Basic ${btoa(`${twilioSid}:${twilioAuth}`)}`,
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: formData,
        });

        if (res.ok) {
          const data = await res.json();
          await supabase
            .from("followup_sequences")
            .update({ status: "sent", sent_at: now })
            .eq("id", seq.id);

          await supabase.from("sms_deliveries").insert({
            recipient_phone: participant.phone,
            message: msgBody.slice(0, 1000),
            twilio_sid: data.sid,
            status: "sent",
            source_page: `followup-step-${seq.step_number}`,
          });

          results.smsSent++;
        } else {
          const errText = await res.text();
          console.error(`Followup SMS failed for ${seq.id}:`, errText);
          results.errors.push(`${seq.id}: ${errText.slice(0, 100)}`);
        }
      } else if (seq.channel === "email" && resendApiKey) {
        // Send email via Resend (future expansion)
        // For now, mark as pending-email
        await supabase
          .from("followup_sequences")
          .update({ status: "pending-email" })
          .eq("id", seq.id);
      }
    }

    console.log(`Followup sequences complete: ${results.smsSent} SMS, ${results.emailsSent} emails`);
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
