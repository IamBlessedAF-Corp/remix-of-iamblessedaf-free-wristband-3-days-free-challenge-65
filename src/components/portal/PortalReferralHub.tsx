import { useState, useCallback, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Copy, Check, Share2, MessageCircle, Link2, Users, Zap,
  Coins, Gift, ExternalLink, Video
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useShortLinks } from "@/hooks/useShortLinks";
import GiftSmsDialog from "@/components/offer/GiftSmsDialog";
import type { PortalProfile, BlessingRow } from "@/hooks/usePortalData";

interface Props {
  profile: PortalProfile;
  blessings: BlessingRow[];
}

export default function PortalReferralHub({ profile, blessings }: Props) {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);
  const [smsOpen, setSmsOpen] = useState(false);
  const { getShareUrl } = useShortLinks();
  const [shortReferralUrl, setShortReferralUrl] = useState("");

  const rawReferralUrl = `https://iamblessedaf.com/r/${profile.referral_code}`;

  useEffect(() => {
    getShareUrl(rawReferralUrl, "portal-referral", "/portal").then(setShortReferralUrl);
  }, [rawReferralUrl, getShareUrl]);

  const referralUrl = shortReferralUrl || rawReferralUrl;
  const confirmed = blessings.filter((b) => b.confirmed_at).length;
  const pending = blessings.filter((b) => !b.confirmed_at).length;
  const conversionRate = blessings.length > 0 ? Math.round((confirmed / blessings.length) * 100) : 0;

  const copyLink = useCallback(() => {
    navigator.clipboard.writeText(referralUrl);
    setCopied(true);
    toast({ title: "Link copied! +5 BC 🪙", description: "Share it with your friends" });
    setTimeout(() => setCopied(false), 2000);
  }, [referralUrl, toast]);

  const shareViaSMS = () => {
    const msg = encodeURIComponent(
      `Hey! I just gifted you a FREE "I Am Blessed AF" wristband 🎁 Claim it here: ${referralUrl}`
    );
    window.open(`sms:?body=${msg}`, "_blank");
  };

  const shareViaWhatsApp = () => {
    const msg = encodeURIComponent(
      `Hey! I'm gifting you a FREE "I Am Blessed AF" wristband 🎁 Each one feeds 11 people 🍽️ Claim yours: ${referralUrl}`
    );
    window.open(`https://wa.me/?text=${msg}`, "_blank");
  };

  const shareViaTwitter = () => {
    const text = encodeURIComponent(
      `🎁 I'm gifting FREE "I Am Blessed AF" wristbands — each one feeds 11 people 🍽️ Claim yours:`
    );
    window.open(`https://twitter.com/intent/tweet?text=${text}&url=${encodeURIComponent(referralUrl)}`, "_blank");
  };

  const shareViaFacebook = () => {
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(referralUrl)}`, "_blank");
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
        <Share2 className="w-5 h-5 text-primary" />
        Referral Hub
      </h2>

      {/* Incentive Banner */}
      <div className="bg-primary/5 border border-primary/20 rounded-xl p-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
            <Gift className="w-5 h-5 text-primary" />
          </div>
          <div>
            <p className="text-sm font-bold text-foreground">
              Every friend you bless = <span className="text-primary">50 BC + 11 meals donated</span>
            </p>
            <p className="text-xs text-muted-foreground">
              They get a FREE wristband. You earn coins. Everyone wins 🙌
            </p>
          </div>
        </div>
      </div>

      {/* Referral link card */}
      <div className="bg-card border border-border/60 rounded-xl p-5 space-y-4">
        <div>
          <p className="text-sm font-semibold text-foreground mb-1">Your unique blessing link</p>
          <p className="text-xs text-muted-foreground">Share this link to bless friends & earn BC coins</p>
        </div>

        <div className="flex gap-2">
          <Input
            value={referralUrl}
            readOnly
            className="text-sm font-mono bg-secondary/50"
            onClick={copyLink}
          />
          <Button onClick={copyLink} variant="outline" className="shrink-0 px-4">
            {copied ? <Check className="w-4 h-4 text-primary" /> : <Copy className="w-4 h-4" />}
          </Button>
        </div>

        {/* Sharing buttons — aggressive grid */}
        <div className="grid grid-cols-2 gap-2">
          <Button
            onClick={shareViaWhatsApp}
            className="h-11 gap-2 bg-[hsl(142_70%_40%)] hover:bg-[hsl(142_70%_35%)] text-[hsl(0_0%_100%)] font-bold"
          >
            <MessageCircle className="w-4 h-4" />
            WhatsApp
            <span className="text-[10px] opacity-80">+15 BC</span>
          </Button>
          <Button
            onClick={() => setSmsOpen(true)}
            className="h-11 gap-2 bg-primary hover:bg-primary/90 text-primary-foreground font-bold"
          >
            <Gift className="w-4 h-4" />
            Send Gift SMS
            <span className="text-[10px] opacity-80">+15 BC</span>
          </Button>
          <Button onClick={shareViaSMS} variant="outline" className="h-11 gap-2 font-bold">
            <MessageCircle className="w-4 h-4" />
            Native SMS
            <span className="text-[10px] text-primary">+5 BC</span>
          </Button>
          <Button onClick={copyLink} variant="outline" className="h-11 gap-2 font-bold">
            <Link2 className="w-4 h-4" />
            Copy Link
            <span className="text-[10px] text-primary">+5 BC</span>
          </Button>
          <Button onClick={shareViaTwitter} variant="outline" className="h-11 gap-2 font-bold">
            <ExternalLink className="w-4 h-4" />
            Post on X
            <span className="text-[10px] text-primary">+30 BC</span>
          </Button>
          <Button onClick={shareViaFacebook} variant="outline" className="h-11 gap-2 font-bold">
            <ExternalLink className="w-4 h-4" />
            Facebook
            <span className="text-[10px] text-primary">+30 BC</span>
          </Button>
        </div>
      </div>

      {/* Referral Stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-card border border-border/60 rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-foreground">{blessings.length}</p>
          <p className="text-xs text-muted-foreground mt-1">Total Sent</p>
        </div>
        <div className="bg-card border border-border/60 rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-primary">{confirmed}</p>
          <p className="text-xs text-muted-foreground mt-1">Confirmed</p>
        </div>
        <div className="bg-card border border-border/60 rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-foreground">{conversionRate}%</p>
          <p className="text-xs text-muted-foreground mt-1">Conversion</p>
        </div>
      </div>

      {/* Milestone rewards */}
      <div className="bg-card border border-border/60 rounded-xl p-5">
        <h3 className="text-sm font-bold text-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
          <Zap className="w-4 h-4 text-primary" />
          Referral Milestones
        </h3>
        <div className="space-y-2">
          {[
            { count: 5, reward: 250, label: "Bless 5 friends" },
            { count: 10, reward: 500, label: "Bless 10 friends" },
            { count: 25, reward: 1500, label: "Bless 25 friends" },
            { count: 50, reward: 3000, label: "Bless 50 friends" },
            { count: 100, reward: 10000, label: "Bless 100 friends" },
          ].map((m) => {
            const hit = confirmed >= m.count;
            return (
              <div key={m.count} className={`flex items-center gap-3 p-2.5 rounded-lg ${hit ? "bg-primary/5" : ""}`}>
                <span className={`text-sm ${hit ? "" : "grayscale opacity-50"}`}>
                  {hit ? "✅" : "🎯"}
                </span>
                <span className={`text-sm flex-1 ${hit ? "text-primary font-semibold" : "text-foreground"}`}>
                  {m.label}
                </span>
                <div className="flex items-center gap-1 text-xs font-bold text-primary">
                  <Coins className="w-3 h-3" />
                  +{m.reward.toLocaleString()} BC
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Pro tips */}
      <div className="bg-accent/50 border border-primary/20 rounded-xl p-4 space-y-2">
        <p className="text-sm font-bold text-foreground flex items-center gap-1.5">
          <Zap className="w-4 h-4 text-primary" />
          Pro Tips: Maximize Conversions
        </p>
        <ul className="text-xs text-muted-foreground space-y-1.5 ml-6 list-disc">
          <li>Send a <strong className="text-foreground">personal text</strong> instead of mass messages — 3x higher conversion</li>
          <li>Mention the <strong className="text-foreground">FREE wristband gift</strong> in your message</li>
          <li>Share at <strong className="text-foreground">8–9 PM local time</strong> for peak engagement</li>
          <li>Post a <strong className="text-foreground">video/story</strong> showing your wristband — <span className="text-primary font-bold">+60 BC bonus</span></li>
          <li>Tag <strong className="text-foreground">@iamblessedaf</strong> on any platform for <span className="text-primary font-bold">verified creator badge</span></li>
        </ul>
      </div>

      {/* Blessing list */}
      <div className="bg-card border border-border/60 rounded-xl p-5">
        <h3 className="text-sm font-bold text-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
          <Users className="w-4 h-4 text-primary" />
          Blessing History
        </h3>
        {blessings.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-6">
            No blessings sent yet. Share your link to get started! 🚀
          </p>
        ) : (
          <div className="space-y-2 max-h-72 overflow-y-auto">
            {blessings.map((b) => (
              <div key={b.id} className="flex items-center justify-between py-2.5 border-b border-border/20 last:border-0">
                <div>
                  <p className="text-sm font-medium text-foreground">
                    {b.recipient_name || "Anonymous"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(b.created_at).toLocaleDateString()}
                  </p>
                </div>
                <span
                  className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                    b.confirmed_at
                      ? "bg-primary/10 text-primary"
                      : "bg-secondary text-muted-foreground"
                  }`}
                >
                  {b.confirmed_at ? "✅ Confirmed" : "⏳ Pending"}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      <GiftSmsDialog
        open={smsOpen}
        onOpenChange={setSmsOpen}
        shortUrl={referralUrl}
        sourcePage="/portal"
        onSuccess={() => toast({ title: "+15 BC earned! 🪙" })}
      />
    </div>
  );
}
