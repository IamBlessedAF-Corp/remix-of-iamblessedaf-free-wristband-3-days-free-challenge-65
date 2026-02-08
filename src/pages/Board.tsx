import { useState } from "react";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { useBoard } from "@/hooks/useBoard";
import { useAutoExecute } from "@/hooks/useAutoExecute";
import KanbanBoard from "@/components/board/KanbanBoard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, LogIn, LogOut, LayoutDashboard, Shield, Eye, EyeOff, Play, Square, Zap } from "lucide-react";

const Board = () => {
  const { user, isAdmin, loading, signInWithEmail, signOut } = useAdminAuth();
  const board = useBoard();
  const autoExec = useAutoExecute(board.refetch);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState("");
  const [selectedSourceColumn, setSelectedSourceColumn] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (isSignUp && password !== confirmPassword) {
      setError("Passwords don't match");
      return;
    }
    setSubmitting(true);

    if (isSignUp) {
      const { supabase } = await import("@/integrations/supabase/client");
      const { error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: { emailRedirectTo: `${window.location.origin}/board` },
      });
      if (signUpError) {
        setError(signUpError.message);
      }
    } else {
      const result = await signInWithEmail(email, password);
      if (result.error) {
        setError(typeof result.error === "object" && "message" in result.error
          ? (result.error as any).message
          : "Login failed");
      }
    }
    setSubmitting(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  // Not logged in — show login form
  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-sm">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-2">
              <Shield className="w-10 h-10 text-primary" />
            </div>
            <CardTitle>Admin Board</CardTitle>
            <CardDescription>{isSignUp ? "Create your account" : "Sign in with your credentials"}</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="password">Password</Label>
                <div className="relative mt-1">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
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
              {isSignUp && (
                <div>
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <div className="relative mt-1">
                    <Input
                      id="confirmPassword"
                      type={showPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
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
              )}
              {error && <p className="text-sm text-destructive">{error}</p>}
              <Button type="submit" className="w-full" disabled={submitting}>
                {submitting ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-1" />
                ) : (
                  <LogIn className="w-4 h-4 mr-1" />
                )}
                {isSignUp ? "Create Account" : "Sign In"}
              </Button>
              <button
                type="button"
                className="w-full text-center text-sm text-muted-foreground hover:text-foreground transition-colors"
                onClick={() => { setIsSignUp(!isSignUp); setError(""); }}
              >
                {isSignUp ? "Already have an account? Sign in" : "Need an account? Sign up"}
              </button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Logged in but not admin
  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-sm text-center">
          <CardHeader>
            <Shield className="w-10 h-10 text-destructive mx-auto mb-2" />
            <CardTitle>Access Denied</CardTitle>
            <CardDescription>
              You need admin privileges to access this board.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" onClick={signOut}>
              <LogOut className="w-4 h-4 mr-1" />
              Sign Out
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleStartAutoExec = () => {
    if (!selectedSourceColumn) return;
    autoExec.execute(selectedSourceColumn);
  };

  // Admin — show the board
  return (
    <div className="min-h-screen bg-background">
      {/* Top bar — stacks vertically on mobile */}
      <header className="border-b border-border bg-card px-3 py-2 sm:px-4 sm:py-3 space-y-2 sm:space-y-0 sm:flex sm:items-center sm:justify-between">
        {/* Row 1: Title + user */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <LayoutDashboard className="w-5 h-5 text-primary flex-shrink-0" />
            <h1 className="text-sm sm:text-lg font-bold text-foreground truncate">
              Dev Board
            </h1>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <span className="text-[10px] sm:text-xs text-muted-foreground truncate max-w-[120px] sm:max-w-none">
              {user.email}
            </span>
            <Button variant="ghost" size="icon" className="h-7 w-7 sm:h-8 sm:w-8" onClick={signOut}>
              <LogOut className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </Button>
          </div>
        </div>

        {/* Row 2: Auto-Execute Controls */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          {autoExec.isRunning ? (
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <div className="flex items-center gap-2 text-xs flex-1 min-w-0">
                <Loader2 className="w-3.5 h-3.5 animate-spin text-primary flex-shrink-0" />
                <span className="text-muted-foreground truncate">
                  {autoExec.currentCardTitle || "Processing..."}
                </span>
                <span className="font-mono text-primary flex-shrink-0">{autoExec.processedCount}</span>
              </div>
              <Button variant="destructive" size="sm" onClick={autoExec.stop} className="flex-shrink-0">
                <Square className="w-3 h-3 mr-1" />
                Stop
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Select value={selectedSourceColumn} onValueChange={setSelectedSourceColumn}>
                <SelectTrigger className="flex-1 sm:w-[200px] h-9 text-xs bg-background">
                  <SelectValue placeholder="Pick source column..." />
                </SelectTrigger>
                <SelectContent className="z-50 bg-popover">
                  {board.columns.map((col) => (
                    <SelectItem key={col.id} value={col.id} className="text-xs">
                      {col.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                size="sm"
                onClick={handleStartAutoExec}
                disabled={!selectedSourceColumn}
                className="gap-1 flex-shrink-0 h-9"
              >
                <Zap className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Auto-Execute</span>
                <span className="sm:hidden">Run</span>
              </Button>
            </div>
          )}
        </div>
      </header>

      {/* Board */}
      <main className="pt-2 sm:pt-4">
        <KanbanBoard
          isAdmin={isAdmin}
          columns={board.columns}
          cards={board.cards}
          loading={board.loading}
          moveCard={board.moveCard}
          updateCard={board.updateCard}
          createCard={board.createCard}
          deleteCard={board.deleteCard}
        />
      </main>
    </div>
  );
};

export default Board;
