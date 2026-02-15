import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { TrendingUp, Flame, Copy } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";

import thumbBrainRewire from "@/assets/vault-thumb-brain-rewire.jpg";
import thumbNeuro from "@/assets/vault-thumb-neuro-thankyou.jpg";
import thumbMorning from "@/assets/vault-thumb-morning.jpg";
import thumbDopamine from "@/assets/vault-thumb-dopamine.jpg";
import thumbSuccess from "@/assets/vault-thumb-success.jpg";
import thumbMindset from "@/assets/vault-thumb-mindset.jpg";

// Map clip IDs to thumbnails (mirrors ContentVault data)
const CLIP_META: Record<string, { title: string; thumbnail: string }> = {
  "1": { title: "Why Gratitude Rewires Your Brain in 21 Days", thumbnail: thumbBrainRewire },
  "2": { title: "The Neuroscience Behind 'Thank You'", thumbnail: thumbNeuro },
  "3": { title: "Morning Gratitude = 31% More Productive", thumbnail: thumbMorning },
  "4": { title: "Dopamine Detox: Reset Your Reward System", thumbnail: thumbDopamine },
  "5": { title: "How Billionaires Use Gratitude Journals", thumbnail: thumbSuccess },
  "6": { title: "Reframe Negative Thoughts in 60 Seconds", thumbnail: thumbMindset },
  "7": { title: "Huberman: Gratitude Changes Brain Chemistry", thumbnail: thumbNeuro },
  "8": { title: "5-Minute Morning Hack Tony Robbins Swears By", thumbnail: thumbMorning },
  "9": { title: "Why Saying 'I Am Blessed' Activates Your RAS", thumbnail: thumbBrainRewire },
  "10": { title: "Joe Dispenza: Rewire Your Identity in 7 Days", thumbnail: thumbMindset },
  "11": { title: "The $33 Wristband That Feeds 111 People", thumbnail: thumbSuccess },
  "12": { title: "Dopamine Stacking: The Gratitude Loop", thumbnail: thumbDopamine },
};

interface TopClip {
  clip_id: string;
  count: number;
}

export default function TopPerformingClips() {
  const [topClips, setTopClips] = useState<TopClip[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTop = async () => {
      // Query repost_logs grouped by clip_id, ordered by count desc, limit 5
      const { data, error } = await supabase
        .from("repost_logs")
        .select("clip_id")
        .order("created_at", { ascending: false })
        .limit(1000);

      if (data && !error) {
        // Aggregate counts
        const counts: Record<string, number> = {};
        data.forEach((row: any) => {
          counts[row.clip_id] = (counts[row.clip_id] || 0) + 1;
        });
        const sorted = Object.entries(counts)
          .map(([clip_id, count]) => ({ clip_id, count }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 5);
        setTopClips(sorted);
      }
      setLoading(false);
    };
    fetchTop();
  }, []);

  if (loading) return null;
  if (topClips.length === 0) return null;

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Flame className="w-4 h-4 text-orange-500" />
        <h4 className="text-sm font-bold text-foreground">Top Performing Clips</h4>
        <Badge className="bg-orange-500/10 text-orange-500 border-orange-500/20 text-[10px]">
          TRENDING
        </Badge>
      </div>

      <div className="space-y-2">
        {topClips.map((clip, i) => {
          const meta = CLIP_META[clip.clip_id];
          if (!meta) return null;
          return (
            <motion.div
              key={clip.clip_id}
              className="flex items-center gap-3 bg-card border border-border/40 rounded-xl p-2.5 hover:border-primary/30 transition-all"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.06 }}
            >
              <span className="text-lg font-black text-muted-foreground/40 w-6 text-center">
                {i + 1}
              </span>
              <img
                src={meta.thumbnail}
                alt={meta.title}
                className="w-12 h-12 rounded-lg object-cover shrink-0"
              />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-foreground line-clamp-1">
                  {meta.title}
                </p>
                <div className="flex items-center gap-2 text-[10px] text-muted-foreground mt-0.5">
                  <span className="flex items-center gap-0.5">
                    <Copy className="w-3 h-3" /> {clip.count} reposts
                  </span>
                  {i === 0 && (
                    <Badge className="bg-orange-500/10 text-orange-500 border-0 text-[8px] px-1.5 py-0">
                      🔥 #1
                    </Badge>
                  )}
                </div>
              </div>
              <TrendingUp className={`w-4 h-4 shrink-0 ${i === 0 ? "text-orange-500" : "text-muted-foreground/40"}`} />
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
