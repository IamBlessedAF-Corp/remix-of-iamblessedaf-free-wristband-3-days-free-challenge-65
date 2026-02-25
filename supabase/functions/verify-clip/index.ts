import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

/** Extract YouTube video ID from various URL formats */
function extractYouTubeId(url: string): string | null {
  const patterns = [
    /youtu\.be\/([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/watch\?v=([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/,
  ];
  for (const p of patterns) {
    const m = url.match(p);
    if (m) return m[1];
  }
  return null;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { clip_url, platform, referral_code, user_id } = await req.json();

    if (!clip_url || !platform || !user_id) {
      return new Response(
        JSON.stringify({ error: "Missing required fields: clip_url, platform, user_id" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // ── YouTube verification ──────────────────────────────────────
    if (platform === "youtube") {
      const YOUTUBE_API_KEY = Deno.env.get("YOUTUBE_API_KEY");
      if (!YOUTUBE_API_KEY) {
        return new Response(
          JSON.stringify({ error: "YouTube API not configured" }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const videoId = extractYouTubeId(clip_url);
      if (!videoId) {
        return new Response(
          JSON.stringify({
            verified: false,
            reason: "invalid_url",
            message: "Could not extract a valid YouTube video ID from this URL.",
          }),
          { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // 1 quota-unit call: videos.list with snippet + status
      const ytUrl = `https://www.googleapis.com/youtube/v3/videos?part=snippet,status,statistics&id=${videoId}&key=${YOUTUBE_API_KEY}`;
      const ytRes = await fetch(ytUrl);

      if (!ytRes.ok) {
        const errBody = await ytRes.text();
        console.error("YouTube API error:", ytRes.status, errBody);
        return new Response(
          JSON.stringify({ error: "YouTube API request failed" }),
          { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const ytData = await ytRes.json();

      // ── Video exists? ──
      if (!ytData.items || ytData.items.length === 0) {
        return new Response(
          JSON.stringify({
            verified: false,
            reason: "not_found",
            message: "This video was not found. Make sure the URL is correct and the video is published.",
          }),
          { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const video = ytData.items[0];
      const privacyStatus = video.status?.privacyStatus;
      const title = (video.snippet?.title || "").toLowerCase();
      const description = (video.snippet?.description || "").toLowerCase();
      const viewCount = parseInt(video.statistics?.viewCount || "0", 10);

      // ── Public? ──
      if (privacyStatus !== "public") {
        return new Response(
          JSON.stringify({
            verified: false,
            reason: "not_public",
            message: `This video is "${privacyStatus}". It must be set to PUBLIC to qualify.`,
          }),
          { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // ── Campaign hashtag check ──
      const hasCampaignTag =
        title.includes("#3dayneurohackerchallenge") ||
        description.includes("#3dayneurohackerchallenge") ||
        title.includes("3dayneurohackerchallenge") ||
        description.includes("3dayneurohackerchallenge");

      // ── Ownership code check ──
      let ownershipVerified = false;
      if (referral_code) {
        const codeSuffix = referral_code.length > 10 ? referral_code.slice(10) : referral_code;
        const ownershipTag = `#iamblessed_${codeSuffix}`.toLowerCase();
        ownershipVerified =
          description.includes(ownershipTag) || title.includes(ownershipTag);
      }

      // ── Build checks result ──
      const checks = {
        video_exists: true,
        is_public: true,
        has_campaign_hashtag: hasCampaignTag,
        has_ownership_code: ownershipVerified,
      };

      const allPassed = hasCampaignTag && ownershipVerified;

      // ── If all passed → insert verified clip ──
      if (allPassed) {
        const { error: insertError } = await supabase.from("clip_submissions").insert({
          user_id,
          clip_url,
          platform,
          status: "verified",
          view_count: viewCount,
          baseline_view_count: viewCount,
          earnings_cents: 222, // minimum $2.22
          verified_at: new Date().toISOString(),
        });

        if (insertError) {
          console.error("Insert error:", insertError);
          return new Response(
            JSON.stringify({ error: "Failed to save clip submission" }),
            { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        return new Response(
          JSON.stringify({
            verified: true,
            checks,
            view_count: viewCount,
            message: "✅ Clip verified! You earned $2.22 minimum. Views will be tracked automatically.",
          }),
          { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // ── Some checks failed → still insert as pending ──
      const { error: insertError } = await supabase.from("clip_submissions").insert({
        user_id,
        clip_url,
        platform,
        status: "pending",
        view_count: viewCount,
        baseline_view_count: viewCount,
        earnings_cents: 0,
      });

      if (insertError) {
        console.error("Insert error:", insertError);
      }

      const failReasons: string[] = [];
      if (!hasCampaignTag) failReasons.push("Missing #3DayNeuroHackerChallenge in title or description");
      const failSuffix = referral_code ? (referral_code.length > 10 ? referral_code.slice(10) : referral_code) : "YOUR_CODE";
      if (!ownershipVerified) failReasons.push(`Missing #IAMBLESSED_${failSuffix} in description`);
      return new Response(
        JSON.stringify({
          verified: false,
          reason: "checks_failed",
          checks,
          message: `Clip saved as pending. Fix these to get verified:\n• ${failReasons.join("\n• ")}`,
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // ── Non-YouTube platforms (TikTok, IG, Other) → save as pending ──
    const { error: insertError } = await supabase.from("clip_submissions").insert({
      user_id,
      clip_url,
      platform,
      status: "pending",
      view_count: 0,
      earnings_cents: 0,
    });

    if (insertError) {
      console.error("Insert error:", insertError);
      return new Response(
        JSON.stringify({ error: "Failed to save clip submission" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({
        verified: false,
        reason: "manual_review",
        message: "Clip submitted! TikTok/IG clips are verified manually within 24h.",
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("verify-clip error:", err);
    return new Response(
      JSON.stringify({ error: err.message || "Internal error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
