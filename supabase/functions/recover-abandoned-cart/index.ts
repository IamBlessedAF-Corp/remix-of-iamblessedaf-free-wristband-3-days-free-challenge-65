import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";

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
      return new Response(JSON.stringify({ recovered: 0 }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    let recovered = 0;
    const origin = "https://funnel-architect-ai-30.lovable.app";

    for (const cart of carts) {
      if (!cart.customer_email) {
        // No email — mark as unrecoverable
        await supabase
          .from("abandoned_carts")
          .update({ status: "no_email" })
          .eq("id", cart.id);
        continue;
      }

      // Build recovery link back to the offer page
      const tierRouteMap: Record<string, string> = {
        "free-wristband": "/FREE-neuro-hacker-wristband",
        "wristband-22": "/offer/22",
        "pack-111": "/offer/111/grok",
        "pack-444": "/offer/444",
        "pack-1111": "/offer/1111",
        "pack-4444": "/offer/4444",
        "monthly-11": "/offer/11mo",
        "kickstarter-11": "/Reserve-your-Neuro-Hack-Wristband-SMART",
        "kickstarter-1": "/Reserve-a-SMART-wristband",
      };
      const route = tierRouteMap[cart.tier] || "/offer/111/grok";
      const recoveryUrl = `${origin}${route}?utm_source=recovery&utm_medium=email&utm_campaign=abandoned_cart`;

      // Send recovery email via Resend
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
                  We noticed you started checking out but didn't finish. No worries — your cart is still waiting for you.
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

        if (!emailRes.ok) {
          const errText = await emailRes.text();
          console.error(`[recover-abandoned-cart] Resend error for ${cart.id}:`, errText);
          continue;
        }
        await emailRes.text(); // consume body

        // Mark as recovery sent
        await supabase
          .from("abandoned_carts")
          .update({
            status: "recovery_sent",
            recovery_sent_at: new Date().toISOString(),
            recovery_channel: "email",
          })
          .eq("id", cart.id);

        recovered++;
      } catch (emailErr) {
        console.error(`[recover-abandoned-cart] Email send failed for ${cart.id}:`, emailErr);
      }
    }

    // Log activity
    if (recovered > 0) {
      try {
        await supabase.rpc("log_portal_activity", {
          p_event_type: "recovery",
          p_display_text: `🛒 ${recovered} abandoned cart${recovered > 1 ? "s" : ""} recovery email${recovered > 1 ? "s" : ""} sent`,
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
