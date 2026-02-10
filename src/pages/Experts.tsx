import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Settings2, Sparkles, ChevronRight, Trophy, ArrowRight, CheckCircle2, ChevronDown, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import HeroQuestionnaire from "@/components/experts/HeroQuestionnaire";
import FrameworkCard from "@/components/experts/FrameworkCard";
import ScriptGeneratorModal from "@/components/experts/ScriptGeneratorModal";
import { FRAMEWORK_SECTIONS, FRAMEWORKS, HeroProfile, Framework } from "@/data/expertFrameworks";
import { useExpertScripts } from "@/hooks/useExpertScripts";
import logoImg from "@/assets/logo.png";

const Experts = () => {
  const { outputs, heroProfile, setHeroProfile, saveOutput, isLoading } = useExpertScripts();
  const [activeFramework, setActiveFramework] = useState<Framework | null>(null);
  const [editingProfile, setEditingProfile] = useState(false);
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({});

  const handleOutputGenerated = useCallback((frameworkId: string, output: string) => {
    if (heroProfile) {
      saveOutput(frameworkId, output, heroProfile);
    }
  }, [heroProfile, saveOutput]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  if (!heroProfile || editingProfile) {
    return (
      <HeroQuestionnaire
        onComplete={(profile) => {
          setHeroProfile(profile);
          setEditingProfile(false);
        }}
        existingProfile={heroProfile}
      />
    );
  }

  const completedCount = Object.keys(outputs).length;
  const totalFrameworks = FRAMEWORKS.length;
  const progressPct = Math.round((completedCount / totalFrameworks) * 100);
  const allDone = completedCount === totalFrameworks;

  const nextFramework = FRAMEWORKS.find((f) => !outputs[f.id]);
  const nextSection = nextFramework
    ? FRAMEWORK_SECTIONS.find((s) => s.id === nextFramework.section)
    : null;

  const sectionStats = FRAMEWORK_SECTIONS.map((section) => {
    const sectionFrameworks = FRAMEWORKS.filter((f) => f.section === section.id);
    const done = sectionFrameworks.filter((f) => outputs[f.id]).length;
    return { ...section, total: sectionFrameworks.length, done, allDone: done === sectionFrameworks.length };
  });

  // First incomplete section is open by default
  const firstIncomplete = sectionStats.find((s) => !s.allDone)?.id;

  const isSectionOpen = (id: string) => {
    if (id in openSections) return openSections[id];
    return id === firstIncomplete;
  };

  const toggleSection = (id: string) => {
    setOpenSections((prev) => ({ ...prev, [id]: !isSectionOpen(id) }));
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Sticky header — slim */}
      <header className="sticky top-0 z-40 bg-background/95 backdrop-blur-md border-b border-border/30">
        <div className="max-w-2xl mx-auto px-4 py-2.5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <img src={logoImg} alt="Logo" className="h-6" />
            <span className="text-xs font-bold text-foreground">Script Lab</span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setEditingProfile(true)}
            className="text-xs h-8 px-2.5 gap-1"
          >
            <Settings2 className="w-3.5 h-3.5" />
            Profile
          </Button>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 pt-4 pb-16">
        {/* Progress card — compact */}
        <motion.div
          className="rounded-2xl p-4 mb-4 bg-card border border-border/40"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-foreground">
              {allDone ? "🏆 All done!" : `${completedCount}/${totalFrameworks} scripts`}
            </span>
            <span className="text-xs font-bold text-primary">{progressPct}%</span>
          </div>
          <Progress value={progressPct} className="h-1.5 mb-3" />
          {/* Compact profile chips */}
          <div className="flex flex-wrap gap-1.5">
            {[
              { label: heroProfile.name },
              { label: heroProfile.brand },
              { label: heroProfile.niche },
            ].map((chip, i) => (
              <span
                key={i}
                className="text-[10px] font-medium text-muted-foreground bg-muted px-2 py-0.5 rounded-full truncate max-w-[140px]"
              >
                {chip.label}
              </span>
            ))}
          </div>
        </motion.div>

        {/* Next step CTA */}
        {nextFramework && !allDone && (
          <motion.button
            className="w-full mb-4 bg-primary/5 hover:bg-primary/10 border border-primary/20 rounded-xl p-3 flex items-center gap-3 text-left transition-colors"
            onClick={() => setActiveFramework(nextFramework)}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
              <ArrowRight className="w-4 h-4 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <span className="text-[9px] font-bold uppercase tracking-wider text-primary">
                Next step
              </span>
              <p className="text-xs font-semibold text-foreground truncate">
                {nextFramework.secret}: {nextFramework.name}
              </p>
            </div>
            <ChevronRight className="w-4 h-4 text-primary shrink-0" />
          </motion.button>
        )}

        {/* All-done celebration */}
        <AnimatePresence>
          {allDone && (
            <motion.div
              className="mb-4 bg-accent border border-primary/10 rounded-2xl p-5 text-center"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <Trophy className="w-8 h-8 text-primary mx-auto mb-2" />
              <h3 className="text-sm font-bold text-foreground mb-1">Funnel Master 🎉</h3>
              <p className="text-xs text-muted-foreground">
                All scripts generated. Deploy across your funnels!
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Sections — custom collapsible, not full accordion */}
        <div className="space-y-2">
          {sectionStats.map((section) => {
            const sectionFrameworks = FRAMEWORKS.filter((f) => f.section === section.id);
            const isOpen = isSectionOpen(section.id);

            return (
              <div
                key={section.id}
                className="rounded-xl border border-border/40 bg-card overflow-hidden"
              >
                {/* Section header — tappable */}
                <button
                  className="w-full px-4 py-3 flex items-center gap-2.5 text-left hover:bg-accent/50 transition-colors"
                  onClick={() => toggleSection(section.id)}
                >
                  {section.allDone ? (
                    <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />
                  ) : (
                    <div className="w-4 h-4 rounded-full border-2 border-border shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    <h2 className="text-xs font-bold text-foreground leading-tight truncate">
                      {section.title}
                    </h2>
                  </div>
                  <span className="text-[10px] font-bold text-muted-foreground shrink-0">
                    {section.done}/{section.total}
                  </span>
                  <ChevronDown
                    className={`w-3.5 h-3.5 text-muted-foreground shrink-0 transition-transform duration-200 ${
                      isOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {/* Section content */}
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2, ease: "easeInOut" }}
                      className="overflow-hidden"
                    >
                      <div className="px-3 pb-3 space-y-1.5">
                        {sectionFrameworks.map((fw) => (
                          <FrameworkCard
                            key={fw.id}
                            framework={fw}
                            onGenerate={setActiveFramework}
                            hasOutput={!!outputs[fw.id]}
                          />
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>

      {/* Generator Modal */}
      {activeFramework && heroProfile && (
        <ScriptGeneratorModal
          framework={activeFramework}
          heroProfile={heroProfile}
          onClose={() => setActiveFramework(null)}
          existingOutput={outputs[activeFramework.id]}
          onOutputGenerated={handleOutputGenerated}
        />
      )}
    </div>
  );
};

export default Experts;
