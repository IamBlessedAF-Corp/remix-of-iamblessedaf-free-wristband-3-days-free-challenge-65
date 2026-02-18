import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import AdminSectionDashboard from "./AdminSectionDashboard";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RefreshCw, MessageSquare, Calendar, Heart, Mail, LayoutDashboard, FileDown } from "lucide-react";
import ExportCsvButton from "./ExportCsvButton";
import { Button } from "@/components/ui/button";
import EngagementBlueprintPanel from "./EngagementBlueprintPanel";

export default function MessagingTab() {
  const [activeTab, setActiveTab] = useState("blueprint");
  const { data: messages = [], isLoading } = useQuery({
    queryKey: ["admin-scheduled-messages"],
    queryFn: async () => {
      const { data } = await supabase.from("scheduled_gratitude_messages").select("*").order("created_at", { ascending: false }).limit(200);
      return data || [];
    },
  });

  const { data: followups = [] } = useQuery({
    queryKey: ["admin-followups"],
    queryFn: async () => {
      const { data } = await supabase.from("followup_sequences").select("*").order("created_at", { ascending: false }).limit(200);
      return data || [];
    },
  });

  const { data: tgfContacts = [] } = useQuery({
    queryKey: ["admin-tgf-contacts"],
    queryFn: async () => {
      const { data } = await supabase.from("tgf_friday_contacts").select("*").order("created_at", { ascending: false }).limit(200);
      return data || [];
    },
  });

  const sentMsgs = messages.filter(m => m.status === "sent").length;
  const pendingMsgs = messages.filter(m => m.status === "draft" || m.status === "scheduled").length;
  const sentFollowups = followups.filter(f => f.status === "sent").length;

  if (isLoading) return <div className="flex justify-center py-20"><RefreshCw className="w-6 h-6 animate-spin text-primary" /></div>;

  return (
    <div className="space-y-4">
      <AdminSectionDashboard
        title="Messaging Hub"
        description="Scheduled gratitude messages, follow-up sequences, TGF Friday contacts, and communication logs"
        kpis={[
          { label: "Total Messages", value: messages.length },
          { label: "Sent", value: sentMsgs },
          { label: "Pending", value: pendingMsgs },
          { label: "Follow-ups", value: followups.length },
          { label: "Follow-ups Sent", value: sentFollowups },
          { label: "TGF Contacts", value: tgfContacts.length },
        ]}
      />

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="blueprint" className="gap-1 text-xs"><LayoutDashboard className="w-3.5 h-3.5" /> Engagement Blueprint</TabsTrigger>
            <TabsTrigger value="messages" className="gap-1 text-xs"><MessageSquare className="w-3.5 h-3.5" /> Messages</TabsTrigger>
            <TabsTrigger value="followups" className="gap-1 text-xs"><Calendar className="w-3.5 h-3.5" /> Follow-ups</TabsTrigger>
            <TabsTrigger value="tgf" className="gap-1 text-xs"><Heart className="w-3.5 h-3.5" /> TGF Contacts</TabsTrigger>
          </TabsList>
          {activeTab === "blueprint" && (
            <Button
              size="sm"
              variant="outline"
              className="gap-1.5 text-xs h-8"
              onClick={() => {
                const el = document.getElementById("engagement-blueprint-content");
                if (!el) return;
                const printWindow = window.open("", "_blank");
                if (!printWindow) return;
                printWindow.document.write(`
                  <html><head><title>Engagement Blueprint</title>
                  <style>
                    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; padding: 24px; color: #1a1a1a; background: #fff; }
                    table { width: 100%; border-collapse: collapse; margin-bottom: 16px; font-size: 11px; }
                    th, td { border: 1px solid #ddd; padding: 6px 8px; text-align: left; }
                    th { background: #f5f5f5; font-weight: 600; text-transform: uppercase; font-size: 9px; letter-spacing: 0.5px; }
                    h1 { font-size: 18px; margin-bottom: 4px; }
                    h2 { font-size: 14px; margin: 16px 0 8px; }
                    .badge { display: inline-block; padding: 2px 6px; border-radius: 4px; font-size: 9px; font-weight: 600; background: #f0f0f0; }
                    @media print { body { padding: 0; } }
                  </style></head><body>
                  <h1>📋 Engagement Blueprint</h1>
                  <p style="color:#666;font-size:12px;margin-bottom:20px;">Generated ${new Date().toLocaleString()}</p>
                  ${el.innerHTML}
                  <script>window.onload=function(){window.print();}<\/script>
                  </body></html>
                `);
                printWindow.document.close();
              }}
            >
              <FileDown className="w-3.5 h-3.5" />
              Download PDF
            </Button>
          )}
          {activeTab === "messages" && (
            <ExportCsvButton data={messages.map(m => ({ friend_name: m.friend_name, day_number: m.day_number, message_body: m.message_body, status: m.status, scheduled_send_at: m.scheduled_send_at }))} filename="messages.csv" columns={["friend_name", "day_number", "message_body", "status", "scheduled_send_at"]} />
          )}
          {activeTab === "followups" && (
            <ExportCsvButton data={followups.map(f => ({ type: f.sequence_type, channel: f.channel, step: f.step_number, status: f.status, scheduled_at: f.scheduled_at, sent_at: f.sent_at || "" }))} filename="followups.csv" columns={["type", "channel", "step", "status", "scheduled_at", "sent_at"]} />
          )}
          {activeTab === "tgf" && (
            <ExportCsvButton data={tgfContacts.map((c: any) => ({ friend_name: c.friend_name, send_count: c.send_count, last_sent_at: c.last_sent_at || "", referral_link: c.referral_link || "" }))} filename="tgf-contacts.csv" columns={["friend_name", "send_count", "last_sent_at", "referral_link"]} />
          )}
        </div>

        <TabsContent value="blueprint">
          <div id="engagement-blueprint-content">
            <EngagementBlueprintPanel />
          </div>
        </TabsContent>

        <TabsContent value="messages">
          <div className="bg-card border border-border/40 rounded-xl overflow-x-auto">
            <table className="w-full text-xs">
              <thead><tr className="text-[10px] text-muted-foreground uppercase tracking-wider border-b border-border/20 bg-secondary/30">
                <th className="text-left py-2 px-3">Friend</th><th className="text-left py-2 px-3">Day</th><th className="text-left py-2 px-3">Message</th>
                <th className="text-left py-2 px-3">Status</th><th className="text-left py-2 px-3">Scheduled</th>
              </tr></thead>
              <tbody className="divide-y divide-border/10">
                {messages.slice(0, 100).map(m => (
                  <tr key={m.id} className="hover:bg-secondary/20">
                    <td className="py-2 px-3 font-medium">{m.friend_name}</td>
                    <td className="py-2 px-3">{m.day_number}</td>
                    <td className="py-2 px-3 text-muted-foreground max-w-[200px] truncate">{m.message_body}</td>
                    <td className="py-2 px-3"><Badge variant="outline" className="text-[10px]">{m.status}</Badge></td>
                    <td className="py-2 px-3 text-muted-foreground">{m.scheduled_send_at ? new Date(m.scheduled_send_at).toLocaleString() : "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </TabsContent>

        <TabsContent value="followups">
          <div className="bg-card border border-border/40 rounded-xl overflow-x-auto">
            <table className="w-full text-xs">
              <thead><tr className="text-[10px] text-muted-foreground uppercase tracking-wider border-b border-border/20 bg-secondary/30">
                <th className="text-left py-2 px-3">Type</th><th className="text-left py-2 px-3">Channel</th><th className="text-left py-2 px-3">Step</th>
                <th className="text-left py-2 px-3">Status</th><th className="text-left py-2 px-3">Scheduled</th><th className="text-left py-2 px-3">Sent</th>
              </tr></thead>
              <tbody className="divide-y divide-border/10">
                {followups.slice(0, 100).map(f => (
                  <tr key={f.id} className="hover:bg-secondary/20">
                    <td className="py-2 px-3 font-medium">{f.sequence_type}</td>
                    <td className="py-2 px-3"><Badge variant="outline" className="text-[10px]">{f.channel}</Badge></td>
                    <td className="py-2 px-3">{f.step_number}</td>
                    <td className="py-2 px-3"><Badge variant="outline" className="text-[10px]">{f.status}</Badge></td>
                    <td className="py-2 px-3 text-muted-foreground">{new Date(f.scheduled_at).toLocaleString()}</td>
                    <td className="py-2 px-3 text-muted-foreground">{f.sent_at ? new Date(f.sent_at).toLocaleString() : "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </TabsContent>

        <TabsContent value="tgf">
          <div className="bg-card border border-border/40 rounded-xl overflow-x-auto">
            <table className="w-full text-xs">
              <thead><tr className="text-[10px] text-muted-foreground uppercase tracking-wider border-b border-border/20 bg-secondary/30">
                <th className="text-left py-2 px-3">Friend Name</th><th className="text-right py-2 px-3">Send Count</th>
                <th className="text-left py-2 px-3">Last Sent</th><th className="text-left py-2 px-3">Referral Link</th>
              </tr></thead>
              <tbody className="divide-y divide-border/10">
                {tgfContacts.slice(0, 100).map(c => (
                  <tr key={c.id} className="hover:bg-secondary/20">
                    <td className="py-2 px-3 font-medium">{c.friend_name}</td>
                    <td className="py-2 px-3 text-right font-bold">{c.send_count}</td>
                    <td className="py-2 px-3 text-muted-foreground">{c.last_sent_at ? new Date(c.last_sent_at).toLocaleString() : "—"}</td>
                    <td className="py-2 px-3 text-muted-foreground text-[10px] truncate max-w-[150px]">{c.referral_link || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
