import { useState, useEffect } from "react";
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
import { ExternalLink, Save, Trash2, Clock } from "lucide-react";
import type { BoardCard, BoardColumn } from "@/hooks/useBoard";

interface CardDetailModalProps {
  card: BoardCard | null;
  columns: BoardColumn[];
  open: boolean;
  onClose: () => void;
  onSave: (cardId: string, updates: Partial<BoardCard>) => void;
  onDelete: (cardId: string) => void;
  isAdmin: boolean;
}

const CardDetailModal = ({
  card,
  columns,
  open,
  onClose,
  onSave,
  onDelete,
  isAdmin,
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
    }
  }, [card]);

  if (!card) return null;

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
    });
    onClose();
  };

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
      <DialogContent className="max-w-2xl max-h-[90vh] p-0">
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
                <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Title
                </Label>
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  disabled={!isAdmin}
                  className="mt-1"
                />
              </div>

              {/* Description */}
              <div>
                <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Description
                </Label>
                <Textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  disabled={!isAdmin}
                  rows={3}
                  className="mt-1"
                />
              </div>

              {/* Master Prompt */}
              <div>
                <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  🎯 Master Prompt (Task Instructions)
                </Label>
                <Textarea
                  value={masterPrompt}
                  onChange={(e) => setMasterPrompt(e.target.value)}
                  disabled={!isAdmin}
                  rows={8}
                  className="mt-1 font-mono text-xs"
                  placeholder="Detailed task instructions for execution..."
                />
              </div>

              <Separator />

              {/* Row: Priority + Column + Staging */}
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Priority
                  </Label>
                  <Select value={priority} onValueChange={setPriority} disabled={!isAdmin}>
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="critical">🔴 Critical</SelectItem>
                      <SelectItem value="high">🟠 High</SelectItem>
                      <SelectItem value="medium">🔵 Medium</SelectItem>
                      <SelectItem value="low">⚪ Low</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Column
                  </Label>
                  <Select value={columnId} onValueChange={setColumnId} disabled={!isAdmin}>
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {columns.map((col) => (
                        <SelectItem key={col.id} value={col.id}>
                          {col.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Status
                  </Label>
                  <Select
                    value={stagingStatus}
                    onValueChange={setStagingStatus}
                    disabled={!isAdmin}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="staging">🔵 Staging</SelectItem>
                      <SelectItem value="production">🟢 Production</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Labels */}
              <div>
                <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Labels
                </Label>
                <div className="flex flex-wrap gap-1 mt-1 mb-2">
                  {labels.map((l) => (
                    <Badge
                      key={l}
                      variant="secondary"
                      className="cursor-pointer"
                      onClick={() => isAdmin && removeLabel(l)}
                    >
                      {l} {isAdmin && "×"}
                    </Badge>
                  ))}
                </div>
                {isAdmin && (
                  <div className="flex gap-2">
                    <Input
                      value={labelInput}
                      onChange={(e) => setLabelInput(e.target.value)}
                      placeholder="Add label..."
                      className="flex-1"
                      onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addLabel())}
                    />
                    <Button variant="outline" size="sm" onClick={addLabel}>
                      Add
                    </Button>
                  </div>
                )}
              </div>

              <Separator />

              {/* Dev Logs */}
              <div>
                <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  📋 Development Logs
                </Label>
                <Textarea
                  value={logs}
                  onChange={(e) => setLogs(e.target.value)}
                  disabled={!isAdmin}
                  rows={4}
                  className="mt-1 font-mono text-xs"
                  placeholder="Log entries from development..."
                />
              </div>

              {/* Summary */}
              <div>
                <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  📝 Summary
                </Label>
                <Textarea
                  value={summary}
                  onChange={(e) => setSummary(e.target.value)}
                  disabled={!isAdmin}
                  rows={3}
                  className="mt-1"
                  placeholder="Summary of what was done..."
                />
              </div>

              {/* Preview Link */}
              <div>
                <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  🔗 Preview / Test Link
                </Label>
                <div className="flex gap-2 mt-1">
                  <Input
                    value={previewLink}
                    onChange={(e) => setPreviewLink(e.target.value)}
                    disabled={!isAdmin}
                    placeholder="https://preview-url..."
                    className="flex-1"
                  />
                  {previewLink && (
                    <Button variant="outline" size="icon" asChild>
                      <a href={previewLink} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    </Button>
                  )}
                </div>
              </div>

              {/* Timestamps */}
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  Created: {new Date(card.created_at).toLocaleDateString()}
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  Updated: {new Date(card.updated_at).toLocaleDateString()}
                </div>
              </div>

              <Separator />

              {/* Actions */}
              {isAdmin && (
                <div className="flex items-center justify-between">
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => {
                      onDelete(card.id);
                      onClose();
                    }}
                  >
                    <Trash2 className="w-4 h-4 mr-1" />
                    Delete Card
                  </Button>
                  <Button onClick={handleSave}>
                    <Save className="w-4 h-4 mr-1" />
                    Save Changes
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
