import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
  apiVersion: "2025-08-27.basil",
});

const supabase = createClient(
  Deno.env.get("SUPABASE_URL") || "",
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || ""
);

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const signature = req.headers.get("stripe-signature");
  const webhookSecret = Deno.env.get("WEBHOOK_SECRET");

  if (!signature || !webhookSecret) {
    console.error("[stripe-webhook] Missing signature or webhook secret");
    return new Response("Missing signature or secret", { status: 400 });
  }

  const body = await req.text();
  let event: Stripe.Event;

  try {
    event = await stripe.webhooks.constructEventAsync(body, signature, webhookSecret);
  } catch (err) {
    console.error("[stripe-webhook] Signature verification failed:", err);
    return new Response(`Webhook signature verification failed`, { status: 400 });
  }

  console.log(`[stripe-webhook] Received event: ${event.type}`);

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const tier = session.metadata?.tier || "unknown";
    const amountTotal = session.amount_total || 0;
    const currency = session.currency || "usd";
    const customerEmail = session.customer_details?.email || null;
    const stripeCustomerId = typeof session.customer === "string" ? session.customer : null;

    console.log(`[stripe-webhook] Checkout completed: tier=${tier}, amount=${amountTotal}, email=${customerEmail}`);

    // Insert order record
    const { error: orderError } = await supabase.from("orders").insert({
      stripe_session_id: session.id,
      tier,
      amount_cents: amountTotal,
      currency,
      customer_email: customerEmail,
      stripe_customer_id: stripeCustomerId,
      status: "completed",
    });

    if (orderError) {
      console.error("[stripe-webhook] Order insert error:", orderError);
    } else {
      console.log("[stripe-webhook] Order recorded successfully");
    }

    // Log portal activity
    try {
      await supabase.rpc("log_portal_activity", {
        p_event_type: "purchase",
        p_display_text: `Someone just grabbed the ${tier} pack! 🎉`,
        p_icon_name: "shopping-bag",
      });
    } catch (e) {
      console.error("[stripe-webhook] Activity log error:", e);
    }
  }

  return new Response(JSON.stringify({ received: true }), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
    status: 200,
  });
});
