import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

/**
 * send-sms — Legacy compatibility wrapper.
 * Routes all requests through the centralized sms-router for A2P 10DLC compliance.
 * Defaults to "transactional" lane unless trafficType is specified.
 */
Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const {
      to,
      message,
      recipientName,
      sourcePage,
      preferWhatsApp,
      mediaUrl,
      trafficType = "transactional",
      templateKey,
      variables,
    } = await req.json();

    if (!to || (!message && !templateKey)) {
      return new Response(
        JSON.stringify({ error: "Missing 'to' or 'message'/'templateKey' field" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Forward to sms-router
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const routerPayload: Record<string, unknown> = {
      to,
      trafficType,
      mediaUrl,
    };

    if (templateKey) {
      routerPayload.templateKey = templateKey;
      routerPayload.variables = variables || {};
    } else {
      // Ad-hoc message — use custom template
      routerPayload.templateKey = `custom-${trafficType}`;
      routerPayload.variables = { body: message };
    }

    const routerRes = await fetch(`${supabaseUrl}/functions/v1/sms-router`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${serviceRoleKey}`,
      },
      body: JSON.stringify(routerPayload),
    });

    const routerData = await routerRes.json();

    return new Response(JSON.stringify(routerData), {
      status: routerRes.status,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("send-sms error:", err);
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : "Internal error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
