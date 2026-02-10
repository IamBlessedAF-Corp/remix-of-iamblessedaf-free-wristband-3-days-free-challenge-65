import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Film, Eye, DollarSign, ExternalLink, Play, CheckCircle, Clock, AlertTriangle, Trophy, Flame } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

interface Clip {
  id: string;
  clip_url: string;
  platform: string;
  status: string;
  view_count: number;
  earnings_cents: number;
  submitted_at: string;
}

interface Props {
  userId: string;
}

const statusCfg: Record<string, { color: string; label: string; icon: any }> = {
  pending: { color: "bg-amber-500/15 text-amber-400 border-amber-500/30", label: "Pending Review", icon: Clock },
  verified: { color: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30", label: "Verified ✓", icon: CheckCircle },
  rejected: { color: "bg-red-500/15 text-red-400 border-red-500/30", label: "Rejected", icon: AlertTriangle },
};

const getTikTokId = (url: string) => {
  const m = url.match(/video\/(\d+)/);
  return m ? m[1] : null;
};

const MILESTONES = [
  { clips: 5, label: "Starter", emoji: "🌱" },
  { clips: 10, label: "Consistent", emoji: "🔥" },
  { clips: 25, label: "Machine", emoji: "⚡" },
  { clips: 50, label: "Legend", emoji: "👑" },
];

const ClipperMyClips = ({ userId }: Props) => {
  const [clips, setClips] = useState<Clip[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase
        .from("clip_submissions")
        .select("id, clip_url, platform, status, view_count, earnings_cents, submitted_at")
        .eq("user_id", userId)
        .order("submitted_at", { ascending: false });
      setClips(data || []);
      setLoading(false);
    };
    fetch();
  }, [userId]);

  if (loading) return null;

  const totalClips = clips.length;
  const totalViews = clips.reduce((s, c) => s + (c.view_count || 0), 0);
  const totalEarnings = clips.reduce((s, c) => s + (c.earnings_cents || 0), 0);
  const nextMilestone = MILESTONES.find((m) => totalClips < m.clips);
  const prevMilestone = [...MILESTONES].reverse().find((m) => totalClips >= m.clips);
  const milestonePct = nextMilestone ? Math.min(100, (totalClips / nextMilestone.clips) * 100) : 100;

  return (
    <div className="bg-card border border-border/50 rounded-2xl p-5">
      <div className="flex items-center gap-2.5 mb-1">
        <Film className="w-4 h-4 text-primary" />
        <h3 className="text-sm font-bold text-foreground">My Clips</h3>
        {prevMilestone && (
          <Badge className="text-[10px] bg-primary/10 text-primary border-primary/30">
            {prevMilestone.emoji} {prevMilestone.label}
          </Badge>
        )}
      </div>

      {/* Combined stats */}
      <div className="grid grid-cols-3 gap-2 mt-3 mb-4">
        <div className="bg-secondary/50 rounded-lg p-2.5 text-center">
          <p className="text-lg font-bold text-foreground">{totalClips}</p>
          <p className="text-[10px] text-muted-foreground">Clips</p>
        </div>
        <div className="bg-secondary/50 rounded-lg p-2.5 text-center">
          <p className="text-lg font-bold text-foreground">{totalViews >= 1000 ? `${(totalViews / 1000).toFixed(1)}k` : totalViews}</p>
          <p className="text-[10px] text-muted-foreground">Views</p>
        </div>
        <div className="bg-secondary/50 rounded-lg p-2.5 text-center">
          <p className="text-lg font-bold text-foreground">${(totalEarnings / 100).toFixed(2)}</p>
          <p className="text-[10px] text-muted-foreground">Earned</p>
        </div>
      </div>

      {/* Milestone progress */}
      {nextMilestone && (
        <div className="mb-4">
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="text-muted-foreground flex items-center gap-1">
              <Trophy className="w-3 h-3" /> Next: {nextMilestone.emoji} {nextMilestone.label}
            </span>
            <span className="font-bold text-foreground">{totalClips}/{nextMilestone.clips}</span>
          </div>
          <Progress value={milestonePct} className="h-2 bg-secondary" />
          <p className="text-[10px] text-muted-foreground mt-1">
            {nextMilestone.clips - totalClips} more clips to unlock!
          </p>
        </div>
      )}

      {/* Clip list */}
      {clips.length === 0 ? (
        <div className="text-center py-6">
          <Film className="w-6 h-6 text-muted-foreground mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">No clips yet. Submit your first one!</p>
        </div>
      ) : (
        <div className="space-y-2 max-h-[400px] overflow-y-auto">
          {clips.map((clip) => {
            const cfg = statusCfg[clip.status] || statusCfg.pending;
            const Icon = cfg.icon;
            const isExpanded = expandedId === clip.id;
            const ttId = getTikTokId(clip.clip_url);

            return (
              <div key={clip.id} className="border border-border/30 rounded-xl overflow-hidden">
                <div
                  className="flex items-center gap-3 px-3 py-2.5 cursor-pointer hover:bg-secondary/30 transition-colors"
                  onClick={() => setExpandedId(isExpanded ? null : clip.id)}
                >
                  <div className="w-8 h-8 bg-secondary rounded-lg flex items-center justify-center shrink-0">
                    <Play className="w-3.5 h-3.5 text-muted-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-foreground capitalize">{clip.platform}</p>
                    <p className="text-[10px] text-muted-foreground">{new Date(clip.submitted_at).toLocaleDateString()}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-[11px] text-muted-foreground flex items-center gap-0.5">
                      <Eye className="w-3 h-3" /> {clip.view_count.toLocaleString()}
                    </span>
                    <span className="text-[11px] font-bold text-foreground">${(clip.earnings_cents / 100).toFixed(2)}</span>
                    <Badge className={`text-[9px] px-1.5 ${cfg.color}`}>
                      <Icon className="w-2.5 h-2.5 mr-0.5" />
                      {clip.status}
                    </Badge>
                  </div>
                </div>
                {isExpanded && (
                  <div className="px-3 pb-3 border-t border-border/20 pt-2 space-y-2">
                    <a href={clip.clip_url} target="_blank" rel="noopener noreferrer" className="text-primary text-[11px] underline flex items-center gap-1">
                      <ExternalLink className="w-3 h-3" /> Open on {clip.platform}
                    </a>
                    {ttId && (
                      <iframe
                        src={`https://www.tiktok.com/embed/v2/${ttId}`}
                        className="w-full h-[350px] rounded-lg border border-border/30"
                        allowFullScreen
                        allow="encrypted-media"
                      />
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ClipperMyClips;
