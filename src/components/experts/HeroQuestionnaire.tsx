import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { HeroProfile, HERO_QUESTIONS } from "@/data/expertFrameworks";
import logoImg from "@/assets/logo.png";

interface HeroQuestionnaireProps {
  onComplete: (profile: HeroProfile) => void;
  existingProfile?: HeroProfile | null;
}

const EMPTY_PROFILE: HeroProfile = {
  name: "", brand: "", niche: "", audience: "",
  originStory: "", transformation: "", mechanism: "",
  enemy: "", bigPromise: "", proof: "",
};

const HeroQuestionnaire = ({ onComplete, existingProfile }: HeroQuestionnaireProps) => {
  const [step, setStep] = useState(0);
  const [profile, setProfile] = useState<HeroProfile>(existingProfile || EMPTY_PROFILE);

  const currentQ = HERO_QUESTIONS[step];
  const isLast = step === HERO_QUESTIONS.length - 1;
  const canProceed = profile[currentQ.key].trim().length > 0;

  const handleNext = () => {
    if (isLast) {
      onComplete(profile);
    } else {
      setStep((s) => s + 1);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 py-12">
      <motion.div
        className="max-w-xl w-full"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        {/* Header */}
        <div className="text-center mb-8">
          <img src={logoImg} alt="Logo" className="h-10 mx-auto mb-4" />
          <div className="flex items-center justify-center gap-2 mb-2">
            <BookOpen className="w-5 h-5 text-primary" />
            <span className="text-xs font-bold uppercase tracking-wider text-primary">
              Expert Secrets AI Script Lab
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">
            Who Is The Hero of Your Story?
          </h1>
          <p className="text-sm text-muted-foreground mt-2">
            Answer {HERO_QUESTIONS.length} questions so every framework aligns to YOUR brand and funnel.
          </p>
        </div>

        {/* Progress */}
        <div className="flex gap-1 mb-8">
          {HERO_QUESTIONS.map((_, i) => (
            <div
              key={i}
              className={`h-1.5 flex-1 rounded-full transition-colors ${
                i <= step ? "bg-primary" : "bg-border"
              }`}
            />
          ))}
        </div>

        {/* Current Question */}
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.25 }}
          className="bg-card border border-border/50 rounded-2xl p-6 shadow-sm"
        >
          <Label className="text-base font-semibold text-foreground mb-1 block">
            {step + 1}. {currentQ.label}
          </Label>

          {currentQ.isTextarea ? (
            <Textarea
              value={profile[currentQ.key]}
              onChange={(e) => setProfile({ ...profile, [currentQ.key]: e.target.value })}
              placeholder={currentQ.placeholder}
              className="mt-3 min-h-[100px]"
              autoFocus
            />
          ) : (
            <Input
              value={profile[currentQ.key]}
              onChange={(e) => setProfile({ ...profile, [currentQ.key]: e.target.value })}
              placeholder={currentQ.placeholder}
              className="mt-3"
              autoFocus
              onKeyDown={(e) => e.key === "Enter" && canProceed && handleNext()}
            />
          )}

          <div className="flex items-center justify-between mt-6">
            {step > 0 ? (
              <Button variant="ghost" size="sm" onClick={() => setStep((s) => s - 1)}>
                ← Back
              </Button>
            ) : (
              <div />
            )}

            <Button
              onClick={handleNext}
              disabled={!canProceed}
              className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold rounded-xl gap-2"
            >
              {isLast ? (
                <>
                  <Sparkles className="w-4 h-4" />
                  Unlock Script Lab
                </>
              ) : (
                <>
                  Next
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </Button>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default HeroQuestionnaire;
