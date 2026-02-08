import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const supabase = createClient(supabaseUrl, serviceRoleKey);

  try {
    const { to, message, recipientName, sourcePage } = await req.json();

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
    const formattedTo = cleanTo.startsWith("+") ? cleanTo : `+${cleanTo}`;

    // Build the status callback URL for Twilio delivery updates
    const statusCallbackUrl = `${supabaseUrl}/functions/v1/sms-status-webhook`;

    // Send SMS via Twilio REST API
    const twilioUrl = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`;
    const credentials = btoa(`${accountSid}:${authToken}`);

    const body = new URLSearchParams({
      To: formattedTo,
      From: fromNumber,
      Body: message,
      StatusCallback: statusCallbackUrl,
    });

    const twilioRes = await fetch(twilioUrl, {
      method: "POST",
      headers: {
        Authorization: `Basic ${credentials}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: body.toString(),
    });

    const twilioData = await twilioRes.json();

    if (!twilioRes.ok) {
      console.error("Twilio error:", JSON.stringify(twilioData));

      // Log failed delivery
      await supabase.from("sms_deliveries").insert({
        recipient_phone: formattedTo,
        recipient_name: recipientName || null,
        message,
        status: "failed",
        error_message: twilioData.message || "Twilio API error",
        source_page: sourcePage || null,
      });

      return new Response(
        JSON.stringify({
          error: twilioData.message || "Failed to send SMS",
          code: twilioData.code,
        }),
        { status: twilioRes.status, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Log successful send
    await supabase.from("sms_deliveries").insert({
      recipient_phone: formattedTo,
      recipient_name: recipientName || null,
      message,
      twilio_sid: twilioData.sid,
      status: twilioData.status || "queued",
      source_page: sourcePage || null,
    });

    return new Response(
      JSON.stringify({
        success: true,
        sid: twilioData.sid,
        status: twilioData.status,
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
