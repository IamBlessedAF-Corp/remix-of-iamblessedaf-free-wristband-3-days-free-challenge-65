import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";

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

/** Tiers that require shipping */
const SHIPPING_TIERS = new Set([
  "free-wristband", "wristband-22", "pack-111", "pack-444", "pack-1111", "pack-4444",
]);

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { tier, coupon } = await req.json();
    if (!tier || !PRICE_MAP[tier]) {
      throw new Error(`Invalid tier: ${tier}`);
    }

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2025-08-27.basil",
    });

    // Try to get user email from auth token
    let customerEmail: string | undefined;
    let customerId: string | undefined;
    const authHeader = req.headers.get("Authorization");
    if (authHeader) {
      try {
        const supabaseClient = createClient(
          Deno.env.get("SUPABASE_URL") ?? "",
          Deno.env.get("SUPABASE_ANON_KEY") ?? ""
        );
        const token = authHeader.replace("Bearer ", "");
        const { data } = await supabaseClient.auth.getUser(token);
        if (data.user?.email) {
          customerEmail = data.user.email;
          // Check if Stripe customer already exists
          const customers = await stripe.customers.list({ email: customerEmail, limit: 1 });
          if (customers.data.length > 0) {
            customerId = customers.data[0].id;
          }
        }
      } catch (e) {
        console.log("[create-checkout] Auth lookup skipped:", e);
      }
    }

    const origin = req.headers.get("origin") || "https://funnel-architect-ai-30.lovable.app";
    const isSubscription = SUBSCRIPTION_TIERS.has(tier);
    const needsShipping = SHIPPING_TIERS.has(tier);

    // Ensure promotion codes exist for our test coupons
    const TEST_COUPONS: Record<string, string> = {
      "HKTN04UP": "HKTn04up",
      "TESTFUNNEL": "HKTn04up",
    };

    for (const [code, couponId] of Object.entries(TEST_COUPONS)) {
      try {
        const existing = await stripe.promotionCodes.list({ code, limit: 1 });
        if (existing.data.length === 0) {
          await stripe.promotionCodes.create({ coupon: couponId, code });
          console.log(`[create-checkout] Created promo code: ${code}`);
        }
      } catch (e) {
        console.log(`[create-checkout] Promo code ${code} setup skipped:`, e);
      }
    }

    const sessionParams: any = {
      line_items: [{ price: PRICE_MAP[tier], quantity: 1 }],
      mode: isSubscription ? "subscription" : "payment",
      success_url: `${origin}/offer/success?tier=${tier}`,
      cancel_url: `${origin}/offer/22`,
      metadata: { tier },
      allow_promotion_codes: true,
    };

    // Pre-fill customer email or attach existing Stripe customer
    if (customerId) {
      sessionParams.customer = customerId;
    } else if (customerEmail) {
      sessionParams.customer_email = customerEmail;
    }

    // Collect shipping address for physical product tiers
    if (needsShipping) {
      sessionParams.shipping_address_collection = {
        allowed_countries: [
          "US", "CA", "MX", "GB", "DE", "FR", "ES", "IT", "NL", "AU",
          "BR", "CO", "AR", "CL", "PE", "JP", "KR", "IN", "PH", "SG",
          "AE", "SA", "ZA", "NG", "SE", "NO", "DK", "FI", "IE", "PT",
          "AT", "CH", "BE", "PL", "CZ", "NZ", "IL", "TH", "MY", "HK",
        ],
      };
    }

    // Apply coupon directly if provided from frontend
    if (coupon) {
      delete sessionParams.allow_promotion_codes;
      if (isSubscription) {
        sessionParams.subscription_data = { coupon };
      } else {
        sessionParams.discounts = [{ coupon }];
      }
    }

    const session = await stripe.checkout.sessions.create(sessionParams);

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
