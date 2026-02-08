import { useState } from "react";
import { BoardColumn } from "@/hooks/useBoard";
import { PipelineMode } from "@/hooks/useAutoExecute";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, Square, Zap, Sparkles, Play, ShieldCheck, Workflow } from "lucide-react";

interface PipelineControlsProps {
  columns: BoardColumn[];
  isRunning: boolean;
  currentPhase: string | null;
  currentCardTitle: string | null;
  processedCount: number;
  onExecute: (columnId: string, mode: PipelineMode, columnMap?: Record<string, string>) => void;
  onStop: () => void;
}

const MODES: { value: PipelineMode; label: string; shortLabel: string; icon: React.ReactNode; description: string }[] = [
  { value: "clarify", label: "Clarify", shortLabel: "💡", icon: <Sparkles className="w-3.5 h-3.5" />, description: "Generate master prompts" },
  { value: "execute", label: "Execute", shortLabel: "⚡", icon: <Play className="w-3.5 h-3.5" />, description: "Run AI on prompts" },
  { value: "validate", label: "Validate", shortLabel: "🔍", icon: <ShieldCheck className="w-3.5 h-3.5" />, description: "Test & verify" },
  { value: "sixsigma", label: "Six Sigma", shortLabel: "🔬", icon: <ShieldCheck className="w-3.5 h-3.5" />, description: "DMAIC verification" },
  { value: "full", label: "Full Pipeline", shortLabel: "🎯", icon: <Workflow className="w-3.5 h-3.5" />, description: "Clarify → Execute → Validate → 6σ" },
];

export default function PipelineControls({
  columns, isRunning, currentPhase, currentCardTitle, processedCount,
  onExecute, onStop,
}: PipelineControlsProps) {
  const [selectedColumn, setSelectedColumn] = useState("");
  const [selectedMode, setSelectedMode] = useState<PipelineMode>("execute");

  // For full pipeline, we auto-map columns
  const [clarifyCol, setClarifyCol] = useState("");
  const [executeCol, setExecuteCol] = useState("");
  const [validateCol, setValidateCol] = useState("");
  const [sixsigmaCol, setSixsigmaCol] = useState("");

  const handleStart = () => {
    if (selectedMode === "full") {
      if (!clarifyCol || !executeCol || !validateCol) return;
      onExecute(clarifyCol, "full", { clarify: clarifyCol, execute: executeCol, validate: validateCol, sixsigma: sixsigmaCol });
    } else {
      if (!selectedColumn) return;
      onExecute(selectedColumn, selectedMode);
    }
  };

  const isFullMode = selectedMode === "full";
  const canStart = isFullMode
    ? !!(clarifyCol && executeCol && validateCol)
    : !!selectedColumn;

  if (isRunning) {
    return (
      <div className="flex items-center gap-2 w-full">
        <div className="flex items-center gap-2 text-xs flex-1 min-w-0">
          <Loader2 className="w-3.5 h-3.5 animate-spin text-primary flex-shrink-0" />
          <span className="text-muted-foreground truncate">
            {currentPhase ? `${currentPhase} — ` : ""}
            {currentCardTitle || "Processing..."}
          </span>
          <span className="font-mono text-primary flex-shrink-0">{processedCount}</span>
        </div>
        <Button variant="destructive" size="sm" onClick={onStop} className="flex-shrink-0 h-8">
          <Square className="w-3 h-3 mr-1" />
          <span className="hidden sm:inline">Stop</span>
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2 w-full">
      {/* Row 1: Mode selector */}
      <div className="flex items-center gap-2">
        {MODES.map((m) => (
          <button
            key={m.value}
            onClick={() => setSelectedMode(m.value)}
            className={`flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium transition-colors border ${
              selectedMode === m.value
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-muted/50 text-muted-foreground border-border hover:bg-muted"
            }`}
          >
            <span className="sm:hidden">{m.shortLabel}</span>
            <span className="hidden sm:flex items-center gap-1">
              {m.icon} {m.label}
            </span>
          </button>
        ))}
      </div>

      {/* Row 2: Column selection + Go */}
      <div className="flex items-center gap-2">
        {isFullMode ? (
          <div className="flex flex-1 gap-1.5 overflow-x-auto">
            <ColumnPicker
              label="Clarify"
              value={clarifyCol}
              onChange={setClarifyCol}
              columns={columns}
            />
            <ColumnPicker
              label="Execute"
              value={executeCol}
              onChange={setExecuteCol}
              columns={columns}
            />
            <ColumnPicker
              label="Validate"
              value={validateCol}
              onChange={setValidateCol}
              columns={columns}
            />
            <ColumnPicker
              label="6σ"
              value={sixsigmaCol}
              onChange={setSixsigmaCol}
              columns={columns}
            />
          </div>
        ) : (
          <Select value={selectedColumn} onValueChange={setSelectedColumn}>
            <SelectTrigger className="flex-1 h-8 text-xs bg-background">
              <SelectValue placeholder="Pick column..." />
            </SelectTrigger>
            <SelectContent className="z-50 bg-popover">
              {columns.map((col) => (
                <SelectItem key={col.id} value={col.id} className="text-xs">
                  {col.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        <Button
          size="sm"
          onClick={handleStart}
          disabled={!canStart}
          className="gap-1 flex-shrink-0 h-8"
        >
          <Zap className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Go</span>
        </Button>
      </div>
    </div>
  );
}

function ColumnPicker({
  label, value, onChange, columns,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  columns: BoardColumn[];
}) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="flex-1 min-w-[80px] h-8 text-[10px] sm:text-xs bg-background">
        <SelectValue placeholder={label} />
      </SelectTrigger>
      <SelectContent className="z-50 bg-popover">
        {columns.map((col) => (
          <SelectItem key={col.id} value={col.id} className="text-xs">
            {col.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
