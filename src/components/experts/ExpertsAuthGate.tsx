import { useState } from "react";
import { motion } from "framer-motion";
import { BookOpen, Mail, Lock, User, Loader2, LogIn, KeyRound, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import logoImg from "@/assets/logo.png";

interface ExpertsAuthGateProps {
  children: React.ReactNode;
}

const ExpertsAuthGate = ({ children }: ExpertsAuthGateProps) => {
  const { user, loading, signInWithGoogle, signInWithApple, signUpWithEmail, signInWithEmail } = useAuth();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [step, setStep] = useState<"form" | "otp">("form");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  if (user) return <>{children}</>;

  const handleSendOtp = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!email || !password || (mode === "signup" && !firstName)) {
      toast.error("Please fill all fields");
      return;
    }
    setSubmitting(true);
    try {
      const { supabase } = await import("@/integrations/supabase/client");
      const { data, error } = await supabase.functions.invoke("send-email-otp", {
        body: { action: "send", email },
      });
      if (error || data?.error) {
        toast.error(data?.error || "Failed to send code");
      } else {
        setStep("otp");
        toast.success(`📧 Code sent to ${email}`);
      }
    } catch {
      toast.error("Could not send verification code");
    }
    setSubmitting(false);
  };

  const handleVerifyAndSignup = async () => {
    if (otpCode.length !== 6) return;
    setSubmitting(true);
    try {
      const { supabase } = await import("@/integrations/supabase/client");
      const { data: verifyData, error: verifyErr } = await supabase.functions.invoke("send-email-otp", {
        body: { action: "verify", email, code: otpCode },
      });
      if (verifyErr || verifyData?.error) {
        toast.error(verifyData?.error || "Verification failed");
        setSubmitting(false);
        return;
      }
      const { error } = await signUpWithEmail(email, password, firstName);
      if (error) {
        toast.error(typeof error === "object" && "message" in error ? (error as any).message : "Signup failed");
      } else {
        toast.success("✅ Account created!");
      }
    } catch {
      toast.error("Something went wrong");
    }
    setSubmitting(false);
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    const { error } = await signInWithEmail(email, password);
    if (error) {
      toast.error(typeof error === "object" && "message" in error ? (error as any).message : "Login failed");
    }
    setSubmitting(false);
  };

  const handleGoogle = async () => {
    const { error } = await signInWithGoogle();
    if (error) toast.error("Google sign-in failed");
  };

  const handleApple = async () => {
    const { error } = await signInWithApple();
    if (error) toast.error("Apple sign-in failed");
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 py-12">
      <motion.div className="max-w-sm w-full" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="text-center mb-6">
          <img src={logoImg} alt="Logo" className="h-10 mx-auto mb-3" />
          <div className="flex items-center justify-center gap-2 mb-2">
            <BookOpen className="w-4 h-4 text-primary" />
            <span className="text-xs font-bold uppercase tracking-wider text-primary">Expert Scripts AI Lab</span>
          </div>
          <h1 className="text-xl font-bold text-foreground mb-1">
            {step === "otp" ? "Verify Your Email" : mode === "signup" ? "Create Your Account" : "Welcome Back"}
          </h1>
          <p className="text-sm text-muted-foreground">
            {step === "otp"
              ? <>We sent a 6-digit code to <strong className="text-foreground">{email}</strong></>
              : "Sign in to save your scripts and continue building your funnel copy."}
          </p>
        </div>

        <div className="bg-card border border-border/50 rounded-2xl p-5 space-y-4">
          {step === "otp" && mode === "signup" ? (
            <div className="space-y-4 text-center">
              <button
                onClick={() => { setStep("form"); setOtpCode(""); }}
                className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                <ArrowLeft className="w-4 h-4" /> Back
              </button>
              <div className="flex justify-center">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  <KeyRound className="w-6 h-6 text-primary" />
                </div>
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
                disabled={submitting || otpCode.length !== 6}
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold rounded-xl gap-2"
              >
                {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <LogIn className="w-4 h-4" />}
                Verify & Create Account
              </Button>
              <button onClick={() => handleSendOtp()} disabled={submitting} className="text-xs text-muted-foreground hover:text-primary transition-colors">
                Didn't receive it? Resend code
              </button>
            </div>
          ) : (
            <>
              {/* Social logins */}
              <div className="space-y-2">
                <Button variant="outline" className="w-full gap-2 rounded-xl" onClick={handleGoogle}>
                  <svg className="w-4 h-4" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
                  Continue with Google
                </Button>
                {/* Apple login hidden for now */}
              </div>

              <div className="relative">
                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-border/50" /></div>
                <div className="relative flex justify-center text-xs"><span className="bg-card px-2 text-muted-foreground">or</span></div>
              </div>

              <form onSubmit={mode === "login" ? handleSignIn : handleSendOtp} className="space-y-3">
                {mode === "signup" && (
                  <div>
                    <Label className="text-xs text-muted-foreground">First Name</Label>
                    <div className="relative mt-1">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input value={firstName} onChange={(e) => setFirstName(e.target.value)} placeholder="Your first name" className="pl-9" required />
                    </div>
                  </div>
                )}
                <div>
                  <Label className="text-xs text-muted-foreground">Email</Label>
                  <div className="relative mt-1">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" className="pl-9" required />
                  </div>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Password</Label>
                  <div className="relative mt-1">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" className="pl-9" required minLength={6} />
                  </div>
                </div>
                <Button type="submit" disabled={submitting} className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold rounded-xl gap-2">
                  {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <LogIn className="w-4 h-4" />}
                  {mode === "signup" ? "Continue →" : "Sign In"}
                </Button>
              </form>

              <p className="text-xs text-center text-muted-foreground">
                {mode === "login" ? (
                  <>Don't have an account? <button onClick={() => setMode("signup")} className="text-primary font-semibold underline">Sign up</button></>
                ) : (
                  <>Already have an account? <button onClick={() => setMode("login")} className="text-primary font-semibold underline">Sign in</button></>
                )}
              </p>
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default ExpertsAuthGate;
