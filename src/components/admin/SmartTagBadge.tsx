import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Pencil, Save, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { getTagInfo, getTagIcon } from "@/data/tagKnowledge";

type SmartTagBadgeProps = {
  tag: string;
  className?: string;
  onEdit?: (field: string, value: string) => void;
};

/**
 * SmartTagBadge — intelligent tag with contextual tooltip.
 * Non-editable tags use Tooltip (hover-based, Portal-rendered).
 * Editable tags use Popover (click-based, Portal-rendered).
 * Both render at document root to avoid overflow clipping.
 */
export default function SmartTagBadge({ tag, className, onEdit }: SmartTagBadgeProps) {
  const [editValues, setEditValues] = useState<Record<string, string>>({});
  const [isEditing, setIsEditing] = useState(false);
  const info = getTagInfo(tag);
  const Icon = getTagIcon(tag);
  const hasEditableFields = info.editable && info.editable.length > 0 && onEdit;

  const badgeElement = (
    <Badge
      variant="outline"
      className={cn(
        "text-[9px] gap-1 cursor-help hover:bg-primary/10 hover:border-primary/30 transition-colors",
        hasEditableFields && "cursor-pointer",
        className
      )}
    >
      <Icon className="w-2.5 h-2.5" />
      {tag}
    </Badge>
  );

  // Editable: Popover (click-based) for edit fields
  if (hasEditableFields) {
    return (
      <Popover>
        <PopoverTrigger asChild>
          <span role="button" tabIndex={0} className="inline-flex">
            {badgeElement}
          </span>
        </PopoverTrigger>
        <PopoverContent className="w-72 p-0 z-[9999]" align="start" side="top">
          <div className="p-3 space-y-2.5">
            <div className="flex items-start gap-2">
              <Icon className="w-4 h-4 text-primary mt-0.5 shrink-0" />
              <p className="text-[11px] text-foreground/90 leading-relaxed">{info.explanation}</p>
            </div>
            <div className="border-t border-border/20 pt-2 space-y-2">
              {!isEditing ? (
                <Button size="sm" variant="ghost" className="h-6 text-[10px] gap-1 w-full justify-start text-muted-foreground hover:text-foreground" onClick={() => setIsEditing(true)}>
                  <Pencil className="w-3 h-3" /> Editar configuración
                </Button>
              ) : (
                <div className="space-y-2">
                  {info.editable!.map(ed => (
                    <div key={ed.field} className="space-y-1">
                      <label className="text-[9px] font-semibold text-muted-foreground uppercase tracking-wider">{ed.label}</label>
                      <Input className="h-7 text-[11px]" placeholder={tag} value={editValues[ed.field] || ""} onChange={(e) => setEditValues(prev => ({ ...prev, [ed.field]: e.target.value }))} />
                    </div>
                  ))}
                  <div className="flex gap-1.5">
                    <Button size="sm" className="h-6 text-[10px] gap-1 flex-1" onClick={() => { Object.entries(editValues).forEach(([field, value]) => { if (value) onEdit!(field, value); }); setIsEditing(false); setEditValues({}); }}>
                      <Save className="w-3 h-3" /> Guardar
                    </Button>
                    <Button size="sm" variant="ghost" className="h-6 text-[10px]" onClick={() => { setIsEditing(false); setEditValues({}); }}>
                      <X className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </PopoverContent>
      </Popover>
    );
  }

  // Non-editable: Tooltip (hover-based, lightweight, Portal-rendered)
  return (
    <TooltipProvider delayDuration={100}>
      <Tooltip>
        <TooltipTrigger asChild>
          <span className="inline-flex">{badgeElement}</span>
        </TooltipTrigger>
        <TooltipContent side="top" className="max-w-[280px] z-[9999]">
          <div className="flex items-start gap-2">
            <Icon className="w-3.5 h-3.5 text-primary mt-0.5 shrink-0" />
            <p className="text-[11px] text-popover-foreground leading-relaxed">{info.explanation}</p>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
