import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface FriendInvite {
  name: string;
  phone: string;
  message: string;
}

function formatPhone(raw: string): string {
  const clean = raw.replace(/[^\d+]/g, "");
  if (clean.startsWith("+")) return clean;
  if (clean.length === 10) return `+1${clean}`;
  if (clean.length === 11 && clean.startsWith("1")) return `+${clean}`;
  return `+${clean}`;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    const accountSid = Deno.env.get("TWILIO_ACCOUNT_SID");
    const authToken = Deno.env.get("TWILIO_AUTH_TOKEN");
    if (!accountSid || !authToken) {
      throw new Error("Missing Twilio credentials");
    }

    // Validate auth
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: { user }, error: authError } = await createClient(
      supabaseUrl,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    ).auth.getUser();

    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { friends, senderName, referralLink } = await req.json() as {
      friends: FriendInvite[];
      senderName: string;
      referralLink: string;
    };

    if (!friends || !Array.isArray(friends) || friends.length === 0 || friends.length > 10) {
      return new Response(JSON.stringify({ error: "Provide 1-10 friends" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Validate each friend
    for (const f of friends) {
      if (!f.name?.trim() || !f.phone?.trim() || !f.message?.trim()) {
        return new Response(
          JSON.stringify({ error: `Missing fields for friend: ${f.name || "unknown"}` }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (f.message.length > 1000) {
        return new Response(
          JSON.stringify({ error: `Message too long for ${f.name}` }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    const twilioUrl = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`;
    const credentials = btoa(`${accountSid}:${authToken}`);

    // Use the transactional messaging service for WhatsApp
    const messagingServiceSid = Deno.env.get("TWILIO_MESSAGING_SERVICE_SID_TRANSACTIONAL");

    const results: Array<{ name: string; success: boolean; error?: string }> = [];

    for (const friend of friends) {
      const formattedPhone = formatPhone(friend.phone);
      
      if (!formattedPhone.match(/^\+\d{10,15}$/)) {
        results.push({ name: friend.name, success: false, error: "Invalid phone number" });
        continue;
      }

      // Build WhatsApp message body
      const whatsappBody = `${friend.message}\n\n🎁 Free Neuro-Hacker Wristband for you:\n${referralLink}\n\n— Sent with love via I am Blessed AF`;

      const formData = new URLSearchParams({
        To: `whatsapp:${formattedPhone}`,
        Body: whatsappBody,
      });

      // Use MessagingServiceSid if available, otherwise use From number
      if (messagingServiceSid) {
        formData.append("MessagingServiceSid", messagingServiceSid);
      } else {
        const fromNumber = Deno.env.get("TWILIO_PHONE_NUMBER");
        if (fromNumber) {
          formData.append("From", `whatsapp:${fromNumber}`);
        }
      }

      // Status callback
      const statusCallbackUrl = `${supabaseUrl}/functions/v1/sms-status-webhook`;
      formData.append("StatusCallback", statusCallbackUrl);

      try {
        const twilioRes = await fetch(twilioUrl, {
          method: "POST",
          headers: {
            Authorization: `Basic ${credentials}`,
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: formData.toString(),
        });

        const twilioData = await twilioRes.json();

        // Audit log
        await supabase.from("sms_audit_log").insert({
          recipient_phone: formattedPhone,
          traffic_type: "transactional",
          template_key: "whatsapp-invite",
          messaging_service_sid: messagingServiceSid || "whatsapp-direct",
          twilio_sid: twilioData.sid || null,
          status: twilioRes.ok ? (twilioData.status || "queued") : "failed",
          error_message: twilioRes.ok ? null : (twilioData.message || "Twilio error"),
          metadata: {
            channel: "whatsapp",
            friend_name: friend.name,
            sender_user_id: user.id,
          },
        });

        if (twilioRes.ok) {
          results.push({ name: friend.name, success: true });
          console.log(`[whatsapp-invite] ✅ → ${formattedPhone} (${twilioData.sid})`);
        } else {
          results.push({ name: friend.name, success: false, error: twilioData.message });
          console.error(`[whatsapp-invite] ❌ → ${formattedPhone}:`, twilioData);
        }
      } catch (sendErr) {
        results.push({
          name: friend.name,
          success: false,
          error: sendErr instanceof Error ? sendErr.message : "Send failed",
        });
      }
    }

    // Mark congrats as completed
    await supabase
      .from("creator_profiles")
      .update({ congrats_completed: "completed" })
      .eq("user_id", user.id);

    return new Response(
      JSON.stringify({ success: true, results }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("[send-whatsapp-invite] error:", err);
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : "Internal error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
