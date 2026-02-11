import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

/**
 * TGF Gratitude Fridays
 * Triggered every Friday at 7AM via pg_cron.
 * For each opted-in participant, picks a friend they haven't texted recently
 * and sends them a "Hey [Name] Thank You!" text with a wristband referral link.
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

  if (!twilioSid || !twilioAuth || (!twilioPhone && !msgServiceSid)) {
    return new Response(
      JSON.stringify({ error: "Twilio not configured" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  const results = { sent: 0, skipped: 0, errors: [] as string[] };

  try {
    // Get all active participants who opted in to SMS
    const { data: participants, error: pErr } = await supabase
      .from("challenge_participants")
      .select("id, phone, display_name, friend_1_name, friend_2_name, friend_3_name, user_id")
      .eq("opted_in_sms", true)
      .limit(50);

    if (pErr) {
      console.error("Error fetching participants:", pErr);
      return new Response(
        JSON.stringify({ error: pErr.message }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    for (const p of participants || []) {
      // Collect available friends
      const friends = [p.friend_1_name, p.friend_2_name, p.friend_3_name].filter(Boolean) as string[];
      if (friends.length === 0) {
        results.skipped++;
        continue;
      }

      // Get existing TGF contacts to find who was texted least recently
      const { data: existingContacts } = await supabase
        .from("tgf_friday_contacts")
        .select("friend_name, last_sent_at, send_count")
        .eq("user_id", p.user_id || p.id);

      // Pick the friend least recently texted
      const contactMap = new Map(
        (existingContacts || []).map((c) => [c.friend_name, c])
      );

      let selectedFriend = friends[0];
      let lowestCount = Infinity;

      for (const f of friends) {
        const contact = contactMap.get(f);
        const count = contact?.send_count || 0;
        if (count < lowestCount) {
          lowestCount = count;
          selectedFriend = f;
        }
      }

      // Get referral link if user has a creator profile
      let referralLink = "https://iamblessedaf.com/challenge";
      if (p.user_id) {
        const { data: profile } = await supabase
          .from("creator_profiles")
          .select("referral_code")
          .eq("user_id", p.user_id)
          .maybeSingle();

        if (profile?.referral_code) {
          referralLink = `https://iamblessedaf.com/r/${profile.referral_code}`;
        }
      }

      // Build the TGF message
      const senderName = p.display_name || "Friend";
      const msgBody = `🙏 TGF — Thank God it's Friday!\n\nHey ${senderName}, it's Gratitude Friday!\n\nThis week's mission: Send a quick "Thank You" to ${selectedFriend}.\n\nHere's a message you can forward:\n\n"Hey ${selectedFriend} Thank You! 🙏\nGot you this wristband, get it shipped with your address here:\n${referralLink}"\n\nSpread the gratitude! 💛\n— Blessed AF`;

      // Wristband image for MMS
      const wristbandImageUrl = `${supabaseUrl}/storage/v1/object/public/board-screenshots/wristband-tgf.avif`;

      // Send via Twilio
      const twilioUrl = `https://api.twilio.com/2010-04-01/Accounts/${twilioSid}/Messages.json`;
      const formData = new URLSearchParams();
      formData.append("To", p.phone);
      if (msgServiceSid) {
        formData.append("MessagingServiceSid", msgServiceSid);
      } else {
        formData.append("From", twilioPhone!);
      }
      formData.append("Body", msgBody);
      // Add wristband image as MMS
      formData.append("MediaUrl", wristbandImageUrl);

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
        
        // Upsert TGF contact tracking
        const existingContact = contactMap.get(selectedFriend);
        if (existingContact) {
          await supabase
            .from("tgf_friday_contacts")
            .update({
              last_sent_at: new Date().toISOString(),
              send_count: (existingContact.send_count || 0) + 1,
            })
            .eq("user_id", p.user_id || p.id)
            .eq("friend_name", selectedFriend);
        } else {
          await supabase
            .from("tgf_friday_contacts")
            .insert({
              user_id: p.user_id || p.id,
              participant_id: p.id,
              friend_name: selectedFriend,
              last_sent_at: new Date().toISOString(),
              send_count: 1,
              referral_link: referralLink,
            });
        }

        // Log to sms_deliveries
        await supabase.from("sms_deliveries").insert({
          recipient_phone: p.phone,
          message: msgBody.slice(0, 1000),
          twilio_sid: data.sid,
          status: "sent",
          source_page: "tgf-friday",
        });

        results.sent++;
      } else {
        const errText = await res.text();
        console.error(`TGF send failed for ${p.id}:`, errText);
        results.errors.push(`${p.id}: ${errText.slice(0, 100)}`);
      }
    }

    console.log(`TGF Friday complete: ${results.sent} sent, ${results.skipped} skipped`);
    return new Response(JSON.stringify(results), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("tgf-friday error:", err);
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
