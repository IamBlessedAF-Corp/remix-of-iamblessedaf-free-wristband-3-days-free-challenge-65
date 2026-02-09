import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

/** Map tier keys to Stripe price IDs */
const PRICE_MAP: Record<string, string> = {
  "free-wristband": "price_1SyijPK7ifE56qrAXBoP2Fsk",
  "wristband-22": "price_1SyiicK7ifE56qrAQPNqivVe",
  "pack-111": "price_1SyiiiK7ifE56qrApLqTcZIc",
  "pack-444": "price_1SyiijK7ifE56qrACsRIy82b",
  "pack-1111": "price_1SyiikK7ifE56qrAO0C5eQIT",
  "pack-4444": "price_1SyiilK7ifE56qrApkieQ2bM",
  "monthly-11": "price_1SyjC7K7ifE56qrAEmDjOCEL",
};

/** Tiers that use subscription mode */
const SUBSCRIPTION_TIERS = new Set(["monthly-11"]);

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { tier } = await req.json();
    if (!tier || !PRICE_MAP[tier]) {
      throw new Error(`Invalid tier: ${tier}`);
    }

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2025-08-27.basil",
    });

    const origin = req.headers.get("origin") || "https://funnel-architect-ai-30.lovable.app";
    const isSubscription = SUBSCRIPTION_TIERS.has(tier);

    const session = await stripe.checkout.sessions.create({
      line_items: [{ price: PRICE_MAP[tier], quantity: 1 }],
      mode: isSubscription ? "subscription" : "payment",
      success_url: `${origin}/offer/success?tier=${tier}`,
      cancel_url: `${origin}/offer/22`,
      metadata: { tier },
    });

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("[create-checkout] Error:", message);
    return new Response(JSON.stringify({ error: message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
