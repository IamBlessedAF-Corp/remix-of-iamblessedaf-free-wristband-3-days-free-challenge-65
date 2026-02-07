import { useState, useRef } from "react";
import { ArrowRight, PenLine } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { motion } from "framer-motion";

const MAX_CHARS = 130;

const CustomMessageBox = () => {
  const [message, setMessage] = useState("");
  const [gender, setGender] = useState<string>("");
  const [saved, setSaved] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const charsLeft = MAX_CHARS - message.length;

  const handleSave = () => {
    if (message.trim() && gender) {
      setSaved(true);
      localStorage.setItem("friendShirtMessage", message);
      localStorage.setItem("friendShirtGender", gender);
    }
  };

  const handleTapToWrite = () => {
    textareaRef.current?.focus();
  };

  return (
    <motion.div
      className="max-w-lg mx-auto"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.12 }}
    >
      {/* Header */}
      <p className="text-sm font-semibold text-foreground text-center mb-3">
        ✍️ Complete this Message here
      </p>

      {/* Unified message card — pre-filled + editable */}
      <div
        className={`rounded-xl border transition-all duration-300 overflow-hidden ${
          isFocused
            ? "border-primary shadow-[0_0_0_2px_hsl(var(--primary)/0.15)]"
            : "border-border/60"
        }`}
      >
        {/* Pre-filled non-editable part */}
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
          onClick={handleTapToWrite}
        >
          {/* Blinking caret hint when empty and not focused */}
          {!message && !isFocused && (
            <motion.div
              className="absolute inset-0 flex items-center justify-center gap-2 pointer-events-none"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              <motion.div
                animate={{ opacity: [1, 0.3, 1] }}
                transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut" }}
              >
                <PenLine className="w-4 h-4 text-primary" />
              </motion.div>
              <span className="text-sm text-muted-foreground">Tap here to write your message...</span>
            </motion.div>
          )}

          <Textarea
            ref={textareaRef}
            placeholder="Mention the specific moment you FELT the most grateful for your Best Friend. What's the most meaningful thing they did for you?"
            value={message}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            onChange={(e) => {
              if (e.target.value.length <= MAX_CHARS) {
                setMessage(e.target.value);
                setSaved(false);
              }
            }}
            className={`min-h-[90px] resize-none bg-transparent border-0 text-foreground text-sm rounded-none focus:ring-0 focus-visible:ring-0 focus-visible:ring-offset-0 ${
              !message && !isFocused
                ? "placeholder:text-transparent"
                : "placeholder:text-muted-foreground/50"
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

      {/* Gender selector */}
      <div className="mb-4">
        <p className="text-sm font-semibold text-foreground mb-2 text-center">
          Your Best Friend is:
        </p>
        <RadioGroup
          value={gender}
          onValueChange={(val) => {
            setGender(val);
            setSaved(false);
          }}
          className="flex items-center justify-center gap-6"
        >
          <div className="flex items-center gap-2">
            <RadioGroupItem value="male" id="gender-male" />
            <Label htmlFor="gender-male" className="text-sm cursor-pointer">
              👨 Male
            </Label>
          </div>
          <div className="flex items-center gap-2">
            <RadioGroupItem value="female" id="gender-female" />
            <Label htmlFor="gender-female" className="text-sm cursor-pointer">
              👩 Female
            </Label>
          </div>
        </RadioGroup>
      </div>

      {/* Save button */}
      <Button
        onClick={handleSave}
        disabled={!message.trim() || !gender}
        className="w-full h-12 text-base font-bold bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl transition-all duration-300"
      >
        {saved ? "✅ Message Saved!" : "Save My Custom Message"}
        {!saved && <ArrowRight className="w-4 h-4 ml-2" />}
      </Button>
    </motion.div>
  );
};

export default CustomMessageBox;
