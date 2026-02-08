import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

/**
 * Twilio Status Callback Webhook
 * Receives delivery status updates for SMS messages.
 * Twilio sends: MessageSid, MessageStatus, To, From, ErrorCode, ErrorMessage
 * Status values: queued, sent, delivered, undelivered, failed
 */
serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Twilio sends status callbacks as form-encoded data
    const formData = await req.formData();
    const messageSid = formData.get("MessageSid") as string;
    const messageStatus = formData.get("MessageStatus") as string;
    const errorCode = formData.get("ErrorCode") as string | null;
    const errorMessage = formData.get("ErrorMessage") as string | null;

    if (!messageSid || !messageStatus) {
      console.error("Missing MessageSid or MessageStatus in webhook");
      return new Response("Bad Request", { status: 400 });
    }

    console.log(`SMS status update: ${messageSid} → ${messageStatus}`);

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    const updatePayload: Record<string, string | null> = {
      status: messageStatus,
    };

    if (errorCode || errorMessage) {
      updatePayload.error_message = `${errorCode || ""}: ${errorMessage || ""}`.trim();
    }

    const { error } = await supabase
      .from("sms_deliveries")
      .update(updatePayload)
      .eq("twilio_sid", messageSid);

    if (error) {
      console.error("Failed to update sms_deliveries:", error);
    }

    // Twilio expects a 200 response
    return new Response("OK", { status: 200, headers: corsHeaders });
  } catch (err) {
    console.error("sms-status-webhook error:", err);
    return new Response("Internal Error", { status: 500 });
  }
});
