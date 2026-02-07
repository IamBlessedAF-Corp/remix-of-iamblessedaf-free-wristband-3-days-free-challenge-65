import { useState } from "react";
import { ArrowRight } from "lucide-react";
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

  const charsLeft = MAX_CHARS - message.length;

  const handleSave = () => {
    if (message.trim() && gender) {
      setSaved(true);
      // Could persist to localStorage or state management
      localStorage.setItem("friendShirtMessage", message);
      localStorage.setItem("friendShirtGender", gender);
    }
  };

  return (
    <motion.div
      className="bg-card border border-border/50 rounded-2xl p-5 max-w-lg mx-auto mb-4 shadow-soft"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.12 }}
    >
      {/* Header */}
      <p className="text-sm font-semibold text-foreground text-center mb-3">
        ✍️ Complete this Message here
      </p>

      {/* Pre-filled non-editable message */}
      <div className="bg-muted/40 rounded-xl p-4 mb-0">
        <p className="text-sm md:text-base italic text-foreground/80 text-center leading-relaxed">
          "I am Blessed AF to Have a Best Friend
        </p>
        <p className="text-sm md:text-base italic text-foreground/80 text-center leading-relaxed">
          TY! I'll Never Forget when You..."
        </p>
      </div>

      {/* Divider */}
      <div className="border-t border-dashed border-border mx-4" />

      {/* Custom message textarea */}
      <Textarea
        placeholder="Mention the specific moment you FELT the most grateful for your Best Friend. What's the most meaningful thing they did for you?"
        value={message}
        onChange={(e) => {
          if (e.target.value.length <= MAX_CHARS) {
            setMessage(e.target.value);
            setSaved(false);
          }
        }}
        className="min-h-[80px] resize-none bg-muted/40 border-0 text-foreground placeholder:text-muted-foreground/60 text-sm rounded-xl rounded-t-none focus:ring-0 focus-visible:ring-0 focus-visible:ring-offset-0"
        maxLength={MAX_CHARS}
      />

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
