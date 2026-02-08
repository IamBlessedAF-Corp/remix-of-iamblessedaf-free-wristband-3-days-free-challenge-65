import { useState, useEffect, useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Separator } from "@/components/ui/separator";
import { CheckCircle2, Users, Heart, Sparkles, Gift } from "lucide-react";
import UrgencyBanner from "@/components/offer/UrgencyBanner";
import SpinWheel from "@/components/challenge/SpinWheel";
import { useSpinLogic } from "@/hooks/useSpinLogic";
import logo from "@/assets/logo.png";
import { useAuth } from "@/hooks/useAuth";
import wristbandsImg from "@/assets/product-wristbands-new.avif";

const formSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters").max(100),
  email: z.string().trim().email("Please enter a valid email").max(255),
  phone: z.string().trim().min(10, "Please enter a valid phone number").max(20),
});

type FormValues = z.infer<typeof formSchema>;

const Challenge = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const { signInWithGoogle, user } = useAuth();
  const spinLogic = useSpinLogic();

  const referralCode = searchParams.get("ref");
  const isReferred = !!referralCode;

  // Redirect to thanks page when user is authenticated via Google
  // BUT only if they're NOT arriving via a referral link (they need to see the wristband offer first)
  useEffect(() => {
    if (user && !isReferred) {
      navigate("/challenge/thanks");
    }
  }, [user, navigate, isReferred]);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
    },
  });

  const onSubmit = async (data: FormValues) => {
    setIsSubmitting(true);
    if (import.meta.env.DEV) {
      console.log("Form submitted:", data, "ref:", referralCode);
    }
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsSubmitting(false);
    // Pass referral code to thanks page so it can be used for checkout
    const thanksUrl = referralCode
      ? `/challenge/thanks?ref=${referralCode}`
      : "/challenge/thanks";
    navigate(thanksUrl);
  };

  const handleGoogleSignup = async () => {
    setGoogleLoading(true);
    // Store referral code in sessionStorage so it persists through the OAuth redirect
    if (referralCode) {
      sessionStorage.setItem("referral_code", referralCode);
    }
    const { error } = await signInWithGoogle();
    if (error) {
      console.error("Google sign-in error:", error);
      setGoogleLoading(false);
    }
  };

  const features = useMemo(() => {
    if (isReferred) {
      return [
        { icon: Gift, text: "FREE Wristband Gift 🎁" },
        { icon: Heart, text: "Someone is Grateful for You" },
        { icon: Sparkles, text: "Win $1,111 This Week" },
      ];
    }
    return [
      { icon: CheckCircle2, text: "100% Free to Join" },
      { icon: Users, text: "Real Human Confirmation" },
      { icon: Heart, text: "Win $1,111 This Week" },
    ];
  }, [isReferred]);

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-accent/50 to-background" />
        
        <div className="relative container mx-auto px-4 py-8 md:py-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="flex flex-col items-center text-center max-w-2xl mx-auto"
          >
            {/* Logo */}
            <motion.img
              src={logo}
              alt="I am Blessed AF"
              className="w-full max-w-md h-auto object-contain mb-6 px-4"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            />

            {/* Referred: Wristband Gift Hero */}
            {isReferred ? (
              <>
                {/* Gift badge */}
                <motion.div
                  className="inline-flex items-center gap-2 bg-primary/10 border border-primary/30 text-primary px-4 py-2 rounded-full text-sm font-bold mb-4"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.25 }}
                >
                  <Gift className="w-4 h-4" />
                  Someone is Grateful for YOU 🎁
                </motion.div>

                <motion.h1
                  className="text-3xl md:text-5xl lg:text-6xl font-bold text-foreground leading-tight mb-4"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.3 }}
                >
                  Someone Sent You a{" "}
                  <span className="text-primary">FREE Wristband!</span>
                </motion.h1>

                {/* Wristband image */}
                <motion.div
                  className="w-full max-w-xs mx-auto mb-4 rounded-xl overflow-hidden border border-border/50 shadow-lg"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.35 }}
                >
                  <img
                    src={wristbandsImg}
                    alt="I Am Blessed AF Wristbands"
                    className="w-full h-auto object-cover"
                  />
                </motion.div>

                <motion.p
                  className="text-lg md:text-xl text-muted-foreground mb-2 max-w-lg"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.4 }}
                >
                  Someone who cares about you sent you a{" "}
                  <span className="font-bold text-foreground">FREE "I Am Blessed AF" Wristband</span> as a 
                  gratitude gift. Sign up to claim yours!
                </motion.p>


                <motion.p
                  className="text-sm font-semibold text-primary mb-8"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                >
                  🙏 Plus: Join the FREE 3-Day Challenge + Win $1,111!
                </motion.p>
              </>
            ) : (
              <>
                {/* Default: Challenge Hero */}
                <motion.h1
                  className="text-3xl md:text-5xl lg:text-6xl font-bold text-foreground leading-tight mb-4"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.3 }}
                >
                  Real Gratitude = Real{" "}
                  <span className="text-primary">Brain Rewire.</span>{" "}
                  Start Free + Win $1,111.
                </motion.h1>

                <motion.p
                  className="text-lg md:text-xl text-muted-foreground mb-4 max-w-lg"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.4 }}
                >
                  2 min/day × 3 days. Science says received thanks boosts happiness{" "}
                  <span className="font-bold text-foreground">27×</span>. No apps. No journaling. Just real humans confirming your gratitude.
                </motion.p>

                <motion.p
                  className="text-sm font-semibold text-primary mb-8"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.45 }}
                >
                  🔥 2,340 joined · 25k+ meals donated — your turn.
                </motion.p>
              </>
            )}

            {/* Feature badges */}
            <motion.div
              className="flex flex-wrap justify-center gap-3 mb-10"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
            >
              {features.map((feature, index) => (
                <div
                  key={index}
                  className="flex items-center gap-2 bg-secondary/80 px-4 py-2 rounded-full text-sm font-medium text-secondary-foreground"
                >
                  <feature.icon className="w-4 h-4 text-primary" />
                  {feature.text}
                </div>
              ))}
            </motion.div>
          </motion.div>

          {/* Wristband urgency */}
          <motion.div
            className="max-w-md mx-auto mb-4"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.55 }}
          >
            <UrgencyBanner variant="wristbands" />
          </motion.div>

          {/* Signup Card */}
          <motion.div
            className="max-w-md mx-auto"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.6 }}
          >
            <div className="bg-card rounded-2xl shadow-premium p-6 md:p-8 border border-border/50">
              {/* Google Button */}
              <Button
                onClick={handleGoogleSignup}
                disabled={googleLoading}
                variant="outline"
                className="w-full h-14 text-base font-semibold mb-6 hover:bg-secondary transition-all duration-300 border-2"
              >
                <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="currentColor"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                {googleLoading ? "Connecting..." : isReferred ? "Claim My FREE Wristband" : "Continue with Google"}
              </Button>

              {/* Divider */}
              <div className="flex items-center gap-4 mb-6">
                <Separator className="flex-1" />
                <span className="text-muted-foreground text-sm">or</span>
                <Separator className="flex-1" />
              </div>

              {/* Email/Phone Form */}
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Input
                            placeholder="Your name"
                            className="h-12 text-base bg-secondary/50 border-border/50 focus:border-primary"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Input
                            type="email"
                            placeholder="Email address"
                            className="h-12 text-base bg-secondary/50 border-border/50 focus:border-primary"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Input
                            type="tel"
                            placeholder="Phone number"
                            className="h-12 text-base bg-secondary/50 border-border/50 focus:border-primary"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full h-14 text-lg font-bold bg-primary hover:bg-primary/90 text-primary-foreground btn-glow transition-all duration-300"
                  >
                    {isSubmitting ? (
                      <span className="flex items-center gap-2">
                        <Sparkles className="w-5 h-5 animate-pulse" />
                        {isReferred ? "Claiming..." : "Joining..."}
                      </span>
                    ) : isReferred ? (
                      "🎁 Claim My FREE Wristband →"
                    ) : (
                      "Start My Free 3-Day Brain Rewire →"
                    )}
                  </Button>
                </form>
              </Form>

              {/* Trust badge */}
              <p className="text-center text-xs text-muted-foreground mt-6">
                {isReferred 
                  ? "🔒 Your wristband is reserved • Powered by real human connection"
                  : "🔒 Powered by real human confirmation"}
              </p>
            </div>
          </motion.div>
        </div>
      </div>

      {/* How It Works Section */}
      <section className="py-16 md:py-24 bg-secondary/30">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="text-2xl md:text-4xl font-bold mb-4">
              {isReferred ? "How to Claim Your Gift" : "How It Works"}
            </h2>
            <p className="text-muted-foreground max-w-lg mx-auto">
              {isReferred ? "3 simple steps to your free wristband." : "Simple. Powerful. Life-changing."}
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {(isReferred
              ? [
                  {
                    step: "1",
                    title: "Claim Your Gift",
                    description: "Sign up above to reserve your FREE 'I Am Blessed AF' wristband.",
                  },
                  {
                    step: "2",
                    title: "Complete Checkout",
                    description: "Choose your wristband option and complete your order.",
                  },
                  {
                    step: "3",
                    title: "Join the Challenge",
                    description: "Bonus: Enter the FREE 3-Day Gratitude Challenge and win $1,111!",
                  },
                ]
              : [
                  {
                    step: "1",
                    title: "Send Gratitude",
                    description: "Each morning, text one person you're genuinely grateful for.",
                  },
                  {
                    step: "2",
                    title: "They Confirm",
                    description: "Your recipient confirms they received your blessing.",
                  },
                  {
                    step: "3",
                    title: "Win Together",
                    description: "Complete 3 days and enter to win $1,111. Simple.",
                  },
                ]
            ).map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="text-center"
              >
                <div className="w-16 h-16 bg-primary text-primary-foreground rounded-2xl flex items-center justify-center text-2xl font-bold mx-auto mb-4 shadow-glow">
                  {item.step}
                </div>
                <h3 className="text-xl font-bold mb-2">{item.title}</h3>
                <p className="text-muted-foreground">{item.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 text-center text-sm text-muted-foreground">
        <p>© {new Date().getFullYear()} I am Blessed AF. All rights reserved.</p>
      </footer>

      {/* Spin the Wheel — auto-shows after 4s for first-time visitors */}
      {!isReferred && (
        <SpinWheel
          segments={spinLogic.segments}
          isSpinning={spinLogic.isSpinning}
          hasWon={spinLogic.hasWon}
          showWheel={spinLogic.showWheel}
          rotation={spinLogic.rotation}
          onSpin={spinLogic.spin}
          onClose={spinLogic.closeWheel}
        />
      )}
    </div>
  );
};

export default Challenge;
