import { useState, useRef } from "react";
import { useIntelligentBlocks, type IntelligentBlock } from "@/hooks/useIntelligentBlocks";
import AdminSectionDashboard from "@/components/admin/AdminSectionDashboard";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  ExternalLink, ChevronDown, ChevronRight, Maximize2, Copy, Trash2,
  Pencil, Save, X, Globe, FileText, RefreshCw, Plus, Upload, Video,
  Film, Edit3, Scissors, Play, Image, User, Star, AlignLeft,
  ScrollText, Brain, Flame, Zap, Award, Users, Settings, DollarSign, Eye, Target,
  BarChart3, ShieldAlert, Clock, AlertTriangle, AlertCircle, TrendingUp, Gauge, Trophy, CreditCard,
} from "lucide-react";
import SmartTagBadge from "@/components/admin/SmartTagBadge";
import { toast } from "sonner";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import type { BlockSubFilter } from "@/types/adminBlocks";

const ICON_MAP: Record<string, any> = {
  ScrollText, Brain, Flame, Zap, Award, Users, Settings, DollarSign, Eye, Target,
  BarChart3, ShieldAlert, Clock, AlertTriangle, AlertCircle, TrendingUp, Gauge, Trophy, CreditCard,
};

const BLOCK_CATEGORY_COLORS: Record<string, string> = {
  Content: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  Product: "bg-amber-500/10 text-amber-500 border-amber-500/20",
  CTA: "bg-primary/10 text-primary border-primary/20",
  Hero: "bg-purple-500/10 text-purple-500 border-purple-500/20",
  Trust: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
  Urgency: "bg-red-500/10 text-red-500 border-red-500/20",
  Viral: "bg-pink-500/10 text-pink-500 border-pink-500/20",
  "Value Stack": "bg-orange-500/10 text-orange-500 border-orange-500/20",
  System: "bg-cyan-500/10 text-cyan-500 border-cyan-500/20",
};

const PREVIEW_COMPONENT_MAP: Record<string, string> = {
  "GrokQuotesSection / GptQuotesSection": "GrokQuotesSection",
  "Inline <img> hawkins-scale.jpg": "",
  "Inline section + logo": "",
  "Inline badge": "",
  "Index page inline": "",
  "ProductSections (wristband)": "WristbandProductCard",
  "FriendShirtSection": "ProductSections",
};

function resolvePreviewComponent(comp: string): string {
  if (PREVIEW_COMPONENT_MAP[comp] !== undefined) return PREVIEW_COMPONENT_MAP[comp];
  const name = comp.split("/")[0].split("(")[0].replace(/\s/g, "").replace("Inline", "").trim();
  return name;
}

// ─── Testimonial Block display ───
interface TestimonialBlock {
  id: string;
  type: "ig" | "video" | "written" | "screenshot";
  title: string;
  authorName: string;
  authorSubtitle: string;
  copy: string;
  igProfileUrl?: string;
  videoUrl?: string;
  screenshotUrl?: string;
  createdAt: string;
}

// ─── Add Testimonial Form ───
function AddTestimonialForm({ type, onAdd }: {
  type: "ig" | "video" | "written" | "screenshot";
  onAdd: (block: TestimonialBlock) => void;
}) {
  const [title, setTitle] = useState("");
  const [authorName, setAuthorName] = useState("");
  const [authorSubtitle, setAuthorSubtitle] = useState("");
  const [copy, setCopy] = useState("");
  const [igProfileUrl, setIgProfileUrl] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [screenshotUrl, setScreenshotUrl] = useState("");
  const igRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLInputElement>(null);
  const ssRef = useRef<HTMLInputElement>(null);

  const handleFile = (ref: React.RefObject<HTMLInputElement>, setter: (v: string) => void) => {
    const file = ref.current?.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setter(url);
  };

  const typeLabels: Record<string, string> = {
    ig: "IG Profile Testimonial",
    video: "Video/Copy Testimonial",
    written: "Written Testimonial",
    screenshot: "Screenshot Testimonial",
  };

  const handleGenerate = () => {
    if (!title || !authorName) {
      toast.error("Title and Author Name are required");
      return;
    }
    const block: TestimonialBlock = {
      id: crypto.randomUUID(),
      type,
      title,
      authorName,
      authorSubtitle,
      copy,
      igProfileUrl: igProfileUrl || undefined,
      videoUrl: videoUrl || undefined,
      screenshotUrl: screenshotUrl || undefined,
      createdAt: new Date().toISOString(),
    };
    onAdd(block);
    setTitle(""); setAuthorName(""); setAuthorSubtitle(""); setCopy("");
    setIgProfileUrl(""); setVideoUrl(""); setScreenshotUrl("");
    toast.success(`${authorName} Testimonial Block created!`);
  };

  return (
    <div className="border border-primary/20 rounded-xl bg-primary/5 p-5 space-y-4">
      <h4 className="text-sm font-bold text-primary flex items-center gap-2">
        <Plus className="w-4 h-4" /> Add New {typeLabels[type]}
      </h4>

      {/* Title */}
      <div className="space-y-1">
        <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Testimonial Title</label>
        <Input value={title} onChange={e => setTitle(e.target.value)} placeholder={`e.g. "Life-changing in 3 days"`} className="h-8 text-xs" />
      </div>

      {/* IG Profile SS */}
      {(type === "ig" || type === "screenshot") && (
        <div className="space-y-1">
          <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
            {type === "ig" ? "IG Profile Screenshot" : "Screenshot Testimonial"}
          </label>
          <div className="flex items-center gap-2">
            <Button size="sm" variant="outline" className="h-8 text-xs gap-1.5" onClick={() => igRef.current?.click()}>
              <Upload className="w-3 h-3" /> Upload Image
            </Button>
            <input ref={igRef} type="file" accept="image/*" className="hidden" onChange={() => handleFile(igRef, setIgProfileUrl)} />
            {igProfileUrl && <img src={igProfileUrl} alt="Preview" className="h-8 w-8 rounded-md object-cover border border-border/40" />}
            {igProfileUrl && <span className="text-[10px] text-emerald-500">✓ Uploaded</span>}
          </div>
        </div>
      )}

      {/* Author Name */}
      <div className="space-y-1">
        <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Author Name</label>
        <Input value={authorName} onChange={e => setAuthorName(e.target.value)} placeholder="e.g. @davenMichaels" className="h-8 text-xs" />
      </div>

      {/* Author Authority */}
      <div className="space-y-1">
        <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Author Authority Subtitle</label>
        <Input value={authorSubtitle} onChange={e => setAuthorSubtitle(e.target.value)} placeholder="e.g. Neuroscience Coach · 2.1M Followers" className="h-8 text-xs" />
      </div>

      {/* Video Upload */}
      {(type === "ig" || type === "video") && (
        <div className="space-y-1">
          <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Upload Video Testimonial</label>
          <div className="flex items-center gap-2">
            <Button size="sm" variant="outline" className="h-8 text-xs gap-1.5" onClick={() => videoRef.current?.click()}>
              <Video className="w-3 h-3" /> Upload Video
            </Button>
            <input ref={videoRef} type="file" accept="video/*" className="hidden" onChange={() => handleFile(videoRef, setVideoUrl)} />
            {videoUrl && <span className="text-[10px] text-emerald-500">✓ Video ready</span>}
          </div>
        </div>
      )}

      {/* Copy */}
      <div className="space-y-1">
        <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Testimonial Copy</label>
        <Textarea value={copy} onChange={e => setCopy(e.target.value)}
          placeholder="Paste the testimonial text here…"
          className="text-xs min-h-[80px]" />
      </div>

      {/* Generate button */}
      <Button
        onClick={handleGenerate}
        className="w-full gap-2 font-bold"
        disabled={!title || !authorName}
      >
        <Star className="w-4 h-4" />
        Generate {authorName ? `"${authorName}"` : ""} Testimonial Block
      </Button>
    </div>
  );
}

// ─── Testimonial Block Card ───
function TestimonialCard({ block, onRemove }: { block: TestimonialBlock; onRemove: (id: string) => void }) {
  const typeColors: Record<string, string> = {
    ig: "bg-purple-500/10 text-purple-500 border-purple-500/20",
    video: "bg-blue-500/10 text-blue-500 border-blue-500/20",
    written: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
    screenshot: "bg-amber-500/10 text-amber-500 border-amber-500/20",
  };
  const typeLabels: Record<string, string> = { ig: "IG Profile", video: "Video", written: "Written", screenshot: "Screenshot" };

  return (
    <div className="border border-border/30 rounded-xl bg-card/60 p-4 space-y-3">
      <div className="flex items-start gap-3">
        {block.igProfileUrl && (
          <img src={block.igProfileUrl} alt={block.authorName} className="w-12 h-12 rounded-full object-cover border-2 border-border/40 shrink-0" />
        )}
        {block.screenshotUrl && (
          <img src={block.screenshotUrl} alt="Screenshot" className="w-20 h-14 rounded-lg object-cover border border-border/40 shrink-0" />
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h4 className="text-sm font-bold text-foreground">{block.title}</h4>
            <Badge className={`text-[9px] px-1.5 py-0 ${typeColors[block.type]}`}>{typeLabels[block.type]}</Badge>
          </div>
          <p className="text-xs font-semibold text-foreground/80 mt-0.5">{block.authorName}</p>
          {block.authorSubtitle && <p className="text-[10px] text-muted-foreground">{block.authorSubtitle}</p>}
        </div>
        <button onClick={() => onRemove(block.id)} className="text-muted-foreground hover:text-red-400 transition-colors shrink-0">
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>

      {block.videoUrl && (
        <video src={block.videoUrl} controls className="w-full rounded-lg max-h-48 bg-black/20" />
      )}

      {block.copy && (
        <div className="bg-secondary/20 rounded-lg px-3 py-2">
          <p className="text-[11px] text-foreground/80 italic">"{block.copy}"</p>
        </div>
      )}
    </div>
  );
}

// ─── Video Blocks Section ───
function VideoBlocksSection({ subFilter }: { subFilter: BlockSubFilter }) {
  const [showForm, setShowForm] = useState(false);
  const [testimonials, setTestimonials] = useState<TestimonialBlock[]>([]);

  const typeMap: Record<string, "ig" | "video" | "written" | "screenshot"> = {
    "video-testimonial-ig": "ig",
    "video-testimonial-video": "video",
    "written-testimonial": "written",
    "screenshot-testimonial": "screenshot",
  };

  const titleMap: Record<string, string> = {
    "video-testimonial-ig": "Testimonials + IG Profile SS",
    "video-testimonial-video": "Video/Copy Testimonials",
    "written-testimonial": "Written Testimonials",
    "screenshot-testimonial": "Screenshot Testimonials",
  };

  const descMap: Record<string, string> = {
    "video-testimonial-ig": "Full video testimonials with IG profile screenshot, author credentials, and social proof copy.",
    "video-testimonial-video": "Video-first testimonials with optional copy overlay and author details.",
    "written-testimonial": "Long-form written testimonials with author name and authority badge.",
    "screenshot-testimonial": "Screenshot-based testimonials from social posts, DMs, or comments.",
  };

  const currentType = typeMap[subFilter] || "ig";
  const filtered = testimonials.filter(t => t.type === currentType);

  const handleAdd = (block: TestimonialBlock) => {
    setTestimonials(prev => [block, ...prev]);
    setShowForm(false);
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-bold text-foreground">{titleMap[subFilter]}</h3>
          <p className="text-xs text-muted-foreground mt-0.5">{descMap[subFilter]}</p>
        </div>
        <Button size="sm" className="gap-1.5 text-xs" onClick={() => setShowForm(p => !p)}>
          <Plus className="w-3.5 h-3.5" />
          Add New {typeMap[subFilter] === "ig" ? "IG Testimonial" :
            typeMap[subFilter] === "video" ? "Video Testimonial" :
            typeMap[subFilter] === "written" ? "Written Testimonial" : "Screenshot Testimonial"}
        </Button>
      </div>

      {showForm && (
        <AddTestimonialForm type={currentType} onAdd={handleAdd} />
      )}

      {filtered.length === 0 && !showForm && (
        <div className="text-center py-12 border border-dashed border-border/30 rounded-xl text-muted-foreground">
          <Video className="w-8 h-8 mx-auto mb-2 opacity-30" />
          <p className="text-sm font-medium">No {titleMap[subFilter]} yet</p>
          <p className="text-xs mt-1">Click "Add New" to create your first block</p>
        </div>
      )}

      <div className="space-y-3">
        {filtered.map(block => (
          <TestimonialCard key={block.id} block={block}
            onRemove={(id) => setTestimonials(prev => prev.filter(t => t.id !== id))} />
        ))}
      </div>
    </div>
  );
}

// ─── Vault Videos Section ───
function VaultVideosSection({ subFilter }: { subFilter: BlockSubFilter }) {
  const [showUpload, setShowUpload] = useState(false);
  const [vaultLabel, setVaultLabel] = useState("");
  const [vaultNotes, setVaultNotes] = useState("");
  const [vaultUrl, setVaultUrl] = useState("");
  const [vaultItems, setVaultItems] = useState<{ id: string; label: string; notes: string; url: string; type: string }[]>([]);
  const fileRef = useRef<HTMLInputElement>(null);

  const titleMap: Record<string, string> = {
    "vault-editing": "Editing Style Videos",
    "vault-repost": "Ready to Repost",
    "vault-edit": "Ready to Edit",
    "vault-clip": "Ready to Clip",
  };

  const descMap: Record<string, string> = {
    "vault-editing": "Reference editing styles and visual formats for the team.",
    "vault-repost": "Finished videos ready to repost as-is on any platform.",
    "vault-edit": "Raw footage or partially edited clips ready for editing.",
    "vault-clip": "Long-form content ready to be clipped into short-form.",
  };

  const handleFile = () => {
    const file = fileRef.current?.files?.[0];
    if (!file) return;
    setVaultUrl(URL.createObjectURL(file));
    if (!vaultLabel) setVaultLabel(file.name.replace(/\.[^.]+$/, ""));
  };

  const handleSave = () => {
    if (!vaultLabel) { toast.error("Label is required"); return; }
    setVaultItems(prev => [{ id: crypto.randomUUID(), label: vaultLabel, notes: vaultNotes, url: vaultUrl, type: subFilter }, ...prev]);
    setVaultLabel(""); setVaultNotes(""); setVaultUrl("");
    setShowUpload(false);
    toast.success("Vault video added!");
  };

  const filtered = vaultItems.filter(v => v.type === subFilter);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-bold text-foreground">{titleMap[subFilter]}</h3>
          <p className="text-xs text-muted-foreground mt-0.5">{descMap[subFilter]}</p>
        </div>
        <Button size="sm" className="gap-1.5 text-xs" onClick={() => setShowUpload(p => !p)}>
          <Plus className="w-3.5 h-3.5" /> Add Vault Video
        </Button>
      </div>

      {showUpload && (
        <div className="border border-primary/20 rounded-xl bg-primary/5 p-5 space-y-4">
          <h4 className="text-sm font-bold text-primary flex items-center gap-2"><Film className="w-4 h-4" /> Upload Vault Video</h4>
          <div className="space-y-1">
            <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Video Label</label>
            <Input value={vaultLabel} onChange={e => setVaultLabel(e.target.value)} placeholder="e.g. Gratitude Montage v2" className="h-8 text-xs" />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Upload Video</label>
            <div className="flex items-center gap-2">
              <Button size="sm" variant="outline" className="h-8 text-xs gap-1.5" onClick={() => fileRef.current?.click()}>
                <Upload className="w-3 h-3" /> Choose File
              </Button>
              <input ref={fileRef} type="file" accept="video/*" className="hidden" onChange={handleFile} />
              {vaultUrl && <span className="text-[10px] text-emerald-500">✓ Ready</span>}
            </div>
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Notes / Instructions</label>
            <Textarea value={vaultNotes} onChange={e => setVaultNotes(e.target.value)}
              placeholder="Usage notes, clip points, style notes…" className="text-xs min-h-[60px]" />
          </div>
          <Button onClick={handleSave} className="w-full gap-2 font-bold" disabled={!vaultLabel}>
            <Save className="w-4 h-4" /> Save to Vault
          </Button>
        </div>
      )}

      {filtered.length === 0 && !showUpload && (
        <div className="text-center py-12 border border-dashed border-border/30 rounded-xl text-muted-foreground">
          <Film className="w-8 h-8 mx-auto mb-2 opacity-30" />
          <p className="text-sm font-medium">No {titleMap[subFilter]} yet</p>
          <p className="text-xs mt-1">Click "Add Vault Video" to upload your first video</p>
        </div>
      )}

      <div className="grid gap-3">
        {filtered.map(v => (
          <div key={v.id} className="border border-border/30 rounded-xl bg-card/60 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold text-foreground">{v.label}</h4>
              <button onClick={() => setVaultItems(prev => prev.filter(i => i.id !== v.id))}
                className="text-muted-foreground hover:text-red-400 transition-colors">
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
            {v.url && <video src={v.url} controls className="w-full rounded-lg max-h-48 bg-black/20" />}
            {v.notes && <p className="text-[11px] text-muted-foreground">{v.notes}</p>}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Block List Item ───
function BlockListItem({
  block: b,
  onDuplicate,
  onRemove,
  onUpdateDesc,
}: {
  block: IntelligentBlock;
  onDuplicate: (block: IntelligentBlock) => void;
  onRemove: (block: IntelligentBlock) => void;
  onUpdateDesc: (id: string, desc: string) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const [editingCopy, setEditingCopy] = useState(false);
  const [copyText, setCopyText] = useState(b.description);
  const compName = resolvePreviewComponent(b.component);
  const hasPreview = compName.length > 0;
  const previewUrl = hasPreview ? `/block-preview?component=${encodeURIComponent(compName)}` : "";
  const IconComp = ICON_MAP[b.icon_name] || Zap;

  return (
    <div className="border border-border/30 rounded-xl bg-card/60 hover:border-border/50 transition-all group">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center gap-4 px-4 py-3 text-left hover:bg-secondary/20 transition-colors"
      >
        <div className="w-[140px] h-[90px] rounded-lg border border-border/40 bg-secondary/20 overflow-hidden shrink-0 flex items-center justify-center">
          {hasPreview ? (
            <div className="text-center">
              <IconComp className="w-6 h-6 text-primary/40 mx-auto mb-1" />
              <span className="text-[8px] text-muted-foreground font-mono">{compName}</span>
            </div>
          ) : (
            <div className="text-center">
              <IconComp className="w-6 h-6 text-muted-foreground/30 mx-auto mb-1" />
              <span className="text-[8px] text-muted-foreground/50">Inline</span>
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <IconComp className="w-4 h-4 text-primary shrink-0" />
            <h3 className="text-sm font-bold text-foreground truncate">{b.name}</h3>
            <Badge className={`text-[9px] px-1.5 py-0.5 leading-tight ${BLOCK_CATEGORY_COLORS[b.category] || "bg-secondary text-foreground border-border"}`}>
              {b.category}
            </Badge>
          </div>
          <p className="text-[11px] text-muted-foreground font-mono truncate mt-1">{b.component}</p>
          <p className="text-[10px] text-muted-foreground mt-1 line-clamp-2">{b.description}</p>
          <div className="flex gap-1 mt-2">
            {b.used_in.slice(0, 3).map(page => (
              <Badge key={page} variant="outline" className="text-[8px] px-1 py-0 bg-secondary/30">{page}</Badge>
            ))}
            {b.used_in.length > 3 && <Badge variant="outline" className="text-[8px] px-1 py-0">+{b.used_in.length - 3}</Badge>}
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {expanded ? <ChevronDown className="w-4 h-4 text-muted-foreground" /> : <ChevronRight className="w-4 h-4 text-muted-foreground" />}
        </div>
      </button>

      {expanded && (
        <div className="border-t border-border/20 px-4 pb-4 pt-3 space-y-3">
          <div className="flex flex-wrap gap-1.5 items-center">
            <span className="text-[9px] font-semibold text-muted-foreground uppercase tracking-wider">Used in:</span>
            {b.used_in.map(page => (
              <button key={page} onClick={(e) => { e.stopPropagation(); window.open(`${window.location.origin}${page}`, "_blank"); }}
                className="text-[9px] bg-primary/5 text-primary border border-primary/20 px-1.5 py-0.5 rounded-md hover:bg-primary/10 transition-colors flex items-center gap-0.5">
                {page} <ExternalLink className="w-2.5 h-2.5" />
              </button>
            ))}
          </div>

          <div className="flex flex-wrap gap-1.5" onClick={e => e.stopPropagation()}>
            <SmartTagBadge tag={b.category} />
          </div>

          <div className="bg-secondary/20 rounded-lg p-3 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[9px] font-semibold text-muted-foreground uppercase tracking-wider">Descripción / Copy</span>
              {!editingCopy && (
                <Button size="sm" variant="ghost" className="h-6 text-[10px] gap-1" onClick={() => setEditingCopy(true)}>
                  <Pencil className="w-3 h-3" /> Editar
                </Button>
              )}
            </div>
            {editingCopy ? (
              <div className="space-y-2">
                <Textarea value={copyText} onChange={e => setCopyText(e.target.value)} className="text-xs min-h-[60px]" />
                <div className="flex gap-1.5">
                  <Button size="sm" className="h-6 text-[10px] gap-1" onClick={() => { setEditingCopy(false); onUpdateDesc(b.id, copyText); }}>
                    <Save className="w-3 h-3" /> Guardar
                  </Button>
                  <Button size="sm" variant="ghost" className="h-6 text-[10px]" onClick={() => { setEditingCopy(false); setCopyText(b.description); }}>
                    <X className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            ) : (
              <p className="text-[11px] text-foreground/80">{copyText}</p>
            )}
          </div>

          <div className="flex items-center gap-2 pt-1">
            <Button size="sm" variant="outline" className="h-7 text-[10px] gap-1" onClick={(e) => { e.stopPropagation(); onDuplicate(b); }}>
              <Copy className="w-3 h-3" /> Duplicar
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button size="sm" variant="outline" className="h-7 text-[10px] gap-1 text-red-400 border-red-500/30 hover:bg-red-500/10">
                  <Trash2 className="w-3 h-3" /> Remover
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>¿Remover "{b.name}"?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Este bloque se usa en {b.used_in.length} página(s): {b.used_in.join(", ")}.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction onClick={() => onRemove(b)} className="bg-red-600 hover:bg-red-700">Remover</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>

          {hasPreview && (
            <div className="rounded-xl border border-border/30 overflow-hidden bg-background">
              <div className="flex items-center justify-between px-3 py-2 bg-secondary/30 border-b border-border/20">
                <span className="text-[10px] font-mono text-muted-foreground">{b.name} — Preview</span>
                <button onClick={(e) => { e.stopPropagation(); window.open(previewUrl, "_blank"); }}
                  className="text-[10px] text-primary hover:underline flex items-center gap-1">
                  <Maximize2 className="w-3 h-3" /> Full screen
                </button>
              </div>
              <div className="w-full overflow-hidden" style={{ height: "400px" }}>
                <iframe src={previewUrl} className="w-full h-full border-0" title={`Preview: ${b.name}`}
                  loading="lazy" sandbox="allow-scripts allow-same-origin" />
              </div>
            </div>
          )}

          {!hasPreview && (
            <div className="rounded-lg border border-border/20 bg-secondary/10 px-4 py-6 text-center">
              <IconComp className="w-8 h-8 text-muted-foreground/30 mx-auto mb-2" />
              <p className="text-[11px] text-muted-foreground">Inline component — no se puede previsualizar de forma aislada</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Page Block Group ───
function PageBlockGroup({
  page, blocks, onDuplicate, onRemove, onUpdateDesc,
}: {
  page: string; blocks: IntelligentBlock[];
  onDuplicate: (b: IntelligentBlock) => void; onRemove: (b: IntelligentBlock) => void; onUpdateDesc: (id: string, desc: string) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const isRoute = page.startsWith("/");

  return (
    <div className="space-y-2">
      <button onClick={() => setExpanded(!expanded)} className="flex items-center gap-2 w-full text-left hover:opacity-80 transition-opacity">
        {expanded ? <ChevronDown className="w-4 h-4 text-primary" /> : <ChevronRight className="w-4 h-4 text-muted-foreground" />}
        {isRoute ? <Globe className="w-3.5 h-3.5 text-blue-400" /> : <FileText className="w-3.5 h-3.5 text-purple-400" />}
        <h3 className="text-sm font-bold text-foreground">{page}</h3>
        <Badge variant="outline" className="text-[9px]">{blocks.length} blocks</Badge>
        {isRoute && (
          <button onClick={(e) => { e.stopPropagation(); window.open(`${window.location.origin}${page}`, "_blank"); }}
            className="text-[9px] text-primary hover:underline ml-auto">Abrir ↗</button>
        )}
      </button>
      {expanded && (
        <div className="space-y-2 pl-4">
          {blocks.map(b => (
            <BlockListItem key={b.id} block={b}
              onDuplicate={onDuplicate} onRemove={onRemove} onUpdateDesc={onUpdateDesc} />
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Category header mapping ───
const CAT_SECTION_LABELS: Record<string, { label: string; desc: string; color: string }> = {
  all: { label: "All Blocks", desc: "Complete registry of all intelligent blocks across the funnel", color: "text-foreground" },
  Content: { label: "Content Blocks", desc: "Quotes, science anchors, storytelling, and brand identity", color: "text-blue-500" },
  Product: { label: "Product Blocks", desc: "Wristband, shirts, cart, and product showcase sections", color: "text-amber-500" },
  CTA: { label: "CTA Blocks", desc: "Conversion action buttons and checkout drivers", color: "text-primary" },
  Hero: { label: "Hero Sections", desc: "Above-the-fold headline and offer introduction blocks", color: "text-purple-500" },
  Trust: { label: "Trust & Social Proof", desc: "Testimonials, guarantees, author authority, and risk reversals", color: "text-emerald-500" },
  Urgency: { label: "Urgency & Scarcity", desc: "Timers, exit-intent, stock decay, and downsell triggers", color: "text-red-500" },
  Viral: { label: "Viral & Gamification", desc: "Share nudges, impact counters, and gamification headers", color: "text-pink-500" },
  "Value Stack": { label: "Value Stack Blocks", desc: "Benefits lists and ROI-focused value communication", color: "text-orange-500" },
  System: { label: "System Blocks (Live DB)", desc: "Real-time clipper, payout, and portal data blocks", color: "text-cyan-500" },
  clippers: { label: "Clipper Blocks", desc: "Payout queues, approval backlogs, earnings, and risk throttles", color: "text-indigo-500" },
  affiliates: { label: "Affiliate Blocks", desc: "Ambassador upgrades, referrer revenue, and wristband distribution", color: "text-amber-600" },
  retention: { label: "Retention Blocks", desc: "Login streaks, BlessedCoin circulation, redemptions, and churn risk", color: "text-teal-500" },
};

const VIDEO_SUB_FILTERS: BlockSubFilter[] = ["video-testimonial-ig", "video-testimonial-video", "written-testimonial", "screenshot-testimonial"];
const VAULT_SUB_FILTERS: BlockSubFilter[] = ["vault-editing", "vault-repost", "vault-edit", "vault-clip"];

// ─── Main Tab ───
export default function IntelligentBlocksTab({ blockSubFilter = "all" }: { blockSubFilter?: BlockSubFilter }) {
  const { blocks, isLoading, updateBlock, duplicateBlock, deleteBlock } = useIntelligentBlocks();
  const [search, setSearch] = useState("");
  const [viewMode, setViewMode] = useState<"category" | "page">("category");

  if (isLoading) {
    return <div className="flex justify-center py-20"><RefreshCw className="w-6 h-6 animate-spin text-primary" /></div>;
  }

  // Route to video blocks section
  if (VIDEO_SUB_FILTERS.includes(blockSubFilter)) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-2 mb-2">
          <Video className="w-5 h-5 text-purple-500" />
          <h2 className="text-lg font-bold text-foreground">Video Blocks</h2>
          <Badge className="bg-purple-500/10 text-purple-500 border-purple-500/20 text-[10px]">Testimonials</Badge>
        </div>
        <VideoBlocksSection subFilter={blockSubFilter} />
      </div>
    );
  }

  // Route to vault section
  if (VAULT_SUB_FILTERS.includes(blockSubFilter)) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-2 mb-2">
          <Film className="w-5 h-5 text-amber-500" />
          <h2 className="text-lg font-bold text-foreground">Vault Videos</h2>
          <Badge className="bg-amber-500/10 text-amber-500 border-amber-500/20 text-[10px]">Content Library</Badge>
        </div>
        <VaultVideosSection subFilter={blockSubFilter} />
      </div>
    );
  }

  // Standard blocks view
  const catInfo = CAT_SECTION_LABELS[blockSubFilter] || CAT_SECTION_LABELS.all;
  const categories = Array.from(new Set(blocks.map(b => b.category)));

  const filtered = blocks.filter(b => {
    if (blockSubFilter !== "all" && b.category !== blockSubFilter) return false;
    if (search && !b.name.toLowerCase().includes(search.toLowerCase()) && !b.description.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const pageMap = new Map<string, IntelligentBlock[]>();
  filtered.forEach(b => {
    b.used_in.forEach(page => {
      if (!pageMap.has(page)) pageMap.set(page, []);
      pageMap.get(page)!.push(b);
    });
  });
  const pageGroups = Array.from(pageMap.entries()).sort((a, b) => b[1].length - a[1].length);

  const handleDuplicate = (block: IntelligentBlock) => duplicateBlock.mutate(block);
  const handleRemove = (block: IntelligentBlock) => deleteBlock.mutate(block.id);
  const handleUpdateDesc = (id: string, desc: string) => updateBlock.mutate({ id, description: desc });

  return (
    <div className="space-y-6">
      <AdminSectionDashboard
        title="Intelligent Blocks Registry"
        description={`${blocks.length} reusable components across the funnel — live from database`}
        kpis={[
          { label: "Total Blocks", value: blocks.length },
          { label: "Categories", value: categories.length },
          { label: "Pages", value: Array.from(new Set(blocks.flatMap(b => b.used_in))).length },
          { label: "With Preview", value: blocks.filter(b => resolvePreviewComponent(b.component).length > 0).length },
        ]}
        charts={[
          { type: "pie", title: "By Category", data: categories.map(c => ({ name: c, value: blocks.filter(b => b.category === c).length })) },
        ]}
      />

      {/* Section header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className={cn("text-base font-bold", catInfo.color)}>{catInfo.label}</h2>
          <p className="text-xs text-muted-foreground mt-0.5">{catInfo.desc}</p>
        </div>
        <Badge variant="outline" className="text-xs">{filtered.length} block{filtered.length !== 1 ? "s" : ""}</Badge>
      </div>

      {/* View toggle + Search */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex items-center bg-secondary/50 rounded-lg p-0.5 mr-2">
          <button onClick={() => setViewMode("category")}
            className={cn("px-2.5 py-1 text-[10px] font-semibold rounded-md transition-colors",
              viewMode === "category" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground")}>
            Por Categoría
          </button>
          <button onClick={() => setViewMode("page")}
            className={cn("px-2.5 py-1 text-[10px] font-semibold rounded-md transition-colors flex items-center gap-1",
              viewMode === "page" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground")}>
            <Globe className="w-3 h-3" /> Por Página
          </button>
        </div>
        <div className="ml-auto">
          <Input placeholder="Search blocks…" value={search} onChange={e => setSearch(e.target.value)} className="h-8 w-48 text-xs" />
        </div>
      </div>

      {viewMode === "category" ? (
        <div className="space-y-2">
          {filtered.map(b => (
            <BlockListItem key={b.id} block={b}
              onDuplicate={handleDuplicate} onRemove={handleRemove} onUpdateDesc={handleUpdateDesc} />
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {pageGroups.map(([page, pageBlocks]) => (
            <PageBlockGroup key={page} page={page} blocks={pageBlocks}
              onDuplicate={handleDuplicate} onRemove={handleRemove} onUpdateDesc={handleUpdateDesc} />
          ))}
        </div>
      )}

      {filtered.length === 0 && <div className="text-center py-12 text-muted-foreground text-sm">No blocks match your filter.</div>}
    </div>
  );
}
