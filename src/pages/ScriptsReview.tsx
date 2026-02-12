import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  BookOpen, ChevronDown, ChevronRight, Copy, Check, Sparkles,
  ArrowRight, Settings2, Loader2, ExternalLink, Trophy,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { FRAMEWORK_SECTIONS, FRAMEWORKS, Framework } from "@/data/expertFrameworks";
import { useExpertScripts } from "@/hooks/useExpertScripts";
import ReactMarkdown from "react-markdown";
import logoImg from "@/assets/logo.png";
import { toast } from "sonner";

const ScriptsReview = () => {
  const navigate = useNavigate();
  const { outputs, heroProfile, isLoading } = useExpertScripts();
  const [expandedScripts, setExpandedScripts] = useState<Record<string, boolean>>({});
  const [copiedId, setCopiedId] = useState<string | null>(null);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  const completedCount = Object.keys(outputs).length;
  const totalFrameworks = FRAMEWORKS.length;
  const progressPct = Math.round((completedCount / totalFrameworks) * 100);
  const allDone = completedCount === totalFrameworks;
  const nextFramework = FRAMEWORKS.find((f) => !outputs[f.id]);

  const toggleScript = (id: string) => {
    setExpandedScripts((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    toast.success("Copied to clipboard!");
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleCopyAll = () => {
    const allText = FRAMEWORKS
      .filter((fw) => outputs[fw.id])
      .map((fw) => `## ${fw.secret}: ${fw.name}\n\n${outputs[fw.id]}`)
      .join("\n\n---\n\n");
    
    if (!allText) {
      toast.error("No scripts generated yet");
      return;
    }

    const profileHeader = heroProfile
      ? `# Hero Profile\n- **Name:** ${heroProfile.name}\n- **Brand:** ${heroProfile.brand}\n- **Niche:** ${heroProfile.niche}\n- **Audience:** ${heroProfile.audience}\n- **Origin Story:** ${heroProfile.originStory}\n- **Transformation:** ${heroProfile.transformation}\n- **Mechanism:** ${heroProfile.mechanism}\n- **Enemy:** ${heroProfile.enemy}\n- **Big Promise:** ${heroProfile.bigPromise}\n- **Proof:** ${heroProfile.proof}\n\n---\n\n`
      : "";

    navigator.clipboard.writeText(profileHeader + allText);
    toast.success(`Copied all ${completedCount} scripts to clipboard!`);
  };

  const sectionStats = FRAMEWORK_SECTIONS.map((section) => {
    const sectionFrameworks = FRAMEWORKS.filter((f) => f.section === section.id);
    const done = sectionFrameworks.filter((f) => outputs[f.id]).length;
    return { ...section, total: sectionFrameworks.length, done, frameworks: sectionFrameworks };
  });

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/95 backdrop-blur-md border-b border-border/30">
        <div className="max-w-3xl mx-auto px-4 py-2.5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <img src={logoImg} alt="Logo" className="h-6" />
            <span className="text-xs font-bold text-foreground">Scripts Review</span>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleCopyAll}
              className="text-xs h-8 px-2.5 gap-1"
              disabled={completedCount === 0}
            >
              <Copy className="w-3.5 h-3.5" />
              Copy All
            </Button>
            <Button
              size="sm"
              onClick={() => navigate("/experts")}
              className="text-xs h-8 px-2.5 gap-1 bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              <Sparkles className="w-3.5 h-3.5" />
              Build Scripts
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-4 pt-4 pb-16">
        {/* Progress overview */}
        <motion.div
          className="rounded-2xl p-4 mb-4 bg-card border border-border/40"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-foreground">
              {allDone ? "🏆 All 22 scripts complete!" : `${completedCount}/${totalFrameworks} scripts generated`}
            </span>
            <span className="text-xs font-bold text-primary">{progressPct}%</span>
          </div>
          <Progress value={progressPct} className="h-1.5 mb-3" />

          {/* Hero profile summary */}
          {heroProfile ? (
            <div className="space-y-2">
              <div className="flex flex-wrap gap-1.5">
                {[
                  { label: "Expert", value: heroProfile.name },
                  { label: "Brand", value: heroProfile.brand },
                  { label: "Niche", value: heroProfile.niche },
                ].map((chip, i) => (
                  <span
                    key={i}
                    className="text-[10px] font-medium text-muted-foreground bg-muted px-2 py-0.5 rounded-full truncate max-w-[200px]"
                  >
                    {chip.label}: {chip.value}
                  </span>
                ))}
              </div>
              <details className="text-xs text-muted-foreground">
                <summary className="cursor-pointer font-semibold text-foreground hover:text-primary transition-colors">
                  View full Hero Profile ↓
                </summary>
                <div className="mt-2 space-y-1.5 bg-muted/50 rounded-lg p-3">
                  {Object.entries(heroProfile).map(([key, value]) => (
                    <div key={key}>
                      <span className="font-semibold text-foreground capitalize">{key.replace(/([A-Z])/g, " $1")}:</span>{" "}
                      <span className="text-muted-foreground">{value || "—"}</span>
                    </div>
                  ))}
                </div>
              </details>
            </div>
          ) : (
            <p className="text-xs text-muted-foreground">
              No hero profile created yet.{" "}
              <button onClick={() => navigate("/experts")} className="text-primary underline">
                Start the questionnaire →
              </button>
            </p>
          )}
        </motion.div>

        {/* Next step CTA */}
        {nextFramework && !allDone && (
          <motion.button
            className="w-full mb-4 bg-primary/5 hover:bg-primary/10 border border-primary/20 rounded-xl p-3 flex items-center gap-3 text-left transition-colors"
            onClick={() => navigate("/experts")}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
              <ArrowRight className="w-4 h-4 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <span className="text-[9px] font-bold uppercase tracking-wider text-primary">
                Continue building
              </span>
              <p className="text-xs font-semibold text-foreground truncate">
                Next: {nextFramework.secret} — {nextFramework.name}
              </p>
            </div>
            <ChevronRight className="w-4 h-4 text-primary shrink-0" />
          </motion.button>
        )}

        {/* All-done celebration */}
        {allDone && (
          <motion.div
            className="mb-4 bg-accent border border-primary/10 rounded-2xl p-5 text-center"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <Trophy className="w-8 h-8 text-primary mx-auto mb-2" />
            <h3 className="text-sm font-bold text-foreground mb-1">Funnel Master 🎉</h3>
            <p className="text-xs text-muted-foreground">
              All 22 scripts are ready. Use "Copy All" to export everything!
            </p>
          </motion.div>
        )}

        {/* Scripts by section */}
        <div className="space-y-3">
          {sectionStats.map((section) => {
            const hasAnyOutput = section.frameworks.some((fw) => outputs[fw.id]);

            return (
              <div key={section.id} className="rounded-xl border border-border/40 bg-card overflow-hidden">
                {/* Section header */}
                <div className="px-4 py-3 flex items-center gap-2.5 border-b border-border/20">
                  <div className="flex-1 min-w-0">
                    <h2 className="text-xs font-bold text-foreground leading-tight">{section.title}</h2>
                    <p className="text-[10px] text-muted-foreground mt-0.5">{section.subtitle}</p>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    section.done === section.total
                      ? "bg-green-500/10 text-green-600"
                      : section.done > 0
                      ? "bg-primary/10 text-primary"
                      : "bg-muted text-muted-foreground"
                  }`}>
                    {section.done}/{section.total}
                  </span>
                </div>

                {/* Framework list */}
                <div className="divide-y divide-border/20">
                  {section.frameworks.map((fw) => {
                    const hasOutput = !!outputs[fw.id];
                    const isExpanded = expandedScripts[fw.id];

                    return (
                      <div key={fw.id}>
                        <button
                          className={`w-full px-4 py-3 flex items-center gap-3 text-left transition-colors ${
                            hasOutput
                              ? "hover:bg-accent/50"
                              : "opacity-50"
                          }`}
                          onClick={() => hasOutput && toggleScript(fw.id)}
                          disabled={!hasOutput}
                        >
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1.5 mb-0.5">
                              <span className={`text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full ${
                                hasOutput
                                  ? "text-primary bg-primary/10"
                                  : "text-muted-foreground bg-muted"
                              }`}>
                                {fw.secret}
                              </span>
                              {hasOutput && (
                                <span className="text-[9px] font-bold uppercase tracking-wider text-green-600 bg-green-500/10 px-1.5 py-0.5 rounded-full">
                                  ✓ Done
                                </span>
                              )}
                            </div>
                            <h3 className="text-[13px] font-semibold text-foreground leading-tight">
                              {fw.name}
                            </h3>
                          </div>

                          {hasOutput ? (
                            <div className="flex items-center gap-2 shrink-0">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleCopy(fw.id, outputs[fw.id]);
                                }}
                                className="p-1.5 rounded-md hover:bg-muted transition-colors"
                              >
                                {copiedId === fw.id ? (
                                  <Check className="w-3.5 h-3.5 text-green-500" />
                                ) : (
                                  <Copy className="w-3.5 h-3.5 text-muted-foreground" />
                                )}
                              </button>
                              <ChevronDown
                                className={`w-3.5 h-3.5 text-muted-foreground transition-transform duration-200 ${
                                  isExpanded ? "rotate-180" : ""
                                }`}
                              />
                            </div>
                          ) : (
                            <span className="text-[10px] text-muted-foreground shrink-0">Not generated</span>
                          )}
                        </button>

                        {/* Expanded script output */}
                        <AnimatePresence initial={false}>
                          {isExpanded && hasOutput && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.2, ease: "easeInOut" }}
                              className="overflow-hidden"
                            >
                              <div className="px-4 pb-4">
                                <div className="bg-muted/50 border border-border/30 rounded-xl p-4">
                                  <div className="prose prose-sm max-w-none text-foreground">
                                    <ReactMarkdown>{outputs[fw.id]}</ReactMarkdown>
                                  </div>
                                </div>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ScriptsReview;
