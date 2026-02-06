import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { CheckCircle, Copy, ExternalLink, Instagram, Video, Share2, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";

// Dynamic supabase import to handle env variable timing
let supabaseInstance: any = null;
const getSupabase = async () => {
  if (!supabaseInstance) {
    const { supabase } = await import("@/integrations/supabase/client");
    supabaseInstance = supabase;
  }
  return supabaseInstance;
};

interface CreatorProfile {
  referral_code: string;
  blessings_confirmed: number;
  display_name: string | null;
  instagram_handle: string | null;
}

export function CreatorNextSteps() {
  const [profile, setProfile] = useState<CreatorProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { user, signOut } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      fetchOrCreateProfile();
    }
  }, [user]);

  const fetchOrCreateProfile = async () => {
    if (!user) return;

    try {
      const supabase = await getSupabase();
      
      // Try to fetch existing profile
      const { data: existingProfile, error: fetchError } = await supabase
        .from("creator_profiles")
        .select("referral_code, blessings_confirmed, display_name, instagram_handle")
        .eq("user_id", user.id)
        .maybeSingle();

      if (existingProfile) {
        setProfile(existingProfile);
        setIsLoading(false);
        return;
      }

      // Create new profile with unique referral code
      const referralCode = generateReferralCode();
      const { data: newProfile, error: insertError } = await supabase
        .from("creator_profiles")
        .insert({
          user_id: user.id,
          email: user.email || "",
          referral_code: referralCode,
        })
        .select("referral_code, blessings_confirmed, display_name, instagram_handle")
        .single();

      if (insertError) {
        // If referral code collision, retry with new code
        if (insertError.code === "23505") {
          const retryCode = generateReferralCode();
          const { data: retryProfile } = await supabase
            .from("creator_profiles")
            .insert({
              user_id: user.id,
              email: user.email || "",
              referral_code: retryCode,
            })
            .select("referral_code, blessings_confirmed, display_name, instagram_handle")
            .single();
          
          if (retryProfile) {
            setProfile(retryProfile);
          }
        }
      } else if (newProfile) {
        setProfile(newProfile);
      }

      setIsLoading(false);
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error("Error setting up profile:", error);
      }
      setIsLoading(false);
    }
  };

  const generateReferralCode = () => {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    let code = "BLESSED";
    for (let i = 0; i < 4; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  };

  const referralUrl = profile
    ? `${window.location.origin}/challenge?ref=${profile.referral_code}`
    : "";

  const copyReferralLink = () => {
    navigator.clipboard.writeText(referralUrl);
    toast({
      title: "Link copied!",
      description: "Share this link in your AI video to track BCs.",
    });
  };

  const handleSignOut = async () => {
    await signOut();
  };

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto" />
        <p className="text-muted-foreground mt-4">Setting up your dashboard...</p>
      </div>
    );
  }

  return (
    <motion.div
      className="max-w-2xl mx-auto"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Success Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-4">
          <CheckCircle className="w-8 h-8 text-primary" />
        </div>
        <h2 className="text-3xl font-bold mb-2">You're In! 🎉</h2>
        <p className="text-muted-foreground">
          Here's everything you need to start creating and winning.
        </p>
      </div>

      {/* Referral Link Card */}
      <div className="bg-card rounded-2xl border border-border/50 p-6 mb-6 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <Share2 className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-bold">Your Unique Referral Link</h3>
        </div>
        <p className="text-sm text-muted-foreground mb-4">
          Include this link in your AI video (QR code, caption, or pinned comment). Every challenge completion = 1 BC.
        </p>
        <div className="flex items-center gap-2 bg-secondary/50 rounded-lg p-3">
          <input
            type="text"
            value={referralUrl}
            readOnly
            className="flex-1 bg-transparent text-sm truncate outline-none"
          />
          <Button variant="default" size="sm" onClick={copyReferralLink}>
            <Copy className="w-4 h-4 mr-1" />
            Copy
          </Button>
        </div>
        {profile && (
          <div className="mt-4 p-3 bg-primary/10 rounded-lg">
            <p className="text-sm">
              <span className="font-semibold">Your Code:</span>{" "}
              <span className="font-mono text-primary">{profile.referral_code}</span>
            </p>
            <p className="text-sm mt-1">
              <span className="font-semibold">Blessings Confirmed:</span>{" "}
              <span className="font-mono text-primary">{profile.blessings_confirmed}</span>
            </p>
          </div>
        )}
      </div>

      {/* Next Steps */}
      <div className="bg-card rounded-2xl border border-border/50 p-6 mb-6 shadow-sm">
        <h3 className="text-lg font-bold mb-4">Next Steps</h3>
        <div className="space-y-4">
          {[
            {
              icon: Video,
              title: "Create your AI clip",
              desc: "Use Runway Gen-3, Kling, Luma, or any AI tool. Follow the master prompt or go rogue.",
            },
            {
              icon: Share2,
              title: "Include your referral link",
              desc: "Add a QR code to your video, or put the link in your caption/pinned comment.",
            },
            {
              icon: Instagram,
              title: "Post & tag @IamBlessedAF",
              desc: "Upload to IG, TikTok, X, Reddit, Discord. Use #AIVideoContest #BlessedChallenge",
            },
          ].map((step, i) => {
            const Icon = step.icon;
            return (
              <div key={i} className="flex gap-4">
                <div className="flex-shrink-0 w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                  <Icon className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="font-semibold">{step.title}</p>
                  <p className="text-sm text-muted-foreground">{step.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        <Button
          variant="outline"
          className="h-12"
          onClick={() => window.open("https://www.instagram.com/iamblessedaf", "_blank")}
        >
          <Instagram className="w-5 h-5 mr-2" />
          Follow @IamBlessedAF
        </Button>
        <Button
          variant="outline"
          className="h-12"
          onClick={() => window.open("https://www.instagram.com/davincy_gang", "_blank")}
        >
          <ExternalLink className="w-5 h-5 mr-2" />
          DM @JoeDaVincy
        </Button>
      </div>

      {/* Sign Out */}
      <div className="text-center">
        <Button variant="ghost" size="sm" onClick={handleSignOut}>
          <LogOut className="w-4 h-4 mr-2" />
          Sign out
        </Button>
      </div>
    </motion.div>
  );
}
