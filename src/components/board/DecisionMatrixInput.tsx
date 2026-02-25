import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface ScoreField {
  key: string;
  label: string;
  emoji: string;
  tip: string;
}

const FIELDS: ScoreField[] = [
  { key: "vs_score", label: "VS", emoji: "🎯", tip: "Strategic Value: direct impact on traction (0–5)" },
  { key: "cc_score", label: "CC", emoji: "🧠", tip: "Cognitive Cost: how much it drains your focus/dopamine (0–5)" },
  { key: "hu_score", label: "HU", emoji: "🦄", tip: "Unique Skill: requires your irreplaceable expertise (0–5, inverted)" },
  { key: "r_score", label: "R", emoji: "🔄", tip: "Repeatability: how repetitive/predictable (0–5)" },
  { key: "ad_score", label: "AD", emoji: "🤖", tip: "Automation/Delegability: easy to systematize (0–5)" },
];

interface DecisionMatrixInputProps {
  scores: Record<string, number>;
  delegationScore: number;
  onChange: (key: string, value: number) => void;
  disabled?: boolean;
  compact?: boolean;
}

function getScoreColor(score: number): string {
  if (score >= 70) return "bg-green-500/20 text-green-400 border-green-500/40";
  if (score >= 40) return "bg-yellow-500/20 text-yellow-400 border-yellow-500/40";
  return "bg-red-500/20 text-red-400 border-red-500/40";
}

function getScoreLabel(score: number): string {
  if (score >= 70) return "🟢 Delegar/Automatizar";
  if (score >= 40) return "🟡 Estandarizar primero";
  return "🔴 Core — No delegar";
}

export default function DecisionMatrixInput({
  scores,
  delegationScore,
  onChange,
  disabled = false,
  compact = false,
}: DecisionMatrixInputProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          📊 Decision Matrix
        </Label>
        <Badge variant="outline" className={`text-xs font-mono ${getScoreColor(delegationScore)}`}>
          Score: {delegationScore.toFixed(0)} — {getScoreLabel(delegationScore)}
        </Badge>
      </div>

      <TooltipProvider delayDuration={200}>
        <div className={compact ? "grid grid-cols-5 gap-2" : "space-y-2"}>
          {FIELDS.map((f) => (
            <Tooltip key={f.key}>
              <TooltipTrigger asChild>
                <div className={compact ? "space-y-1" : "flex items-center gap-3"}>
                  <span className="text-xs font-medium w-14 flex-shrink-0">
                    {f.emoji} {f.label}
                  </span>
                  <Slider
                    min={0}
                    max={5}
                    step={1}
                    value={[scores[f.key] || 0]}
                    onValueChange={([v]) => onChange(f.key, v)}
                    disabled={disabled}
                    className="flex-1"
                  />
                  <span className="text-xs font-mono w-4 text-right text-muted-foreground">
                    {scores[f.key] || 0}
                  </span>
                </div>
              </TooltipTrigger>
              <TooltipContent side="top" className="max-w-[200px] text-xs">
                {f.tip}
              </TooltipContent>
            </Tooltip>
          ))}
        </div>
      </TooltipProvider>
    </div>
  );
}
