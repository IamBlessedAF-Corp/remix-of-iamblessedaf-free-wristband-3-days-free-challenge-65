import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";

import {
  Heart,
  Send,
  Phone,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  Calendar,
  Gift,
  ChevronDown,
} from "lucide-react";
import MessageBubblePreview from "./MessageBubblePreview";

import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
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

const SS_KEY = "gratitude_setup_state";

const loadState = () => {
  try {
    const raw = sessionStorage.getItem(SS_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return null;
};

const saveState = (state: Record<string, unknown>) => {
  try { sessionStorage.setItem(SS_KEY, JSON.stringify(state)); } catch {}
};

const STEP_LABELS = [
  { label: "Why It Works", done: true },
  { label: "Name Your Friend", done: false },
  { label: "Claim Wristband", done: false },
];

const anim = {
  initial: { opacity: 0, x: 20 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -20 },
  transition: { duration: 0.3 },
};

const GratitudeSetupFlow = ({ onComplete, onSkip }: GratitudeSetupFlowProps) => {
  const saved = loadState();
  const [currentStep, setCurrentStepRaw] = useState<Step>(
    saved?.step && STEPS.includes(saved.step) ? saved.step : "name-friend"
  );
  const [bestFriend, setBestFriendRaw] = useState(saved?.bestFriend ?? "");
  const [gratitudeMemory, setGratitudeMemoryRaw] = useState(saved?.gratitudeMemory ?? "");
  const [countryCode, setCountryCodeRaw] = useState(saved?.countryCode ?? "+1");
  const [phoneLocal, setPhoneLocalRaw] = useState(saved?.phoneLocal ?? "");
  const [agreedToSms, setAgreedToSmsRaw] = useState(saved?.agreedToSms ?? false);
  const [saving, setSaving] = useState(false);
  const [showCountryCodes, setShowCountryCodes] = useState(false);

  const persist = (patch: Record<string, unknown>) => {
    const cur = loadState() || {};
    saveState({ ...cur, ...patch });
  };
  const setCurrentStep = (v: Step) => { setCurrentStepRaw(v); persist({ step: v }); };
  const setBestFriend = (v: string) => { setBestFriendRaw(v); persist({ bestFriend: v }); };
  const setGratitudeMemory = (v: string) => { setGratitudeMemoryRaw(v); persist({ gratitudeMemory: v }); };
  const setCountryCode = (v: string) => { setCountryCodeRaw(v); persist({ countryCode: v }); };
  const setPhoneLocal = (v: string) => { setPhoneLocalRaw(v); persist({ phoneLocal: v }); };
  const setAgreedToSms = (v: boolean) => { setAgreedToSmsRaw(v); persist({ agreedToSms: v }); };


  const phone = `${countryCode}${phoneLocal}`;

  const COUNTRY_CODES = [
    { code: "+1", flag: "🇺🇸", label: "US/CA" },
    { code: "+52", flag: "🇲🇽", label: "MX" },
    { code: "+44", flag: "🇬🇧", label: "UK" },
    { code: "+34", flag: "🇪🇸", label: "ES" },
    { code: "+57", flag: "🇨🇴", label: "CO" },
    { code: "+54", flag: "🇦🇷", label: "AR" },
    { code: "+55", flag: "🇧🇷", label: "BR" },
    { code: "+56", flag: "🇨🇱", label: "CL" },
    { code: "+51", flag: "🇵🇪", label: "PE" },
    { code: "+91", flag: "🇮🇳", label: "IN" },
    { code: "+61", flag: "🇦🇺", label: "AU" },
    { code: "+49", flag: "🇩🇪", label: "DE" },
    { code: "+33", flag: "🇫🇷", label: "FR" },
    { code: "+81", flag: "🇯🇵", label: "JP" },
    { code: "+82", flag: "🇰🇷", label: "KR" },
    { code: "+234", flag: "🇳🇬", label: "NG" },
    { code: "+27", flag: "🇿🇦", label: "ZA" },
    { code: "+971", flag: "🇦🇪", label: "AE" },
    { code: "+966", flag: "🇸🇦", label: "SA" },
    { code: "+63", flag: "🇵🇭", label: "PH" },
  ];

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
      {/* Step indicator matching intro screen */}
      <div className="flex items-center justify-center gap-2">
        {STEP_LABELS.map((s, i) => {
          const isStep2 = i === 1;
          const isStep3 = i === 2;
          const isInSetup = currentStep !== "confirmation";
          const isActive = isInSetup ? isStep2 : isStep3;
          const isDone = i === 0 || (isStep2 && !isInSetup);
          return (
            <div key={i} className="flex items-center gap-2">
              <div className="flex items-center gap-1.5">
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                    isDone
                      ? "bg-primary/30 text-primary"
                      : isActive
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {isDone ? "✓" : i + 1}
                </div>
                <span className={`text-xs font-medium ${isActive ? "text-foreground" : "text-muted-foreground"}`}>
                  {s.label}
                </span>
              </div>
              {i < STEP_LABELS.length - 1 && (
                <div className={`w-6 h-px ${isDone ? "bg-primary/50" : "bg-border"}`} />
              )}
            </div>
          );
        })}
      </div>

      <AnimatePresence mode="wait" initial={false}>
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
              <div className="flex gap-2">
                {/* Country code picker */}
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setShowCountryCodes(!showCountryCodes)}
                    className="h-12 px-3 rounded-md border border-input bg-secondary/50 flex items-center gap-1 text-sm font-medium hover:bg-secondary transition-colors min-w-[90px]"
                  >
                    <span>{COUNTRY_CODES.find(c => c.code === countryCode)?.flag}</span>
                    <span>{countryCode}</span>
                    <ChevronDown className="w-3 h-3 text-muted-foreground" />
                  </button>
                  {showCountryCodes && (
                    <div className="absolute top-full left-0 mt-1 bg-card border border-border rounded-lg shadow-lg z-20 max-h-48 overflow-y-auto w-44">
                      {COUNTRY_CODES.map((c) => (
                        <button
                          key={c.code}
                          type="button"
                          onClick={() => {
                            setCountryCode(c.code);
                            setShowCountryCodes(false);
                          }}
                          className={`w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-secondary/50 transition-colors ${
                            countryCode === c.code ? "bg-primary/10 text-primary font-semibold" : ""
                          }`}
                        >
                          <span>{c.flag}</span>
                          <span className="font-mono">{c.code}</span>
                          <span className="text-muted-foreground text-xs">{c.label}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                {/* Phone number */}
                <Input
                  type="tel"
                  placeholder="Your phone number"
                  value={phoneLocal}
                  onChange={(e) => setPhoneLocal(e.target.value)}
                  className="h-12 text-base bg-secondary/50 border-border/50 focus:border-primary flex-1"
                  maxLength={15}
                />
              </div>

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
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.3 }}
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
