import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles, BookOpen, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
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
  // For multi-select, track selected chips separately
  const [multiSelections, setMultiSelections] = useState<Record<string, string[]>>(() => {
    // Initialize from existing profile if niche has data
    if (existingProfile?.niche) {
      return { niche: [] }; // text already in profile
    }
    return {};
  });

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

  const handleSuggestionClick = (suggestion: string) => {
    if (currentQ.isMultiSelect) {
      const key = currentQ.key;
      const current = multiSelections[key] || [];
      let updated: string[];
      if (current.includes(suggestion)) {
        updated = current.filter((s) => s !== suggestion);
      } else {
        updated = [...current, suggestion];
      }
      setMultiSelections({ ...multiSelections, [key]: updated });
      // Build combined value: chips + custom text
      const customText = profile[key]
        .split(" | ")
        .filter((part) => !(currentQ.suggestions || []).includes(part.trim()))
        .join(" | ")
        .trim();
      const combined = [...updated, customText].filter(Boolean).join(" | ");
      setProfile({ ...profile, [key]: combined });
    } else {
      // Single-select: populate the input/textarea with the suggestion
      if (currentQ.isTextarea) {
        const current = profile[currentQ.key];
        const newVal = current ? `${current} ${suggestion}` : suggestion;
        setProfile({ ...profile, [currentQ.key]: newVal });
      } else {
        setProfile({ ...profile, [currentQ.key]: suggestion });
      }
    }
  };

  const handleTextChange = (value: string) => {
    if (currentQ.isMultiSelect) {
      const selected = multiSelections[currentQ.key] || [];
      const combined = [...selected, value].filter(Boolean).join(" | ");
      setProfile({ ...profile, [currentQ.key]: combined });
    } else {
      setProfile({ ...profile, [currentQ.key]: value });
    }
  };

  // For multi-select, extract the "other" text (non-chip portion)
  const getCustomText = () => {
    if (!currentQ.isMultiSelect) return profile[currentQ.key];
    const selected = multiSelections[currentQ.key] || [];
    const parts = profile[currentQ.key].split(" | ").filter((p) => !selected.includes(p.trim()));
    return parts.join(" | ").trim();
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
        <div className="flex gap-1 mb-2">
          {HERO_QUESTIONS.map((_, i) => (
            <div
              key={i}
              className={`h-1.5 flex-1 rounded-full transition-colors ${
                i <= step ? "bg-primary" : "bg-border"
              }`}
            />
          ))}
        </div>
        <p className="text-xs text-muted-foreground text-right mb-6">
          {step + 1} of {HERO_QUESTIONS.length}
        </p>

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
          {currentQ.subtitle && (
            <p className="text-xs text-muted-foreground mb-3 leading-relaxed">
              💡 {currentQ.subtitle}
            </p>
          )}

          {/* Suggestions */}
          {currentQ.suggestions && currentQ.suggestions.length > 0 && (
            <div className="mb-3">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground block mb-2">
                {currentQ.isMultiSelect ? "Select all that apply ↓" : "Quick-fill suggestions ↓"}
              </span>
              <div className="flex flex-wrap gap-1.5">
                {currentQ.suggestions.map((s) => {
                  const isSelected = currentQ.isMultiSelect
                    ? (multiSelections[currentQ.key] || []).includes(s)
                    : profile[currentQ.key] === s;
                  return (
                    <Badge
                      key={s}
                      variant={isSelected ? "default" : "outline"}
                      className={`cursor-pointer text-xs py-1 px-2.5 transition-all hover:scale-[1.02] ${
                        isSelected
                          ? "bg-primary text-primary-foreground"
                          : "hover:bg-accent hover:text-accent-foreground"
                      }`}
                      onClick={() => handleSuggestionClick(s)}
                    >
                      {isSelected && <Check className="w-3 h-3 mr-1" />}
                      {s}
                    </Badge>
                  );
                })}
              </div>
            </div>
          )}

          {/* Input */}
          {currentQ.isMultiSelect ? (
            <div>
              <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground block mb-1.5">
                Other / specify your niche ↓
              </span>
              <Input
                value={getCustomText()}
                onChange={(e) => handleTextChange(e.target.value)}
                placeholder={currentQ.placeholder}
                className="mt-1"
              />
            </div>
          ) : currentQ.isTextarea ? (
            <Textarea
              value={profile[currentQ.key]}
              onChange={(e) => setProfile({ ...profile, [currentQ.key]: e.target.value })}
              placeholder={currentQ.placeholder}
              className="mt-1 min-h-[100px]"
              autoFocus
            />
          ) : (
            <Input
              value={profile[currentQ.key]}
              onChange={(e) => setProfile({ ...profile, [currentQ.key]: e.target.value })}
              placeholder={currentQ.placeholder}
              className="mt-1"
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
