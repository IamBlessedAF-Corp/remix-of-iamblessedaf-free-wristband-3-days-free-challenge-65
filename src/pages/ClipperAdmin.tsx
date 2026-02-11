import { useState } from "react";
import { motion } from "framer-motion";
import {
  Shield, RefreshCw, ArrowLeft, Film, Eye,
  CheckCircle, Clock, AlertTriangle, Trash2, ExternalLink, TrendingUp,
  Lightbulb, BarChart3, Play,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { useClipperAdmin, type ClipRow } from "@/hooks/useClipperAdmin";
import BoardLoginForm from "@/components/board/BoardLoginForm";
import { toast } from "sonner";
import AdminAnalyticsDashboard from "@/components/clipper/AdminAnalyticsDashboard";

// ---------- Video Embed ----------
const VideoEmbed = ({ url }: { url: string }) => {
  const getTikTokId = (u: string) => {
    const m = u.match(/video\/(\d+)/);
    return m ? m[1] : null;
  };
  const ttId = getTikTokId(url);

  if (ttId) {
    return (
      <iframe
        src={`https://www.tiktok.com/embed/v2/${ttId}`}
        className="w-full h-[400px] rounded-lg border border-border/30"
        allowFullScreen
        allow="encrypted-media"
      />
    );
  }

  return (
    <a href={url} target="_blank" rel="noopener noreferrer" className="text-primary text-xs underline flex items-center gap-1">
      <Play className="w-3 h-3" /> Open clip externally
    </a>
  );
};

// ---------- Clip Row ----------
const ClipRowItem = ({ clip, onApprove, onReject, onDelete }: {
  clip: ClipRow;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
  onDelete: (id: string) => void;
}) => {
  const [expanded, setExpanded] = useState(false);
  const statusCfg: Record<string, { color: string; icon: any }> = {
    pending: { color: "bg-amber-500/15 text-amber-400 border-amber-500/30", icon: Clock },
    verified: { color: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30", icon: CheckCircle },
    rejected: { color: "bg-red-500/15 text-red-400 border-red-500/30", icon: AlertTriangle },
  };
  const cfg = statusCfg[clip.status] || statusCfg.pending;
  const StatusIcon = cfg.icon;

  return (
    <div className="border border-border/30 rounded-xl overflow-hidden bg-card/50">
      <div
        className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-secondary/30 transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-foreground truncate">{clip.display_name}</p>
          <p className="text-[11px] text-muted-foreground truncate">{clip.platform} · {new Date(clip.submitted_at).toLocaleDateString()}</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-xs text-muted-foreground">{clip.view_count.toLocaleString()} views</span>
          <span className="text-xs font-bold text-foreground">${(clip.earnings_cents / 100).toFixed(2)}</span>
          <Badge className={`text-[10px] ${cfg.color}`}>
            <StatusIcon className="w-3 h-3 mr-0.5" />
            {clip.status}
          </Badge>
        </div>
      </div>
      {expanded && (
        <div className="px-4 pb-4 space-y-3 border-t border-border/20 pt-3">
          <div className="flex items-center gap-2">
            <a href={clip.clip_url} target="_blank" rel="noopener noreferrer" className="text-primary text-xs underline flex items-center gap-1">
              <ExternalLink className="w-3 h-3" /> {clip.clip_url.substring(0, 60)}...
            </a>
          </div>
          <VideoEmbed url={clip.clip_url} />
          <div className="flex gap-2">
            {clip.status === "pending" && (
              <>
                <Button size="sm" onClick={() => onApprove(clip.id)} className="gap-1">
                  <CheckCircle className="w-3 h-3" /> Approve
                </Button>
                <Button size="sm" variant="outline" onClick={() => onReject(clip.id)} className="gap-1">
                  <AlertTriangle className="w-3 h-3" /> Reject
                </Button>
              </>
            )}
            <Button size="sm" variant="destructive" onClick={() => onDelete(clip.id)} className="gap-1 ml-auto">
              <Trash2 className="w-3 h-3" /> Delete
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

// ---------- Optimization Suggestions ----------
const Suggestions = ({ stats }: { stats: any }) => {
  const suggestions: string[] = [];
  if (stats.clipsThisWeek < stats.clipsLastWeek) suggestions.push("Clip submissions dropped vs last week. Consider a push notification or email reminder.");
  if (stats.avgViewsPerClip < 5000) suggestions.push("Average views/clip is low. Encourage clippers to use trending sounds and hashtags.");
  if (stats.pendingReviewCount > 10) suggestions.push(`${stats.pendingReviewCount} clips pending review. Prioritize batch approvals to maintain clipper trust.`);
  if (stats.totalClippers < 10) suggestions.push("Less than 10 active clippers. Boost recruitment with referral incentives.");
  if (stats.topPlatform === "tiktok") suggestions.push("TikTok dominates. Consider bonus multipliers for Instagram Reels & YouTube Shorts to diversify.");
  if (suggestions.length === 0) suggestions.push("Campaign is running smoothly. Keep pushing weekly targets!");

  return (
    <div className="bg-card border border-border/50 rounded-xl p-5">
      <div className="flex items-center gap-2 mb-3">
        <Lightbulb className="w-4 h-4 text-primary" />
        <h3 className="text-sm font-bold text-foreground">Optimization Suggestions</h3>
      </div>
      <div className="space-y-2">
        {suggestions.map((s, i) => (
          <div key={i} className="flex gap-2 text-xs text-muted-foreground">
            <span className="text-primary font-bold shrink-0">→</span>
            <span>{s}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

// ---------- Main Page ----------
export default function ClipperAdmin() {
  const { isAdmin, loading: authLoading, signInWithEmail, signOut } = useAdminAuth();
  const admin = useClipperAdmin();
  const [filter, setFilter] = useState<"all" | "pending" | "verified" | "rejected">("all");

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <RefreshCw className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="max-w-sm w-full">
          <div className="flex items-center justify-center gap-2 mb-6">
            <Shield className="w-5 h-5 text-primary" />
            <h1 className="text-lg font-bold text-foreground">Clipper Admin Access</h1>
          </div>
          <BoardLoginForm signInWithEmail={signInWithEmail} />
        </div>
      </div>
    );
  }

  const handleApprove = async (id: string) => {
    const err = await admin.updateClipStatus(id, "verified");
    if (err) toast.error("Failed to approve");
    else toast.success("Clip approved!");
  };

  const handleReject = async (id: string) => {
    const err = await admin.updateClipStatus(id, "rejected");
    if (err) toast.error("Failed to reject");
    else toast.success("Clip rejected");
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this clip permanently?")) return;
    const err = await admin.deleteClip(id);
    if (err) toast.error("Failed to delete");
    else toast.success("Clip deleted");
  };

  const handleBulkApprove = async () => {
    const pendingIds = admin.clips.filter((c) => c.status === "pending").map((c) => c.id);
    if (pendingIds.length === 0) return toast.info("No pending clips");
    if (!confirm(`Approve ${pendingIds.length} pending clips?`)) return;
    await admin.bulkApprove(pendingIds);
    toast.success(`${pendingIds.length} clips approved!`);
  };

  const filteredClips = filter === "all" ? admin.clips : admin.clips.filter((c) => c.status === filter);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/50 bg-card/50 backdrop-blur-sm sticky top-0 z-20">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <a href="/board" className="text-muted-foreground hover:text-foreground transition-colors">
              <ArrowLeft className="w-4 h-4" />
            </a>
            <BarChart3 className="w-5 h-5 text-primary" />
            <h1 className="text-base font-bold text-foreground">Clipper Admin</h1>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={admin.refresh} className="gap-1.5">
              <RefreshCw className={`w-3.5 h-3.5 ${admin.loading ? "animate-spin" : ""}`} />
              Refresh
            </Button>
            <Button variant="ghost" size="sm" onClick={signOut} className="text-xs text-muted-foreground">
              Sign out
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-6 space-y-6">
        {admin.loading && !admin.stats ? (
          <div className="flex items-center justify-center py-20">
            <RefreshCw className="w-6 h-6 animate-spin text-primary" />
          </div>
        ) : admin.stats ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
            {/* YouTube Studio-style Analytics Dashboard */}
            <AdminAnalyticsDashboard stats={admin.stats} clips={admin.clips} clippers={admin.clippers} />

            {/* Tabs */}
            <Tabs defaultValue="clips" className="space-y-4">
              <TabsList className="bg-secondary/50">
                <TabsTrigger value="clips">All Clips</TabsTrigger>
                <TabsTrigger value="leaderboard">Leaderboard</TabsTrigger>
                <TabsTrigger value="suggestions">Optimize</TabsTrigger>
              </TabsList>

              {/* === Clips Tab === */}
              <TabsContent value="clips" className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex gap-1.5">
                    {(["all", "pending", "verified", "rejected"] as const).map((f) => (
                      <button
                        key={f}
                        onClick={() => setFilter(f)}
                        className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors ${
                          filter === f ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        {f === "all" ? `All (${admin.clips.length})` :
                          f === "pending" ? `Pending (${admin.clips.filter((c) => c.status === "pending").length})` :
                          f === "verified" ? `Verified (${admin.clips.filter((c) => c.status === "verified").length})` :
                          `Rejected (${admin.clips.filter((c) => c.status === "rejected").length})`}
                      </button>
                    ))}
                  </div>
                  {admin.clips.some((c) => c.status === "pending") && (
                    <Button size="sm" onClick={handleBulkApprove} className="gap-1">
                      <CheckCircle className="w-3 h-3" /> Approve All Pending
                    </Button>
                  )}
                </div>

                {filteredClips.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <Film className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No clips {filter !== "all" ? `with status "${filter}"` : "submitted yet"}.</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {filteredClips.map((clip) => (
                      <ClipRowItem key={clip.id} clip={clip} onApprove={handleApprove} onReject={handleReject} onDelete={handleDelete} />
                    ))}
                  </div>
                )}
              </TabsContent>

              {/* === Leaderboard Tab === */}
              <TabsContent value="leaderboard" className="space-y-4">
                <div className="bg-card border border-border/50 rounded-xl overflow-hidden">
                  <div className="grid grid-cols-[2.5rem_1fr_5rem_5rem_5rem_4.5rem] px-4 py-2 text-[10px] font-bold text-muted-foreground uppercase tracking-wider border-b border-border/20 bg-secondary/30">
                    <span>#</span>
                    <span>Clipper</span>
                    <span className="text-right">Clips</span>
                    <span className="text-right">Views</span>
                    <span className="text-right">Earned</span>
                    <span className="text-right">Pending</span>
                  </div>
                  <div className="divide-y divide-border/15">
                    {admin.clippers.map((u, i) => (
                      <div key={u.user_id} className="grid grid-cols-[2.5rem_1fr_5rem_5rem_5rem_4.5rem] items-center px-4 py-3 text-sm hover:bg-secondary/20 transition-colors">
                        <span className="text-xs font-bold text-muted-foreground">{i + 1}</span>
                        <div>
                          <p className="font-semibold text-foreground text-xs">{u.display_name}</p>
                          <p className="text-[10px] text-muted-foreground">Last: {new Date(u.lastSubmitted).toLocaleDateString()}</p>
                        </div>
                        <span className="text-right text-xs font-semibold">{u.totalClips}</span>
                        <span className="text-right text-xs">{u.totalViews.toLocaleString()}</span>
                        <span className="text-right text-xs font-bold text-foreground">${(u.totalEarningsCents / 100).toFixed(2)}</span>
                        <span className="text-right">
                          {u.pendingClips > 0 && (
                            <Badge className="text-[10px] bg-amber-500/15 text-amber-400 border-amber-500/30">{u.pendingClips}</Badge>
                          )}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </TabsContent>

              {/* === Optimize Tab === */}
              <TabsContent value="suggestions">
                <Suggestions stats={admin.stats} />
              </TabsContent>
            </Tabs>
          </motion.div>
        ) : (
          <p className="text-center text-muted-foreground py-20">No data available.</p>
        )}
      </main>
    </div>
  );
}
