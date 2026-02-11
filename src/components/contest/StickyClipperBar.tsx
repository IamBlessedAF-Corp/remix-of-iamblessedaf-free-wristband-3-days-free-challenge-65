import { motion } from "framer-motion";
import { ArrowRight, Link2, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect, useState, useRef } from "react";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import confetti from "canvas-confetti";

interface StickyClipperBarProps {
  onJoin: () => void;
}

const StickyClipperBar = ({ onJoin }: StickyClipperBarProps) => {
  const [visible, setVisible] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);
  const { user } = useAuth();
  const hasCopiedBefore = useRef(false);

  useEffect(() => {
    const handleScroll = () => {
      setVisible(window.scrollY > 500);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleCopyReferralLink = async () => {
    const referralBase = "https://iamblessedaf.com/r/";
    try {
      const { supabase } = await import("@/integrations/supabase/client");
      const { data } = await supabase
        .from("creator_profiles")
        .select("referral_code")
        .eq("user_id", user?.id || "")
        .maybeSingle();

      if (data?.referral_code) {
        await navigator.clipboard.writeText(`${referralBase}${data.referral_code}`);
        setLinkCopied(true);
        if (!hasCopiedBefore.current) {
          hasCopiedBefore.current = true;
          confetti({ particleCount: 80, spread: 60, origin: { y: 0.9 } });
          toast.success("🎉 Referral link copied! Paste it in your TikTok/IG bio → viewers click → you earn!");
        } else {
          toast.success("Referral link copied!");
        }
        setTimeout(() => setLinkCopied(false), 3000);
        return;
      }
    } catch {}
    await navigator.clipboard.writeText("https://iamblessedaf.com/challenge");
    setLinkCopied(true);
    toast.success("Link copied!");
    setTimeout(() => setLinkCopied(false), 3000);
  };

  if (!visible) return null;

  return (
    <motion.div
      className="fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-md border-t border-border/60 px-4 py-3 safe-bottom"
      initial={{ y: 80 }}
      animate={{ y: 0 }}
      exit={{ y: 80 }}
      transition={{ type: "spring", damping: 25, stiffness: 300 }}
    >
      <div className="max-w-lg mx-auto flex items-center gap-3">
        {user ? (
          <>
            <Button
              onClick={handleCopyReferralLink}
              variant="outline"
              className="h-12 px-4 text-xs font-bold rounded-xl gap-1.5 border-primary/40 flex-shrink-0"
            >
              {linkCopied ? <Check className="w-4 h-4" /> : <Link2 className="w-4 h-4" />}
              {linkCopied ? "Copied!" : "Copy Link"}
            </Button>
            <Button
              asChild
              className="flex-1 h-12 text-sm font-bold bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl btn-glow"
            >
              <a href="/clipper-dashboard">
                Open Dashboard
                <ArrowRight className="w-4 h-4 ml-1" />
              </a>
            </Button>
          </>
        ) : (
          <>
            <div className="flex-shrink-0">
              <p className="text-sm font-bold text-foreground">$2.22–$1,111</p>
              <p className="text-xs text-primary font-semibold">Per Clip</p>
            </div>
            <Button
              onClick={onJoin}
              className="flex-1 h-12 text-sm font-bold bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl btn-glow animate-pulse-glow"
            >
              Start Clipping → Get Paid
              <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </>
        )}
      </div>
    </motion.div>
  );
};

export default StickyClipperBar;
