import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Eye, ExternalLink, Play, Copy, Check, TrendingUp, Repeat2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { motion } from "framer-motion";

interface TopClip {
  id: string;
  clip_url: string;
  platform: string;
  view_count: number;
  submitted_at: string;
}

interface Props {
  userId: string;
  referralLink?: string | null;
  referralCode?: string | null;
}

const platformIcons: Record<string, string> = {
  tiktok: "🎵",
  instagram: "📸",
  youtube: "▶️",
  other: "🎬",
};

const ClipperRepostGallery = ({ userId, referralLink, referralCode }: Props) => {
  const [clips, setClips] = useState<TopClip[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [repostedIds, setRepostedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    const fetchTopClips = async () => {
      // Fetch top 20 verified clips by view_count
      const { data } = await supabase
        .from("clip_submissions")
        .select("id, clip_url, platform, view_count, submitted_at")
        .eq("status", "verified")
        .order("view_count", { ascending: false })
        .limit(20);
      setClips(data || []);
      setLoading(false);
    };

    const fetchUserReposts = async () => {
      const { data } = await supabase
        .from("repost_logs")
        .select("clip_id")
        .eq("user_id", userId);
      if (data) {
        setRepostedIds(new Set(data.map((r) => r.clip_id)));
      }
    };

    fetchTopClips();
    fetchUserReposts();
  }, [userId]);

  const handleCopyCaption = (clip: TopClip) => {
    const link = referralLink || "https://iamblessedaf.com/challenge";
    const ownershipTag = referralCode ? `#IAMBLESSED_${referralCode}` : "#IAMBLESSED_YOURCODE";
    const caption = `🧠 Gratitude rewires your brain. Science says so.\n\nJoin the FREE 3-Day Neuro-Hacker Challenge → ${link}\n\n#3DayNeuroHackerChallenge ${ownershipTag} #IamBlessedAF #GratitudeChallenge #${clip.platform === "tiktok" ? "fyp" : clip.platform === "youtube" ? "Shorts" : "Reels"}`;
    navigator.clipboard.writeText(caption);
    setCopiedId(clip.id);
    toast.success("Caption copied with your referral link! 🔗");
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleLogRepost = async (clip: TopClip) => {
    await supabase.from("repost_logs").insert({
      user_id: userId,
      clip_id: clip.id,
      clip_title: `${clip.platform} clip`,
      referral_link: referralLink || null,
    });
    setRepostedIds((prev) => new Set([...prev, clip.id]));
    toast.success("Repost logged! 🎬 Your views will be tracked.");
  };

  const formatViews = (v: number) => {
    if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(1)}M`;
    if (v >= 1_000) return `${(v / 1_000).toFixed(1)}k`;
    return v.toString();
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <p className="text-sm text-muted-foreground">Loading top clips...</p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 bg-primary/15 border border-primary/30 rounded-full px-4 py-1.5">
          <Repeat2 className="w-4 h-4 text-primary" />
          <span className="text-primary font-semibold text-sm">Top Clips to Remix & Repost</span>
        </div>
        <h2 className="text-2xl font-bold">🔥 Campaign's Top 20 Clips</h2>
        <p className="text-sm text-muted-foreground max-w-md mx-auto">
          Repost these winning clips on your own account. Add your referral link in the caption → <strong className="text-foreground">you earn on the views.</strong>
        </p>
      </div>

      {/* Referral Link Reminder */}
      {referralLink && (
        <div className="bg-primary/5 border border-primary/20 rounded-xl p-3 text-center">
          <p className="text-xs text-muted-foreground mb-1">Your link is auto-included when you copy captions:</p>
          <p className="text-xs text-primary font-mono font-bold truncate">{referralLink}</p>
        </div>
      )}

      {clips.length === 0 ? (
        <div className="text-center py-12 bg-card border border-border/50 rounded-2xl">
          <Play className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground">No verified clips yet. Be the first to submit!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {clips.map((clip, i) => {
            const isReposted = repostedIds.has(clip.id);
            return (
              <motion.div
                key={clip.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
                className={`bg-card border rounded-xl p-3.5 flex items-center gap-3 ${isReposted ? 'border-emerald-500/30 bg-emerald-500/5' : 'border-border/50'}`}
              >
                {/* Rank */}
                <div className="w-7 h-7 rounded-full bg-secondary flex items-center justify-center shrink-0">
                  <span className="text-xs font-bold text-foreground">#{i + 1}</span>
                </div>

                {/* Platform + Date */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm">{platformIcons[clip.platform] || "🎬"}</span>
                    <p className="text-xs font-semibold text-foreground capitalize">{clip.platform}</p>
                    {isReposted && (
                      <Badge className="text-[9px] bg-emerald-500/15 text-emerald-500 border-emerald-500/30">
                        ✓ Reposted
                      </Badge>
                    )}
                  </div>
                  <p className="text-[10px] text-muted-foreground">
                    {new Date(clip.submitted_at).toLocaleDateString()}
                  </p>
                </div>

                {/* Views */}
                <div className="text-center shrink-0">
                  <div className="flex items-center gap-0.5 text-muted-foreground">
                    <Eye className="w-3 h-3" />
                    <span className="text-xs font-bold text-foreground">{formatViews(clip.view_count)}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1.5 shrink-0">
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-[10px] h-7 px-2 gap-1"
                    onClick={() => handleCopyCaption(clip)}
                  >
                    {copiedId === clip.id ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                    {copiedId === clip.id ? "Copied" : "Caption"}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-[10px] h-7 px-2 gap-1"
                    asChild
                  >
                    <a href={clip.clip_url} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="w-3 h-3" />
                      View
                    </a>
                  </Button>
                  {!isReposted && (
                    <Button
                      size="sm"
                      className="text-[10px] h-7 px-2 gap-1 bg-primary text-primary-foreground"
                      onClick={() => handleLogRepost(clip)}
                    >
                      <TrendingUp className="w-3 h-3" />
                      Log Repost
                    </Button>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Instructions */}
      <div className="bg-secondary/30 border border-border/30 rounded-xl p-4 space-y-2">
        <p className="text-sm font-semibold text-foreground">📋 How to Repost & Earn</p>
        <ol className="text-xs text-muted-foreground space-y-1 list-decimal list-inside">
          <li>Click <strong className="text-foreground">"View"</strong> to watch/download the original clip</li>
          <li>Remix it (add your CTA overlay in the last 3-5 sec)</li>
          <li>Click <strong className="text-foreground">"Caption"</strong> to copy the pre-written caption with your referral link</li>
          <li>Post on TikTok / Reels / Shorts with <strong className="text-primary">#3DayNeuroHackerChallenge</strong></li>
          <li>Click <strong className="text-foreground">"Log Repost"</strong> to track it, then submit via Dashboard</li>
        </ol>
      </div>
    </div>
  );
};

export default ClipperRepostGallery;
