import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Video, Play, Copy, Check, ExternalLink, Eye, TrendingUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

import thumbBrainRewire from "@/assets/vault-thumb-brain-rewire.jpg";
import thumbNeuro from "@/assets/vault-thumb-neuro-thankyou.jpg";
import thumbMorning from "@/assets/vault-thumb-morning.jpg";
import thumbDopamine from "@/assets/vault-thumb-dopamine.jpg";
import thumbSuccess from "@/assets/vault-thumb-success.jpg";
import thumbMindset from "@/assets/vault-thumb-mindset.jpg";
import TopPerformingClips from "@/components/portal/TopPerformingClips";

type Category = "all" | "gratitude" | "neuroscience" | "mindset" | "morning" | "dopamine" | "success";

interface VaultClip {
  id: string;
  title: string;
  category: Category;
  thumbnail: string;
  duration: string;
  views: string;
  reposts: number;
  previewUrl: string;
}

const CATEGORIES: { id: Category; label: string }[] = [
  { id: "all", label: "All" },
  { id: "gratitude", label: "Gratitude Science" },
  { id: "neuroscience", label: "Neuroscience" },
  { id: "mindset", label: "Mindset Shifts" },
  { id: "morning", label: "Morning Routines" },
  { id: "dopamine", label: "Dopamine Reset" },
  { id: "success", label: "Success Stories" },
];

const PLACEHOLDER_CLIPS: VaultClip[] = [
  { id: "1", title: "Why Gratitude Rewires Your Brain in 21 Days", category: "gratitude", thumbnail: thumbBrainRewire, duration: "0:58", views: "2.4M", reposts: 847, previewUrl: "https://www.tiktok.com/@iamblessedaf" },
  { id: "2", title: "The Neuroscience Behind 'Thank You'", category: "neuroscience", thumbnail: thumbNeuro, duration: "1:12", views: "1.8M", reposts: 623, previewUrl: "https://www.tiktok.com/@iamblessedaf" },
  { id: "3", title: "Morning Gratitude = 31% More Productive", category: "morning", thumbnail: thumbMorning, duration: "0:45", views: "3.1M", reposts: 1204, previewUrl: "https://www.tiktok.com/@iamblessedaf" },
  { id: "4", title: "Dopamine Detox: Reset Your Reward System", category: "dopamine", thumbnail: thumbDopamine, duration: "1:30", views: "5.2M", reposts: 2103, previewUrl: "https://www.tiktok.com/@iamblessedaf" },
  { id: "5", title: "How Billionaires Use Gratitude Journals", category: "success", thumbnail: thumbSuccess, duration: "0:52", views: "1.1M", reposts: 412, previewUrl: "https://www.tiktok.com/@iamblessedaf" },
  { id: "6", title: "Reframe Negative Thoughts in 60 Seconds", category: "mindset", thumbnail: thumbMindset, duration: "1:01", views: "4.7M", reposts: 1856, previewUrl: "https://www.tiktok.com/@iamblessedaf" },
  { id: "7", title: "Huberman: Gratitude Changes Brain Chemistry", category: "neuroscience", thumbnail: thumbNeuro, duration: "1:15", views: "6.3M", reposts: 3201, previewUrl: "https://www.tiktok.com/@iamblessedaf" },
  { id: "8", title: "5-Minute Morning Hack Tony Robbins Swears By", category: "morning", thumbnail: thumbMorning, duration: "0:47", views: "2.9M", reposts: 998, previewUrl: "https://www.tiktok.com/@iamblessedaf" },
  { id: "9", title: "Why Saying 'I Am Blessed' Activates Your RAS", category: "gratitude", thumbnail: thumbBrainRewire, duration: "0:39", views: "1.5M", reposts: 567, previewUrl: "https://www.tiktok.com/@iamblessedaf" },
  { id: "10", title: "Joe Dispenza: Rewire Your Identity in 7 Days", category: "mindset", thumbnail: thumbMindset, duration: "1:22", views: "8.1M", reposts: 4102, previewUrl: "https://www.tiktok.com/@iamblessedaf" },
  { id: "11", title: "The $33 Wristband That Feeds 111 People", category: "success", thumbnail: thumbSuccess, duration: "0:55", views: "920K", reposts: 345, previewUrl: "https://www.tiktok.com/@iamblessedaf" },
  { id: "12", title: "Dopamine Stacking: The Gratitude Loop", category: "dopamine", thumbnail: thumbDopamine, duration: "1:08", views: "3.4M", reposts: 1432, previewUrl: "https://www.tiktok.com/@iamblessedaf" },
];

interface ContentVaultProps {
  referralCode?: string;
  userId?: string;
}

const ContentVault = ({ referralCode, userId }: ContentVaultProps) => {
  const [activeCategory, setActiveCategory] = useState<Category>("all");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [userRepostCount, setUserRepostCount] = useState(0);

  useEffect(() => {
    if (!userId) return;
    const fetchCount = async () => {
      const { count } = await supabase
        .from("repost_logs")
        .select("*", { count: "exact", head: true })
        .eq("user_id", userId);
      setUserRepostCount(count ?? 0);
    };
    fetchCount();
  }, [userId]);

  const filtered = activeCategory === "all"
    ? PLACEHOLDER_CLIPS
    : PLACEHOLDER_CLIPS.filter((c) => c.category === activeCategory);

  const referralLink = referralCode
    ? `https://iamblessedaf.com/go/${referralCode}`
    : "https://iamblessedaf.com/offer/111";

  const handleCopyLink = async (clip: VaultClip) => {
    const ownershipTag = referralCode ? `#IAMBLESSED_${referralCode}` : "";
    const text = `Check this out 🙏 ${referralLink}\n\n#3DayNeuroHackerChallenge ${ownershipTag} #IamBlessedAF`;
    navigator.clipboard.writeText(text);
    setCopiedId(clip.id);
    toast.success("Caption + referral link copied!");
    setTimeout(() => setCopiedId(null), 2000);

    if (userId) {
      await supabase.from("repost_logs").insert({
        user_id: userId,
        clip_id: clip.id,
        clip_title: clip.title,
        referral_link: referralLink,
      });
      setUserRepostCount((prev) => prev + 1);
    }
  };

  const totalReposts = PLACEHOLDER_CLIPS.reduce((s, c) => s + c.reposts, 0);

  return (
    <div className="space-y-5">
      {/* Header stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Available Clips", value: PLACEHOLDER_CLIPS.length, icon: Video },
          { label: "Total Reposts", value: totalReposts.toLocaleString(), icon: TrendingUp },
          { label: "Your Reposts", value: userRepostCount.toString(), icon: Eye },
        ].map((stat, i) => (
          <div key={i} className="bg-card border border-border/40 rounded-xl p-3 text-center">
            <stat.icon className="w-4 h-4 text-primary mx-auto mb-1" />
            <p className="text-lg font-bold text-foreground">{stat.value}</p>
            <p className="text-[10px] text-muted-foreground">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* How it works */}
      <div className="bg-primary/5 border border-primary/20 rounded-xl p-4">
        <h4 className="text-sm font-bold text-foreground mb-2">How Repost & Earn Works</h4>
        <div className="grid grid-cols-3 gap-2 text-center">
          {[
            { step: "1", text: "Pick a clip from the vault" },
            { step: "2", text: "Copy caption + your referral link" },
            { step: "3", text: "Post on TikTok / Reels / Shorts" },
          ].map((s) => (
            <div key={s.step}>
              <div className="w-7 h-7 rounded-full bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center mx-auto mb-1">
                {s.step}
              </div>
              <p className="text-[10px] text-muted-foreground leading-tight">{s.text}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Category filter */}
      <div className="flex gap-1.5 overflow-x-auto pb-1 -mx-1 px-1">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
              activeCategory === cat.id
                ? "bg-primary text-primary-foreground"
                : "bg-secondary text-muted-foreground hover:text-foreground"
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Clip grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {filtered.map((clip, i) => (
          <motion.div
            key={clip.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.04 }}
            className="bg-card border border-border/40 rounded-xl overflow-hidden hover:border-primary/30 transition-all group"
          >
            {/* Thumbnail area */}
            <div className="relative h-32 overflow-hidden">
              <img
                src={clip.thumbnail}
                alt={clip.title}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-black/10 group-hover:bg-black/30 transition-all flex items-center justify-center">
                <Play className="w-10 h-10 text-white opacity-0 group-hover:opacity-90 transition-opacity drop-shadow-lg" />
              </div>
              <Badge className="absolute top-2 right-2 bg-black/60 text-white text-[10px] border-0">
                {clip.duration}
              </Badge>
            </div>

            {/* Info */}
            <div className="p-3 space-y-2">
              <h4 className="text-sm font-semibold text-foreground leading-tight line-clamp-2">
                {clip.title}
              </h4>
              <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
                <span className="flex items-center gap-0.5"><Eye className="w-3 h-3" /> {clip.views}</span>
                <span className="flex items-center gap-0.5"><TrendingUp className="w-3 h-3" /> {clip.reposts} reposts</span>
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={() => handleCopyLink(clip)}
                  className="flex-1 h-8 text-xs bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg gap-1"
                >
                  {copiedId === clip.id ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                  {copiedId === clip.id ? "Copied!" : "Copy & Repost"}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="h-8 text-xs rounded-lg gap-1"
                  onClick={() => window.open(clip.previewUrl, "_blank")}
                >
                  <ExternalLink className="w-3 h-3" />
                </Button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Top Performing Clips */}
      <TopPerformingClips />

      {/* Your referral link */}
      <div className="bg-card border border-border/40 rounded-xl p-4 text-center space-y-2">
        <p className="text-xs text-muted-foreground">Your referral link (included when you copy)</p>
        <p className="text-sm font-mono text-primary break-all">{referralLink}</p>
      </div>
    </div>
  );
};

export default ContentVault;
