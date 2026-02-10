import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import { BookOpen, Settings2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
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

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/90 backdrop-blur-md border-b border-border/40">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={logoImg} alt="Logo" className="h-7" />
            <div className="hidden sm:block">
              <span className="text-sm font-bold text-foreground">Expert Secrets</span>
              <span className="text-xs text-muted-foreground ml-1.5">AI Script Lab</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground hidden sm:inline">
              {completedCount}/{FRAMEWORKS.length} scripts generated
            </span>
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
        </div>
      </header>

      {/* Hero Profile Summary */}
      <div className="max-w-5xl mx-auto px-4 pt-6 pb-4">
        <motion.div
          className="bg-card border border-border/50 rounded-2xl p-5"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-xs font-bold uppercase tracking-wider text-primary">
              Your Hero Profile
            </span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3 text-xs">
            <div>
              <span className="text-muted-foreground block">Expert</span>
              <span className="font-bold text-foreground">{heroProfile.name}</span>
            </div>
            <div>
              <span className="text-muted-foreground block">Brand</span>
              <span className="font-bold text-foreground">{heroProfile.brand}</span>
            </div>
            <div>
              <span className="text-muted-foreground block">Niche</span>
              <span className="font-bold text-foreground">{heroProfile.niche}</span>
            </div>
            <div>
              <span className="text-muted-foreground block">Audience</span>
              <span className="font-bold text-foreground">{heroProfile.audience}</span>
            </div>
            <div>
              <span className="text-muted-foreground block">Big Promise</span>
              <span className="font-bold text-foreground">{heroProfile.bigPromise}</span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Framework Sections */}
      <main className="max-w-5xl mx-auto px-4 pb-12">
        {FRAMEWORK_SECTIONS.map((section) => {
          const sectionFrameworks = FRAMEWORKS.filter((f) => f.section === section.id);
          return (
            <div key={section.id} className="mb-8">
              <div className="flex items-center gap-2 mb-1 mt-4">
                <BookOpen className="w-4 h-4 text-primary" />
                <h2 className="text-lg font-bold text-foreground">{section.title}</h2>
              </div>
              <p className="text-sm text-muted-foreground mb-4">{section.subtitle}</p>
              <div className="grid md:grid-cols-2 gap-3">
                {sectionFrameworks.map((fw) => (
                  <FrameworkCard
                    key={fw.id}
                    framework={fw}
                    onGenerate={setActiveFramework}
                    hasOutput={!!outputs[fw.id]}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </main>

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
