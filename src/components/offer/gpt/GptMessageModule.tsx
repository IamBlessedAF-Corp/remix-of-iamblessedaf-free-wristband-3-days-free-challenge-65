import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Check, PenLine, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

const MAX_CHARS = 130;

const TEMPLATES = [
  {
    label: "❤️ Heartfelt",
    text: "helped me through one of the hardest times in my life. You showed up when nobody else did. 💙",
  },
  {
    label: "🙏 Meaningful",
    text: "drove 3 hours just to make sure I was okay. That night changed everything for me. I never told you, but it meant the world. 🙏",
  },
  {
    label: "😂 Fun",
    text: "covered for me that one time we BOTH know about 😂 Real ones don't snitch. Love you forever! 🤣",
  },
];

type Step = 1 | 2 | 3;

interface GptMessageModuleProps {
  onComplete?: () => void;
}

const GptMessageModule = ({ onComplete }: GptMessageModuleProps) => {
  const [message, setMessage] = useState("");
  const [gender, setGender] = useState("");
  const [saved, setSaved] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const charsLeft = MAX_CHARS - message.length;

  // Determine current step
  const currentStep: Step = saved ? 3 : message.trim().length > 0 && gender ? 2 : 1;

  // Track events
  useEffect(() => {
    if (message.length === 1) {
      window.dispatchEvent(new CustomEvent("track", { detail: { event: "message_started" } }));
    }
  }, [message]);

  const handleTemplateClick = (templateText: string) => {
    if (templateText.length <= MAX_CHARS) {
      setMessage(templateText);
      setSaved(false);
      textareaRef.current?.focus();
    }
  };

  const handleSave = () => {
    if (message.trim() && gender) {
      setSaved(true);
      localStorage.setItem("friendShirtMessage", message);
      localStorage.setItem("friendShirtGender", gender);
      window.dispatchEvent(new CustomEvent("track", { detail: { event: "message_saved" } }));
      onComplete?.();
    }
  };

  const handleGenderChange = (val: string) => {
    setGender(val);
    setSaved(false);
    window.dispatchEvent(new CustomEvent("track", { detail: { event: "friend_gender_selected", value: val } }));
  };

  return (
    <motion.div
      className="max-w-lg mx-auto"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.1 }}
    >
      {/* Progress steps */}
      <div className="flex items-center justify-center gap-2 mb-5">
        {[
          { num: 1, label: "Write" },
          { num: 2, label: "Details" },
          { num: 3, label: "Done" },
        ].map((step, i) => (
          <div key={step.num} className="flex items-center gap-2">
            <div
              className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                currentStep >= step.num
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              {currentStep > step.num ? (
                <Check className="w-3.5 h-3.5" />
              ) : (
                step.num
              )}
            </div>
            <span
              className={`text-xs font-medium ${
                currentStep >= step.num ? "text-foreground" : "text-muted-foreground"
              }`}
            >
              {step.label}
            </span>
            {i < 2 && (
              <div
                className={`w-8 h-px ${
                  currentStep > step.num ? "bg-primary" : "bg-border"
                }`}
              />
            )}
          </div>
        ))}
      </div>

      {/* Templates */}
      <div className="mb-3">
        <p className="text-xs font-medium text-muted-foreground text-center mb-2">
          <Sparkles className="w-3 h-3 inline mr-1" />
          Pick a template or write your own
        </p>
        <div className="flex gap-2 overflow-x-auto pb-1">
          {TEMPLATES.map((t) => (
            <button
              key={t.label}
              onClick={() => handleTemplateClick(t.text)}
              className="flex-shrink-0 text-xs px-3 py-2 rounded-lg border border-border/60 bg-card hover:border-primary/40 hover:bg-primary/5 transition-all text-left max-w-[160px]"
            >
              <span className="font-semibold block mb-0.5">{t.label}</span>
              <span className="text-muted-foreground line-clamp-2">{t.text}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Message card */}
      <div
        className={`rounded-xl border transition-all duration-300 overflow-hidden ${
          isFocused
            ? "border-primary shadow-[0_0_0_2px_hsl(var(--primary)/0.15)]"
            : "border-border/60"
        }`}
      >
        {/* Pre-filled part */}
        <div className="bg-muted/30 px-4 pt-4 pb-2">
          <p className="text-sm md:text-base font-medium text-foreground leading-relaxed">
            I am Blessed AF to Have a Best Friend
          </p>
          <p className="text-sm md:text-base font-medium text-foreground leading-relaxed">
            TY! I'll Never Forget when You...
          </p>
        </div>

        {/* Editable area */}
        <div
          className="relative bg-muted/10 cursor-text"
          onClick={() => textareaRef.current?.focus()}
        >
          {!message && !isFocused && (
            <motion.div
              className="absolute inset-0 flex items-center justify-center gap-2 pointer-events-none"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <motion.div
                animate={{ opacity: [1, 0.3, 1] }}
                transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut" }}
              >
                <PenLine className="w-4 h-4 text-primary" />
              </motion.div>
              <span className="text-sm text-muted-foreground">
                Tap to write your message...
              </span>
            </motion.div>
          )}

          <Textarea
            ref={textareaRef}
            placeholder="What's the most meaningful thing they did for you?"
            value={message}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            onChange={(e) => {
              if (e.target.value.length <= MAX_CHARS) {
                setMessage(e.target.value);
                setSaved(false);
              }
            }}
            className={`min-h-[80px] resize-none bg-transparent border-0 text-foreground text-sm rounded-none focus:ring-0 focus-visible:ring-0 focus-visible:ring-offset-0 ${
              !message && !isFocused ? "placeholder:text-transparent" : "placeholder:text-muted-foreground/50"
            }`}
            maxLength={MAX_CHARS}
          />
        </div>
      </div>

      {/* Character count */}
      <div className="flex justify-end mt-1.5 mb-4">
        <span
          className={`text-xs font-medium ${
            charsLeft <= 20
              ? charsLeft <= 0
                ? "text-destructive"
                : "text-primary"
              : "text-muted-foreground"
          }`}
        >
          {charsLeft} / {MAX_CHARS}
        </span>
      </div>

      {/* Gender + Save — only show when message exists */}
      <AnimatePresence>
        {message.trim().length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            {/* Gender selector */}
            <div className="mb-4">
              <p className="text-sm font-semibold text-foreground mb-2 text-center">
                Your Best Friend is:
              </p>
              <RadioGroup
                value={gender}
                onValueChange={handleGenderChange}
                className="flex items-center justify-center gap-6"
              >
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="male" id="gpt-gender-male" />
                  <Label htmlFor="gpt-gender-male" className="text-sm cursor-pointer">
                    👨 Male
                  </Label>
                </div>
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="female" id="gpt-gender-female" />
                  <Label htmlFor="gpt-gender-female" className="text-sm cursor-pointer">
                    👩 Female
                  </Label>
                </div>
              </RadioGroup>
            </div>

            {/* Save button */}
            <Button
              onClick={handleSave}
              disabled={!message.trim() || !gender}
              className="w-full h-11 text-sm font-bold bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl transition-all"
            >
              {saved ? (
                <>
                  <Check className="w-4 h-4 mr-2" />
                  Message Saved!
                </>
              ) : (
                <>
                  Save My Message
                  <ArrowRight className="w-4 h-4 ml-2" />
                </>
              )}
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default GptMessageModule;
