import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

// ─── Tier → route map ───
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

// ─── Tier → friendly label for SMS ───
const TIER_LABEL: Record<string, string> = {
  "free-wristband": "your free wristband",
  "wristband-22":   "the $22 wristband",
  "pack-111":       "the $111 pack",
  "pack-444":       "the $444 pack",
  "pack-1111":      "the $1111 pack",
  "pack-4444":      "the $4444 pack",
  "monthly-11":     "the $11/mo plan",
  "kickstarter-11": "your Kickstarter reservation ($11)",
  "kickstarter-1":  "your Kickstarter reservation ($1)",
};

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL") || "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || ""
  );

  const resendKey = Deno.env.get("RESEND_API_KEY");
  if (!resendKey) {
    console.error("[recover-abandoned-cart] RESEND_API_KEY not configured");
    return new Response(JSON.stringify({ error: "Email service unavailable" }), {
      status: 503,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    // Find carts older than 1 hour that haven't been completed or recovered
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();

    const { data: carts, error } = await supabase
      .from("abandoned_carts")
      .select("*")
      .eq("status", "pending")
      .lt("created_at", oneHourAgo)
      .limit(50);

    if (error) throw error;
    if (!carts || carts.length === 0) {
      console.log("[recover-abandoned-cart] No pending carts to process");
      return new Response(JSON.stringify({ processed: 0, recovered: 0 }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    let recovered = 0;
    const origin = "https://funnel-architect-ai-30.lovable.app";
    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY") ?? "";

    for (const cart of carts) {
      // No email — mark as unrecoverable
      if (!cart.customer_email) {
        await supabase.from("abandoned_carts").update({ status: "no_email" }).eq("id", cart.id);
        continue;
      }

      const route = TIER_ROUTE_MAP[cart.tier] ?? "/offer/111/grok";
      const recoveryUrl = `${origin}${route}?utm_source=recovery&utm_medium=email&utm_campaign=abandoned_cart`;
      const tierLabel = TIER_LABEL[cart.tier] ?? "your order";
      let channelSent = "";

      // ─── 1. Email recovery via Resend ───
      if (resendKey) {
        try {
          const emailRes = await fetch("https://api.resend.com/emails", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${resendKey}`,
            },
            body: JSON.stringify({
              from: "I Am Blessed AF <hello@iamblessedaf.com>",
              to: [cart.customer_email],
              subject: "You left something behind 🙏 Your blessings are waiting",
              html: `
                <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 500px; margin: 0 auto; padding: 24px;">
                  <h2 style="color: #1a1a1a; margin-bottom: 8px;">Hey there 🙏</h2>
                  <p style="color: #444; line-height: 1.6;">
                    We noticed you started checking out for <strong>${tierLabel}</strong> but didn't finish. No worries — your cart is still waiting for you.
                  </p>
                  <p style="color: #444; line-height: 1.6;">
                    Every purchase feeds families in need. Your blessings ripple further than you think.
                  </p>
                  <div style="text-align: center; margin: 28px 0;">
                    <a href="${recoveryUrl}" style="background: #7c3aed; color: white; padding: 14px 32px; border-radius: 12px; text-decoration: none; font-weight: bold; font-size: 16px;">
                      Complete Your Order →
                    </a>
                  </div>
                  <p style="color: #888; font-size: 12px; text-align: center;">
                    Questions? Just reply to this email. We're real people 💜
                  </p>
                </div>
              `,
            }),
          });

          if (emailRes.ok) {
            channelSent = "email";
            console.log(`[recover-abandoned-cart] Email sent for cart ${cart.id}`);
          } else {
            const errText = await emailRes.text();
            console.error(`[recover-abandoned-cart] Resend error for ${cart.id}:`, errText);
          }
          await emailRes.text().catch(() => {});
        } catch (emailErr) {
          console.error(`[recover-abandoned-cart] Email send failed for ${cart.id}:`, emailErr);
        }
      }

      // ─── 2. SMS recovery via sms-router (if phone available) ───
      if (cart.customer_phone) {
        try {
          const smsBody = `🙏 Hey! You were so close — ${tierLabel} is still in your cart. Complete your order here: ${recoveryUrl} (Reply STOP to opt out)`;
          const smsRes = await fetch(`${supabaseUrl}/functions/v1/sms-router`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${supabaseAnonKey}`,
            },
            body: JSON.stringify({
              to: cart.customer_phone,
              message: smsBody,
              traffic_type: "marketing",
              template_key: "abandoned_cart_recovery",
            }),
          });
          if (smsRes.ok) {
            channelSent = channelSent ? `${channelSent}+sms` : "sms";
            console.log(`[recover-abandoned-cart] SMS sent for cart ${cart.id}`);
          } else {
            const errText = await smsRes.text();
            console.error(`[recover-abandoned-cart] SMS error for ${cart.id}:`, errText);
          }
        } catch (smsErr) {
          console.error(`[recover-abandoned-cart] SMS send failed for ${cart.id}:`, smsErr);
        }
      }

      // ─── Mark as recovery sent if at least one channel succeeded ───
      if (channelSent) {
        await supabase
          .from("abandoned_carts")
          .update({
            status: "recovery_sent",
            recovery_sent_at: new Date().toISOString(),
            recovery_channel: channelSent,
          })
          .eq("id", cart.id);
        recovered++;
      }
    }

    // Log activity
    if (recovered > 0) {
      try {
        await supabase.rpc("log_portal_activity", {
          p_event_type: "recovery",
          p_display_text: `🛒 ${recovered} abandoned cart${recovered > 1 ? "s" : ""} recovery sent`,
          p_icon_name: "mail",
        });
      } catch (e) {
        console.error("[recover-abandoned-cart] Activity log error:", e);
      }
    }

    console.log(`[recover-abandoned-cart] Processed ${carts.length} carts, recovered ${recovered}`);
    return new Response(JSON.stringify({ processed: carts.length, recovered }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("[recover-abandoned-cart] Error:", err);
    return new Response(JSON.stringify({ error: "Recovery processing failed" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
