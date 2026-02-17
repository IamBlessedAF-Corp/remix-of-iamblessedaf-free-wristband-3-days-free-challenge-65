import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import AdminSectionDashboard from "./AdminSectionDashboard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { RefreshCw, Pencil, CheckCircle, X, MessageSquare, Users, Calendar, Heart } from "lucide-react";

export default function ChallengeTab() {
  const qc = useQueryClient();

  const { data: participants = [], isLoading: pLoad } = useQuery({
    queryKey: ["admin-challenge-participants"],
    queryFn: async () => {
      const { data } = await supabase.from("challenge_participants").select("*").order("created_at", { ascending: false }).limit(200);
      return data || [];
    },
  });

  const { data: messages = [] } = useQuery({
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

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editVal, setEditVal] = useState("");

  const handleUpdateStatus = async (id: string) => {
    const { error } = await (supabase.from("challenge_participants") as any).update({ challenge_status: editVal }).eq("id", id);
    if (error) return toast.error("Failed");
    toast.success("Updated");
    setEditingId(null);
    qc.invalidateQueries({ queryKey: ["admin-challenge-participants"] });
  };

  const active = participants.filter(p => p.challenge_status === "active").length;
  const completed = participants.filter(p => p.challenge_status === "completed").length;
  const sentMsgs = messages.filter(m => m.status === "sent").length;

  if (pLoad) return <div className="flex justify-center py-20"><RefreshCw className="w-6 h-6 animate-spin text-primary" /></div>;

  return (
    <div className="space-y-4">
      <AdminSectionDashboard
        title="Challenge & Messaging"
        description="Gratitude challenge participants, scheduled messages, follow-ups, TGF contacts"
        kpis={[
          { label: "Participants", value: participants.length },
          { label: "Active", value: active },
          { label: "Completed", value: completed },
          { label: "Messages", value: messages.length },
          { label: "Sent", value: sentMsgs },
          { label: "Follow-ups", value: followups.length },
          { label: "TGF Contacts", value: tgfContacts.length },
        ]}
      />

      <Tabs defaultValue="participants" className="space-y-4">
        <TabsList>
          <TabsTrigger value="participants" className="gap-1 text-xs"><Users className="w-3.5 h-3.5" /> Participants</TabsTrigger>
          <TabsTrigger value="messages" className="gap-1 text-xs"><MessageSquare className="w-3.5 h-3.5" /> Messages</TabsTrigger>
          <TabsTrigger value="followups" className="gap-1 text-xs"><Calendar className="w-3.5 h-3.5" /> Follow-ups</TabsTrigger>
          <TabsTrigger value="tgf" className="gap-1 text-xs"><Heart className="w-3.5 h-3.5" /> TGF Contacts</TabsTrigger>
        </TabsList>

        <TabsContent value="participants">
          <div className="bg-card border border-border/40 rounded-xl overflow-x-auto">
            <table className="w-full text-xs">
              <thead><tr className="text-[10px] text-muted-foreground uppercase tracking-wider border-b border-border/20 bg-secondary/30">
                <th className="text-left py-2 px-3">Name</th><th className="text-left py-2 px-3">Phone</th><th className="text-left py-2 px-3">Friends</th>
                <th className="text-right py-2 px-3">Streak</th><th className="text-left py-2 px-3">Status</th><th className="text-left py-2 px-3">Date</th><th className="py-2 px-3"></th>
              </tr></thead>
              <tbody className="divide-y divide-border/10">
                {participants.map(p => (
                  <tr key={p.id} className="hover:bg-secondary/20">
                    <td className="py-2 px-3 font-medium">{p.display_name || "—"}</td>
                    <td className="py-2 px-3 text-muted-foreground font-mono">{p.phone}</td>
                    <td className="py-2 px-3 text-muted-foreground">{[p.friend_1_name, p.friend_2_name, p.friend_3_name].filter(Boolean).join(", ")}</td>
                    <td className="py-2 px-3 text-right font-bold">{p.current_streak || 0} 🔥</td>
                    <td className="py-2 px-3">
                      {editingId === p.id ? (
                        <Select value={editVal} onValueChange={setEditVal}>
                          <SelectTrigger className="h-7 w-24 text-[10px]"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pending">pending</SelectItem>
                            <SelectItem value="active">active</SelectItem>
                            <SelectItem value="completed">completed</SelectItem>
                            <SelectItem value="paused">paused</SelectItem>
                          </SelectContent>
                        </Select>
                      ) : (
                        <Badge variant="outline" className="text-[10px]">{p.challenge_status || "pending"}</Badge>
                      )}
                    </td>
                    <td className="py-2 px-3 text-muted-foreground">{p.created_at ? new Date(p.created_at).toLocaleDateString() : "—"}</td>
                    <td className="py-2 px-3">
                      {editingId === p.id ? (
                        <div className="flex gap-1">
                          <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => handleUpdateStatus(p.id)}><CheckCircle className="w-3 h-3 text-emerald-400" /></Button>
                          <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => setEditingId(null)}><X className="w-3 h-3" /></Button>
                        </div>
                      ) : (
                        <Button size="icon" variant="ghost" className="h-6 w-6 opacity-50 hover:opacity-100" onClick={() => { setEditingId(p.id); setEditVal(p.challenge_status || "pending"); }}>
                          <Pencil className="w-3 h-3" />
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
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
