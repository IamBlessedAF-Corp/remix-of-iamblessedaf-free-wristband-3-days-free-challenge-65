import { useState, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BookOpen, Settings2, Sparkles, ChevronRight, Trophy, ArrowRight, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import HeroQuestionnaire from "@/components/experts/HeroQuestionnaire";
import FrameworkCard from "@/components/experts/FrameworkCard";
import ScriptGeneratorModal from "@/components/experts/ScriptGeneratorModal";
import { FRAMEWORK_SECTIONS, FRAMEWORKS, HeroProfile, Framework } from "@/data/expertFrameworks";
import logoImg from "@/assets/logo.png";

const Experts = () => {
  const [heroProfile, setHeroProfile] = useState<HeroProfile | null>(null);
  const [activeFramework, setActiveFramework] = useState<Framework | null>(null);
  const [outputs, setOutputs] = useState<Record<string, string>>({});
  const [editingProfile, setEditingProfile] = useState(false);

  const handleOutputGenerated = useCallback((frameworkId: string, output: string) => {
    setOutputs((prev) => ({ ...prev, [frameworkId]: output }));
  }, []);

  // Show questionnaire first
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

  // Find the first incomplete framework for "next step" nudge
  const nextFramework = FRAMEWORKS.find((f) => !outputs[f.id]);
  const nextSection = nextFramework
    ? FRAMEWORK_SECTIONS.find((s) => s.id === nextFramework.section)
    : null;

  // Section completion stats
  const sectionStats = FRAMEWORK_SECTIONS.map((section) => {
    const sectionFrameworks = FRAMEWORKS.filter((f) => f.section === section.id);
    const done = sectionFrameworks.filter((f) => outputs[f.id]).length;
    return { ...section, total: sectionFrameworks.length, done, allDone: done === sectionFrameworks.length };
  });

  // Default open section = first incomplete section
  const defaultOpenSection = sectionStats.find((s) => !s.allDone)?.id || sectionStats[0]?.id;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/90 backdrop-blur-md border-b border-border/40">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={logoImg} alt="Logo" className="h-7" />
            <div className="hidden sm:block">
              <span className="text-sm font-bold text-foreground">Expert Secrets</span>
              <span className="text-xs text-muted-foreground ml-1.5">AI Script Lab</span>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setEditingProfile(true)}
            className="gap-1.5 rounded-xl text-xs"
          >
            <Settings2 className="w-3.5 h-3.5" />
            Edit Profile
          </Button>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-4 pt-6 pb-12">
        {/* Progress Hero */}
        <motion.div
          className="bg-card border border-border/50 rounded-2xl p-5 mb-6"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              {allDone ? (
                <Trophy className="w-5 h-5 text-yellow-500" />
              ) : (
                <Sparkles className="w-4 h-4 text-primary" />
              )}
              <span className="text-sm font-bold text-foreground">
                {allDone
                  ? "🏆 All Scripts Generated — You're a Funnel Master!"
                  : `${completedCount} of ${totalFrameworks} scripts generated`}
              </span>
            </div>
            <span className="text-xs font-bold text-primary">{progressPct}%</span>
          </div>
          <Progress value={progressPct} className="h-2 mb-4" />

          {/* Hero Profile Summary — compact */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-xs">
            <div><span className="text-muted-foreground block">Expert</span><span className="font-bold text-foreground truncate">{heroProfile.name}</span></div>
            <div><span className="text-muted-foreground block">Brand</span><span className="font-bold text-foreground truncate">{heroProfile.brand}</span></div>
            <div><span className="text-muted-foreground block">Niche</span><span className="font-bold text-foreground truncate">{heroProfile.niche}</span></div>
            <div className="hidden sm:block"><span className="text-muted-foreground block">Audience</span><span className="font-bold text-foreground truncate">{heroProfile.audience}</span></div>
            <div className="hidden sm:block"><span className="text-muted-foreground block">Promise</span><span className="font-bold text-foreground truncate">{heroProfile.bigPromise}</span></div>
          </div>
        </motion.div>

        {/* Next Step Nudge */}
        {nextFramework && !allDone && (
          <motion.button
            className="w-full mb-6 bg-primary/5 hover:bg-primary/10 border border-primary/20 rounded-2xl p-4 flex items-center gap-4 text-left transition-colors"
            onClick={() => setActiveFramework(nextFramework)}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
          >
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
              <ArrowRight className="w-5 h-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <span className="text-[10px] font-bold uppercase tracking-wider text-primary">
                Recommended Next Step
              </span>
              <p className="text-sm font-bold text-foreground truncate">
                {nextFramework.secret}: {nextFramework.name}
              </p>
              <p className="text-xs text-muted-foreground truncate">{nextSection?.title}</p>
            </div>
            <ChevronRight className="w-5 h-5 text-primary shrink-0" />
          </motion.button>
        )}

        {/* All-done celebration */}
        <AnimatePresence>
          {allDone && (
            <motion.div
              className="mb-6 bg-yellow-500/5 border border-yellow-500/20 rounded-2xl p-6 text-center"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <Trophy className="w-10 h-10 text-yellow-500 mx-auto mb-3" />
              <h3 className="text-lg font-bold text-foreground mb-1">
                You've Generated Every Framework!
              </h3>
              <p className="text-sm text-muted-foreground max-w-md mx-auto">
                Your entire Expert Secrets copy library is ready. Go deploy these scripts across your funnels, webinars, emails, and ads.
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Collapsible Sections */}
        <Accordion type="single" collapsible defaultValue={defaultOpenSection} className="space-y-3">
          {sectionStats.map((section) => {
            const sectionFrameworks = FRAMEWORKS.filter((f) => f.section === section.id);
            return (
              <AccordionItem
                key={section.id}
                value={section.id}
                className="border border-border/50 rounded-2xl overflow-hidden bg-card data-[state=open]:shadow-sm"
              >
                <AccordionTrigger className="px-5 py-4 hover:no-underline gap-3">
                  <div className="flex items-center gap-3 flex-1 text-left">
                    {section.allDone ? (
                      <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0" />
                    ) : (
                      <BookOpen className="w-4 h-4 text-primary shrink-0" />
                    )}
                    <div className="min-w-0">
                      <h2 className="text-sm font-bold text-foreground leading-tight">{section.title}</h2>
                      <p className="text-xs text-muted-foreground">{section.subtitle}</p>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-muted-foreground shrink-0 mr-2">
                    {section.done}/{section.total}
                  </span>
                </AccordionTrigger>
                <AccordionContent className="px-5 pb-5">
                  <div className="grid md:grid-cols-2 gap-3 pt-1">
                    {sectionFrameworks.map((fw) => (
                      <FrameworkCard
                        key={fw.id}
                        framework={fw}
                        onGenerate={setActiveFramework}
                        hasOutput={!!outputs[fw.id]}
                      />
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>
            );
          })}
        </Accordion>
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
