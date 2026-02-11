import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

/** Check if a number is US/Canada (+1) */
function isNorthAmerican(phone: string): boolean {
  return phone.startsWith("+1");
}

/** Send a WhatsApp message via Twilio */
async function sendWhatsApp(
  accountSid: string,
  authToken: string,
  fromWhatsApp: string,
  to: string,
  message: string,
  statusCallbackUrl: string
): Promise<{ ok: boolean; data: any }> {
  const twilioUrl = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`;
  const credentials = btoa(`${accountSid}:${authToken}`);

  const body = new URLSearchParams({
    To: `whatsapp:${to}`,
    From: `whatsapp:${fromWhatsApp}`,
    Body: message,
    StatusCallback: statusCallbackUrl,
  });

  const res = await fetch(twilioUrl, {
    method: "POST",
    headers: {
      Authorization: `Basic ${credentials}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: body.toString(),
  });

  const data = await res.json();
  return { ok: res.ok, data };
}

/** Send a regular SMS (or MMS with media) via Twilio */
async function sendSMS(
  accountSid: string,
  authToken: string,
  fromNumber: string,
  to: string,
  message: string,
  statusCallbackUrl: string,
  mediaUrl?: string
): Promise<{ ok: boolean; data: any; status: number }> {
  const twilioUrl = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`;
  const credentials = btoa(`${accountSid}:${authToken}`);

  const body = new URLSearchParams({
    To: to,
    From: fromNumber,
    Body: message,
    StatusCallback: statusCallbackUrl,
  });

  // Attach media for MMS if provided
  if (mediaUrl) {
    body.append("MediaUrl", mediaUrl);
  }

  const res = await fetch(twilioUrl, {
    method: "POST",
    headers: {
      Authorization: `Basic ${credentials}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: body.toString(),
  });

  const data = await res.json();
  return { ok: res.ok, data, status: res.status };
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const supabase = createClient(supabaseUrl, serviceRoleKey);

  try {
    const { to, message, recipientName, sourcePage, preferWhatsApp, mediaUrl } = await req.json();

    if (!to || !message) {
      return new Response(
        JSON.stringify({ error: "Missing 'to' or 'message' field" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const accountSid = Deno.env.get("TWILIO_ACCOUNT_SID");
    const authToken = Deno.env.get("TWILIO_AUTH_TOKEN");
    const fromNumber = Deno.env.get("TWILIO_PHONE_NUMBER");

    if (!accountSid || !authToken || !fromNumber) {
      console.error("Missing Twilio credentials");
      return new Response(
        JSON.stringify({ error: "Twilio not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Clean the phone number — ensure E.164 format
    const cleanTo = to.replace(/[^\d+]/g, "");
    if (!cleanTo.match(/^\+?\d{10,15}$/)) {
      return new Response(
        JSON.stringify({ error: "Invalid phone number format. Use E.164 (e.g. +15551234567)" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    // Auto-detect 10-digit US/Canada numbers and prepend +1
    let formattedTo: string;
    if (cleanTo.startsWith("+")) {
      formattedTo = cleanTo;
    } else if (cleanTo.length === 10) {
      // 10-digit number without country code → assume US/Canada
      formattedTo = `+1${cleanTo}`;
      console.log(`Auto-prepended +1 for 10-digit number: ${formattedTo}`);
    } else if (cleanTo.length === 11 && cleanTo.startsWith("1")) {
      // 11-digit starting with 1 → US/Canada without +
      formattedTo = `+${cleanTo}`;
    } else {
      formattedTo = `+${cleanTo}`;
    }

    const statusCallbackUrl = `${supabaseUrl}/functions/v1/sms-status-webhook`;
    const isIntl = !isNorthAmerican(formattedTo);

    // Determine channel strategy:
    // - International + preferWhatsApp (default for intl): try WhatsApp first, fall back to SMS
    // - US/Canada: always SMS
    // - Explicit preferWhatsApp=true: try WhatsApp first regardless
    const shouldTryWhatsApp = preferWhatsApp === true || (isIntl && preferWhatsApp !== false);

    let channel = "sms";
    let twilioResult: { ok: boolean; data: any; status?: number };

    if (shouldTryWhatsApp) {
      console.log(`Trying WhatsApp first for ${formattedTo}`);
      const waResult = await sendWhatsApp(
        accountSid, authToken, fromNumber, formattedTo, message, statusCallbackUrl
      );

      if (waResult.ok) {
        channel = "whatsapp";
        twilioResult = { ...waResult, status: 200 };
      } else {
        console.log(`WhatsApp failed (${waResult.data?.code || "unknown"}), falling back to SMS`);
        twilioResult = await sendSMS(
          accountSid, authToken, fromNumber, formattedTo, message, statusCallbackUrl, mediaUrl
        );
        channel = "sms";
      }
    } else {
      twilioResult = await sendSMS(
        accountSid, authToken, fromNumber, formattedTo, message, statusCallbackUrl, mediaUrl
      );
    }

    if (!twilioResult.ok) {
      console.error("Send error:", JSON.stringify(twilioResult.data));

      await supabase.from("sms_deliveries").insert({
        recipient_phone: formattedTo,
        recipient_name: recipientName || null,
        message,
        status: "failed",
        error_message: twilioResult.data.message || "Twilio API error",
        source_page: sourcePage || null,
      });

      // Provide user-friendly error for invalid numbers
      const userMessage =
        twilioResult.data.code === 21211
          ? `Invalid phone number: ${formattedTo}. Please check the country code and number are correct (e.g. +1 for US, +44 for UK, +52 for Mexico).`
          : twilioResult.data.message || "Failed to send message";

      return new Response(
        JSON.stringify({
          error: userMessage,
          code: twilioResult.data.code,
          channel,
        }),
        { status: twilioResult.status || 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Log successful send
    await supabase.from("sms_deliveries").insert({
      recipient_phone: formattedTo,
      recipient_name: recipientName || null,
      message,
      twilio_sid: twilioResult.data.sid,
      status: twilioResult.data.status || "queued",
      source_page: sourcePage || null,
    });

    return new Response(
      JSON.stringify({
        success: true,
        sid: twilioResult.data.sid,
        status: twilioResult.data.status,
        channel,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("send-sms error:", err);
    return new Response(
      JSON.stringify({ error: err.message || "Internal error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
