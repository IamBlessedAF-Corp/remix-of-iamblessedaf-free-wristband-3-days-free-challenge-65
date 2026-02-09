import { useState } from "react";
import { Send, Loader2, Check } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const BACKLOG_COL_ID = "a0000001-0001-0001-0001-000000000012";

interface BulkItem {
  title: string;
  detail?: string;
  priority?: string;
}

interface BulkSendToBoardProps {
  items: BulkItem[];
  sectionLabel: string;
}

const from = (table: string) => supabase.from(table as any);

export default function BulkSendToBoard({ items, sectionLabel }: BulkSendToBoardProps) {
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const handleBulkSend = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setSending(true);
    try {
      const rows = items.map((item, idx) => ({
        column_id: BACKLOG_COL_ID,
        title: item.title.length > 100 ? item.title.slice(0, 97) + "..." : item.title,
        description: item.detail || null,
        priority: item.priority || "medium",
        position: 900 + idx,
        labels: ["roadmap-bulk", sectionLabel.toLowerCase().replace(/[^a-z0-9]+/g, "-")],
      }));

      const { error } = await (from("board_cards") as any).insert(rows);
      if (error) throw error;

      setSent(true);
      toast.success(`✅ Sent ${items.length} items to 📦 Backlog!`);
    } catch (err: any) {
      toast.error(`Bulk send failed: ${err.message}`);
    } finally {
      setSending(false);
    }
  };

  if (sent) {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 text-[9px] font-semibold rounded-md bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
        <Check className="w-3 h-3" />
        {items.length} sent to Backlog
      </span>
    );
  }

  return (
    <button
      onClick={handleBulkSend}
      disabled={sending}
      className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[9px] font-semibold rounded-md bg-blue-500/15 text-blue-400 border border-blue-500/30 hover:bg-blue-500/25 transition-colors disabled:opacity-50"
      title={`Send all ${items.length} items to Backlog`}
    >
      {sending ? <Loader2 className="w-3 h-3 animate-spin" /> : <Send className="w-3 h-3" />}
      📦 Send All ({items.length}) to Backlog
    </button>
  );
}
