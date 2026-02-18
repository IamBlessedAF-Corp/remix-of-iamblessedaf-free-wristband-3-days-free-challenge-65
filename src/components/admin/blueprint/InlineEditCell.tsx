import { useState, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Check, X, Loader2, Pencil } from "lucide-react";
import { toast } from "sonner";

interface InlineEditProps {
  configKey: string;
  fallback: string;
  label: string;
  category?: string;
  affectedAreas?: string[];
  getValue: (key: string, fallback?: string) => string;
  saveChanges: (changes: { key: string; label: string; oldValue: string; newValue: string; affected_areas: string[]; category: string }[]) => Promise<void>;
  className?: string;
  mono?: boolean;
}

export default function InlineEditCell({
  configKey, fallback, label, category = "blueprint_msg",
  affectedAreas = [], getValue, saveChanges, className = "", mono = false,
}: InlineEditProps) {
  const currentVal = getValue(configKey, fallback);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(currentVal);
  const [saving, setSaving] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const startEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    setDraft(currentVal);
    setEditing(true);
    setTimeout(() => inputRef.current?.focus(), 50);
  };

  const cancel = () => { setEditing(false); setDraft(currentVal); };

  const save = async () => {
    if (draft === currentVal) { setEditing(false); return; }
    setSaving(true);
    try {
      await saveChanges([{
        key: configKey, label, oldValue: currentVal, newValue: draft,
        affected_areas: affectedAreas, category,
      }]);
      toast.success(`${label} updated`);
      setEditing(false);
    } catch {
      toast.error("Failed to save");
    } finally {
      setSaving(false);
    }
  };

  if (editing) {
    return (
      <div className="flex items-center gap-0.5 min-w-0" onClick={e => e.stopPropagation()}>
        <Input
          ref={inputRef}
          value={draft}
          onChange={e => setDraft(e.target.value)}
          onKeyDown={e => { if (e.key === "Enter") save(); if (e.key === "Escape") cancel(); }}
          className="h-6 text-[10px] px-1.5 py-0 min-w-[80px] flex-1 border-primary/40"
          disabled={saving}
        />
        <Button size="icon" variant="ghost" className="h-5 w-5 shrink-0" onClick={save} disabled={saving}>
          {saving ? <Loader2 className="w-2.5 h-2.5 animate-spin" /> : <Check className="w-2.5 h-2.5 text-emerald-400" />}
        </Button>
        <Button size="icon" variant="ghost" className="h-5 w-5 shrink-0" onClick={cancel}>
          <X className="w-2.5 h-2.5 text-muted-foreground" />
        </Button>
      </div>
    );
  }

  return (
    <span
      className={`group/edit cursor-pointer hover:text-foreground transition-colors inline-flex items-center gap-1 ${mono ? "font-mono text-[10px]" : ""} ${className}`}
      onClick={startEdit}
    >
      <span className="truncate">{currentVal}</span>
      <Pencil className="w-2 h-2 opacity-0 group-hover/edit:opacity-50 shrink-0 transition-opacity" />
    </span>
  );
}
