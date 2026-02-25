import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import AdminSectionDashboard from "./AdminSectionDashboard";
import {
  ChevronDown, ChevronRight, RefreshCw, Code2, FileText,
  Layers, Clock, Tag, AlertCircle, Plus, GitCommit,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import ExportCsvButton from "./ExportCsvButton";

type CodeChange = {
  file: string;
  action: string;
  summary: string;
  diff: string;
};

type ChangelogEntry = {
  id: string;
  created_at: string;
  prompt_summary: string;
  affected_areas: string[];
  change_details: string | null;
  code_changes: CodeChange[];
  tags: string[];
  created_by: string | null;
};

const TAG_COLORS: Record<string, string> = {
  database: "bg-blue-500/15 text-blue-400 border-blue-500/30",
  security: "bg-red-500/15 text-red-400 border-red-500/30",
  bugfix: "bg-amber-500/15 text-amber-400 border-amber-500/30",
  "edge-function": "bg-purple-500/15 text-purple-400 border-purple-500/30",
  auth: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  ui: "bg-pink-500/15 text-pink-400 border-pink-500/30",
  users: "bg-cyan-500/15 text-cyan-400 border-cyan-500/30",
  rls: "bg-orange-500/15 text-orange-400 border-orange-500/30",
  permissions: "bg-indigo-500/15 text-indigo-400 border-indigo-500/30",
  onboarding: "bg-teal-500/15 text-teal-400 border-teal-500/30",
  admin: "bg-violet-500/15 text-violet-400 border-violet-500/30",
};

function getTagColor(tag: string) {
  return TAG_COLORS[tag] || "bg-muted text-muted-foreground border-border/50";
}

function timeAgo(date: string) {
  const now = new Date();
  const d = new Date(date);
  const diffMs = now.getTime() - d.getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

const ActionBadge = ({ action }: { action: string }) => {
  const colors: Record<string, string> = {
    edited: "bg-amber-500/15 text-amber-400",
    created: "bg-emerald-500/15 text-emerald-400",
    deleted: "bg-red-500/15 text-red-400",
    executed: "bg-blue-500/15 text-blue-400",
  };
  return (
    <span className={cn("text-[10px] px-1.5 py-0.5 rounded font-medium", colors[action] || "bg-muted text-muted-foreground")}>
      {action}
    </span>
  );
};

function ChangelogItem({ entry }: { entry: ChangelogEntry }) {
  const [expanded, setExpanded] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [showCodeIdx, setShowCodeIdx] = useState<number | null>(null);

  return (
    <div className="border border-border/30 rounded-xl overflow-hidden bg-card/60 hover:border-border/50 transition-colors">
      {/* Collapsed header - always visible */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-start gap-3 px-4 py-3.5 text-left hover:bg-secondary/20 transition-colors"
      >
        <div className="mt-0.5 shrink-0">
          {expanded ? (
            <ChevronDown className="w-4 h-4 text-primary" />
          ) : (
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <GitCommit className="w-3.5 h-3.5 text-primary shrink-0" />
            <p className="text-sm font-semibold text-foreground truncate">{entry.prompt_summary}</p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[11px] text-muted-foreground flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {timeAgo(entry.created_at)}
            </span>
            <span className="text-[10px] text-muted-foreground/60">·</span>
            <span className="text-[11px] text-muted-foreground">
              {new Date(entry.created_at).toLocaleString("es-CO", {
                day: "2-digit", month: "short", year: "numeric",
                hour: "2-digit", minute: "2-digit",
              })}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          {entry.code_changes?.length > 0 && (
            <Badge variant="outline" className="text-[10px] gap-1 border-border/40">
              <Code2 className="w-3 h-3" />
              {entry.code_changes.length} {entry.code_changes.length === 1 ? "file" : "files"}
            </Badge>
          )}
        </div>
      </button>

      {/* Expanded: Summary + affected areas */}
      {expanded && (
        <div className="border-t border-border/20 px-4 pb-4 pt-3 space-y-3">
          {/* Tags */}
          {entry.tags?.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {entry.tags.map(tag => (
                <Badge key={tag} variant="outline" className={cn("text-[10px]", getTagColor(tag))}>
                  <Tag className="w-2.5 h-2.5 mr-0.5" />
                  {tag}
                </Badge>
              ))}
            </div>
          )}

          {/* Affected areas */}
          {entry.affected_areas?.length > 0 && (
            <div className="bg-secondary/30 rounded-lg p-3">
              <p className="text-[11px] font-semibold text-muted-foreground mb-1.5 flex items-center gap-1">
                <Layers className="w-3 h-3" /> Affected Areas
              </p>
              <div className="flex flex-wrap gap-1.5">
                {entry.affected_areas.map(area => (
                  <span key={area} className="text-[11px] bg-background/80 border border-border/40 px-2 py-0.5 rounded-md text-foreground">
                    {area}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Details toggle */}
          {entry.change_details && (
            <div>
              <button
                onClick={() => setShowDetails(!showDetails)}
                className="flex items-center gap-1.5 text-xs font-medium text-primary hover:text-primary/80 transition-colors"
              >
                <FileText className="w-3.5 h-3.5" />
                {showDetails ? "Hide details" : "View change details"}
                {showDetails ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
              </button>
              {showDetails && (
                <div className="mt-2 bg-secondary/20 border border-border/20 rounded-lg p-3">
                  <p className="text-xs text-foreground/90 leading-relaxed whitespace-pre-wrap">
                    {entry.change_details}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Code changes */}
          {entry.code_changes?.length > 0 && (
            <div className="space-y-2">
              <p className="text-[11px] font-semibold text-muted-foreground flex items-center gap-1">
                <Code2 className="w-3 h-3" /> Code Changes
              </p>
              {entry.code_changes.map((change, idx) => (
                <div key={idx} className="border border-border/30 rounded-lg overflow-hidden">
                  <button
                    onClick={() => setShowCodeIdx(showCodeIdx === idx ? null : idx)}
                    className="w-full flex items-center gap-2 px-3 py-2 text-left hover:bg-secondary/20 transition-colors"
                  >
                    <ActionBadge action={change.action} />
                    <span className="text-xs font-mono text-foreground truncate flex-1">{change.file}</span>
                    <span className="text-[11px] text-muted-foreground truncate max-w-[200px] hidden sm:block">
                      {change.summary}
                    </span>
                    {showCodeIdx === idx ? (
                      <ChevronDown className="w-3 h-3 text-muted-foreground shrink-0" />
                    ) : (
                      <Code2 className="w-3 h-3 text-muted-foreground shrink-0" />
                    )}
                  </button>
                  {showCodeIdx === idx && (
                    <div className="border-t border-border/20">
                      <p className="text-[11px] text-muted-foreground px-3 py-1.5 bg-secondary/10">
                        {change.summary}
                      </p>
                      <pre className="text-[11px] font-mono leading-relaxed overflow-x-auto px-3 py-2 bg-zinc-950 text-zinc-300">
                        {change.diff.split("\n").map((line, i) => {
                          let lineClass = "text-zinc-400";
                          if (line.startsWith("+")) lineClass = "text-emerald-400";
                          else if (line.startsWith("-")) lineClass = "text-red-400";
                          return (
                            <div key={i} className={lineClass}>
                              {line}
                            </div>
                          );
                        })}
                      </pre>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Add Entry Form ───
function AddChangelogForm({ onSuccess }: { onSuccess: () => void }) {
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [summary, setSummary] = useState("");
  const [areas, setAreas] = useState("");
  const [details, setDetails] = useState("");
  const [tags, setTags] = useState("");

  const handleSave = async () => {
    if (!summary.trim()) return toast.error("Summary is required");
    setSaving(true);
    const { error } = await (supabase.from("changelog_entries" as any) as any).insert({
      prompt_summary: summary.trim(),
      affected_areas: areas.split(",").map(a => a.trim()).filter(Boolean),
      change_details: details.trim() || null,
      tags: tags.split(",").map(t => t.trim()).filter(Boolean),
      code_changes: [],
    });
    setSaving(false);
    if (error) return toast.error("Failed to save: " + error.message);
    toast.success("Changelog entry added");
    setSummary(""); setAreas(""); setDetails(""); setTags("");
    setOpen(false);
    onSuccess();
  };

  if (!open) {
    return (
      <Button variant="outline" size="sm" onClick={() => setOpen(true)} className="gap-1.5">
        <Plus className="w-3.5 h-3.5" /> Add Entry
      </Button>
    );
  }

  return (
    <div className="border border-border/40 rounded-xl p-4 space-y-3 bg-card/60">
      <p className="text-sm font-semibold text-foreground">New Changelog Entry</p>
      <Input placeholder="Prompt / cambio summary..." value={summary} onChange={e => setSummary(e.target.value)} />
      <Input placeholder="Affected areas (comma separated)" value={areas} onChange={e => setAreas(e.target.value)} />
      <Textarea placeholder="Detailed description..." value={details} onChange={e => setDetails(e.target.value)} rows={3} />
      <Input placeholder="Tags (comma separated: database, bugfix, ui...)" value={tags} onChange={e => setTags(e.target.value)} />
      <div className="flex gap-2">
        <Button size="sm" onClick={handleSave} disabled={saving}>
          {saving ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : "Save"}
        </Button>
        <Button size="sm" variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
      </div>
    </div>
  );
}

// ─── Main Export ───
export default function ChangelogTab() {
  const { data: entries = [], isLoading, refetch } = useQuery({
    queryKey: ["changelog-entries"],
    queryFn: async () => {
      const { data } = await (supabase.from("changelog_entries" as any) as any)
        .select("*")
        .order("created_at", { ascending: false })
        .limit(100);
      return (data || []) as ChangelogEntry[];
    },
  });

  const [filter, setFilter] = useState("");

  const filtered = filter
    ? entries.filter(e =>
        e.prompt_summary.toLowerCase().includes(filter.toLowerCase()) ||
        e.tags?.some(t => t.toLowerCase().includes(filter.toLowerCase())) ||
        e.affected_areas?.some(a => a.toLowerCase().includes(filter.toLowerCase()))
      )
    : entries;

  const todayCount = entries.filter(e =>
    new Date(e.created_at).toDateString() === new Date().toDateString()
  ).length;

  if (isLoading) return <div className="flex justify-center py-20"><RefreshCw className="w-6 h-6 animate-spin text-primary" /></div>;

  return (
    <div className="space-y-4">
      <AdminSectionDashboard
        title="Changelog & Audit Trail"
        description="History of every prompt, code change, and what was affected"
        kpis={[
          { label: "Total Changes", value: entries.length },
          { label: "Today", value: todayCount },
          { label: "Files Touched", value: entries.reduce((sum, e) => sum + (e.code_changes?.length || 0), 0) },
        ]}
      />

      <div className="flex items-center gap-3">
        <Input
          placeholder="Search by keyword, tag, or area..."
          value={filter}
          onChange={e => setFilter(e.target.value)}
          className="max-w-sm text-sm"
        />
        <ExportCsvButton data={filtered.map(e => ({ summary: e.prompt_summary, areas: e.affected_areas?.join(", "), tags: e.tags?.join(", "), details: e.change_details, files: e.code_changes?.length || 0, created_at: e.created_at }))} filename="changelog.csv" columns={["summary", "areas", "tags", "details", "files", "created_at"]} />
        <AddChangelogForm onSuccess={() => refetch()} />
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-12">
          <AlertCircle className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">
            {filter ? "No entries match your search." : "No changelog entries yet."}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map(entry => (
            <ChangelogItem key={entry.id} entry={entry} />
          ))}
        </div>
      )}
    </div>
  );
}
