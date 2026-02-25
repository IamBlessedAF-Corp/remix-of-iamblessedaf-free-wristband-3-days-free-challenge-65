import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Extract YouTube video ID from various URL formats
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

  const YOUTUBE_API_KEY = Deno.env.get("YOUTUBE_API_KEY");
  if (!YOUTUBE_API_KEY) {
    console.error("YOUTUBE_API_KEY not configured");
    return new Response(JSON.stringify({ error: "YouTube API key not configured" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  try {
    // Get all YouTube clips that are pending or verified
    // Fetch YouTube clips with their owner's referral code for ownership re-check
    const { data: clips, error } = await supabase
      .from("clip_submissions")
      .select("id, clip_url, view_count, baseline_view_count, status, user_id")
      .eq("platform", "youtube")
      .in("status", ["pending", "verified"]);

    if (error) throw error;
    if (!clips || clips.length === 0) {
      return new Response(JSON.stringify({ message: "No YouTube clips to verify", updated: 0 }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Extract video IDs
    // Extract video IDs and map clips
    const clipMap = new Map<string, typeof clips[0]>();
    const videoIds: string[] = [];
    const userIds = new Set<string>();
    for (const clip of clips) {
      const vid = extractYouTubeId(clip.clip_url);
      if (vid) {
        videoIds.push(vid);
        clipMap.set(vid, clip);
        userIds.add(clip.user_id);
      }
    }

    // Pre-fetch referral codes for all users
    const { data: profiles } = await supabase
      .from("creator_profiles")
      .select("user_id, referral_code")
      .in("user_id", Array.from(userIds));

    const referralMap = new Map<string, string>();
    for (const p of profiles || []) {
      referralMap.set(p.user_id, p.referral_code);
    }

    if (videoIds.length === 0) {
      return new Response(JSON.stringify({ message: "No valid YouTube IDs found", updated: 0 }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Batch fetch from YouTube Data API (max 50 per request)
    let updated = 0;
    for (let i = 0; i < videoIds.length; i += 50) {
      const batch = videoIds.slice(i, i + 50);
      const ytUrl = `https://www.googleapis.com/youtube/v3/videos?part=statistics,snippet&id=${batch.join(",")}&key=${YOUTUBE_API_KEY}`;
      
      const ytRes = await fetch(ytUrl);
      if (!ytRes.ok) {
        const errBody = await ytRes.text();
        console.error(`YouTube API error: ${ytRes.status} ${errBody}`);
        continue;
      }

      const ytData = await ytRes.json();
      
      for (const item of ytData.items || []) {
        const clip = clipMap.get(item.id);
        if (!clip) continue;

        const liveViewCount = parseInt(item.statistics?.viewCount || "0", 10);
        const description = (item.snippet?.description || "").toLowerCase();
        
        // Check campaign hashtag
        const hasCampaignTag = description.includes("#3dayneurohackerchallenge") || 
                               description.includes("3dayneurohackerchallenge");

        // Check ownership code: #IAMBLESSED_{4-char suffix}
        const userRefCode = referralMap.get(clip.user_id);
        const codeSuffix = userRefCode && userRefCode.length > 10 ? userRefCode.slice(10) : userRefCode;
        const hasOwnership = codeSuffix
          ? description.includes(`#iamblessed_${codeSuffix}`.toLowerCase())
          : false;

        // Update view count
        const updateData: Record<string, any> = {
          view_count: liveViewCount,
          updated_at: new Date().toISOString(),
        };

        // If baseline is 0 and this is the first check, set baseline
        if (clip.baseline_view_count === 0 && clip.status === "pending") {
          updateData.baseline_view_count = liveViewCount;
        }

        // Auto-verify if both tags are present and clip is pending
        if (hasCampaignTag && hasOwnership && clip.status === "pending") {
          updateData.status = "verified";
          updateData.verified_at = new Date().toISOString();
          
          // Calculate net views for activation check
          const baseline = updateData.baseline_view_count || clip.baseline_view_count || 0;
          const netViews = Math.max(0, liveViewCount - baseline);
          updateData.net_views = netViews;
          
          // Earnings only activate after 1,000+ net views
          // Other quality thresholds (CTR, RegRate, Day1Post) are checked during weekly payout
          if (netViews >= 1000) {
            const rpmEarnings = Math.round((netViews / 1000) * 22);
            updateData.earnings_cents = Math.max(222, rpmEarnings);
            updateData.is_activated = true;
          } else {
            // Verified but not yet earning — needs more views
            updateData.earnings_cents = 0;
            updateData.is_activated = false;
          }
        }
        
        // Also update earnings for already-verified clips based on current views
        if (clip.status === "verified" && !hasCampaignTag) {
          // Already verified, just update view-based earnings
          const baseline = clip.baseline_view_count || 0;
          const netViews = Math.max(0, liveViewCount - baseline);
          updateData.net_views = netViews;
          
          if (netViews >= 1000) {
            const rpmEarnings = Math.round((netViews / 1000) * 22);
            updateData.earnings_cents = Math.max(222, rpmEarnings);
            updateData.is_activated = true;
          } else {
            updateData.earnings_cents = 0;
            updateData.is_activated = false;
          }
        }

        const { error: updateError } = await supabase
          .from("clip_submissions")
          .update(updateData)
          .eq("id", clip.id);

        if (updateError) {
          console.error(`Failed to update clip ${clip.id}:`, updateError);
        } else {
          updated++;
        }
      }
    }

    return new Response(JSON.stringify({ 
      message: `Verified ${updated} YouTube clips`,
      updated,
      total: clips.length,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Error in verify-youtube-views:", err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
