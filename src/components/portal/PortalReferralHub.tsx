import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import { Copy, Check, Share2, MessageCircle, Link2, Users, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import type { PortalProfile, BlessingRow } from "@/hooks/usePortalData";

interface Props {
  profile: PortalProfile;
  blessings: BlessingRow[];
}

export default function PortalReferralHub({ profile, blessings }: Props) {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);

  const referralUrl = `${window.location.origin}/r/${profile.referral_code}`;
  const confirmed = blessings.filter((b) => b.confirmed_at).length;
  const pending = blessings.filter((b) => !b.confirmed_at).length;
  const conversionRate = blessings.length > 0 ? Math.round((confirmed / blessings.length) * 100) : 0;

  const copyLink = useCallback(() => {
    navigator.clipboard.writeText(referralUrl);
    setCopied(true);
    toast({ title: "Link copied! 🔗", description: "Share it with your friends" });
    window.dispatchEvent(new CustomEvent("track", { detail: { event: "referral_link_copied" } }));
    setTimeout(() => setCopied(false), 2000);
  }, [referralUrl, toast]);

  const shareViaSMS = () => {
    const msg = encodeURIComponent(
      `Hey! I just blessed you with a FREE gift 🎁 Check it out: ${referralUrl}`
    );
    window.open(`sms:?body=${msg}`, "_blank");
    window.dispatchEvent(new CustomEvent("track", { detail: { event: "share_sms_clicked" } }));
  };

  const shareViaWhatsApp = () => {
    const msg = encodeURIComponent(
      `Hey! I just blessed you with a FREE gift 🎁 Check it out: ${referralUrl}`
    );
    window.open(`https://wa.me/?text=${msg}`, "_blank");
    window.dispatchEvent(new CustomEvent("track", { detail: { event: "share_whatsapp_clicked" } }));
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
        <Share2 className="w-5 h-5 text-primary" />
        Referral Hub
      </h2>

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

        <div className="flex gap-2">
          <Button onClick={shareViaSMS} variant="outline" className="flex-1 h-11 gap-2">
            <MessageCircle className="w-4 h-4" />
            SMS
          </Button>
          <Button onClick={shareViaWhatsApp} className="flex-1 h-11 gap-2 bg-[hsl(142_70%_40%)] hover:bg-[hsl(142_70%_35%)] text-white">
            <MessageCircle className="w-4 h-4" />
            WhatsApp
          </Button>
          <Button onClick={copyLink} variant="outline" className="flex-1 h-11 gap-2">
            <Link2 className="w-4 h-4" />
            Copy
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

      {/* Referral tip */}
      <div className="bg-accent/50 border border-primary/20 rounded-xl p-4 space-y-2">
        <p className="text-sm font-bold text-foreground flex items-center gap-1.5">
          <Zap className="w-4 h-4 text-primary" />
          Pro Tip: Maximize Your Conversions
        </p>
        <ul className="text-xs text-muted-foreground space-y-1 ml-6 list-disc">
          <li>Send a <strong>personal text</strong> instead of mass messages — 3x higher conversion</li>
          <li>Mention the <strong>FREE wristband gift</strong> in your message</li>
          <li>Share at <strong>8-9 PM local time</strong> for peak engagement</li>
          <li>Follow up if they haven't confirmed within 24 hours</li>
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
    </div>
  );
}
