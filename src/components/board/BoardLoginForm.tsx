import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Loader2, LogIn, Shield, Eye, EyeOff } from "lucide-react";

interface BoardLoginFormProps {
  signInWithEmail: (email: string, password: string) => Promise<{ error?: any }>;
}

export default function BoardLoginForm({ signInWithEmail }: BoardLoginFormProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

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

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-2">
            <Shield className="w-10 h-10 text-primary" />
          </div>
          <CardTitle>Admin Access</CardTitle>
          <CardDescription>Sign in with your credentials</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4" autoComplete="on">
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
            {error && <p className="text-sm text-destructive">{error}</p>}
            <Button type="submit" className="w-full" disabled={submitting}>
              {submitting ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : <LogIn className="w-4 h-4 mr-1" />}
              Sign In
            </Button>
            <p className="text-center text-xs text-muted-foreground">
              Access is by invitation only. Contact your administrator.
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}