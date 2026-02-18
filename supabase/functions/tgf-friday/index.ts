import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

/**
 * TGF Gratitude Fridays
 * Triggered every Friday at 7AM via pg_cron.
 * Routes through sms-router for A2P 10DLC compliance (transactional lane).
 */
Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const supabase = createClient(supabaseUrl, serviceKey);

  const results = { sent: 0, skipped: 0, errors: [] as string[] };

  try {
    // ── PAUSE GUARD: Check campaign_config ──
    const { data: pauseConfig } = await supabase
      .from("campaign_config")
      .select("value")
      .eq("key", "engagement_tgf_friday")
      .maybeSingle();

    if (pauseConfig?.value === "paused") {
      console.log("tgf-friday: PAUSED via campaign_config — skipping all sends");
      return new Response(
        JSON.stringify({ paused: true, reason: "Flow disabled in Engagement Blueprint" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { data: participants, error: pErr } = await supabase
      .from("challenge_participants")
      .select("id, phone, display_name, friend_1_name, friend_2_name, friend_3_name, user_id")
      .eq("opted_in_sms", true)
      .limit(50);

    if (pErr) {
      console.error("Error fetching participants:", pErr);
      return new Response(
        JSON.stringify({ error: pErr.message }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    for (const p of participants || []) {
      const friends = [p.friend_1_name, p.friend_2_name, p.friend_3_name].filter(Boolean) as string[];
      if (friends.length === 0) {
        results.skipped++;
        continue;
      }

      // Get existing TGF contacts to find who was texted least recently
      const { data: existingContacts } = await supabase
        .from("tgf_friday_contacts")
        .select("friend_name, last_sent_at, send_count")
        .eq("user_id", p.user_id || p.id);

      const contactMap = new Map(
        (existingContacts || []).map((c) => [c.friend_name, c])
      );

      let selectedFriend = friends[0];
      let lowestCount = Infinity;
      for (const f of friends) {
        const count = contactMap.get(f)?.send_count || 0;
        if (count < lowestCount) {
          lowestCount = count;
          selectedFriend = f;
        }
      }

      // Get referral link
      let referralLink = "https://iamblessedaf.com/challenge";
      if (p.user_id) {
        const { data: profile } = await supabase
          .from("creator_profiles")
          .select("referral_code")
          .eq("user_id", p.user_id)
          .maybeSingle();
        if (profile?.referral_code) {
          referralLink = `https://iamblessedaf.com/r/${profile.referral_code}`;
        }
      }

      // Wristband image for MMS
      const wristbandImageUrl = `${supabaseUrl}/storage/v1/object/public/board-screenshots/wristband-tgf.avif`;

      // Send via sms-router (transactional lane)
      const routerRes = await callRouter(supabaseUrl, serviceKey, {
        to: p.phone,
        trafficType: "transactional",
        templateKey: "tgf-friday",
        variables: {
          senderName: p.display_name || "Friend",
          friendName: selectedFriend,
          referralLink,
        },
        mediaUrl: wristbandImageUrl,
      });

      if (routerRes.success) {
        // Upsert TGF contact tracking
        const existingContact = contactMap.get(selectedFriend);
        if (existingContact) {
          await supabase
            .from("tgf_friday_contacts")
            .update({
              last_sent_at: new Date().toISOString(),
              send_count: (existingContact.send_count || 0) + 1,
            })
            .eq("user_id", p.user_id || p.id)
            .eq("friend_name", selectedFriend);
        } else {
          await supabase
            .from("tgf_friday_contacts")
            .insert({
              user_id: p.user_id || p.id,
              participant_id: p.id,
              friend_name: selectedFriend,
              last_sent_at: new Date().toISOString(),
              send_count: 1,
              referral_link: referralLink,
            });
        }
        results.sent++;
      } else {
        console.error(`TGF send failed for ${p.id}:`, routerRes.error);
        results.errors.push(`${p.id}: ${routerRes.error}`);
      }
    }

    console.log(`TGF Friday complete: ${results.sent} sent, ${results.skipped} skipped`);
    return new Response(JSON.stringify(results), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("tgf-friday error:", err);
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

/** Call the centralized sms-router */
async function callRouter(
  supabaseUrl: string,
  serviceKey: string,
  payload: Record<string, unknown>
): Promise<{ success: boolean; sid?: string; error?: string }> {
  try {
    const res = await fetch(`${supabaseUrl}/functions/v1/sms-router`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${serviceKey}`,
      },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (res.ok && data.success) {
      return { success: true, sid: data.sid };
    }
    return { success: false, error: data.error || "Router returned error" };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Router call failed" };
  }
}
