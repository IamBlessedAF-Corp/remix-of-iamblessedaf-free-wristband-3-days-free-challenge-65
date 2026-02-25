import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Film, Eye, DollarSign, ExternalLink, Play, CheckCircle, Clock, AlertTriangle, Trophy, Flame, TrendingUp, XCircle, ChevronDown, ChevronUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

interface Clip {
  id: string;
  clip_url: string;
  platform: string;
  status: string;
  view_count: number;
  baseline_view_count: number;
  net_views: number | null;
  earnings_cents: number;
  is_activated: boolean | null;
  submitted_at: string;
}

interface Props {
  userId: string;
}

const statusCfg: Record<string, { color: string; label: string; icon: any }> = {
  pending: { color: "bg-amber-500/15 text-amber-400 border-amber-500/30", label: "Pending", icon: Clock },
  verified: { color: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30", label: "Verified ✓", icon: CheckCircle },
  rejected: { color: "bg-destructive/15 text-destructive border-destructive/30", label: "Rejected", icon: XCircle },
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

const formatViews = (v: number) => v >= 1000 ? `${(v / 1000).toFixed(1)}k` : v.toString();

const ClipperMyClips = ({ userId }: Props) => {
  const [clips, setClips] = useState<Clip[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [showRejected, setShowRejected] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase
        .from("clip_submissions")
        .select("id, clip_url, platform, status, view_count, baseline_view_count, net_views, earnings_cents, is_activated, submitted_at")
        .eq("user_id", userId)
        .order("submitted_at", { ascending: false });
      setClips(data || []);
      setLoading(false);
    };
    fetch();
  }, [userId]);

  if (loading) return null;

  // Separate active clips from rejected
  const activeClips = clips.filter(c => c.status !== "rejected");
  const rejectedClips = clips.filter(c => c.status === "rejected");

  const totalClips = activeClips.length;
  const totalViews = activeClips.reduce((s, c) => s + (c.view_count || 0), 0);
  const totalEarnings = activeClips.reduce((s, c) => s + (c.earnings_cents || 0), 0);
  const nextMilestone = MILESTONES.find((m) => totalClips < m.clips);
  const prevMilestone = [...MILESTONES].reverse().find((m) => totalClips >= m.clips);
  const milestonePct = nextMilestone ? Math.min(100, (totalClips / nextMilestone.clips) * 100) : 100;

  const renderClip = (clip: Clip) => {
    const cfg = statusCfg[clip.status] || statusCfg.pending;
    const Icon = cfg.icon;
    const isExpanded = expandedId === clip.id;
    const ttId = getTikTokId(clip.clip_url);
    const netViews = clip.net_views ?? Math.max(0, (clip.view_count || 0) - (clip.baseline_view_count || 0));
    const isActivated = clip.is_activated || false;
    const viewProgress = Math.min(100, (netViews / 1000) * 100);
    const isRejected = clip.status === "rejected";

    return (
      <div key={clip.id} className={`border rounded-xl overflow-hidden ${isRejected ? "border-destructive/20 opacity-75" : "border-border/30"}`}>
        <div
          className="flex items-center gap-3 px-3 py-2.5 cursor-pointer hover:bg-secondary/30 transition-colors"
          onClick={() => setExpandedId(isExpanded ? null : clip.id)}
        >
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${isRejected ? "bg-destructive/10" : "bg-secondary"}`}>
            <Play className={`w-3.5 h-3.5 ${isRejected ? "text-destructive" : "text-muted-foreground"}`} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-foreground capitalize">{clip.platform}</p>
            <p className="text-[10px] text-muted-foreground">
              {new Date(clip.submitted_at).toLocaleDateString()} · {new Date(clip.submitted_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-[11px] text-muted-foreground flex items-center gap-0.5">
              <Eye className="w-3 h-3" /> {clip.view_count.toLocaleString()}
            </span>
            {!isRejected && (
              <span className={`text-[11px] font-bold ${isActivated ? 'text-emerald-500' : 'text-muted-foreground'}`}>
                ${(clip.earnings_cents / 100).toFixed(2)}
              </span>
            )}
            <Badge className={`text-[9px] px-1.5 ${cfg.color}`}>
              <Icon className="w-2.5 h-2.5 mr-0.5" />
              {cfg.label}
            </Badge>
          </div>
        </div>

        {isExpanded && (
          <div className="px-3 pb-3 border-t border-border/20 pt-2 space-y-2">
            {isRejected && (
              <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-2.5">
                <p className="text-[11px] text-destructive font-semibold mb-1">❌ This clip was rejected</p>
                <p className="text-[10px] text-muted-foreground">
                  Missing required hashtags (#3DayNeuroHackerChallenge and/or #IAMBLESSED_XXXX). 
                  Fix the video description and submit again.
                </p>
              </div>
            )}

            {!isRejected && (
              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div className="bg-secondary/40 rounded-lg p-2">
                  <p className="text-muted-foreground">Views at submission</p>
                  <p className="font-bold text-foreground">{(clip.baseline_view_count || 0).toLocaleString()}</p>
                </div>
                <div className="bg-secondary/40 rounded-lg p-2">
                  <p className="text-muted-foreground">Net views (new)</p>
                  <p className="font-bold text-foreground">{netViews.toLocaleString()}</p>
                </div>
              </div>
            )}

            {/* Progress toward 1,000 views activation */}
            {clip.status === "verified" && !isActivated && (
              <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-2.5">
                <div className="flex items-center justify-between text-[11px] mb-1">
                  <span className="text-amber-400 flex items-center gap-1">
                    <TrendingUp className="w-3 h-3" /> Progress to $2.22+
                  </span>
                  <span className="font-bold text-foreground">{netViews.toLocaleString()} / 1,000</span>
                </div>
                <Progress value={viewProgress} className="h-1.5 bg-secondary" />
                <p className="text-[10px] text-muted-foreground mt-1">
                  {1000 - netViews > 0
                    ? `${(1000 - netViews).toLocaleString()} more net views to activate earnings`
                    : "Almost there!"}
                </p>
              </div>
            )}

            {/* Activated earnings */}
            {isActivated && (
              <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-2.5 text-center">
                <p className="text-[11px] text-emerald-400 font-bold">💰 Earning ${(clip.earnings_cents / 100).toFixed(2)} — keep growing views!</p>
              </div>
            )}

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
  };

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
          <p className="text-lg font-bold text-foreground">{formatViews(totalViews)}</p>
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

      {/* Active clips list */}
      {activeClips.length === 0 && rejectedClips.length === 0 ? (
        <div className="text-center py-6">
          <Film className="w-6 h-6 text-muted-foreground mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">No clips yet. Submit your first one!</p>
        </div>
      ) : (
        <>
          {activeClips.length > 0 && (
            <div className="space-y-2 max-h-[400px] overflow-y-auto">
              {activeClips.map(renderClip)}
            </div>
          )}

          {activeClips.length === 0 && rejectedClips.length > 0 && (
            <div className="text-center py-4 mb-2">
              <p className="text-sm text-muted-foreground">No active clips yet. Check rejected below and fix them!</p>
            </div>
          )}

          {/* Rejected section */}
          {rejectedClips.length > 0 && (
            <div className="mt-4">
              <button
                onClick={() => setShowRejected(!showRejected)}
                className="flex items-center gap-2 w-full text-left px-3 py-2 rounded-lg bg-destructive/5 border border-destructive/15 hover:bg-destructive/10 transition-colors"
              >
                <XCircle className="w-4 h-4 text-destructive" />
                <span className="text-xs font-bold text-destructive">
                  Rejected ({rejectedClips.length})
                </span>
                <span className="text-[10px] text-muted-foreground ml-1">
                  Missing hashtags or requirements
                </span>
                {showRejected ? (
                  <ChevronUp className="w-3.5 h-3.5 text-muted-foreground ml-auto" />
                ) : (
                  <ChevronDown className="w-3.5 h-3.5 text-muted-foreground ml-auto" />
                )}
              </button>
              {showRejected && (
                <div className="space-y-2 mt-2 max-h-[300px] overflow-y-auto">
                  {rejectedClips.map(renderClip)}
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ClipperMyClips;