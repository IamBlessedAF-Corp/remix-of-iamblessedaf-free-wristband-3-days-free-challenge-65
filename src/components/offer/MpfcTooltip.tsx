import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

/**
 * Reusable inline "mPFC" label with hover tooltip explaining the term.
 * Uses Tooltip with Portal for reliable rendering in any container.
 */
const MpfcTooltip = () => (
  <TooltipProvider delayDuration={100}>
    <Tooltip>
      <TooltipTrigger asChild>
        <span
          className="inline font-bold text-destructive underline decoration-destructive underline-offset-2 cursor-help hover:opacity-80 transition-all animate-pulse hover:animate-none hover:drop-shadow-[0_0_6px_hsl(var(--destructive)/0.5)]"
        >
          mPFC
        </span>
      </TooltipTrigger>
      <TooltipContent side="top" className="max-w-[320px]">
        <div className="space-y-2">
          <p className="text-sm font-black text-popover-foreground">
            mPFC = medial Prefrontal Cortex
          </p>
          <p className="text-xs text-muted-foreground leading-relaxed">
            The key area that activates when someone receives genuine gratitude
            (not when they give it).
          </p>
          <p className="text-xs text-muted-foreground leading-relaxed">
            It triggers the HAPPY chemicals in your brain 🧠 (serotonin +
            dopamine), which is the core neuroscience backing the IamBlessedAF
            Brand mission.
          </p>
          <p className="text-xs font-semibold text-primary leading-relaxed">
            Teaching the world most powerful way of practicing Gratitude making it
            feel it up to 27× more potent
          </p>
        </div>
      </TooltipContent>
    </Tooltip>
  </TooltipProvider>
);

export default MpfcTooltip;
