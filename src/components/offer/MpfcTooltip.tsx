import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";

/**
 * Reusable inline "mPFC" label with hover/click tooltip explaining the term.
 * Renders bold red text with an underline, and a smart popup on interaction.
 */
const MpfcTooltip = () => (
  <HoverCard openDelay={100}>
    <HoverCardTrigger asChild>
      <button
        type="button"
        className="inline font-bold text-destructive underline decoration-destructive underline-offset-2 cursor-pointer hover:opacity-80 transition-opacity"
      >
        mPFC
      </button>
    </HoverCardTrigger>
    <HoverCardContent className="w-80 text-left" side="top">
      <div className="space-y-2">
        <p className="text-sm font-black text-foreground">
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
    </HoverCardContent>
  </HoverCard>
);

export default MpfcTooltip;
