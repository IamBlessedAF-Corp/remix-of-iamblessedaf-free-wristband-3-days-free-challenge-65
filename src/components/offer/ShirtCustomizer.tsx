import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PenLine, User, ArrowRight, Check, Sparkles, Shirt } from "lucide-react";
import confetti from "canvas-confetti";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

const MAX_CHARS = 130;
const MAX_NAME_CHARS = 20;
const TSHIRT_SIZES = ["S", "M", "L", "XL", "2XL", "3XL"];

interface ShirtCustomizerProps {
  friendName: string;
  onFriendNameChange: (name: string) => void;
  message: string;
  onMessageChange: (message: string) => void;
  selectedSize: string;
  onSizeChange: (size: string) => void;
}

/** Step indicator dots */
const StepDots = ({ current, total }: { current: number; total: number }) => (
  <div className="flex items-center gap-1.5 justify-center mb-3">
    {Array.from({ length: total }).map((_, i) => (
      <motion.div
        key={i}
        className={`h-1.5 rounded-full transition-all duration-300 ${
          i < current
            ? "bg-primary w-6"
            : i === current
            ? "bg-primary/60 w-4"
            : "bg-muted-foreground/20 w-1.5"
        }`}
        layout
      />
    ))}
  </div>
);

const ShirtCustomizer = ({
  friendName,
  onFriendNameChange,
  message,
  onMessageChange,
  selectedSize,
  onSizeChange,
}: ShirtCustomizerProps) => {
  const [saved, setSaved] = useState(false);
  const [gender, setGender] = useState(() => localStorage.getItem("friendShirtGender") || "");
  const nameInputRef = useRef<HTMLInputElement>(null);
  const messageRef = useRef<HTMLTextAreaElement>(null);

  // Track which field user is editing for step indicator
  const hasName = friendName.trim().length > 0;
  const hasMessage = message.trim().length > 0;
  const hasSize = !!gender;
  const currentStep = !hasName ? 0 : !hasMessage ? 1 : !hasSize ? 2 : 3;

  const charsLeft = MAX_CHARS - message.length;

  // Auto-focus name input on mount
  useEffect(() => {
    const timer = setTimeout(() => nameInputRef.current?.focus(), 600);
    return () => clearTimeout(timer);
  }, []);

  const fireConfetti = useCallback(() => {
    const end = Date.now() + 600;
    const colors = ["hsl(var(--primary))", "#FFD700", "#FF6B6B", "#4ECDC4"];
    const frame = () => {
      confetti({
        particleCount: 3,
        angle: 60 + Math.random() * 60,
        spread: 55,
        origin: { x: Math.random(), y: 0.6 },
        colors,
        ticks: 100,
        gravity: 1.2,
        scalar: 0.9,
      });
      if (Date.now() < end) requestAnimationFrame(frame);
    };
    frame();
  }, []);

  const handleSave = () => {
    if (hasName && hasMessage && gender) {
      setSaved(true);
      fireConfetti();
      localStorage.setItem("friendShirtMessage", message);
      localStorage.setItem("friendShirtGender", gender);
      localStorage.setItem("friendShirtName", friendName);
      localStorage.setItem("friendShirtSize", selectedSize);

      window.dispatchEvent(
        new CustomEvent("track", { detail: { event: "message_saved" } })
      );
    }
  };

  return (
    <motion.div
      className="space-y-4"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      {/* Step indicator */}
      <StepDots current={currentStep} total={3} />

      {/* ── Step 1: Friend's name ── */}
      <div>
        <label className="flex items-center gap-1.5 text-sm font-semibold text-foreground mb-1.5">
          <User className="w-3.5 h-3.5 text-primary" />
          Who's this for?
        </label>
        <div className="relative">
          <Input
            ref={nameInputRef}
            placeholder="Your best friend's name"
            value={friendName}
            onChange={(e) => {
              if (e.target.value.length <= MAX_NAME_CHARS) {
                onFriendNameChange(e.target.value);
                setSaved(false);
              }
            }}
            maxLength={MAX_NAME_CHARS}
            className="h-11 text-base font-medium border-border/60 focus:border-primary rounded-xl pl-4 pr-10"
          />
          <AnimatePresence>
            {hasName && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
                className="absolute right-3 top-1/2 -translate-y-1/2"
              >
                <Check className="w-4 h-4 text-primary" />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* ── Step 2: Message ── */}
      <AnimatePresence>
        {hasName && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <label className="flex items-center gap-1.5 text-sm font-semibold text-foreground mb-1.5">
              <PenLine className="w-3.5 h-3.5 text-primary" />
              Your message to {friendName}
            </label>
            <p className="text-xs text-muted-foreground mb-2">
              💡 Mention a specific moment you felt grateful — the more personal, the more powerful
            </p>
            <div className="relative">
              <Textarea
                ref={messageRef}
                placeholder={`e.g. "you stayed up all night to help me move — I felt so loved"`}
                value={message}
                onChange={(e) => {
                  if (e.target.value.length <= MAX_CHARS) {
                    onMessageChange(e.target.value);
                    setSaved(false);
                  }
                }}
                maxLength={MAX_CHARS}
                className="min-h-[80px] resize-none text-sm border-border/60 focus:border-primary rounded-xl"
                onFocus={() =>
                  window.dispatchEvent(
                    new CustomEvent("track", {
                      detail: { event: "message_started" },
                    })
                  )
                }
              />
              <div className="flex justify-between items-center mt-1">
                <AnimatePresence>
                  {hasMessage && (
                    <motion.span
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="text-xs text-primary font-medium flex items-center gap-1"
                    >
                      <Sparkles className="w-3 h-3" /> Looking great!
                    </motion.span>
                  )}
                </AnimatePresence>
                <span
                  className={`text-xs font-medium ml-auto ${
                    charsLeft <= 20
                      ? charsLeft <= 0
                        ? "text-destructive"
                        : "text-primary"
                      : "text-muted-foreground"
                  }`}
                >
                  {charsLeft}/{MAX_CHARS}
                </span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Step 3: Gender + Size ── */}
      <AnimatePresence>
        {hasName && hasMessage && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="space-y-3"
          >
            {/* Gender */}
            <div>
              <p className="text-sm font-semibold text-foreground mb-2 flex items-center gap-1.5">
                <Shirt className="w-3.5 h-3.5 text-primary" />
                {friendName}'s fit
              </p>
              <RadioGroup
                value={gender}
                onValueChange={(val) => {
                  setGender(val);
                  setSaved(false);
                  window.dispatchEvent(
                    new CustomEvent("track", {
                      detail: { event: "friend_gender_selected" },
                    })
                  );
                }}
                className="flex items-center gap-3"
              >
                <Label
                  htmlFor="g-male"
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border cursor-pointer transition-all ${
                    gender === "male"
                      ? "border-primary bg-primary/5 text-foreground"
                      : "border-border/60 text-muted-foreground hover:border-foreground/40"
                  }`}
                >
                  <RadioGroupItem value="male" id="g-male" className="sr-only" />
                  <span className="text-base">👨</span>
                  <span className="text-sm font-medium">Male</span>
                </Label>
                <Label
                  htmlFor="g-female"
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border cursor-pointer transition-all ${
                    gender === "female"
                      ? "border-primary bg-primary/5 text-foreground"
                      : "border-border/60 text-muted-foreground hover:border-foreground/40"
                  }`}
                >
                  <RadioGroupItem value="female" id="g-female" className="sr-only" />
                  <span className="text-base">👩</span>
                  <span className="text-sm font-medium">Female</span>
                </Label>
              </RadioGroup>
            </div>

            {/* Size */}
            <AnimatePresence>
              {gender && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs font-medium text-foreground uppercase tracking-wider">
                      {friendName}'s size
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Selected: <span className="font-medium text-foreground">{selectedSize}</span>
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {TSHIRT_SIZES.map((size) => (
                      <button
                        key={size}
                        onClick={() => {
                          onSizeChange(size);
                          setSaved(false);
                          window.dispatchEvent(
                            new CustomEvent("track", {
                              detail: { event: "size_selected" },
                            })
                          );
                        }}
                        className={`min-w-[3.25rem] h-11 px-3 text-sm font-medium rounded-xl border transition-all ${
                          selectedSize === size
                            ? "border-primary bg-primary text-primary-foreground"
                            : "border-border/60 text-foreground hover:border-primary/50"
                        }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Save Button ── */}
      <AnimatePresence>
        {hasName && hasMessage && gender && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            <Button
              onClick={handleSave}
              className={`w-full h-12 text-base font-bold rounded-xl transition-all duration-300 ${
                saved
                  ? "bg-primary/20 text-primary border border-primary/30"
                  : "bg-primary hover:bg-primary/90 text-primary-foreground"
              }`}
            >
              {saved ? (
                <>
                  <Check className="w-4 h-4 mr-2" />
                  Saved! {friendName} is going to love this 💛
                </>
              ) : (
                <>
                  Save {friendName}'s Custom Shirt
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

export default ShirtCustomizer;
