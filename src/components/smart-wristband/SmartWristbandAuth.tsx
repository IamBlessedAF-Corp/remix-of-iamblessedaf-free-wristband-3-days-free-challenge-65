import { useState, useEffect } from "react";
import { Mail, Lock, User, Loader2, CheckCircle, Users, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/useAuth";
import { useWristbandWaitlist } from "@/hooks/useWristbandWaitlist";
import { toast } from "sonner";

const SmartWristbandAuth = () => {
  const { user, loading, signInWithGoogle, signInWithApple, signUpWithEmail, signInWithEmail } = useAuth();
  const { joinWaitlist, loading: waitlistLoading } = useWristbandWaitlist();
  const [mode, setMode] = useState<"login" | "signup">("signup");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [phone, setPhone] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [joined, setJoined] = useState(false);

  // Auto-join waitlist when user is authenticated
  useEffect(() => {
    if (user && !joined) {
      joinWaitlist(
        user.email || "",
        user.user_metadata?.first_name || user.email?.split("@")[0],
        user.id
      );
      setJoined(true);
    }
  }, [user, joined]);

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  if (user) {
    return (
      <div className="bg-card border border-primary/30 rounded-2xl p-6 text-center">
        <CheckCircle className="w-10 h-10 text-primary mx-auto mb-3" />
        <h3 className="text-lg font-bold text-foreground mb-1">You're on the waitlist! 🎉</h3>
        <p className="text-sm text-muted-foreground mb-3">
          We'll notify you the moment the mPFC Neuro-Hacker Wristband SMART launches on Kickstarter.
        </p>
        <div className="space-y-2">
          <a href="/FREE-neuro-hacker-wristband">
            <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-black rounded-xl gap-2">
              🎁 Claim Your FREE Prototype Wristband
            </Button>
          </a>
          <a href="/Reserve-a-SMART-wristband">
            <Button variant="outline" className="w-full font-bold rounded-xl gap-2 mt-2">
              🚀 Or Reserve SMART with $11 — Lock 77% OFF
            </Button>
          </a>
        </div>
      </div>
    );
  }

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (mode === "signup") {
        const { error } = await signUpWithEmail(email, password, firstName);
        if (error) {
          toast.error(typeof error === "object" && "message" in error ? (error as any).message : "Signup failed");
        } else {
          await joinWaitlist(email, firstName, undefined, phone || undefined);
          toast.success("You're on the waitlist! Check your email 🎉" + (phone ? " & phone 📱" : ""));
        }
      } else {
        const { error } = await signInWithEmail(email, password);
        if (error) {
          toast.error(typeof error === "object" && "message" in error ? (error as any).message : "Login failed");
        }
      }
    } finally {
      setSubmitting(false);
    }
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
    <div className="bg-card border border-border/50 rounded-2xl p-5 max-w-sm mx-auto">
      <h3 className="text-base font-bold text-foreground text-center mb-1">
        🧠 Join the mPFC SMART Wristband Waitlist NOW
      </h3>
      <p className="text-xs text-muted-foreground text-center mb-4">
        {mode === "signup" ? "Sign up to get notified first & lock 77% OFF" : "Welcome back, Neuro-Hacker"}
      </p>

      {/* Social logins */}
      <div className="space-y-2 mb-4">
        <Button variant="outline" className="w-full gap-2 rounded-xl" onClick={handleGoogle}>
          <svg className="w-4 h-4" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
          Continue with Google
        </Button>
        {/* Apple login hidden for now */}
      </div>

      <div className="relative mb-4">
        <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-border/50" /></div>
        <div className="relative flex justify-center text-xs"><span className="bg-card px-2 text-muted-foreground">or</span></div>
      </div>

      {/* Email form */}
      <form onSubmit={handleEmailAuth} className="space-y-3">
        {mode === "signup" && (
          <>
            <div>
              <Label className="text-xs text-muted-foreground">First Name</Label>
              <div className="relative mt-1">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input value={firstName} onChange={(e) => setFirstName(e.target.value)} placeholder="Your first name" className="pl-9" required />
              </div>
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Phone <span className="text-muted-foreground/60">(optional — get a text when we launch 📱)</span></Label>
              <div className="relative mt-1">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+1 (555) 123-4567" className="pl-9" />
              </div>
            </div>
          </>
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
          {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Users className="w-4 h-4" />}
          {mode === "signup" ? "🧠 Join the Waitlist NOW" : "Sign In"}
        </Button>
      </form>

      <p className="text-xs text-center text-muted-foreground mt-3">
        {mode === "login" ? (
          <>Don't have an account?{" "}<button onClick={() => setMode("signup")} className="text-primary font-semibold underline">Sign up</button></>
        ) : (
          <>Already have an account?{" "}<button onClick={() => setMode("login")} className="text-primary font-semibold underline">Sign in</button></>
        )}
      </p>
    </div>
  );
};

export default SmartWristbandAuth;
