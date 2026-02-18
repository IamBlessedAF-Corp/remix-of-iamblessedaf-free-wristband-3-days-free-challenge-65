import { useState } from "react";
import { useClipperAdmin, type ClipRow } from "@/hooks/useClipperAdmin";
import AdminAnalyticsDashboard from "@/components/clipper/AdminAnalyticsDashboard";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  RefreshCw, Film, CheckCircle, Clock, AlertTriangle, Trash2, ExternalLink, Play, ChevronDown, ChevronRight,
} from "lucide-react";
import ExportCsvButton from "@/components/admin/ExportCsvButton";

const VideoEmbed = ({ url }: { url: string }) => {
  const ttId = url.match(/video\/(\d+)/)?.[1];
  if (ttId) return <iframe src={`https://www.tiktok.com/embed/v2/${ttId}`} className="w-full h-[400px] rounded-lg border border-border/30" allowFullScreen allow="encrypted-media" />;
  return <a href={url} target="_blank" rel="noopener noreferrer" className="text-primary text-xs underline flex items-center gap-1"><Play className="w-3 h-3" /> Open clip</a>;
};

const ClipRowItem = ({ clip, onApprove, onReject, onDelete }: { clip: ClipRow; onApprove: (id: string) => void; onReject: (id: string) => void; onDelete: (id: string) => void }) => {
  const [expanded, setExpanded] = useState(false);
  const cfgMap: Record<string, { color: string; icon: any }> = {
    pending: { color: "bg-amber-500/15 text-amber-400 border-amber-500/30", icon: Clock },
    verified: { color: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30", icon: CheckCircle },
    rejected: { color: "bg-red-500/15 text-red-400 border-red-500/30", icon: AlertTriangle },
  };
  const c = cfgMap[clip.status] || cfgMap.pending;
  const Icon = c.icon;
  return (
    <div className="border border-border/30 rounded-xl overflow-hidden bg-card/50">
      <div className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-secondary/30 transition-colors" onClick={() => setExpanded(!expanded)}>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-foreground truncate">{clip.display_name}</p>
          <p className="text-[11px] text-muted-foreground truncate">{clip.platform} · {new Date(clip.submitted_at).toLocaleDateString()}</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-xs text-muted-foreground">{clip.view_count.toLocaleString()} views</span>
          <span className="text-xs font-bold text-foreground">${(clip.earnings_cents / 100).toFixed(2)}</span>
          <Badge className={`text-[10px] ${c.color}`}><Icon className="w-3 h-3 mr-0.5" />{clip.status}</Badge>
        </div>
      </div>
      {expanded && (
        <div className="px-4 pb-4 space-y-3 border-t border-border/20 pt-3">
          <a href={clip.clip_url} target="_blank" rel="noopener noreferrer" className="text-primary text-xs underline flex items-center gap-1"><ExternalLink className="w-3 h-3" /> {clip.clip_url.substring(0, 60)}...</a>
          <VideoEmbed url={clip.clip_url} />
          <div className="flex gap-2">
            {clip.status === "pending" && (
              <>
                <Button size="sm" onClick={() => onApprove(clip.id)} className="gap-1"><CheckCircle className="w-3 h-3" /> Approve</Button>
                <Button size="sm" variant="outline" onClick={() => onReject(clip.id)} className="gap-1"><AlertTriangle className="w-3 h-3" /> Reject</Button>
              </>
            )}
            <Button size="sm" variant="destructive" onClick={() => onDelete(clip.id)} className="gap-1 ml-auto"><Trash2 className="w-3 h-3" /> Delete</Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default function ClippersTab() {
  const admin = useClipperAdmin();
  const [filter, setFilter] = useState<"all" | "pending" | "verified" | "rejected">("all");
  const handleApprove = async (id: string) => { const err = await admin.updateClipStatus(id, "verified"); err ? toast.error("Failed") : toast.success("Approved!"); };
  const handleReject = async (id: string) => { const err = await admin.updateClipStatus(id, "rejected"); err ? toast.error("Failed") : toast.success("Rejected"); };
  const handleDelete = async (id: string) => { if (!confirm("Delete permanently?")) return; const err = await admin.deleteClip(id); err ? toast.error("Failed") : toast.success("Deleted"); };
  const handleBulkApprove = async () => {
    const ids = admin.clips.filter(c => c.status === "pending").map(c => c.id);
    if (!ids.length) return toast.info("No pending");
    if (!confirm(`Approve ${ids.length}?`)) return;
    await admin.bulkApprove(ids);
    toast.success(`${ids.length} approved!`);
  };
  const filtered = filter === "all" ? admin.clips : admin.clips.filter(c => c.status === filter);

  if (admin.loading) return <div className="flex justify-center py-20"><RefreshCw className="w-6 h-6 animate-spin text-primary" /></div>;

  return (
    <div className="space-y-6">
      {admin.stats && <AdminAnalyticsDashboard stats={admin.stats} clips={admin.clips} clippers={admin.clippers} />}
      <div className="border-t border-border/30 pt-6 space-y-4">
        <h3 className="text-sm font-black text-foreground uppercase tracking-wider">Clip Management</h3>
        <div className="flex items-center justify-between">
          <div className="flex gap-1.5">
            {(["all", "pending", "verified", "rejected"] as const).map(f => (
              <button key={f} onClick={() => setFilter(f)} className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors ${filter === f ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground hover:text-foreground"}`}>
                {f === "all" ? `All (${admin.clips.length})` : `${f.charAt(0).toUpperCase() + f.slice(1)} (${admin.clips.filter(c => c.status === f).length})`}
              </button>
            ))}
          </div>
          {admin.clips.some(c => c.status === "pending") && <Button size="sm" onClick={handleBulkApprove} className="gap-1"><CheckCircle className="w-3 h-3" /> Approve All</Button>}
          <ExportCsvButton data={filtered} filename="clips.csv" columns={["clip_url", "platform", "status", "view_count", "net_views", "earnings_cents", "submitted_at"]} />
        </div>
        {filtered.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground"><Film className="w-8 h-8 mx-auto mb-2 opacity-50" /><p className="text-sm">No clips.</p></div>
        ) : (
          <div className="space-y-2">{filtered.map(clip => <ClipRowItem key={clip.id} clip={clip} onApprove={handleApprove} onReject={handleReject} onDelete={handleDelete} />)}</div>
        )}
      </div>
    </div>
  );
}
