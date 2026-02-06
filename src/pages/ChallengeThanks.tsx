import { motion } from "framer-motion";
import { CheckCircle, Mail, MessageSquare, Share2, Copy, Twitter, Facebook } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import logo from "@/assets/logo.png";

const ChallengeThanks = () => {
  const { toast } = useToast();

  // Placeholder referral code - will be dynamically generated
  const referralCode = "BLESSED" + Math.random().toString(36).substring(2, 6).toUpperCase();
  const shareUrl = `${window.location.origin}/challenge?ref=${referralCode}`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(shareUrl);
    toast({
      title: "Link copied!",
      description: "Share it with friends to spread the blessings.",
    });
  };

  const shareToTwitter = () => {
    const text = "I just joined the 3-Day Gratitude Challenge! Send real gratitude, get real confirmation, win $1,111. Join me:";
    window.open(
      `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(shareUrl)}`,
      "_blank"
    );
  };

  const shareToFacebook = () => {
    window.open(
      `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
      "_blank"
    );
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full text-center">
        {/* Success Animation */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", duration: 0.6, bounce: 0.5 }}
          className="mb-8"
        >
          <div className="relative inline-block">
            <motion.div
              className="absolute inset-0 bg-primary/20 rounded-full blur-xl"
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
            <div className="relative bg-primary rounded-full p-6 inline-block shadow-glow">
              <CheckCircle className="w-16 h-16 text-primary-foreground" />
            </div>
          </div>
        </motion.div>

        {/* Logo */}
        <motion.img
          src={logo}
          alt="I am Blessed AF"
          className="w-20 h-20 object-contain mx-auto mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        />

        {/* Headline */}
        <motion.h1
          className="text-4xl md:text-5xl font-bold text-foreground mb-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          You're In! 🎉
        </motion.h1>

        {/* Confirmation Message */}
        <motion.p
          className="text-lg text-muted-foreground mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          Get ready to spread some blessings.
        </motion.p>

        {/* Next Steps Card */}
        <motion.div
          className="bg-card rounded-2xl shadow-premium p-6 mb-8 border border-border/50"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <h2 className="font-bold text-lg mb-4">What Happens Next?</h2>
          
          <div className="space-y-4 text-left">
            <div className="flex items-start gap-3">
              <div className="bg-primary/10 rounded-lg p-2 mt-0.5">
                <Mail className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="font-semibold">Check your inbox</p>
                <p className="text-sm text-muted-foreground">
                  Day 1 instructions arrive at 8am tomorrow
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="bg-primary/10 rounded-lg p-2 mt-0.5">
                <MessageSquare className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="font-semibold">Watch for texts</p>
                <p className="text-sm text-muted-foreground">
                  We'll SMS you a reminder each morning
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Share Section */}
        <motion.div
          className="bg-secondary/50 rounded-2xl p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          <div className="flex items-center justify-center gap-2 mb-4">
            <Share2 className="w-5 h-5 text-primary" />
            <h3 className="font-bold">Invite Friends, Multiply Blessings</h3>
          </div>
          
          <p className="text-sm text-muted-foreground mb-4">
            The more people you bring, the bigger the blessing circle.
          </p>

          {/* Referral Link */}
          <div className="flex items-center gap-2 bg-background rounded-lg p-3 mb-4">
            <input
              type="text"
              value={shareUrl}
              readOnly
              className="flex-1 bg-transparent text-sm truncate outline-none"
            />
            <Button
              variant="ghost"
              size="sm"
              onClick={copyToClipboard}
              className="shrink-0"
            >
              <Copy className="w-4 h-4" />
            </Button>
          </div>

          {/* Social Share Buttons */}
          <div className="flex gap-3 justify-center">
            <Button
              variant="outline"
              size="sm"
              onClick={shareToTwitter}
              className="flex-1"
            >
              <Twitter className="w-4 h-4 mr-2" />
              Twitter
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={shareToFacebook}
              className="flex-1"
            >
              <Facebook className="w-4 h-4 mr-2" />
              Facebook
            </Button>
          </div>
        </motion.div>

        {/* Footer */}
        <motion.p
          className="text-xs text-muted-foreground mt-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9 }}
        >
          Questions? Reply to any of our emails.
        </motion.p>
      </div>
    </div>
  );
};

export default ChallengeThanks;
