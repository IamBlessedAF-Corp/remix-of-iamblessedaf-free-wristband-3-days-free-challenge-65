import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

export const STAGES = [
  { value: "stage-1", label: "🚀 Stage 1 — MVP Launch", color: "bg-blue-500" },
  { value: "stage-2", label: "💳 Stage 2 — Payments", color: "bg-green-500" },
  { value: "stage-3", label: "📱 Stage 3 — Comms Automation", color: "bg-purple-500" },
  { value: "stage-4", label: "📈 Stage 4 — Scale & Optimize", color: "bg-orange-500" },
  { value: "stage-5", label: "🏛️ Stage 5 — High-Ticket & DAO", color: "bg-yellow-500" },
] as const;

export function getStageInfo(stage: string) {
  return STAGES.find((s) => s.value === stage) || STAGES[0];
}

interface StageSelectorProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  showLabel?: boolean;
}

export default function StageSelector({ value, onChange, disabled, showLabel = true }: StageSelectorProps) {
  return (
    <div>
      {showLabel && (
        <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          Stage
        </Label>
      )}
      <Select value={value} onValueChange={onChange} disabled={disabled}>
        <SelectTrigger className={showLabel ? "mt-1" : ""}>
          <SelectValue placeholder="Select stage..." />
        </SelectTrigger>
        <SelectContent>
          {STAGES.map((s) => (
            <SelectItem key={s.value} value={s.value}>
              {s.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
