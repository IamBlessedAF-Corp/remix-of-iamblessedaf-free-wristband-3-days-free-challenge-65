import { motion } from "framer-motion";
import { FlaskConical, ChevronDown, BookOpen } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import logo from "@/assets/logo.png";

const STUDIES = [
  { title: "Receiving gratitude > giving gratitude", source: "Huberman Lab Podcast #47" },
  { title: "Gratitude spikes serotonin & dopamine", source: "Zahn et al., 2009 — NeuroImage" },
  { title: "3 minutes is the effective threshold", source: "Emmons & McCullough, 2003" },
  { title: "#1 predictor of lifelong happiness", source: "Harvard Grant Study (75+ years)" },
  { title: "Gratitude rewires neural pathways", source: "Kini et al., 2016 — NeuroImage" },
  { title: "Up to 27× consciousness elevation", source: "Dr. David Hawkins — Power vs. Force" },
  { title: "Reduces cortisol by 23%", source: "McCraty et al., 1998" },
  { title: "Habit formation in 21 days", source: "Lally et al., 2010" },
];

interface GratitudeEngineLoopProps {
  delay?: number;
  className?: string;
}

/**
 * THE GRATITUDE ENGINE LOOP™ — shared scientific validation module.
 * Huberman video + "27x Happier" bridge copy + 8-study collapsible.
 */
const GratitudeEngineLoop = ({ delay = 0.4, className = "" }: GratitudeEngineLoopProps) => {
  return (
    <motion.div
      className={`rounded-2xl border-2 border-primary/20 bg-gradient-to-br from-primary/5 via-card to-primary/5 overflow-hidden p-6 text-center space-y-5 ${className}`}
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
    >
      <img src={logo} alt="IamBlessedAF" className="h-8 mx-auto" />
      <h2 className="text-xl md:text-2xl font-black text-foreground tracking-tight">
        THE <span className="text-primary">GRATITUDE ENGINE</span> LOOP™
      </h2>

      {/* Huberman Clip */}
      <div className="max-w-sm mx-auto rounded-xl overflow-hidden border border-border/50 shadow-sm">
        <div className="relative w-full" style={{ paddingBottom: "56.25%" }}>
          <iframe
            className="absolute inset-0 w-full h-full"
            src="https://www.youtube.com/embed/ph1BuMRFJ88?rel=0&modestbranding=1&fs=0"
            title="Huberman on Gratitude"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            loading="lazy"
          />
        </div>
      </div>

      {/* Bridge copy */}
      <div className="space-y-3 max-w-sm mx-auto">
        <h3 className="text-lg md:text-xl font-extrabold leading-tight text-foreground">
          Receiving & Giving a FREE "I am Blessed" Neuro-Hacker Wristband is the Practical Implementation of{" "}
          <span className="text-primary">The Biggest Andrew Huberman Discovery</span>{" "}
          in the Last 18 Months for Overall Well-Being.
        </h3>
        <p className="text-base font-black text-primary">
          Just Try It!
        </p>
        <p className="text-sm font-semibold text-foreground/90 leading-snug">
          Dr. Hawkins' (PhD) Research affirms it could make you up to{" "}
          <motion.span
            className="text-primary inline-block"
            animate={{ scale: [1, 1.08, 1] }}
            transition={{ duration: 2.5, repeat: Infinity, repeatDelay: 3 }}
          >
            27× Happier
          </motion.span>
          .
        </p>
         <p className="text-xs text-muted-foreground leading-relaxed">
           The <strong className="text-foreground">Neuro-Hack</strong> to spike{" "}
           <strong className="text-primary">Dopamine & Serotonin</strong> (Overall Well-Being) — pre-built into a{" "}
           <strong className="text-foreground">trigger</strong>,{" "}
           <strong className="text-foreground">habit-forming system</strong> &{" "}
           <strong className="text-primary">brand</strong>.
         </p>
         <p className="text-xs text-primary font-bold leading-relaxed mt-2">
           🎰 Because you're gifting 2 Neuro-Hacker Wristbands to 2 friends — you earn <span className="underline">2 bonus spins</span> on the reward wheel after checkout!
         </p>
      </div>

      {/* Science of Gratitude — collapsible */}
      <Collapsible>
        <CollapsibleTrigger className="w-full">
          <div className="flex items-center justify-center gap-2 bg-card border border-border/50 rounded-xl px-4 py-2.5 mx-auto max-w-xs shadow-sm hover:shadow-md transition-shadow">
            <FlaskConical className="w-4 h-4 text-primary" />
            <span className="text-sm font-bold text-foreground">Science of Gratitude</span>
            <ChevronDown className="w-4 h-4 text-muted-foreground ml-1" />
          </div>
          <p className="text-[11px] text-muted-foreground mt-1.5">8 peer-reviewed studies · Huberman Lab</p>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className="mt-4 space-y-2.5 text-left">
            {STUDIES.map((study, i) => (
              <div key={i} className="bg-card/80 border border-border/40 rounded-lg p-3 flex items-start gap-2.5">
                <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <BookOpen className="w-3 h-3 text-primary" />
                </div>
                <div>
                  <p className="text-xs font-bold text-foreground">{study.title}</p>
                  <p className="text-[10px] text-primary font-semibold mt-0.5">{study.source}</p>
                </div>
              </div>
            ))}
          </div>
        </CollapsibleContent>
      </Collapsible>
    </motion.div>
  );
};

export default GratitudeEngineLoop;
