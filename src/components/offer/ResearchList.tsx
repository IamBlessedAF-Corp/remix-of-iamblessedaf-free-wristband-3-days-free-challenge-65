import { motion } from "framer-motion";
import { ChevronDown, BookOpen, FlaskConical } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

const STUDIES = [
  {
    title: "Conscious Processing of Narrative Stimulates Synchronization of Heart Rate Between Individuals",
    year: "2017",
    authors: "Pérez et al.",
    keyphrase: "Narrative synchronizes heart rate and physiology across individuals.",
  },
  {
    title: "Prefrontal Activation While Listening to a Letter of Gratitude Read Aloud by a Coworker: A NIRS Study",
    year: "2014",
    authors: "Fox et al.",
    keyphrase: "Receiving gratitude activates the prefrontal cortex more than expressing it.",
  },
  {
    title: "Neural Responses to Intention and Benefit Appraisal Are Critical in Distinguishing Gratitude and Joy",
    year: "2018",
    authors: "Yu et al.",
    keyphrase: "The brain detects genuine gratitude; intention matters more than the reward.",
  },
  {
    title: "Effects of Gratitude Meditation on Neural Network Functional Connectivity and Brain–Heart Coupling",
    year: "2020",
    authors: "Kral et al.",
    keyphrase: "Repeated gratitude reshapes emotion, fear, and motivation circuits.",
  },
  {
    title: "Exploring Neural Mechanisms of the Health Benefits of Gratitude in Women: A Randomized Controlled Trial",
    year: "2021",
    authors: "Hazlitt et al.",
    keyphrase: "Gratitude reduces amygdala activity and inflammatory markers (TNF-α, IL-6).",
  },
  {
    title: "Neural Correlates of Gratitude",
    year: "2015",
    authors: "Antonio Damasio et al.",
    keyphrase: "Gratitude activates medial prefrontal and anterior cingulate cortex.",
  },
  {
    title: "Counting Blessings Versus Burdens: An Experimental Investigation of Gratitude and Subjective Well-Being",
    year: "2003",
    authors: "Emmons & McCullough",
    keyphrase: "Weekly gratitude practice produces lasting wellbeing improvements.",
  },
  {
    title: "The Happiness Advantage (Applied Research, Positive Psychology)",
    year: "2010",
    authors: "Shawn Achor",
    keyphrase: "Gratitude is one of the fastest interventions to increase happiness and performance.",
  },
];

const ResearchList = ({ delay = 1.5 }: { delay?: number }) => {
  return (
    <motion.div
      className="max-w-lg mx-auto mt-12 mb-8"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
    >
      <Collapsible>
        <CollapsibleTrigger className="w-full group">
          <div className="bg-card border border-border/50 rounded-2xl p-5 shadow-soft transition-colors hover:border-primary/30">
            <div className="flex items-center justify-center gap-2.5">
              <FlaskConical className="w-5 h-5 text-primary" />
              <h3 className="text-base md:text-lg font-bold text-foreground">
                Science of Gratitude
              </h3>
              <ChevronDown className="w-4 h-4 text-muted-foreground transition-transform duration-300 group-data-[state=open]:rotate-180" />
            </div>
            <p className="text-xs text-muted-foreground mt-1.5">
              {STUDIES.length} peer-reviewed studies · Huberman Lab
            </p>
          </div>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <div className="mt-4">
            <Accordion type="single" collapsible className="space-y-2">
              {STUDIES.map((study, i) => (
                <AccordionItem
                  key={i}
                  value={`study-${i}`}
                  className="border-none"
                >
                  <AccordionTrigger className="bg-card border border-border/50 rounded-xl px-4 py-3 hover:no-underline hover:border-primary/30 transition-colors [&[data-state=open]]:rounded-b-none [&[data-state=open]]:border-b-0">
                    <div className="flex items-start gap-3 text-left">
                      <div className="flex-shrink-0 w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center mt-0.5">
                        <BookOpen className="w-3.5 h-3.5 text-primary" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-foreground leading-snug pr-2">
                          {study.title}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {study.year} · {study.authors}
                        </p>
                      </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="bg-card border border-border/50 border-t-0 rounded-b-xl px-4 pb-4">
                    <div className="pl-10">
                      <div className="bg-primary/5 rounded-lg p-3 border-l-2 border-primary">
                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">
                          Key Finding
                        </p>
                        <p className="text-sm text-foreground leading-relaxed">
                          {study.keyphrase}
                        </p>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </CollapsibleContent>
      </Collapsible>
    </motion.div>
  );
};

export default ResearchList;
