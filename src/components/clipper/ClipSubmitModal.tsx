import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Upload, Loader2, CheckCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string;
  onSubmitted: () => void;
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

const ClipSubmitModal = ({ open, onOpenChange, userId, onSubmitted }: Props) => {
  const [clipUrl, setClipUrl] = useState("");
  const [platform, setPlatform] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const { toast } = useToast();

  const isValidUrl = (url: string) => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
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

    // Optional: warn if URL doesn't match selected platform
    const expectedPattern = URL_PATTERNS[platform];
    if (expectedPattern && !expectedPattern.test(trimmedUrl)) {
      toast({ title: "URL mismatch", description: `This doesn't look like a ${platform} link. Please double-check.`, variant: "destructive" });
      return;
    }

    setSubmitting(true);
    try {
      const { error } = await supabase.from("clip_submissions").insert({
        user_id: userId,
        clip_url: trimmedUrl,
        platform,
        status: "pending",
        view_count: 0,
        earnings_cents: 0,
      });

      if (error) throw error;

      setSubmitted(true);
      onSubmitted();

      setTimeout(() => {
        setClipUrl("");
        setPlatform("");
        setSubmitted(false);
        onOpenChange(false);
      }, 1800);
    } catch (err: any) {
      toast({ title: "Submission failed", description: err?.message || "Please try again.", variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = (val: boolean) => {
    if (!submitting) {
      setClipUrl("");
      setPlatform("");
      setSubmitted(false);
      onOpenChange(val);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-[360px] rounded-2xl">
        <DialogHeader>
          <DialogTitle className="text-lg">Submit a Clip</DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            Paste the link to your posted clip. We'll verify views and update your earnings within 24h.
          </DialogDescription>
        </DialogHeader>

        {submitted ? (
          <div className="text-center py-6 space-y-3">
            <CheckCircle className="w-10 h-10 text-primary mx-auto" />
            <p className="font-bold text-foreground">Clip submitted! 🎉</p>
            <p className="text-sm text-muted-foreground">We'll verify it within 24 hours.</p>
          </div>
        ) : (
          <div className="space-y-4 pt-2">
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

            <div className="space-y-2">
              <Label htmlFor="clip-url" className="text-sm font-medium">Clip URL</Label>
              <Input
                id="clip-url"
                type="url"
                placeholder="https://www.tiktok.com/@you/video/..."
                value={clipUrl}
                onChange={(e) => setClipUrl(e.target.value)}
                maxLength={2048}
                autoComplete="off"
              />
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
              {submitting ? "Submitting..." : "Submit Clip"}
            </Button>

            <p className="text-[11px] text-muted-foreground text-center">
              Minimum $2.22 guaranteed per verified clip
            </p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ClipSubmitModal;
