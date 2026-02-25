import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Upload, Loader2, CheckCircle, AlertTriangle, Hash, XCircle, ShieldCheck, Eye } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string;
  onSubmitted: () => void;
  referralCode?: string | null;
}

const PLATFORMS = [
  { value: "tiktok", label: "TikTok" },
  { value: "instagram", label: "Instagram Reels" },
  { value: "youtube", label: "YouTube Shorts" },
  { value: "other", label: "Other" },
];

const URL_PATTERNS: Record<string, RegExp> = {
  tiktok: /tiktok\.com/i,
  instagram: /instagram\.com/i,
  youtube: /youtu(be\.com|\.be)/i,
};

interface VerificationResult {
  verified: boolean;
  reason?: string;
  message: string;
  checks?: {
    video_exists: boolean;
    is_public: boolean;
    has_campaign_hashtag: boolean;
    has_ownership_code: boolean;
  };
  view_count?: number;
}

const ClipSubmitModal = ({ open, onOpenChange, userId, onSubmitted, referralCode: referralCodeProp }: Props) => {
  const [clipUrl, setClipUrl] = useState("");
  const [platform, setPlatform] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<VerificationResult | null>(null);
  const [fetchedCode, setFetchedCode] = useState<string | null>(null);
  const { toast } = useToast();

  // Fallback: fetch referral code if prop not provided
  useEffect(() => {
    if (referralCodeProp || !userId || !open) return;
    supabase
      .from("creator_profiles")
      .select("referral_code")
      .eq("user_id", userId)
      .maybeSingle()
      .then(({ data }) => {
        if (data?.referral_code) setFetchedCode(data.referral_code);
      });
  }, [referralCodeProp, userId, open]);

  const referralCode = referralCodeProp || fetchedCode;

  const isValidUrl = (url: string) => {
    try { new URL(url); return true; } catch { return false; }
  };

  const handleSubmit = async () => {
    const trimmedUrl = clipUrl.trim();

    if (!trimmedUrl || !platform) {
      toast({ title: "Missing info", description: "Please enter a clip URL and select a platform.", variant: "destructive" });
      return;
    }
    if (!isValidUrl(trimmedUrl)) {
      toast({ title: "Invalid URL", description: "Please paste a valid link to your clip.", variant: "destructive" });
      return;
    }
    if (trimmedUrl.length > 2048) {
      toast({ title: "URL too long", description: "Please use a shorter URL.", variant: "destructive" });
      return;
    }

    const expectedPattern = URL_PATTERNS[platform];
    if (expectedPattern && !expectedPattern.test(trimmedUrl)) {
      toast({ title: "URL mismatch", description: `This doesn't look like a ${platform} link. Please double-check.`, variant: "destructive" });
      return;
    }

    setSubmitting(true);
    setResult(null);

    try {
      const { data, error } = await supabase.functions.invoke("verify-clip", {
        body: {
          clip_url: trimmedUrl,
          platform,
          referral_code: referralCode,
          user_id: userId,
        },
      });

      if (error) throw error;

      setResult(data as VerificationResult);
      onSubmitted();
    } catch (err: any) {
      toast({ title: "Verification failed", description: err?.message || "Please try again.", variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = (val: boolean) => {
    if (!submitting) {
      setClipUrl("");
      setPlatform("");
      setResult(null);
      setFetchedCode(null);
      onOpenChange(val);
    }
  };

  const codeSuffix = referralCode && referralCode.length > 10 ? referralCode.slice(10) : referralCode;
  const ownershipTag = codeSuffix ? `#IAMBLESSED_${codeSuffix}` : "#IAMBLESSED_YOURCODE";

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-[380px] rounded-2xl">
        <DialogHeader>
          <DialogTitle className="text-lg">Submit a Clip</DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            Paste your video link. YouTube clips are verified instantly via API.
          </DialogDescription>
        </DialogHeader>

        {result ? (
          <VerificationResultView result={result} ownershipTag={ownershipTag} onClose={() => handleClose(false)} />
        ) : (
          <div className="space-y-4 pt-2">
            {/* Platform */}
            <div className="space-y-2">
              <Label htmlFor="platform" className="text-sm font-medium">Platform</Label>
              <Select value={platform} onValueChange={setPlatform}>
                <SelectTrigger id="platform">
                  <SelectValue placeholder="Where did you post?" />
                </SelectTrigger>
                <SelectContent>
                  {PLATFORMS.map((p) => (
                    <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* URL */}
            <div className="space-y-2">
              <Label htmlFor="clip-url" className="text-sm font-medium">Clip URL</Label>
              <Input
                id="clip-url"
                type="url"
                placeholder="https://www.youtube.com/shorts/..."
                value={clipUrl}
                onChange={(e) => setClipUrl(e.target.value)}
                maxLength={2048}
                autoComplete="off"
              />
            </div>

            {/* Required tags info */}
            <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 space-y-2">
              <p className="text-xs font-semibold text-foreground">📋 Before you submit, make sure your video description includes:</p>
              <div className="flex flex-wrap gap-1.5">
                <span className="inline-flex items-center gap-0.5 bg-primary/15 text-primary text-[10px] font-bold px-2 py-0.5 rounded-full">
                  <Hash className="w-2.5 h-2.5" />3DayNeuroHackerChallenge
                </span>
                <span className="inline-flex items-center gap-0.5 bg-emerald-500/15 text-emerald-600 text-[10px] font-bold px-2 py-0.5 rounded-full">
                  <ShieldCheck className="w-2.5 h-2.5" />
                  {ownershipTag.replace("#", "")}
                </span>
              </div>
              <p className="text-[10px] text-muted-foreground">
                The ownership code proves you control the video. Without both tags, your clip stays "pending".
              </p>
            </div>

            <Button
              onClick={handleSubmit}
              disabled={submitting || !clipUrl.trim() || !platform}
              className="w-full h-12 font-bold rounded-xl"
            >
              {submitting ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : (
                <Upload className="w-4 h-4 mr-2" />
              )}
              {submitting ? "Verifying..." : "Submit & Verify"}
            </Button>

            <p className="text-[11px] text-muted-foreground text-center">
              YouTube clips are verified instantly • TikTok/IG verified within 24h
            </p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

/** Shows the verification result with check/fail icons */
function VerificationResultView({
  result,
  ownershipTag,
  onClose,
}: {
  result: VerificationResult;
  ownershipTag: string;
  onClose: () => void;
}) {
  const checks = result.checks;

  return (
    <div className="space-y-4 py-2">
      {/* Header */}
      <div className="text-center space-y-2">
        {result.verified ? (
          <CheckCircle className="w-12 h-12 text-emerald-500 mx-auto" />
        ) : result.reason === "manual_review" ? (
          <AlertTriangle className="w-12 h-12 text-amber-500 mx-auto" />
        ) : (
          <XCircle className="w-12 h-12 text-red-500 mx-auto" />
        )}
        <p className="font-bold text-foreground text-lg">
          {result.verified ? "Clip Verified! 🎉" : result.reason === "manual_review" ? "Submitted for Review" : "Verification Issues"}
        </p>
      </div>

      {/* Checks grid (YouTube only) */}
      {checks && (
        <div className="space-y-2 bg-secondary/30 rounded-xl p-3">
          <CheckRow label="Video exists" passed={checks.video_exists} />
          <CheckRow label="Video is public" passed={checks.is_public} />
          <CheckRow label="#3DayNeuroHackerChallenge" passed={checks.has_campaign_hashtag} />
          <CheckRow label={ownershipTag} passed={checks.has_ownership_code} />
        </div>
      )}

      {/* View count */}
      {result.view_count !== undefined && result.view_count > 0 && (
        <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
          <Eye className="w-4 h-4" />
          <span>Current views: <strong className="text-foreground">{result.view_count.toLocaleString()}</strong></span>
        </div>
      )}

      {/* Message */}
      <p className="text-sm text-muted-foreground text-center whitespace-pre-line">{result.message}</p>

      {result.verified && (
        <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-3 text-center space-y-1">
          <p className="text-sm font-bold text-emerald-500">📊 Views are being tracked!</p>
          <p className="text-[11px] text-muted-foreground">
            Submitted with {(result.view_count || 0).toLocaleString()} views. You'll earn <strong className="text-foreground">$2.22+</strong> once your clip gains 1,000 net views.
          </p>
        </div>
      )}

      <Button onClick={onClose} className="w-full rounded-xl">
        {result.verified ? "Done" : "Got it"}
      </Button>
    </div>
  );
}

function CheckRow({ label, passed }: { label: string; passed: boolean }) {
  return (
    <div className="flex items-center gap-2 text-sm">
      {passed ? (
        <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
      ) : (
        <XCircle className="w-4 h-4 text-red-500 shrink-0" />
      )}
      <span className={passed ? "text-foreground" : "text-red-400"}>{label}</span>
    </div>
  );
}

export default ClipSubmitModal;
