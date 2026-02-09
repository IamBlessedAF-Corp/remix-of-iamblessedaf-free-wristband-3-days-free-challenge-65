import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import {
  Heart,
  Users,
  Send,
  Phone,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  Calendar,
} from "lucide-react";
import MessageBubblePreview from "./MessageBubblePreview";
import { supabase } from "@/integrations/supabase/client";

interface GratitudeSetupFlowProps {
  onComplete: () => void;
  onSkip: () => void;
}

type Step = "name-friends" | "write-message" | "phone-optin" | "confirmation";

const STEPS: Step[] = [
  "name-friends",
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
  const [currentStep, setCurrentStep] = useState<Step>("name-friends");
  const [friends, setFriends] = useState({
    friend1: "",
    friend2: "",
    friend3: "",
  });
  const [gratitudeMemory, setGratitudeMemory] = useState("");
  const [phone, setPhone] = useState("");
  const [agreedToSms, setAgreedToSms] = useState(false);
  const [saving, setSaving] = useState(false);

  const stepIndex = STEPS.indexOf(currentStep);
  const progress = ((stepIndex + 1) / STEPS.length) * 100;

  const buildFullMessage = () => {
    const friendName = friends.friend1 || "your friend";
    const memory = gratitudeMemory || "[your specific memory]";
    return `It's 11:11! 🙏 I feel Blessed And Fortunate to have u as my best Friend.\n\n${friendName}, I'll never forget when you ${memory}\n\nI just got a cool wristband to remind myself to be more grateful and I'm sending you one as a gift too! Want the link to get it by mail? 🎁`;
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
            friend1: friends.friend1.trim(),
            friend2: friends.friend2.trim() || null,
            friend3: friends.friend3.trim() || null,
          },
          gratitudeMemory: gratitudeMemory.trim(),
          fullMessage: buildFullMessage(),
        },
      });

      if (res.error) {
        console.error("Schedule error:", res.error);
      }

      // Store locally as backup
      localStorage.setItem(
        "gratitude_challenge_setup",
        JSON.stringify({
          friends,
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

  // Calculate schedule dates
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const day2 = new Date();
  day2.setDate(day2.getDate() + 2);
  const day3 = new Date();
  day3.setDate(day3.getDate() + 3);
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
        {/* ── STEP 1: Name Your 3 Friends ── */}
        {currentStep === "name-friends" && (
          <motion.div key="name-friends" {...anim} className="space-y-6">
            <div className="text-center space-y-2">
              <div className="w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                <Users className="w-7 h-7 text-primary" />
              </div>
              <h2 className="text-2xl font-bold">Who Made Your Life Better?</h2>
              <p className="text-muted-foreground text-sm">
                Name 3 people you're grateful for. Each one gets a real
                "thank you" text from you — and BOTH your brains get happier.
              </p>
            </div>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-sm font-semibold flex items-center gap-2">
                  <Heart className="w-4 h-4 text-primary" />
                  Day 1 — Your Best Friend
                </label>
                <Input
                  placeholder="Their name"
                  value={friends.friend1}
                  onChange={(e) =>
                    setFriends((f) => ({ ...f, friend1: e.target.value }))
                  }
                  className="h-12 text-base bg-secondary/50 border-border/50 focus:border-primary"
                  maxLength={100}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-muted-foreground">
                  Day 2 — Someone Who Helped You
                </label>
                <Input
                  placeholder="Their name (optional)"
                  value={friends.friend2}
                  onChange={(e) =>
                    setFriends((f) => ({ ...f, friend2: e.target.value }))
                  }
                  className="h-12 text-base bg-secondary/50 border-border/50 focus:border-primary"
                  maxLength={100}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-muted-foreground">
                  Day 3 — Someone Unexpected
                </label>
                <Input
                  placeholder="Their name (optional)"
                  value={friends.friend3}
                  onChange={(e) =>
                    setFriends((f) => ({ ...f, friend3: e.target.value }))
                  }
                  className="h-12 text-base bg-secondary/50 border-border/50 focus:border-primary"
                  maxLength={100}
                />
              </div>
            </div>

            <p className="text-xs text-center text-muted-foreground italic">
              Harvard's 85-year study: the happiest people had strong
              relationships — built by saying "thank you" out loud.
            </p>

            <Button
              onClick={goNext}
              disabled={!friends.friend1.trim()}
              className="w-full h-14 text-base md:text-lg font-bold btn-glow px-4"
            >
              Write Your 11:11 Message
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
                What Will You Never Forget About {friends.friend1}?
              </h2>
              <p className="text-muted-foreground text-sm">
                Write one specific memory. The more real it is, the deeper the
                connection — and the bigger the happiness boost for both of you.
              </p>
            </div>

            {/* Template + Textarea */}
            <div className="bg-secondary/50 rounded-xl p-4 border border-border/50 space-y-3">
              <p className="text-sm font-medium">Your message will say:</p>
              <p className="text-sm text-muted-foreground italic leading-relaxed">
                "It's 11:11! 🙏 I feel Blessed And Fortunate to have u as my
                best Friend.
                <br />
                <br />
                <span className="font-semibold text-foreground">
                  {friends.friend1}
                </span>
                , I'll never forget when you..."
              </p>
              <Textarea
                placeholder='Share a specific moment… e.g. "helped me move apartments even though it was raining and you had to cancel your plans"'
                value={gratitudeMemory}
                onChange={(e) => setGratitudeMemory(e.target.value)}
                className="min-h-[100px] text-base bg-background"
                maxLength={500}
              />
              <p className="text-xs text-right text-muted-foreground">
                {gratitudeMemory.length}/500
              </p>
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
              <h2 className="text-2xl font-bold">Get Your Daily Reminders</h2>
              <p className="text-muted-foreground text-sm">
                We'll text you at 3PM each day to prepare your 11:11 message. No
                spam — just 3 texts over 3 days.
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
                  data rates may apply. Reply STOP to cancel anytime. Max 6
                  messages over 3 days.
                </label>
              </div>
            </div>

            {/* Schedule preview */}
            <div className="bg-accent/50 rounded-xl p-4 space-y-2">
              <p className="text-sm font-semibold">📅 Your reminder schedule:</p>
              <div className="space-y-1 text-sm text-muted-foreground">
                <p>
                  3PM today → Prepare Day 1 message for{" "}
                  <span className="font-medium text-foreground">
                    {friends.friend1}
                  </span>
                </p>
                {friends.friend2 && (
                  <p>
                    3PM tomorrow → Prepare Day 2 message for{" "}
                    <span className="font-medium text-foreground">
                      {friends.friend2}
                    </span>
                  </p>
                )}
                {friends.friend3 && (
                  <p>
                    3PM in 2 days → Prepare Day 3 message for{" "}
                    <span className="font-medium text-foreground">
                      {friends.friend3}
                    </span>
                  </p>
                )}
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
                  Schedule My Messages
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
                Tomorrow at 11:11 AM, your first gratitude text goes out.
                Get ready to feel something real.
              </p>
            </div>

            {/* Schedule summary */}
            <div className="bg-secondary/50 rounded-xl p-4 space-y-3 border border-border/50">
              <div className="flex items-center gap-3 p-2 rounded-lg bg-background/50">
                <Calendar className="w-5 h-5 text-primary flex-shrink-0" />
                <div>
                  <p className="text-sm font-semibold">
                    Day 1 — {formatDate(tomorrow)} at 11:11 AM
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Message to {friends.friend1}
                  </p>
                </div>
              </div>
              {friends.friend2 && (
                <div className="flex items-center gap-3 p-2 rounded-lg bg-background/50">
                  <Calendar className="w-5 h-5 text-primary/60 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-semibold">
                      Day 2 — {formatDate(day2)} at 11:11 AM
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Message to {friends.friend2}
                    </p>
                  </div>
                </div>
              )}
              {friends.friend3 && (
                <div className="flex items-center gap-3 p-2 rounded-lg bg-background/50">
                  <Calendar className="w-5 h-5 text-primary/60 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-semibold">
                      Day 3 — {formatDate(day3)} at 11:11 AM
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Message to {friends.friend3}
                    </p>
                  </div>
                </div>
              )}
            </div>

            <p className="text-xs text-center text-muted-foreground">
              🔔 You'll get a reminder at 3PM each day to refine your message.
            </p>

            <Button
              onClick={onComplete}
              className="w-full h-14 text-base md:text-lg font-bold btn-glow px-4"
            >
              Continue to Checkout
              <ArrowRight className="w-5 h-5 ml-2 flex-shrink-0" />
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default GratitudeSetupFlow;
