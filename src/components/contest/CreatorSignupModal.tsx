import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Mail, Lock, User, Loader2, KeyRound, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { z } from "zod";

const signupSchema = z.object({
  firstName: z.string().trim().min(1, "First name is required").max(50),
  email: z.string().trim().email("Please enter a valid email").max(255),
  password: z.string().min(6, "Password must be at least 6 characters").max(100),
});

interface CreatorSignupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const GoogleIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24">
    <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
    <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
    <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
    <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
  </svg>
);

const AppleIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
    <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
  </svg>
);

export function CreatorSignupModal({ isOpen, onClose, onSuccess }: CreatorSignupModalProps) {
  const [mode, setMode] = useState<"signup" | "signin">("signup");
  const [step, setStep] = useState<"form" | "otp">("form");
  const [firstName, setFirstName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ firstName?: string; email?: string; password?: string }>({});

  const { signInWithGoogle, signInWithApple, signUpWithEmail, signInWithEmail } = useAuth();
  const { toast } = useToast();

  // Write referral attribution to creator_profiles after any successful auth
  // Resolves the referral code → referrer's user_id and stores both
  const writeReferralAttribution = async (userId: string) => {
    const refCode = sessionStorage.getItem("referral_code") || localStorage.getItem("referral_code");
    if (!refCode) return;
    try {
      // Look up the referrer's user_id from their referral_code
      const { data: referrer } = await supabase
        .from("creator_profiles")
        .select("user_id")
        .eq("referral_code", refCode)
        .maybeSingle();

      const updatePayload: Record<string, string> = { referred_by_code: refCode };
      if (referrer?.user_id) {
        updatePayload.referred_by_user_id = referrer.user_id;
      }

      await supabase
        .from("creator_profiles")
        .update(updatePayload)
        .eq("user_id", userId);

      sessionStorage.removeItem("referral_code");
      localStorage.removeItem("referral_code");
    } catch (_) {}
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    const { error } = await signInWithGoogle();
    if (error) toast({ variant: "destructive", title: "Google sign-in failed", description: (error as any).message });
    setIsLoading(false);
  };

  const handleAppleSignIn = async () => {
    setIsLoading(true);
    const { error } = await signInWithApple();
    if (error) toast({ variant: "destructive", title: "Apple sign-in failed", description: (error as any).message });
    setIsLoading(false);
  };

  const handleSendOtp = async () => {
    setErrors({});
    const validateObj = { firstName, email, password };
    const result = signupSchema.safeParse(validateObj);
    if (!result.success) {
      const fieldErrors: typeof errors = {};
      result.error.errors.forEach((err) => {
        if (err.path[0] === "firstName") fieldErrors.firstName = err.message;
        if (err.path[0] === "email") fieldErrors.email = err.message;
        if (err.path[0] === "password") fieldErrors.password = err.message;
      });
      setErrors(fieldErrors);
      return;
    }

    setIsLoading(true);
    try {
      const { supabase } = await import("@/integrations/supabase/client");
      const { data, error } = await supabase.functions.invoke("send-email-otp", {
        body: { action: "send", email },
      });
      if (error || data?.error) {
        toast({ variant: "destructive", title: "Error", description: data?.error || "Failed to send code" });
      } else {
        setStep("otp");
        toast({ title: "📧 Code sent!", description: `Check ${email} for your 6-digit verification code.` });
      }
    } catch (e) {
      toast({ variant: "destructive", title: "Error", description: "Could not send verification code" });
    }
    setIsLoading(false);
  };

  const handleVerifyAndSignup = async () => {
    if (otpCode.length !== 6) return;
    setIsLoading(true);
    try {
      const { supabase } = await import("@/integrations/supabase/client");
      const { data: verifyData, error: verifyErr } = await supabase.functions.invoke("send-email-otp", {
        body: { action: "verify", email, code: otpCode },
      });
      if (verifyErr || verifyData?.error) {
        toast({ variant: "destructive", title: "Invalid code", description: verifyData?.error || "Verification failed" });
        setIsLoading(false);
        return;
      }

      // OTP verified — create account
      const { error: signupErr } = await signUpWithEmail(email, password, firstName);
      if (signupErr) {
        // If user already exists, try signing in directly
        if (signupErr.message?.includes("already registered") || signupErr.message?.includes("already exists")) {
          const { data: signInData, error: signInErr } = await signInWithEmail(email, password);
          if (signInErr) {
            toast({ variant: "destructive", title: "Sign-in failed", description: (signInErr as any).message });
          } else {
            if (signInData?.user) await writeReferralAttribution(signInData.user.id);
            toast({ title: "✅ Welcome back!", description: "Signed in successfully." });
            onSuccess();
          }
        } else {
          toast({ variant: "destructive", title: "Signup failed", description: (signupErr as any).message });
        }
      } else {
        // Account created — now sign in to get a session
        const { data: signInData, error: signInErr } = await signInWithEmail(email, password);
        if (signInErr) {
          toast({ variant: "destructive", title: "Account created but sign-in failed", description: "Please sign in manually." });
        } else {
          if (signInData?.user) await writeReferralAttribution(signInData.user.id);
          // Send welcome email (fire & forget)
          try {
            await supabase.functions.invoke("send-welcome-email", { body: { email, name: firstName } });
          } catch (_) {}
          toast({ title: "✅ Account created!", description: "Welcome to the community!" });
          onSuccess();
        }
      }
    } catch (e) {
      toast({ variant: "destructive", title: "Error", description: "Something went wrong" });
    }
    setIsLoading(false);
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setIsLoading(true);
    const { data: signInData, error } = await signInWithEmail(email, password);
    if (error) {
      toast({ variant: "destructive", title: "Sign-in failed", description: (error as any).message });
    } else {
      if (signInData?.user) await writeReferralAttribution(signInData.user.id);
      onSuccess();
    }
    setIsLoading(false);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <motion.div
          className="bg-card rounded-2xl shadow-2xl max-w-md w-full p-6 relative"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
        >
          <button onClick={onClose} className="absolute top-4 right-4 text-muted-foreground hover:text-foreground">
            <X className="w-5 h-5" />
          </button>

          {/* OTP VERIFICATION STEP */}
          {step === "otp" && mode === "signup" ? (
            <div className="text-center space-y-5">
              <button
                onClick={() => { setStep("form"); setOtpCode(""); }}
                className="absolute top-4 left-4 text-muted-foreground hover:text-foreground"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div className="flex justify-center">
                <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center">
                  <KeyRound className="w-7 h-7 text-primary" />
                </div>
              </div>
              <div>
                <h2 className="text-xl font-bold text-foreground">Verify Your Email</h2>
                <p className="text-sm text-muted-foreground mt-1">
                  We sent a 6-digit code to <strong className="text-foreground">{email}</strong>
                </p>
              </div>
              <div className="flex justify-center">
                <InputOTP maxLength={6} value={otpCode} onChange={setOtpCode}>
                  <InputOTPGroup>
                    <InputOTPSlot index={0} />
                    <InputOTPSlot index={1} />
                    <InputOTPSlot index={2} />
                    <InputOTPSlot index={3} />
                    <InputOTPSlot index={4} />
                    <InputOTPSlot index={5} />
                  </InputOTPGroup>
                </InputOTP>
              </div>
              <Button
                onClick={handleVerifyAndSignup}
                disabled={isLoading || otpCode.length !== 6}
                className="w-full h-12 bg-primary hover:bg-primary/90"
              >
                {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Verify & Create Account"}
              </Button>
              <button
                onClick={handleSendOtp}
                disabled={isLoading}
                className="text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                Didn't receive it? Resend code
              </button>
            </div>
          ) : (
            <>
              <h2 className="text-2xl font-bold mb-2">
                {mode === "signup" ? "Claim Your FREE Wristband 🎁" : "Welcome Back"}
              </h2>
              <p className="text-muted-foreground mb-6">
                {mode === "signup" ? "Sign up in 5 seconds to start your gratitude journey" : "Sign in to continue your journey"}
              </p>

              {/* OAuth Buttons */}
              <div className="space-y-3 mb-4">
                <Button variant="outline" className="w-full h-12" onClick={handleGoogleSignIn} disabled={isLoading}>
                  <GoogleIcon /><span className="ml-2">Continue with Google</span>
                </Button>
                <Button variant="outline" className="w-full h-12 bg-foreground text-background hover:bg-foreground/90" onClick={handleAppleSignIn} disabled={isLoading}>
                  <AppleIcon /><span className="ml-2">Continue with Apple</span>
                </Button>
              </div>

              <div className="flex items-center gap-4 mb-4">
                <div className="flex-1 h-px bg-border" />
                <span className="text-sm text-muted-foreground">or</span>
                <div className="flex-1 h-px bg-border" />
              </div>

              {/* Email Form */}
              <form onSubmit={mode === "signin" ? handleSignIn : (e) => { e.preventDefault(); handleSendOtp(); }} className="space-y-4">
                {mode === "signup" && (
                  <div>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                      <Input placeholder="First name" value={firstName} onChange={(e) => setFirstName(e.target.value)} className="pl-10 h-12" disabled={isLoading} />
                    </div>
                    {errors.firstName && <p className="text-sm text-destructive mt-1">{errors.firstName}</p>}
                  </div>
                )}
                <div>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input type="email" placeholder="Email address" value={email} onChange={(e) => setEmail(e.target.value)} className="pl-10 h-12" disabled={isLoading} />
                  </div>
                  {errors.email && <p className="text-sm text-destructive mt-1">{errors.email}</p>}
                </div>
                <div>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} className="pl-10 h-12" disabled={isLoading} />
                  </div>
                  {errors.password && <p className="text-sm text-destructive mt-1">{errors.password}</p>}
                </div>
                <Button type="submit" className="w-full h-12 bg-primary hover:bg-primary/90" disabled={isLoading}>
                  {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : mode === "signup" ? "Continue →" : "Sign In"}
                </Button>
              </form>

              <p className="text-sm text-center text-muted-foreground mt-4">
                {mode === "signup" ? (
                  <>Already have an account? <button onClick={() => setMode("signin")} className="text-primary hover:underline">Sign in</button></>
                ) : (
                  <>Don't have an account? <button onClick={() => setMode("signup")} className="text-primary hover:underline">Sign up</button></>
                )}
              </p>
            </>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
