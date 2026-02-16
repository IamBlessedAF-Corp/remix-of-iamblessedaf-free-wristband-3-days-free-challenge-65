import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

// IP-based rate limiter: max 5 requests per hour per IP
const rateLimitMap = new Map<string, number[]>();
const RATE_LIMIT_WINDOW_MS = 3600_000;
const RATE_LIMIT_MAX = 5;

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
    const { phone, friends, gratitudeMemory, fullMessage } = await req.json();

    // ── Validate ──
    if (!phone || typeof phone !== "string" || phone.length < 10 || phone.length > 20) {
      return new Response(
        JSON.stringify({ error: "Valid phone number required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    if (!friends?.friend1 || typeof friends.friend1 !== "string" || friends.friend1.length > 100) {
      return new Response(
        JSON.stringify({ error: "At least one friend name required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    if (!fullMessage || typeof fullMessage !== "string" || fullMessage.length > 5000) {
      return new Response(
        JSON.stringify({ error: "Message body required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // ── Get auth user if available ──
    let userId: string | null = null;
    const authHeader = req.headers.get("Authorization");
    if (authHeader) {
      const { data: { user } } = await supabase.auth.getUser(
        authHeader.replace("Bearer ", "")
      );
      userId = user?.id ?? null;
    }

    // ── Create participant ──
    const tomorrowDate = new Date(Date.now() + 86_400_000)
      .toISOString()
      .split("T")[0];

    const { data: participant, error: pErr } = await supabase
      .from("challenge_participants")
      .insert({
        user_id: userId,
        phone: phone.trim(),
        friend_1_name: friends.friend1.trim().slice(0, 100),
        friend_2_name: friends.friend2?.trim().slice(0, 100) || null,
        friend_3_name: friends.friend3?.trim().slice(0, 100) || null,
        opted_in_sms: true,
        challenge_start_date: tomorrowDate,
        challenge_status: "active",
      })
      .select()
      .single();

    if (pErr) {
      console.error("[schedule-challenge-messages] Insert error:", pErr);
      return new Response(
        JSON.stringify({ error: "Failed to join challenge. Please try again." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // ── Create scheduled messages ──
    const now = new Date();
    const messages: Array<{
      participant_id: string;
      day_number: number;
      friend_name: string;
      message_body: string;
      scheduled_send_at: string;
      reminder_send_at: string;
      status: string;
    }> = [];

    messages.push({
      participant_id: participant.id,
      day_number: 1,
      friend_name: friends.friend1.trim(),
      message_body: fullMessage,
      scheduled_send_at: getNextDateTime(now, 1, 11, 11),
      reminder_send_at: getNextDateTime(now, 0, 15, 0),
      status: "scheduled",
    });

    if (friends.friend2) {
      messages.push({
        participant_id: participant.id,
        day_number: 2,
        friend_name: friends.friend2.trim(),
        message_body: "",
        scheduled_send_at: getNextDateTime(now, 2, 11, 11),
        reminder_send_at: getNextDateTime(now, 1, 15, 0),
        status: "draft",
      });
    }

    if (friends.friend3) {
      messages.push({
        participant_id: participant.id,
        day_number: 3,
        friend_name: friends.friend3.trim(),
        message_body: "",
        scheduled_send_at: getNextDateTime(now, 3, 11, 11),
        reminder_send_at: getNextDateTime(now, 2, 15, 0),
        status: "draft",
      });
    }

    const { error: mErr } = await supabase
      .from("scheduled_gratitude_messages")
      .insert(messages);
    if (mErr) {
      console.error("[schedule-challenge-messages] Message insert error:", mErr);
    }

    // ── Follow-up sequences ──
    if (!friends.friend2 || !friends.friend3) {
      const followups = [];
      const baseDate = new Date();

      if (!friends.friend2) {
        const schedAt = new Date(baseDate);
        schedAt.setDate(schedAt.getDate() + 2);
        schedAt.setHours(10, 0, 0, 0);
        followups.push({
          participant_id: participant.id,
          sequence_type: "friend_collection",
          step_number: 1,
          scheduled_at: schedAt.toISOString(),
          channel: "sms",
        });
      }

      if (!friends.friend3) {
        const schedAt = new Date(baseDate);
        schedAt.setDate(schedAt.getDate() + 3);
        schedAt.setHours(10, 0, 0, 0);
        followups.push({
          participant_id: participant.id,
          sequence_type: "friend_collection",
          step_number: 2,
          scheduled_at: schedAt.toISOString(),
          channel: "sms",
        });
      }

      if (followups.length > 0) {
        await supabase.from("followup_sequences").insert(followups);
      }
    }

    // ── Send welcome SMS via sms-router ──
    await callRouter(supabaseUrl, supabaseServiceKey, {
      to: phone.trim(),
      trafficType: "transactional",
      templateKey: "challenge-welcome",
      variables: {
        friendName: friends.friend1.trim(),
      },
    });

    return new Response(
      JSON.stringify({
        success: true,
        participantId: participant.id,
        messagesScheduled: messages.length,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("schedule-challenge-messages error:", error);
    return new Response(
      JSON.stringify({ error: "Something went wrong. Please try again." }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

function getNextDateTime(
  from: Date,
  daysAhead: number,
  hour: number,
  minute: number
): string {
  const d = new Date(from);
  d.setDate(d.getDate() + daysAhead);
  d.setHours(hour, minute, 0, 0);
  return d.toISOString();
}

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
