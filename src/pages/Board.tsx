import { useState, useMemo } from "react";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { useBoard } from "@/hooks/useBoard";
import { useAutoExecute } from "@/hooks/useAutoExecute";
import KanbanBoard from "@/components/board/KanbanBoard";
import PipelineControls from "@/components/board/PipelineControls";
import BoardLoginForm from "@/components/board/BoardLoginForm";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Loader2, LogOut, LayoutDashboard, Shield, Search, X } from "lucide-react";

const Board = () => {
  const { user, isAdmin, loading, signInWithEmail, signOut } = useAdminAuth();
  const board = useBoard();
  const autoExec = useAutoExecute(board.refetch);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredCards = useMemo(() => {
    if (!searchQuery.trim()) return board.cards;
    const q = searchQuery.toLowerCase();
    return board.cards.filter(
      (c) =>
        c.title.toLowerCase().includes(q) ||
        c.description?.toLowerCase().includes(q) ||
        c.summary?.toLowerCase().includes(q) ||
        c.labels?.some((l) => l.toLowerCase().includes(q)) ||
        c.priority?.toLowerCase().includes(q)
    );
  }, [board.cards, searchQuery]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) return <BoardLoginForm signInWithEmail={signInWithEmail} />;

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-sm text-center">
          <CardHeader>
            <Shield className="w-10 h-10 text-destructive mx-auto mb-2" />
            <CardTitle>Access Denied</CardTitle>
            <CardDescription>You need admin privileges to access this board.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" onClick={signOut}>
              <LogOut className="w-4 h-4 mr-1" /> Sign Out
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card px-3 py-2 sm:px-4 sm:py-3 space-y-2">
        {/* Row 1: Title + user */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 flex-shrink-0">
            <LayoutDashboard className="w-5 h-5 text-primary flex-shrink-0" />
            <h1 className="text-sm sm:text-lg font-bold text-foreground truncate">Dev Board</h1>
          </div>
          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
            <Input
              type="text"
              placeholder="Search cards..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-8 pl-8 pr-8 text-xs bg-background"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <span className="text-[10px] sm:text-xs text-muted-foreground truncate max-w-[120px] sm:max-w-none">
              {user.email}
            </span>
            <Button variant="ghost" size="icon" className="h-7 w-7 sm:h-8 sm:w-8" onClick={signOut}>
              <LogOut className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </Button>
          </div>
        </div>

        {/* Row 2: Pipeline Controls */}
        <PipelineControls
          columns={board.columns}
          isRunning={autoExec.isRunning}
          currentPhase={autoExec.currentPhase}
          currentCardTitle={autoExec.currentCardTitle}
          processedCount={autoExec.processedCount}
          onExecute={autoExec.execute}
          onStop={autoExec.stop}
        />
      </header>

      <main className="pt-2 sm:pt-4">
        <KanbanBoard
          isAdmin={isAdmin}
          columns={board.columns}
          cards={filteredCards}
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
