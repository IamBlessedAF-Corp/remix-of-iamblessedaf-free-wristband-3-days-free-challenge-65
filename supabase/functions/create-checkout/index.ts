import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// IP-based rate limiter: max 10 checkout sessions per hour per IP
const rateLimitMap = new Map<string, number[]>();
const RATE_LIMIT_WINDOW_MS = 3600_000;
const RATE_LIMIT_MAX = 10;

function isRateLimited(key: string): boolean {
  const now = Date.now();
  const attempts = (rateLimitMap.get(key) || []).filter(
    (t) => now - t < RATE_LIMIT_WINDOW_MS
  );
  if (attempts.length >= RATE_LIMIT_MAX) {
    rateLimitMap.set(key, attempts);
    return true;
  }
  attempts.push(now);
  rateLimitMap.set(key, attempts);
  return false;
}

setInterval(() => {
  const now = Date.now();
  for (const [key, attempts] of rateLimitMap.entries()) {
    const recent = attempts.filter((t) => now - t < RATE_LIMIT_WINDOW_MS);
    if (recent.length === 0) rateLimitMap.delete(key);
    else rateLimitMap.set(key, recent);
  }
}, 300_000);

/** Map tier keys to Stripe price IDs */
const PRICE_MAP: Record<string, string> = {
  "free-wristband": "price_1SyijPK7ifE56qrAXBoP2Fsk",
  "wristband-22": "price_1SyiicK7ifE56qrAQPNqivVe",
  "pack-111": "price_1SyiiiK7ifE56qrApLqTcZIc",
  "pack-444": "price_1SyiijK7ifE56qrACsRIy82b",
  "pack-1111": "price_1SyiikK7ifE56qrAO0C5eQIT",
  "pack-4444": "price_1SyiilK7ifE56qrApkieQ2bM",
  "monthly-11": "price_1SyjC7K7ifE56qrAEmDjOCEL",
  "kickstarter-11": "price_1T0l4cK7ifE56qrAx5B6cYUN",
  "kickstarter-1": "price_1T0l4dK7ifE56qrAqSF3wQzh",
};

const SUBSCRIPTION_TIERS = new Set(["monthly-11"]);

const SHIPPING_TIERS = new Set([
  "free-wristband", "wristband-22", "pack-111", "pack-444", "pack-1111", "pack-4444",
  "kickstarter-11", "kickstarter-1",
]);

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  // Rate limit by IP
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("cf-connecting-ip") ||
    "unknown";

  if (isRateLimited(ip)) {
    return new Response(
      JSON.stringify({ error: "Too many requests. Please try again later." }),
      { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  try {
    const { tier, coupon } = await req.json();
    if (!tier || typeof tier !== "string" || !PRICE_MAP[tier]) {
      return new Response(
        JSON.stringify({ error: "Invalid tier selected" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) {
      console.error("[create-checkout] STRIPE_SECRET_KEY not configured");
      return new Response(
        JSON.stringify({ error: "Payment service temporarily unavailable" }),
        { status: 503, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const stripe = new Stripe(stripeKey, {
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

    if (customerId) {
      sessionParams.customer = customerId;
    } else if (customerEmail) {
      sessionParams.customer_email = customerEmail;
    }

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

    // Validate coupon format if provided
    if (coupon) {
      if (typeof coupon !== "string" || coupon.length > 50) {
        return new Response(
          JSON.stringify({ error: "Invalid coupon format" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      delete sessionParams.allow_promotion_codes;
      if (isSubscription) {
        sessionParams.subscription_data = { coupon };
      } else {
        sessionParams.discounts = [{ coupon }];
      }
    }

    const session = await stripe.checkout.sessions.create(sessionParams);

    // Log checkout start for abandonment recovery
    try {
      const supabaseAdmin = createClient(
        Deno.env.get("SUPABASE_URL") ?? "",
        Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
      );
      await supabaseAdmin.from("abandoned_carts").insert({
        stripe_session_id: session.id,
        tier,
        customer_email: customerEmail || null,
        status: "pending",
      });
    } catch (e) {
      console.error("[create-checkout] Failed to log abandoned cart:", e);
    }

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("[create-checkout] Error:", error);
    return new Response(JSON.stringify({ error: "Failed to create checkout session. Please try again." }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
