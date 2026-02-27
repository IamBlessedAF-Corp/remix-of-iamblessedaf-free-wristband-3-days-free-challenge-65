import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// ─── Tier → friendly label for SMS ───
const TIER_LABEL: Record<string, string> = {
  "free-wristband": "your free wristband",
  "wristband-22":   "the $22 wristband",
  "pack-111":       "the $111 pack",
  "pack-444":       "the $444 pack",
  "pack-1111":      "the $1,111 pack",
  "pack-4444":      "the $4,444 pack",
  "monthly-11":     "the $11/mo plan",
  "kickstarter-11": "your Kickstarter reservation ($11)",
  "kickstarter-1":  "your Kickstarter reservation ($1)",
};

// ─── Tier → recovery route ───
const TIER_ROUTE_MAP: Record<string, string> = {
  "free-wristband":  "/FREE-neuro-hacker-wristband",
  "wristband-22":    "/offer/22",
  "pack-111":        "/offer/111/grok",
  "pack-444":        "/offer/444",
  "pack-1111":       "/offer/1111",
  "pack-4444":       "/offer/4444",
  "monthly-11":      "/offer/11mo",
  "kickstarter-11":  "/Reserve-your-Neuro-Hack-Wristband-SMART",
  "kickstarter-1":   "/Reserve-a-SMART-wristband",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
  );

  const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
  const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY") ?? "";
  const origin = "https://funnel-architect-ai-30.lovable.app";

  try {
    // Find carts 15–60 min old that are still pending and haven't had 15-min SMS sent
    const fifteenMinAgo = new Date(Date.now() - 15 * 60 * 1000).toISOString();
    const sixtyMinAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();

    const { data: carts, error } = await supabase
      .from("abandoned_carts")
      .select("*")
      .eq("status", "pending")
      .is("sms_15min_sent_at", null)
      .lt("created_at", fifteenMinAgo)
      .gt("created_at", sixtyMinAgo) // Don't overlap with the 1-hour recovery
      .limit(50);

    if (error) throw error;

    if (!carts || carts.length === 0) {
      console.log("[send-cart-sms-15min] No carts to process");
      return new Response(JSON.stringify({ processed: 0, sent: 0 }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    let sent = 0;

    for (const cart of carts) {
      let phone: string | null = cart.customer_phone ?? null;

      // ─── Try to look up phone from creator_profiles or challenge_participants ───
      if (!phone && cart.customer_email) {
        // Check challenge_participants first (most likely to have phone)
        const { data: participant } = await supabase
          .from("challenge_participants")
          .select("phone")
          .eq("phone", cart.customer_email) // fallback: match by email via user_id join
          .maybeSingle();

        if (participant?.phone) {
          phone = participant.phone;
        }

        if (!phone) {
          // Try to look up via auth uid → challenge_participants
          // Get user_id from creator_profiles by email
          const { data: profile } = await supabase
            .from("creator_profiles")
            .select("user_id")
            .eq("email", cart.customer_email)
            .maybeSingle();

          if (profile?.user_id) {
            const { data: cp } = await supabase
              .from("challenge_participants")
              .select("phone")
              .eq("user_id", profile.user_id)
              .maybeSingle();

            if (cp?.phone) phone = cp.phone;
          }
        }
      }

      // ─── Mark as processed (even if no phone) to avoid re-processing ───
      const smsStatus = phone ? "sending" : "no_phone";
      await supabase
        .from("abandoned_carts")
        .update({
          sms_15min_sent_at: new Date().toISOString(),
          sms_15min_status: smsStatus,
          customer_phone: phone ?? cart.customer_phone,
        })
        .eq("id", cart.id);

      if (!phone) {
        console.log(`[send-cart-sms-15min] No phone for cart ${cart.id} (${cart.customer_email})`);
        continue;
      }

      const route = TIER_ROUTE_MAP[cart.tier] ?? "/offer/111/grok";
      const recoveryUrl = `${origin}${route}?utm_source=sms15&utm_medium=sms&utm_campaign=cart_15min`;
      const tierLabel = TIER_LABEL[cart.tier] ?? "your order";
      const message = `🙏 Hey! You were about to complete ${tierLabel} — your cart is still waiting. Finish here: ${recoveryUrl} (Reply STOP to opt out)`;

      try {
        const smsRes = await fetch(`${supabaseUrl}/functions/v1/sms-router`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${supabaseAnonKey}`,
          },
          body: JSON.stringify({
            to: phone,
            message,
            traffic_type: "marketing",
            template_key: "cart_abandonment_15min",
          }),
        });

        const smsOk = smsRes.ok;
        const smsResult = await smsRes.json().catch(() => ({}));

        await supabase
          .from("abandoned_carts")
          .update({
            sms_15min_status: smsOk ? "sent" : "failed",
          })
          .eq("id", cart.id);

        if (smsOk) {
          sent++;
          console.log(`[send-cart-sms-15min] SMS sent for cart ${cart.id}`);
        } else {
          console.error(`[send-cart-sms-15min] SMS failed for cart ${cart.id}:`, smsResult);
        }
      } catch (smsErr) {
        console.error(`[send-cart-sms-15min] SMS error for cart ${cart.id}:`, smsErr);
        await supabase
          .from("abandoned_carts")
          .update({ sms_15min_status: "error" })
          .eq("id", cart.id);
      }
    }

    // Log to portal activity if any sent
    if (sent > 0) {
      try {
        await supabase.rpc("log_portal_activity", {
          p_event_type: "recovery",
          p_display_text: `📱 ${sent} 15-min cart recovery SMS${sent > 1 ? "s" : ""} sent`,
          p_icon_name: "smartphone",
        });
      } catch (e) {
        console.error("[send-cart-sms-15min] Activity log error:", e);
      }
    }

    console.log(`[send-cart-sms-15min] Processed ${carts.length}, sent ${sent}`);
    return new Response(JSON.stringify({ processed: carts.length, sent }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("[send-cart-sms-15min] Fatal error:", err);
    return new Response(
      JSON.stringify({ error: "SMS processing failed" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
