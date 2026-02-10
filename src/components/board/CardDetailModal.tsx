import { useState, useEffect, useRef, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ExternalLink, Save, Trash2, Clock, Upload, X, Image, Clipboard, FileText } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import type { BoardCard, BoardColumn } from "@/hooks/useBoard";
import StageSelector from "./StageSelector";
import DecisionMatrixInput from "./DecisionMatrixInput";
import CardAIChat from "./CardAIChat";
import { computeDelegationScore } from "@/utils/boardHelpers";

interface CardDetailModalProps {
  card: BoardCard | null;
  columns: BoardColumn[];
  open: boolean;
  onClose: () => void;
  onSave: (cardId: string, updates: Partial<BoardCard>) => void;
  onDelete: (cardId: string) => void;
  isAdmin: boolean;
  canEdit: boolean;
}

const CardDetailModal = ({
  card,
  columns,
  open,
  onClose,
  onSave,
  onDelete,
  isAdmin,
  canEdit,
}: CardDetailModalProps) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [masterPrompt, setMasterPrompt] = useState("");
  const [priority, setPriority] = useState("medium");
  const [stagingStatus, setStagingStatus] = useState("staging");
  const [columnId, setColumnId] = useState("");
  const [logs, setLogs] = useState("");
  const [summary, setSummary] = useState("");
  const [previewLink, setPreviewLink] = useState("");
  const [labelInput, setLabelInput] = useState("");
  const [labels, setLabels] = useState<string[]>([]);
  const [screenshots, setScreenshots] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [stage, setStage] = useState("stage-1");
  const [scores, setScores] = useState({ vs_score: 0, cc_score: 0, hu_score: 0, r_score: 0, ad_score: 0 });
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (card) {
      setTitle(card.title);
      setDescription(card.description || "");
      setMasterPrompt(card.master_prompt || "");
      setPriority(card.priority);
      setStagingStatus(card.staging_status);
      setColumnId(card.column_id);
      setLogs(card.logs || "");
      setSummary(card.summary || "");
      setPreviewLink(card.preview_link || "");
      setLabels(card.labels || []);
      setScreenshots(card.screenshots || []);
      setStage(card.stage || "stage-1");
      setScores({
        vs_score: card.vs_score || 0,
        cc_score: card.cc_score || 0,
        hu_score: card.hu_score || 0,
        r_score: card.r_score || 0,
        ad_score: card.ad_score || 0,
      });
    }
  }, [card]);

  const handlePasteScreenshot = useCallback(async () => {
    if (!card) return;
    try {
      const clipboardItems = await navigator.clipboard.read();
      for (const item of clipboardItems) {
        const imageType = item.types.find((t) => t.startsWith("image/"));
        if (imageType) {
          const blob = await item.getType(imageType);
          setUploading(true);
          const fileName = `${card.id}/${Date.now()}-pasted.png`;
          const { data, error } = await supabase.storage
            .from("board-screenshots")
            .upload(fileName, blob, { upsert: false, contentType: imageType });
          if (error) {
            console.error("Paste upload failed:", error);
            setUploading(false);
            return;
          }
          const { data: urlData } = supabase.storage
            .from("board-screenshots")
            .getPublicUrl(data.path);
          setScreenshots((prev) => [...prev, urlData.publicUrl]);
          setUploading(false);
          return;
        }
      }
    } catch (err) {
      console.error("Clipboard paste failed:", err);
    }
  }, [card]);

  if (!card) return null;

  const delegationScore = computeDelegationScore(scores);

  const handleScoreChange = (key: string, value: number) => {
    setScores((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = () => {
    onSave(card.id, {
      title,
      description: description || null,
      master_prompt: masterPrompt || null,
      priority,
      staging_status: stagingStatus,
      column_id: columnId,
      logs: logs || null,
      summary: summary || null,
      preview_link: previewLink || null,
      labels,
      screenshots,
      stage,
      vs_score: scores.vs_score,
      cc_score: scores.cc_score,
      hu_score: scores.hu_score,
      r_score: scores.r_score,
      ad_score: scores.ad_score,
      delegation_score: delegationScore,
    });
    onClose();
  };

  const handleUploadScreenshot = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const fileName = `${card.id}/${Date.now()}-${file.name}`;
    const { data, error } = await supabase.storage
      .from("board-screenshots")
      .upload(fileName, file, { upsert: false });
    if (error) {
      console.error("Upload failed:", error);
      setUploading(false);
      return;
    }
    const { data: urlData } = supabase.storage
      .from("board-screenshots")
      .getPublicUrl(data.path);
    setScreenshots([...screenshots, urlData.publicUrl]);
    setUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removeScreenshot = (url: string) => setScreenshots(screenshots.filter((s) => s !== url));

  const addLabel = () => {
    const trimmed = labelInput.trim();
    if (trimmed && !labels.includes(trimmed)) {
      setLabels([...labels, trimmed]);
      setLabelInput("");
    }
  };
  const removeLabel = (l: string) => setLabels(labels.filter((x) => x !== l));
  const currentColumn = columns.find((c) => c.id === columnId);

  return (
    <Dialog open={open} onOpenChange={() => onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] p-0 [&_*]:select-text">
        <ScrollArea className="max-h-[90vh]">
          <div className="p-6">
            <DialogHeader>
              <div className="flex items-center gap-2 mb-1">
                {currentColumn && (
                  <Badge
                    variant="outline"
                    className="text-xs"
                    style={{ borderColor: currentColumn.color, color: currentColumn.color }}
                  >
                    {currentColumn.name}
                  </Badge>
                )}
                <Badge
                  variant={stagingStatus === "production" ? "default" : "secondary"}
                  className="text-xs"
                >
                  {stagingStatus === "production" ? "🟢 Production" : "🔵 Staging"}
                </Badge>
              </div>
              <DialogTitle className="text-xl">{card.title}</DialogTitle>
            </DialogHeader>

            <div className="space-y-4 mt-4">
              {/* Title */}
              <div>
                <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Title</Label>
                <Input value={title} onChange={(e) => setTitle(e.target.value)} disabled={!canEdit} className="mt-1" />
              </div>

              {/* Description */}
              <div>
                <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Description</Label>
                <Textarea value={description} onChange={(e) => setDescription(e.target.value)} disabled={!canEdit} rows={3} className="mt-1" />
              </div>

              {/* Master Prompt */}
              <div>
                <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">🎯 Master Prompt (Task Instructions)</Label>
                <Textarea value={masterPrompt} onChange={(e) => setMasterPrompt(e.target.value)} disabled={!canEdit} rows={8} className="mt-1 font-mono text-xs" placeholder="Detailed task instructions for execution..." />
              </div>

              <Separator />

              {/* Row: Priority + Column + Staging + Stage */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Priority</Label>
                  <Select value={priority} onValueChange={setPriority} disabled={!canEdit}>
                    <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="critical">🔴 Critical</SelectItem>
                      <SelectItem value="high">🟠 High</SelectItem>
                      <SelectItem value="medium">🔵 Medium</SelectItem>
                      <SelectItem value="low">⚪ Low</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Column</Label>
                  <Select value={columnId} onValueChange={setColumnId} disabled={!canEdit}>
                    <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {columns.map((col) => (<SelectItem key={col.id} value={col.id}>{col.name}</SelectItem>))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Status</Label>
                  <Select value={stagingStatus} onValueChange={setStagingStatus} disabled={!canEdit}>
                    <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="staging">🔵 Staging</SelectItem>
                      <SelectItem value="production">🟢 Production</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <StageSelector value={stage} onChange={setStage} disabled={!canEdit} />
              </div>

              <Separator />

              {/* Decision Matrix */}
              <DecisionMatrixInput
                scores={scores}
                delegationScore={delegationScore}
                onChange={handleScoreChange}
                disabled={!canEdit}
              />

              <Separator />

              {/* Labels */}
              <div>
                <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Labels</Label>
                <div className="flex flex-wrap gap-1 mt-1 mb-2">
                  {labels.map((l) => (
                    <Badge key={l} variant="secondary" className="cursor-pointer" onClick={() => canEdit && removeLabel(l)}>
                      {l} {canEdit && "×"}
                    </Badge>
                  ))}
                </div>
                {canEdit && (
                  <div className="flex gap-2">
                    <Input value={labelInput} onChange={(e) => setLabelInput(e.target.value)} placeholder="Add label..." className="flex-1" onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addLabel())} />
                    <Button variant="outline" size="sm" onClick={addLabel}>Add</Button>
                  </div>
                )}
              </div>

              <Separator />

              {/* Review Evidence */}
              <div className="bg-muted/30 rounded-xl p-4 border border-border space-y-4">
                <h3 className="text-sm font-bold text-foreground flex items-center gap-2">📸 Review Evidence</h3>

                {/* Screenshots */}
                <div>
                  <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Screenshots</Label>
                  {screenshots.length > 0 && (
                    <div className="grid grid-cols-2 gap-2 mt-2">
                      {screenshots.map((url, i) => (
                        <div key={i} className="relative group rounded-lg overflow-hidden border border-border">
                          <img src={url} alt={`Screenshot ${i + 1}`} className="w-full h-32 object-cover object-top cursor-pointer" onClick={() => window.open(url, "_blank")} />
                          {canEdit && (
                            <button onClick={() => removeScreenshot(url)} className="absolute top-1 right-1 bg-destructive text-destructive-foreground rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                              <X className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                  {screenshots.length === 0 && (
                    <div className="mt-2 border border-dashed border-border rounded-lg p-4 flex items-center justify-center text-muted-foreground">
                      <Image className="w-4 h-4 mr-2" /><span className="text-xs">No screenshots yet</span>
                    </div>
                  )}
                  {canEdit && (
                    <div className="mt-2 flex gap-2">
                      <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleUploadScreenshot} />
                      <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()} disabled={uploading}>
                        <Upload className="w-3 h-3 mr-1" />{uploading ? "Uploading..." : "Upload"}
                      </Button>
                      <Button variant="outline" size="sm" onClick={handlePasteScreenshot} disabled={uploading}>
                        <Clipboard className="w-3 h-3 mr-1" />Paste from Clipboard
                      </Button>
                    </div>
                  )}
                </div>

                {/* Dev Logs */}
                <div>
                  <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">📋 Development Logs</Label>
                  {logs ? (
                    <ScrollArea className="mt-1 max-h-[200px] rounded-md border border-border bg-background p-3">
                      <pre className="text-[11px] font-mono text-foreground whitespace-pre-wrap break-words leading-relaxed select-text">{logs}</pre>
                    </ScrollArea>
                  ) : (
                    <div className="mt-1 border border-dashed border-border rounded-lg p-4 flex items-center justify-center text-muted-foreground">
                      <FileText className="w-4 h-4 mr-2" /><span className="text-xs">No development logs yet — logs are auto-generated by the AI pipeline</span>
                    </div>
                  )}
                  {canEdit && (
                    <Textarea value={logs} onChange={(e) => setLogs(e.target.value)} rows={2} className="mt-2 font-mono text-xs" placeholder="Add manual log entry..." />
                  )}
                </div>

                {/* Summary */}
                <div>
                  <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">📝 Summary of Changes</Label>
                  <Textarea value={summary} onChange={(e) => setSummary(e.target.value)} disabled={!canEdit} rows={3} className="mt-1" placeholder="Summary of what was done..." />
                </div>

                {/* Preview Link */}
                <div>
                  <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">🔗 Preview / Test Link</Label>
                  <div className="flex gap-2 mt-1">
                    <Input value={previewLink} onChange={(e) => setPreviewLink(e.target.value)} disabled={!canEdit} placeholder="https://preview-url..." className="flex-1" />
                    {previewLink && (
                      <Button variant="outline" size="icon" asChild>
                        <a href={previewLink} target="_blank" rel="noopener noreferrer"><ExternalLink className="w-4 h-4" /></a>
                      </Button>
                    )}
                  </div>
                </div>
              </div>

              <Separator />

              {/* AI Assistant */}
              <CardAIChat cardId={card.id} cardTitle={card.title} disabled={!canEdit} />

              {/* Timestamps */}
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <div className="flex items-center gap-1"><Clock className="w-3 h-3" />Created: {new Date(card.created_at).toLocaleDateString()}</div>
                <div className="flex items-center gap-1"><Clock className="w-3 h-3" />Updated: {new Date(card.updated_at).toLocaleDateString()}</div>
              </div>

              <Separator />

              {/* Actions */}
              {canEdit && (
                <div className="flex items-center justify-between">
                  <Button variant="destructive" size="sm" onClick={() => { onDelete(card.id); onClose(); }}>
                    <Trash2 className="w-4 h-4 mr-1" />Delete Card
                  </Button>
                  <Button onClick={handleSave}>
                    <Save className="w-4 h-4 mr-1" />Save Changes
                  </Button>
                </div>
              )}
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default CardDetailModal;
