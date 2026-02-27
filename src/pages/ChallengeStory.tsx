import { useState, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import html2canvas from "html2canvas";
import { Button } from "@/components/ui/button";
import { useKeyStatus } from "@/hooks/useKeyStatus";
import {
  Share2,
  Download,
  CheckCircle2,
  Sparkles,
  ArrowLeft,
  Loader2,
  MessageCircle,
  Image as ImageIcon,
  Copy,
  ChevronRight,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import logoImg from "@/assets/logo.png";

// ─── Story background themes ───
const STORY_THEMES = [
  {
    id: "golden",
    label: "Golden Hour",
    bg: "from-amber-900 via-yellow-800 to-orange-900",
    accent: "text-yellow-300",
    border: "border-yellow-500/30",
  },
  {
    id: "ocean",
    label: "Deep Ocean",
    bg: "from-blue-950 via-cyan-900 to-teal-900",
    accent: "text-cyan-300",
    border: "border-cyan-500/30",
  },
  {
    id: "cosmic",
    label: "Cosmic",
    bg: "from-purple-950 via-violet-900 to-indigo-900",
    accent: "text-violet-300",
    border: "border-violet-500/30",
  },
  {
    id: "forest",
    label: "Forest",
    bg: "from-emerald-950 via-green-900 to-teal-900",
    accent: "text-emerald-300",
    border: "border-emerald-500/30",
  },
  {
    id: "midnight",
    label: "Midnight",
    bg: "from-gray-950 via-slate-900 to-zinc-900",
    accent: "text-slate-300",
    border: "border-slate-500/30",
  },
] as const;

type ThemeId = (typeof STORY_THEMES)[number]["id"];

// ─── Step states ───
type StoryStep = "compose" | "preview" | "shared";

export default function ChallengeStory() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const {
    status,
    loading,
    isAuthenticated,
    unlockKey2,
    isKeyUnlocked,
  } = useKeyStatus();

  // ── State ──
  const [step, setStep] = useState<StoryStep>("compose");
  const [gratitudeText, setGratitudeText] = useState("");
  const [selectedTheme, setSelectedTheme] = useState<ThemeId>("golden");
  const [userName, setUserName] = useState("");
  const [capturing, setCapturing] = useState(false);
  const [sharing, setSharing] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);

  const storyRef = useRef<HTMLDivElement>(null);
  const theme = STORY_THEMES.find((t) => t.id === selectedTheme) ?? STORY_THEMES[0];

  // ── Already unlocked Key 2? ──
  const key2Done = isKeyUnlocked(2);

  // ── Capture story as image ──
  const captureStory = useCallback(async (): Promise<string | null> => {
    if (!storyRef.current) return null;
    setCapturing(true);
    try {
      const canvas = await html2canvas(storyRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: null,
        width: 1080 / 2,
        height: 1920 / 2,
      });
      const dataUrl = canvas.toDataURL("image/png");
      setCapturedImage(dataUrl);
      return dataUrl;
    } catch (err) {
      console.error("html2canvas error:", err);
      toast({
        title: "Capture failed",
        description: "Could not generate story image. Try again.",
        variant: "destructive",
      });
      return null;
    } finally {
      setCapturing(false);
    }
  }, [toast]);

  // ── Download image ──
  const downloadImage = useCallback(async () => {
    const img = capturedImage ?? (await captureStory());
    if (!img) return;
    const link = document.createElement("a");
    link.download = "iamblessedaf-story.png";
    link.href = img;
    link.click();
    toast({ title: "Downloaded!", description: "Story saved to your device." });
  }, [capturedImage, captureStory, toast]);

  // ── Copy image to clipboard ──
  const copyImage = useCallback(async () => {
    const img = capturedImage ?? (await captureStory());
    if (!img) return;
    try {
      const response = await fetch(img);
      const blob = await response.blob();
      await navigator.clipboard.write([
        new ClipboardItem({ "image/png": blob }),
      ]);
      toast({ title: "Copied!", description: "Story copied to clipboard." });
    } catch {
      toast({
        title: "Copy failed",
        description: "Your browser may not support clipboard images.",
        variant: "destructive",
      });
    }
  }, [capturedImage, captureStory, toast]);

  // ── Share to WhatsApp ──
  const shareWhatsApp = useCallback(async () => {
    // First download/copy so user has the image
    await downloadImage();

    const shareText = encodeURIComponent(
      `🙏 I just shared what I'm grateful for in the IamBlessedAF 3-Day Challenge!\n\n` +
        `"${gratitudeText.slice(0, 120)}${gratitudeText.length > 120 ? "..." : ""}"\n\n` +
        `Join me → https://iamblessedaf.com/challenge\n\n` +
        `#IamBlessedAF #GratitudeChallenge`
    );
    window.open(`https://wa.me/?text=${shareText}`, "_blank");
  }, [gratitudeText, downloadImage]);

  // ── Confirm share + unlock Key 2 ──
  const confirmShare = useCallback(async () => {
    if (key2Done) {
      navigate("/keys");
      return;
    }
    setSharing(true);
    try {
      const imageUrl = capturedImage ?? "story-shared-whatsapp";
      const success = await unlockKey2("story_whatsapp", imageUrl);
      if (success) {
        setStep("shared");
        toast({
          title: "🔑 Key 2 Unlocked!",
          description: "+150 Blessed Credits earned!",
        });
      } else {
        toast({
          title: "Hmm...",
          description: "Could not verify share. Try again.",
          variant: "destructive",
        });
      }
    } finally {
      setSharing(false);
    }
  }, [key2Done, capturedImage, unlockKey2, navigate, toast]);

  // ── Go to preview ──
  const goToPreview = useCallback(async () => {
    if (!gratitudeText.trim()) {
      toast({
        title: "Write something!",
        description: "Share what you're grateful for today.",
        variant: "destructive",
      });
      return;
    }
    await captureStory();
    setStep("preview");
  }, [gratitudeText, captureStory, toast]);

  // ── Loading state ──
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  // ── Not authenticated ──
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-md"
        >
          <h1 className="text-2xl font-black mb-4">Join the Challenge First</h1>
          <p className="text-muted-foreground mb-6">
            Start the 3-Day Gratitude Challenge to unlock story sharing.
          </p>
          <Button
            onClick={() => navigate("/challenge")}
            className="w-full min-h-[56px] text-lg font-black bg-primary hover:bg-primary/90 rounded-xl"
          >
            Start Challenge
            <ChevronRight className="w-5 h-5 ml-1" />
          </Button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      <div className="max-w-2xl mx-auto py-8 px-4">
        {/* ── Header ── */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3 mb-6"
        >
          <button
            onClick={() =>
              step === "compose" ? navigate("/challenge") : setStep("compose")
            }
            className="p-2 rounded-xl hover:bg-card transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-xl font-black">
              {step === "shared" ? "Key 2 Unlocked! 🔑" : "Share Your Story"}
            </h1>
            <p className="text-xs text-muted-foreground">
              {key2Done
                ? "You already unlocked Key 2!"
                : step === "shared"
                ? "+150 Blessed Credits earned"
                : "Key 2 · Share your gratitude story"}
            </p>
          </div>
        </motion.div>

        <AnimatePresence mode="wait">
          {/* ═══════════════════════════════════════════ */}
          {/* STEP 1: COMPOSE                            */}
          {/* ═══════════════════════════════════════════ */}
          {step === "compose" && (
            <motion.div
              key="compose"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="space-y-5"
            >
              {/* Theme selector */}
              <div className="bg-card border border-border/50 rounded-2xl p-4 shadow-soft">
                <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">
                  Choose a vibe
                </p>
                <div className="flex gap-2 overflow-x-auto pb-1">
                  {STORY_THEMES.map((t) => (
                    <button
                      key={t.id}
                      onClick={() => setSelectedTheme(t.id)}
                      className={`flex-shrink-0 px-4 py-2 rounded-xl text-xs font-bold transition-all bg-gradient-to-br ${t.bg} ${
                        selectedTheme === t.id
                          ? "ring-2 ring-primary ring-offset-2 ring-offset-background scale-105"
                          : "opacity-60 hover:opacity-80"
                      }`}
                    >
                      <span className="text-white">{t.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Name input */}
              <div className="bg-card border border-border/50 rounded-2xl p-4 shadow-soft">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2 block">
                  Your name (shown on story)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Sarah M."
                  value={userName}
                  onChange={(e) => setUserName(e.target.value.slice(0, 30))}
                  className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              {/* Gratitude text */}
              <div className="bg-card border border-border/50 rounded-2xl p-4 shadow-soft">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2 block">
                  What are you grateful for today?
                </label>
                <textarea
                  placeholder="Today I'm grateful for..."
                  value={gratitudeText}
                  onChange={(e) => setGratitudeText(e.target.value.slice(0, 280))}
                  rows={4}
                  className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <p className="text-xs text-muted-foreground mt-1 text-right">
                  {gratitudeText.length}/280
                </p>
              </div>

              {/* ── STORY CANVAS (1080×1920 ratio) ── */}
              <div className="bg-card border border-border/50 rounded-2xl p-4 shadow-soft">
                <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">
                  <ImageIcon className="w-3 h-3 inline mr-1" />
                  Story preview
                </p>
                <div className="relative mx-auto" style={{ maxWidth: 320 }}>
                  <div
                    ref={storyRef}
                    className={`relative w-full bg-gradient-to-br ${theme.bg} rounded-2xl overflow-hidden`}
                    style={{ aspectRatio: "9/16" }}
                  >
                    {/* Inner content */}
                    <div className="absolute inset-0 flex flex-col items-center justify-between p-6 text-white">
                      {/* Top - branding */}
                      <div className="text-center pt-4">
                        <img
                          src={logoImg}
                          alt="IamBlessedAF"
                          className="w-14 h-14 mx-auto mb-2 rounded-full"
                          crossOrigin="anonymous"
                        />
                        <p className="text-[10px] font-bold uppercase tracking-[0.2em] opacity-70">
                          3-Day Gratitude Challenge
                        </p>
                      </div>

                      {/* Center - gratitude message */}
                      <div className="flex-1 flex items-center justify-center px-2 w-full">
                        <div className={`text-center ${theme.border} border rounded-2xl p-5 bg-black/20 backdrop-blur-sm w-full`}>
                          <Sparkles className={`w-6 h-6 mx-auto mb-3 ${theme.accent}`} />
                          <p className="text-base md:text-lg font-medium leading-relaxed italic">
                            "{gratitudeText || "Today I'm grateful for..."}"
                          </p>
                          {userName && (
                            <p className={`mt-3 text-sm font-bold ${theme.accent}`}>
                              — {userName}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Bottom - CTA */}
                      <div className="text-center pb-4">
                        <div className="bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 inline-block">
                          <p className="text-[10px] font-bold">
                            🙏 Join me → iamblessedaf.com/challenge
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* CTA */}
              <Button
                onClick={goToPreview}
                disabled={!gratitudeText.trim() || capturing}
                className="w-full min-h-[56px] h-auto text-base md:text-lg font-black bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl gap-2"
              >
                {capturing ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Share2 className="w-5 h-5" />
                )}
                {capturing ? "Generating..." : "Continue to Share"}
              </Button>
            </motion.div>
          )}

          {/* ═══════════════════════════════════════════ */}
          {/* STEP 2: PREVIEW + SHARE                    */}
          {/* ═══════════════════════════════════════════ */}
          {step === "preview" && (
            <motion.div
              key="preview"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-5"
            >
              {/* Captured image preview */}
              {capturedImage && (
                <div className="bg-card border border-border/50 rounded-2xl p-4 shadow-soft">
                  <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">
                    Your story is ready!
                  </p>
                  <div className="mx-auto" style={{ maxWidth: 280 }}>
                    <img
                      src={capturedImage}
                      alt="Your gratitude story"
                      className="w-full rounded-xl shadow-lg"
                    />
                  </div>
                </div>
              )}

              {/* Instructions card */}
              <div className="bg-card border border-border/50 rounded-2xl p-5 shadow-soft space-y-3">
                <p className="text-sm font-bold">How to unlock Key 2:</p>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <div className="flex gap-2">
                    <span className="text-primary font-bold">1.</span>
                    <span>Download or copy your story image</span>
                  </div>
                  <div className="flex gap-2">
                    <span className="text-primary font-bold">2.</span>
                    <span>Share it on WhatsApp, Instagram Stories, or any social</span>
                  </div>
                  <div className="flex gap-2">
                    <span className="text-primary font-bold">3.</span>
                    <span>Come back and tap "I Shared It!" below</span>
                  </div>
                </div>
              </div>

              {/* Action buttons */}
              <div className="grid grid-cols-2 gap-3">
                <Button
                  onClick={downloadImage}
                  variant="outline"
                  className="min-h-[48px] rounded-xl font-bold gap-2"
                >
                  <Download className="w-4 h-4" />
                  Save Image
                </Button>
                <Button
                  onClick={copyImage}
                  variant="outline"
                  className="min-h-[48px] rounded-xl font-bold gap-2"
                >
                  <Copy className="w-4 h-4" />
                  Copy Image
                </Button>
              </div>

              {/* WhatsApp share */}
              <Button
                onClick={shareWhatsApp}
                className="w-full min-h-[56px] h-auto text-base font-black bg-green-600 hover:bg-green-700 text-white rounded-xl gap-2"
              >
                <MessageCircle className="w-5 h-5" />
                Share on WhatsApp
              </Button>

              {/* Confirm share → unlock key 2 */}
              <Button
                onClick={confirmShare}
                disabled={sharing}
                className="w-full min-h-[56px] h-auto text-base md:text-lg font-black bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl gap-2"
              >
                {sharing ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <CheckCircle2 className="w-5 h-5" />
                )}
                {sharing
                  ? "Verifying..."
                  : key2Done
                  ? "Already Unlocked! → Keys"
                  : "I Shared It! Unlock Key 2 🔑"}
              </Button>
            </motion.div>
          )}

          {/* ═══════════════════════════════════════════ */}
          {/* STEP 3: SUCCESS                            */}
          {/* ═══════════════════════════════════════════ */}
          {step === "shared" && (
            <motion.div
              key="shared"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center space-y-6 py-8"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", delay: 0.2 }}
                className="w-24 h-24 mx-auto bg-primary/20 rounded-full flex items-center justify-center"
              >
                <CheckCircle2 className="w-12 h-12 text-primary" />
              </motion.div>

              <div>
                <h2 className="text-2xl font-black mb-2">Key 2 Unlocked! 🔑</h2>
                <p className="text-muted-foreground">
                  +150 Blessed Credits earned. Your story is spreading gratitude!
                </p>
              </div>

              <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-full px-5 py-3">
                <Sparkles className="w-4 h-4 text-primary" />
                <span className="text-sm font-bold">
                  {key2Done ? "3 of 4 keys" : "2 of 4 keys"} complete
                </span>
              </div>

              <div className="space-y-3 pt-2">
                <Button
                  onClick={() => navigate("/challenge/invite")}
                  className="w-full min-h-[56px] h-auto text-base md:text-lg font-black bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl gap-2"
                >
                  Unlock Key 3 → Invite Friends
                  <ChevronRight className="w-5 h-5" />
                </Button>
                <Button
                  onClick={() => navigate("/keys")}
                  variant="outline"
                  className="w-full min-h-[48px] rounded-xl font-bold"
                >
                  View All Keys
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
