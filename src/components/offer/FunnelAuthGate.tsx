import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Sparkles, Eye, EyeOff } from "lucide-react";
import logo from "@/assets/logo.png";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

interface FunnelAuthGateProps {
  onAuthenticated: () => void;
}

const FunnelAuthGate = ({ onAuthenticated }: FunnelAuthGateProps) => {
  const { signInWithGoogle, signInWithApple, signUpWithEmail, signInWithEmail } = useAuth();
  const [googleLoading, setGoogleLoading] = useState(false);
  const [appleLoading, setAppleLoading] = useState(false);
  const [emailLoading, setEmailLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLogin, setIsLogin] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleGoogle = async () => {
    setGoogleLoading(true);
    const { error } = await signInWithGoogle();
    if (error) {
      console.error("Google sign-in error:", error);
      toast.error("Google sign-in failed. Please try again.");
    }
    setGoogleLoading(false);
  };

  const handleApple = async () => {
    setAppleLoading(true);
    const { error } = await signInWithApple();
    if (error) {
      console.error("Apple sign-in error:", error);
      toast.error("Apple sign-in failed. Please try again.");
    }
    setAppleLoading(false);
  };

  const handleEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    setEmailLoading(true);

    if (isLogin) {
      const { error } = await signInWithEmail(email, password);
      if (error) {
        toast.error("Invalid email or password.");
      }
    } else {
      const { error } = await signUpWithEmail(email, password);
      if (error) {
        toast.error(error.message || "Signup failed.");
      } else {
        toast.success("Check your email to verify your account!");
      }
    }
    setEmailLoading(false);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <motion.div
        className="w-full max-w-md"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        {/* Logo */}
        <motion.img
          src={logo}
          alt="I am Blessed AF"
          className="w-full max-w-xs h-auto object-contain mx-auto mb-6"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        />

        <motion.p
          className="text-center text-muted-foreground mb-8 text-base"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          Create your account to start the journey.
        </motion.p>

        <div className="bg-card rounded-2xl shadow-premium p-6 md:p-8 border border-border/50">
          {/* Google */}
          <Button
            onClick={handleGoogle}
            disabled={googleLoading}
            variant="outline"
            className="w-full h-14 text-base font-semibold mb-3 hover:bg-secondary transition-all duration-300 border-2"
          >
            <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
              <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            {googleLoading ? "Connecting..." : "Continue with Google"}
          </Button>

          {/* Apple */}
          <Button
            onClick={handleApple}
            disabled={appleLoading}
            variant="outline"
            className="w-full h-14 text-base font-semibold mb-4 hover:bg-secondary transition-all duration-300 border-2"
          >
            <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
            </svg>
            {appleLoading ? "Connecting..." : "Continue with Apple"}
          </Button>

          {/* Divider */}
          <div className="flex items-center gap-4 mb-4">
            <Separator className="flex-1" />
            <span className="text-muted-foreground text-sm">or</span>
            <Separator className="flex-1" />
          </div>

          {/* Email form */}
          <form onSubmit={handleEmail} className="space-y-3">
            <Input
              type="email"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-12 text-base bg-secondary/50 border-border/50 focus:border-primary"
              required
            />
            <div className="relative">
              <Input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-12 text-base bg-secondary/50 border-border/50 focus:border-primary pr-12"
                required
                minLength={6}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <Button
              type="submit"
              disabled={emailLoading}
              className="w-full h-14 text-lg font-bold bg-primary hover:bg-primary/90 text-primary-foreground btn-glow transition-all duration-300"
            >
              {emailLoading ? (
                <span className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 animate-pulse" />
                  {isLogin ? "Signing in..." : "Creating account..."}
                </span>
              ) : isLogin ? (
                "Sign In →"
              ) : (
                "Create Account →"
              )}
            </Button>
          </form>

          {/* Toggle login/signup */}
          <p className="text-center text-sm text-muted-foreground mt-5">
            {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="text-primary font-semibold hover:underline"
            >
              {isLogin ? "Sign up" : "Sign in"}
            </button>
          </p>

          {/* Trust */}
          <p className="text-center text-xs text-muted-foreground mt-4">
            🔒 Secure · No spam · Your data is never shared
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default FunnelAuthGate;
