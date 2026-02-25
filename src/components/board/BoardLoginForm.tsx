import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Loader2, LogIn, Shield, Eye, EyeOff, Mail } from "lucide-react";
import { Separator } from "@/components/ui/separator";

interface BoardLoginFormProps {
  signInWithEmail: (email: string, password: string) => Promise<{ error?: any }>;
  signInWithGoogle?: () => Promise<{ error?: any }>;
  signInWithApple?: () => Promise<{ error?: any }>;
}

export default function BoardLoginForm({ signInWithEmail, signInWithGoogle, signInWithApple }: BoardLoginFormProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showEmailForm, setShowEmailForm] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    const result = await signInWithEmail(email, password);
    if (result.error) {
      setError(
        typeof result.error === "object" && "message" in result.error
          ? (result.error as any).message
          : "Login failed"
      );
    }
    setSubmitting(false);
  };

  const handleGoogle = async () => {
    if (!signInWithGoogle) return;
    setError("");
    setSubmitting(true);
    const result = await signInWithGoogle();
    if (result.error) setError("Google sign-in failed");
    setSubmitting(false);
  };

  const handleApple = async () => {
    if (!signInWithApple) return;
    setError("");
    setSubmitting(true);
    const result = await signInWithApple();
    if (result.error) setError("Apple sign-in failed");
    setSubmitting(false);
  };

  return (
    <Card className="w-full max-w-sm">
      <CardHeader className="text-center">
        <div className="flex justify-center mb-2">
          <Shield className="w-10 h-10 text-primary" />
        </div>
        <CardTitle>Admin Access</CardTitle>
        <CardDescription>Sign in to continue</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Google */}
        {signInWithGoogle && (
          <Button
            type="button"
            variant="outline"
            className="w-full gap-2 font-medium"
            onClick={handleGoogle}
            disabled={submitting}
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18A11.96 11.96 0 0 0 0 12c0 1.94.46 3.77 1.28 5.39l3.56-2.77.01-.53z" fill="#FBBC05" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
            </svg>
            Continue with Google
          </Button>
        )}

        {/* Apple */}
        {signInWithApple && (
          <Button
            type="button"
            variant="outline"
            className="w-full gap-2 font-medium"
            onClick={handleApple}
            disabled={submitting}
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
            </svg>
            Continue with Apple
          </Button>
        )}

        {/* Divider */}
        {(signInWithGoogle || signInWithApple) && (
          <div className="flex items-center gap-3">
            <Separator className="flex-1" />
            <span className="text-xs text-muted-foreground">or</span>
            <Separator className="flex-1" />
          </div>
        )}

        {/* Email toggle */}
        {!showEmailForm ? (
          <Button
            type="button"
            variant="secondary"
            className="w-full gap-2"
            onClick={() => setShowEmailForm(true)}
          >
            <Mail className="w-4 h-4" />
            Sign in with Email
          </Button>
        ) : (
          <form onSubmit={handleLogin} className="space-y-3" autoComplete="on">
            <div>
              <Label htmlFor="admin-email">Email</Label>
              <Input id="admin-email" name="email" type="email" autoComplete="username" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <div>
              <Label htmlFor="admin-password">Password</Label>
              <div className="relative mt-1">
                <Input
                  id="admin-password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="pr-10"
                />
                <button
                  type="button"
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  onClick={() => setShowPassword(!showPassword)}
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <Button type="submit" className="w-full" disabled={submitting}>
              {submitting ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : <LogIn className="w-4 h-4 mr-1" />}
              Sign In
            </Button>
          </form>
        )}

        {error && <p className="text-sm text-destructive text-center">{error}</p>}

        <p className="text-center text-xs text-muted-foreground pt-1">
          Access is by invitation only. Contact your administrator.
        </p>
      </CardContent>
    </Card>
  );
}
