import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import {
  Heart,
  Send,
  Phone,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  Calendar,
  Gift,
} from "lucide-react";
import MessageBubblePreview from "./MessageBubblePreview";
import { supabase } from "@/integrations/supabase/client";
import wristbandImg from "@/assets/wristband-gift.avif";

interface GratitudeSetupFlowProps {
  onComplete: () => void;
  onSkip: () => void;
}

type Step = "name-friend" | "write-message" | "phone-optin" | "confirmation";

const STEPS: Step[] = [
  "name-friend",
  "write-message",
  "phone-optin",
  "confirmation",
];

const anim = {
  initial: { opacity: 0, x: 20 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -20 },
  transition: { duration: 0.3 },
};

const GratitudeSetupFlow = ({ onComplete, onSkip }: GratitudeSetupFlowProps) => {
  const [currentStep, setCurrentStep] = useState<Step>("name-friend");
  const [bestFriend, setBestFriend] = useState("");
  const [gratitudeMemory, setGratitudeMemory] = useState("");
  const [phone, setPhone] = useState("");
  const [agreedToSms, setAgreedToSms] = useState(false);
  const [saving, setSaving] = useState(false);

  const stepIndex = STEPS.indexOf(currentStep);
  const progress = ((stepIndex + 1) / STEPS.length) * 100;

  const friendName = bestFriend.trim() || "your friend";

  const buildFullMessage = () => {
    const memory = gratitudeMemory.trim() || "you know what";
    return `It's 11:11! 🙏 I feel Blessed And Fortunate to have u as my best Friend.\n\n${friendName} for real! TY for ${memory}!\n\nI just got a cool wristband to remind myself to be more grateful and they gave me an extra one for my best friend!\n\nI want you to get it too!\nThis is the link to get it shipped\n[Link]`;
  };

  const goNext = () => {
    const idx = STEPS.indexOf(currentStep);
    if (idx < STEPS.length - 1) {
      setCurrentStep(STEPS[idx + 1]);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const goBack = () => {
    const idx = STEPS.indexOf(currentStep);
    if (idx > 0) {
      setCurrentStep(STEPS[idx - 1]);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleSchedule = async () => {
    setSaving(true);
    try {
      const res = await supabase.functions.invoke("schedule-challenge-messages", {
        body: {
          phone,
          friends: {
            friend1: bestFriend.trim(),
            friend2: null,
            friend3: null,
          },
          gratitudeMemory: gratitudeMemory.trim(),
          fullMessage: buildFullMessage(),
        },
      });

      if (res.error) {
        console.error("Schedule error:", res.error);
      }

      localStorage.setItem(
        "gratitude_challenge_setup",
        JSON.stringify({
          friends: { friend1: bestFriend.trim() },
          message: buildFullMessage(),
          gratitudeMemory,
          phone,
          agreedToSms,
          participantId: res.data?.participantId,
          createdAt: new Date().toISOString(),
        })
      );
    } catch (err) {
      console.error("Failed to schedule:", err);
    }
    setSaving(false);
    goNext();
  };

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const formatDate = (d: Date) =>
    d.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    });

  return (
    <div className="space-y-6">
      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm text-muted-foreground">
          <span>
            Step {stepIndex + 1} of {STEPS.length}
          </span>
          <span>{Math.round(progress)}%</span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      <AnimatePresence mode="wait">
        {/* ── STEP 1: Name Your Best Friend ── */}
        {currentStep === "name-friend" && (
          <motion.div key="name-friend" {...anim} className="space-y-6">
            <div className="text-center space-y-2">
              <div className="w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                <Heart className="w-7 h-7 text-primary" />
              </div>
              <h2 className="text-2xl font-bold">Who's Your Best Friend?</h2>
              <p className="text-muted-foreground text-sm">
                Name or nickname — the person you'd text at 2 AM. They'll get a real "thank you" from you.
              </p>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-semibold flex items-center gap-2">
                <Heart className="w-4 h-4 text-primary" />
                Best Friend or Bro Code Nickname
              </label>
              <Input
                placeholder='e.g. "Joe", "Güero", "My Day One"'
                value={bestFriend}
                onChange={(e) => setBestFriend(e.target.value)}
                className="h-12 text-base bg-secondary/50 border-border/50 focus:border-primary"
                maxLength={100}
              />
            </div>

            <p className="text-xs text-center text-muted-foreground italic">
              Harvard's 85-year study: the happiest people had strong
              relationships — built by saying "thank you" out loud.
            </p>

            <Button
              onClick={goNext}
              disabled={!bestFriend.trim()}
              className="w-full h-14 text-base md:text-lg font-bold btn-glow px-4"
            >
              Write Their 11:11 Message
              <ArrowRight className="w-5 h-5 ml-2 flex-shrink-0" />
            </Button>

            <button
              onClick={onSkip}
              className="w-full text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Skip for now
            </button>
          </motion.div>
        )}

        {/* ── STEP 2: Write Your Message ── */}
        {currentStep === "write-message" && (
          <motion.div key="write-message" {...anim} className="space-y-6">
            <div className="text-center space-y-2">
              <div className="w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                <Send className="w-7 h-7 text-primary" />
              </div>
              <h2 className="text-2xl font-bold">
                What Are You Grateful For?
              </h2>
              <p className="text-muted-foreground text-sm">
                One thing {friendName} did for you. Keep it real — even one sentence is enough.
              </p>
            </div>

            {/* Template + Textarea */}
            <div className="bg-secondary/50 rounded-xl p-4 border border-border/50 space-y-3">
              <p className="text-sm font-medium">Your text will say:</p>
              <p className="text-sm text-muted-foreground italic leading-relaxed">
                "It's 11:11! 🙏 I feel Blessed And Fortunate to have u as my
                best Friend.
                <br />
                <br />
                <span className="font-semibold text-foreground">
                  {friendName}
                </span>
                {" "}for real! TY for..."
              </p>
              <Textarea
                placeholder='e.g. "that time you showed up when nobody else did" or "always keeping it real with me"'
                value={gratitudeMemory}
                onChange={(e) => setGratitudeMemory(e.target.value)}
                className="min-h-[80px] text-base bg-background"
                maxLength={300}
              />
              <p className="text-xs text-right text-muted-foreground">
                {gratitudeMemory.length}/300
              </p>
            </div>

            {/* Wristband preview in the message */}
            <div className="bg-secondary/50 rounded-xl p-4 border border-border/50 space-y-2">
              <p className="text-xs font-medium text-muted-foreground">+ Your friend also gets:</p>
              <div className="flex items-center gap-3">
                <img
                  src={wristbandImg}
                  alt="FREE Wristband"
                  className="w-16 h-16 rounded-lg object-cover border border-border/50"
                />
                <div>
                  <p className="text-sm font-semibold">FREE "I Am Blessed AF" Wristband</p>
                  <p className="text-xs text-muted-foreground">Shipped to them with your referral link</p>
                </div>
              </div>
            </div>

            {/* Live iPhone Preview */}
            <MessageBubblePreview message={buildFullMessage()} />

            <Button
              onClick={goNext}
              disabled={!gratitudeMemory.trim()}
              className="w-full h-14 text-base md:text-lg font-bold btn-glow px-4"
            >
              Set Up Reminders
              <ArrowRight className="w-5 h-5 ml-2 flex-shrink-0" />
            </Button>

            <button
              onClick={goBack}
              className="w-full text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              ← Back
            </button>
          </motion.div>
        )}

        {/* ── STEP 3: Phone Opt-In ── */}
        {currentStep === "phone-optin" && (
          <motion.div key="phone-optin" {...anim} className="space-y-6">
            <div className="text-center space-y-2">
              <div className="w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                <Phone className="w-7 h-7 text-primary" />
              </div>
              <h2 className="text-2xl font-bold">Get Your Reminder</h2>
              <p className="text-muted-foreground text-sm">
                We'll text you at 3PM to prepare your 11:11 message for {friendName}. Just 1 reminder text.
              </p>
            </div>

            <div className="space-y-4">
              <Input
                type="tel"
                placeholder="Your phone number"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="h-12 text-base bg-secondary/50 border-border/50 focus:border-primary"
                maxLength={20}
              />

              <div className="flex items-start gap-3">
                <Checkbox
                  id="sms-consent"
                  checked={agreedToSms}
                  onCheckedChange={(v) => setAgreedToSms(v === true)}
                  className="mt-0.5"
                />
                <label
                  htmlFor="sms-consent"
                  className="text-xs text-muted-foreground leading-relaxed cursor-pointer"
                >
                  I agree to receive challenge reminders via text message. Msg &
                  data rates may apply. Reply STOP to cancel anytime.
                </label>
              </div>
            </div>

            {/* Schedule preview */}
            <div className="bg-accent/50 rounded-xl p-4 space-y-2">
              <p className="text-sm font-semibold">📅 Your schedule:</p>
              <div className="space-y-1 text-sm text-muted-foreground">
                <p>
                  Tomorrow at 11:11 AM → Your gratitude text goes to{" "}
                  <span className="font-medium text-foreground">
                    {friendName}
                  </span>
                </p>
              </div>
            </div>

            <Button
              onClick={handleSchedule}
              disabled={
                !phone.trim() || phone.length < 10 || !agreedToSms || saving
              }
              className="w-full h-14 text-base md:text-lg font-bold btn-glow px-4"
            >
              {saving ? (
                <span className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 animate-pulse" />
                  Scheduling...
                </span>
              ) : (
                <>
                  Schedule My Message
                  <ArrowRight className="w-5 h-5 ml-2 flex-shrink-0" />
                </>
              )}
            </Button>

            <button
              onClick={goBack}
              className="w-full text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              ← Back
            </button>
          </motion.div>
        )}

        {/* ── STEP 4: Confirmation ── */}
        {currentStep === "confirmation" && (
          <motion.div
            key="confirmation"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-6"
          >
            <div className="text-center space-y-2">
              <motion.div
                className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", delay: 0.2 }}
              >
                <CheckCircle2 className="w-8 h-8 text-primary" />
              </motion.div>
              <h2 className="text-2xl font-bold">
                You're All Set! 🎉
              </h2>
              <p className="text-muted-foreground text-sm">
                Tomorrow at 11:11 AM, your gratitude text goes to {friendName}.
                Get ready to feel something real.
              </p>
            </div>

            {/* Schedule summary */}
            <div className="bg-secondary/50 rounded-xl p-4 space-y-3 border border-border/50">
              <div className="flex items-center gap-3 p-2 rounded-lg bg-background/50">
                <Calendar className="w-5 h-5 text-primary flex-shrink-0" />
                <div>
                  <p className="text-sm font-semibold">
                    {formatDate(tomorrow)} at 11:11 AM
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Message to {friendName}
                  </p>
                </div>
              </div>
            </div>

            {/* Wristband preview */}
            <div className="bg-accent/50 rounded-xl p-4 space-y-2 border border-primary/20">
              <div className="flex items-center gap-3">
                <Gift className="w-5 h-5 text-primary flex-shrink-0" />
                <p className="text-sm font-semibold">
                  {friendName} will also get a FREE wristband link!
                </p>
              </div>
            </div>

            <p className="text-xs text-center text-muted-foreground">
              🔔 You'll get a reminder at 3PM to refine your message.
            </p>

            <Button
              onClick={onComplete}
              className="w-full h-14 text-base md:text-lg font-bold btn-glow px-4"
            >
              <Gift className="w-5 h-5 mr-2 flex-shrink-0" />
              Get My FREE Wristband Shipped NOW
              <ArrowRight className="w-5 h-5 ml-2 flex-shrink-0" />
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default GratitudeSetupFlow;
