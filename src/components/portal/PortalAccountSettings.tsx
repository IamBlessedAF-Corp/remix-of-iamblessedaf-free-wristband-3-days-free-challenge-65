import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  User, Mail, Shield, Hash, Save, Loader2, Check,
  Briefcase, Home, Users, Target, Scissors, Video, Share2, Heart, Brain, UserPlus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const ROLE_OPTIONS = [
  { id: "expert", label: "Expert / Coach", icon: Briefcase },
  { id: "realtor", label: "Real Estate Agent", icon: Home },
  { id: "network-marketer", label: "Network Marketer", icon: Users },
  { id: "affiliate-marketer", label: "Affiliate Marketer", icon: Target },
  { id: "clipper", label: "Content Clipper", icon: Scissors },
  { id: "influencer", label: "Influencer / Creator", icon: Video },
  { id: "podcast-host", label: "Podcast Host", icon: Share2 },
  { id: "gym-owner", label: "Gym Owner", icon: Heart },
  { id: "health-coach", label: "Health Coach", icon: Brain },
  { id: "other", label: "Other", icon: UserPlus },
];

interface PortalAccountSettingsProps {
  userId: string;
  userEmail: string;
  profile: any;
}

export default function PortalAccountSettings({ userId, userEmail, profile }: PortalAccountSettingsProps) {
  const [displayName, setDisplayName] = useState(profile?.display_name || "");
  const [referralCode, setReferralCode] = useState(profile?.referral_code?.startsWith("pending-") ? "" : (profile?.referral_code || ""));
  const [referredByCode, setReferredByCode] = useState(profile?.referred_by_code || "");
  const [tiktok, setTiktok] = useState(profile?.tiktok_handle || "");
  const [instagram, setInstagram] = useState(profile?.instagram_handle || "");
  const [twitter, setTwitter] = useState(profile?.twitter_handle || "");
  const [selectedRole, setSelectedRole] = useState<string>(() => {
    // Try to load from localStorage
    return localStorage.getItem("affiliate-role") || "other";
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const [referrerValid, setReferrerValid] = useState<boolean | null>(null);

  // Validate referred-by code on blur
  const validateReferrer = async (code: string) => {
    if (!code.trim()) { setReferrerValid(null); return; }
    const { data } = await supabase
      .from("creator_profiles")
      .select("id")
      .eq("referral_code", code.trim().toLowerCase())
      .maybeSingle();
    setReferrerValid(!!data);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const from = (table: string) => supabase.from(table as any);
      const code = referralCode.trim().toLowerCase();
      if (!code) {
        toast.error("Referral code is required.");
        setSaving(false);
        return;
      }
      // Check uniqueness
      const { data: existing } = await (from("creator_profiles") as any)
        .select("id")
        .eq("referral_code", code)
        .neq("user_id", userId)
        .maybeSingle();
      if (existing) {
        toast.error("That referral code is already taken. Try another one.");
        setSaving(false);
        return;
      }

      // Validate referred_by_code if provided
      const refBy = referredByCode.trim().toLowerCase();
      if (refBy) {
        if (refBy === code) {
          toast.error("You can't refer yourself!");
          setSaving(false);
          return;
        }
        const { data: refExists } = await (from("creator_profiles") as any)
          .select("id")
          .eq("referral_code", refBy)
          .maybeSingle();
        if (!refExists) {
          toast.error("The referrer code doesn't exist. Check the code and try again.");
          setSaving(false);
          return;
        }
      }

      await (from("creator_profiles") as any)
        .update({
          display_name: displayName,
          referral_code: code,
          referred_by_code: refBy || null,
          tiktok_handle: tiktok || null,
          instagram_handle: instagram || null,
          twitter_handle: twitter || null,
        })
        .eq("user_id", userId);

      localStorage.setItem("affiliate-role", selectedRole);
      setSaved(true);
      toast.success("Profile updated!");
      setTimeout(() => setSaved(false), 2000);
    } catch {
      toast.error("Failed to save. Try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-lg">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <h2 className="text-xl font-bold text-foreground mb-1">Account Settings</h2>
        <p className="text-sm text-muted-foreground">Manage your profile, role, and login details.</p>
      </motion.div>

      {/* Login Info (read-only) */}
      <div className="bg-card border border-border/40 rounded-xl p-4 space-y-3">
        <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
          <Shield className="w-4 h-4 text-primary" /> Login Information
        </h3>
        <div className="space-y-2">
          <div>
            <Label className="text-xs text-muted-foreground">Email</Label>
            <div className="flex items-center gap-2 mt-1">
              <Mail className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm text-foreground">{userEmail}</span>
              <Badge variant="outline" className="text-[9px] ml-auto">Verified</Badge>
            </div>
          </div>
          <div>
            <Label htmlFor="referredBy" className="text-xs text-muted-foreground">Referred By (optional)</Label>
            <div className="flex items-center gap-2 mt-1">
              <UserPlus className="w-4 h-4 text-muted-foreground" />
              <Input
                id="referredBy"
                value={referredByCode}
                onChange={(e) => setReferredByCode(e.target.value.replace(/[^a-zA-Z0-9-_]/g, ""))}
                onBlur={(e) => validateReferrer(e.target.value)}
                placeholder="friend-code"
                className="font-mono"
                disabled={!!profile?.referred_by_code}
              />
              {referrerValid === true && <Check className="w-4 h-4 text-primary" />}
              {referrerValid === false && <span className="text-[10px] text-destructive">Not found</span>}
            </div>
            {profile?.referred_by_code && (
              <p className="text-[10px] text-muted-foreground mt-1">Referrer already set and locked.</p>
            )}
          </div>
          <div>
            <Label htmlFor="referralCode" className="text-xs text-muted-foreground">Referral Code</Label>
            <div className="flex items-center gap-2 mt-1">
              <Hash className="w-4 h-4 text-muted-foreground" />
              <Input
                id="referralCode"
                value={referralCode}
                onChange={(e) => setReferralCode(e.target.value.replace(/[^a-zA-Z0-9-_]/g, ""))}
                placeholder="your-unique-code"
                className="font-mono text-primary"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Profile Info */}
      <div className="bg-card border border-border/40 rounded-xl p-4 space-y-4">
        <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
          <User className="w-4 h-4 text-primary" /> Profile
        </h3>

        <div className="space-y-3">
          <div>
            <Label htmlFor="displayName" className="text-xs text-muted-foreground">Display Name</Label>
            <Input
              id="displayName"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Your name"
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="tiktok" className="text-xs text-muted-foreground">TikTok Handle</Label>
            <Input
              id="tiktok"
              value={tiktok}
              onChange={(e) => setTiktok(e.target.value)}
              placeholder="@yourhandle"
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="instagram" className="text-xs text-muted-foreground">Instagram Handle</Label>
            <Input
              id="instagram"
              value={instagram}
              onChange={(e) => setInstagram(e.target.value)}
              placeholder="@yourhandle"
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="twitter" className="text-xs text-muted-foreground">X / Twitter Handle</Label>
            <Input
              id="twitter"
              value={twitter}
              onChange={(e) => setTwitter(e.target.value)}
              placeholder="@yourhandle"
              className="mt-1"
            />
          </div>
        </div>
      </div>

      {/* Affiliate Role */}
      <div className="bg-card border border-border/40 rounded-xl p-4 space-y-3">
        <h3 className="text-sm font-bold text-foreground">Your Affiliate Role</h3>
        <p className="text-xs text-muted-foreground">This affects the funnel and tools optimized for you.</p>
        <div className="grid grid-cols-2 gap-2">
          {ROLE_OPTIONS.map((role) => (
            <button
              key={role.id}
              onClick={() => setSelectedRole(role.id)}
              className={`flex items-center gap-2 px-3 py-2.5 rounded-lg border text-left transition-all text-xs ${
                selectedRole === role.id
                  ? "border-primary bg-primary/5 text-primary font-semibold"
                  : "border-border/40 text-muted-foreground hover:border-primary/30"
              }`}
            >
              <role.icon className="w-4 h-4 shrink-0" />
              {role.label}
            </button>
          ))}
        </div>
      </div>

      {/* Save button */}
      <Button
        onClick={handleSave}
        disabled={saving}
        className="w-full h-11 bg-primary hover:bg-primary/90 text-primary-foreground font-bold rounded-xl gap-2"
      >
        {saving ? (
          <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</>
        ) : saved ? (
          <><Check className="w-4 h-4" /> Saved!</>
        ) : (
          <><Save className="w-4 h-4" /> Save Changes</>
        )}
      </Button>
    </div>
  );
}
