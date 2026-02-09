import { useState } from "react";
import { Cpu, Send, Loader2, Check, ChevronDown } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const IDEAS_COL_ID = "a0000001-0001-0001-0001-000000000002";
const BACKLOG_COL_ID = "a0000001-0001-0001-0001-000000000012";

interface RoadmapItemActionsProps {
  title: string;
  detail?: string;
  phaseName: string;
}

// Helper to cast table names for new tables not yet in generated types
const from = (table: string) => supabase.from(table as any);

function generateMasterPrompt(title: string, detail: string, phaseName: string): string {
  return `🧠 ETHEREUM MASTER DEVELOPER — EXECUTION PROMPT

📌 TASK: ${title}
📂 PHASE: ${phaseName}
📝 CONTEXT: ${detail}

─── INSTRUCTIONS ───
Acting as the Ethereum Master Developer agent with full autonomy:

1. ANALYZE the current codebase for related implementations
2. IDENTIFY all files, hooks, components, edge functions, and DB tables affected
3. PLAN the implementation with a Six Sigma quality approach:
   - Define acceptance criteria
   - List all dependencies and blockers
   - Estimate delegation score (VS/CC/HU/R/AD)
4. IMPLEMENT with:
   - TypeScript strict mode, no \`any\` types
   - Semantic Tailwind tokens from design system
   - Proper RLS policies for any new tables
   - Edge function error handling with proper CORS
   - Mobile-first responsive design
5. VALIDATE:
   - Test edge cases and error states
   - Verify RLS policies work correctly
   - Check mobile viewport rendering
   - Confirm no regression on existing features
6. DOCUMENT:
   - Update the 📚 Documentation card on the board
   - Add inline JSDoc comments for complex logic

─── HORMOZI GROWTH LENS ───
- How does this increase LTV?
- How does this reduce CAC?
- How does this improve K-factor?
- Does this create a moat or competitive advantage?

Execute with conviction. Ship fast, ship right.`;
}

export default function RoadmapItemActions({ title, detail, phaseName }: RoadmapItemActionsProps) {
  const [showPrompt, setShowPrompt] = useState(false);
  const [showSendMenu, setShowSendMenu] = useState(false);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const prompt = generateMasterPrompt(title, detail || "", phaseName);

  const handleCopyPrompt = async () => {
    try {
      await navigator.clipboard.writeText(prompt);
      setCopied(true);
      toast.success("Master prompt copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Failed to copy — try selecting manually");
    }
  };

  const handleSendToBoard = async (columnId: string, columnName: string) => {
    setSending(true);
    setShowSendMenu(false);
    try {
      const { error } = await (from("board_cards") as any).insert({
        column_id: columnId,
        title: title.length > 100 ? title.slice(0, 97) + "..." : title,
        description: detail || null,
        master_prompt: prompt,
        priority: "medium",
        position: 999,
        labels: ["roadmap-generated"],
      });

      if (error) throw error;

      setSent(columnName);
      toast.success(`✅ Sent to ${columnName}!`);
    } catch (err: any) {
      toast.error(`Failed to send: ${err.message}`);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="flex items-center gap-1.5 mt-1.5">
      {/* Generate Master Prompt Button */}
      <button
        onClick={(e) => { e.stopPropagation(); setShowPrompt(!showPrompt); }}
        className="inline-flex items-center gap-1 px-2 py-1 text-[9px] font-semibold rounded-md bg-purple-500/15 text-purple-400 border border-purple-500/30 hover:bg-purple-500/25 transition-colors"
        title="Generate Ethereum Developer Master Prompt"
      >
        <Cpu className="w-3 h-3" />
        Generate Master Prompt
      </button>

      {/* Send to Board Button */}
      <div className="relative">
        {sent ? (
          <span className="inline-flex items-center gap-1 px-2 py-1 text-[9px] font-semibold rounded-md bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
            <Check className="w-3 h-3" />
            Sent to {sent}
          </span>
        ) : (
          <button
            onClick={(e) => { e.stopPropagation(); setShowSendMenu(!showSendMenu); }}
            disabled={sending}
            className="inline-flex items-center gap-1 px-2 py-1 text-[9px] font-semibold rounded-md bg-blue-500/15 text-blue-400 border border-blue-500/30 hover:bg-blue-500/25 transition-colors disabled:opacity-50"
            title="Send to board column"
          >
            {sending ? (
              <Loader2 className="w-3 h-3 animate-spin" />
            ) : (
              <Send className="w-3 h-3" />
            )}
            Send to Board
            <ChevronDown className="w-2.5 h-2.5" />
          </button>
        )}

        {/* Dropdown */}
        {showSendMenu && (
          <div className="absolute left-0 top-full mt-1 z-30 bg-card border border-border rounded-lg shadow-xl overflow-hidden animate-in fade-in slide-in-from-top-1 duration-100">
            <button
              onClick={(e) => { e.stopPropagation(); handleSendToBoard(IDEAS_COL_ID, "💡 Ideas"); }}
              className="w-full flex items-center gap-2 px-3 py-2 text-[11px] text-foreground hover:bg-secondary/50 transition-colors whitespace-nowrap"
            >
              💡 Send to Ideas
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); handleSendToBoard(BACKLOG_COL_ID, "📦 Backlog"); }}
              className="w-full flex items-center gap-2 px-3 py-2 text-[11px] text-foreground hover:bg-secondary/50 transition-colors whitespace-nowrap border-t border-border/30"
            >
              📦 Send to Backlog
            </button>
          </div>
        )}
      </div>

      {/* Master Prompt Expanded */}
      {showPrompt && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          onClick={() => setShowPrompt(false)}
        >
          <div
            className="bg-card border border-border rounded-xl shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col animate-in fade-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-5 py-3 border-b border-border/50">
              <div className="flex items-center gap-2">
                <Cpu className="w-4 h-4 text-purple-400" />
                <h3 className="text-sm font-bold text-foreground">Ethereum Master Developer Prompt</h3>
              </div>
              <button
                onClick={handleCopyPrompt}
                className={`px-3 py-1.5 text-[10px] font-semibold rounded-md transition-colors ${
                  copied
                    ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                    : "bg-primary/10 text-primary border border-primary/30 hover:bg-primary/20"
                }`}
              >
                {copied ? "✓ Copied!" : "📋 Copy Prompt"}
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-5">
              <pre className="text-[11px] text-muted-foreground whitespace-pre-wrap font-mono leading-relaxed">
                {prompt}
              </pre>
            </div>
            <div className="px-5 py-3 border-t border-border/50 flex justify-end">
              <button
                onClick={() => setShowPrompt(false)}
                className="px-4 py-1.5 text-xs font-medium rounded-md bg-secondary text-foreground hover:bg-secondary/80 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
