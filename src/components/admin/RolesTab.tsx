import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { Shield, Plus, Trash2, Users, Crown, Code, ShieldCheck, Mail, UserPlus, Loader2, Key, Eye, EyeOff, Save, Settings2 } from "lucide-react";
import AdminSectionDashboard from "./AdminSectionDashboard";

const ROLE_CONFIG: Record<string, { label: string; color: string; icon: any; description: string }> = {
  super_admin: { label: "Super Admin", color: "bg-amber-500/15 text-amber-400 border-amber-500/30", icon: Crown, description: "Full access to everything." },
  admin: { label: "Admin", color: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30", icon: ShieldCheck, description: "Configurable admin access." },
  developer: { label: "Developer", color: "bg-blue-500/15 text-blue-400 border-blue-500/30", icon: Code, description: "Configurable developer access." },
  user: { label: "User", color: "bg-muted text-muted-foreground border-border/30", icon: Users, description: "Standard portal user." },
};

const ASSIGNABLE_ROLES = ["admin", "developer", "user"];

// All admin sections for the permission matrix
const ALL_SECTIONS = [
  { id: "dashboard", label: "Dashboard", group: "General" },
  { id: "clippers", label: "Clippers", group: "Creators & Community" },
  { id: "congrats", label: "Congrats", group: "Creators & Community" },
  { id: "experts", label: "Experts", group: "Creators & Community" },
  { id: "leaderboard", label: "Leaderboard", group: "Creators & Community" },
  { id: "blessings", label: "Blessings & Creators", group: "Creators & Community" },
  { id: "affiliates", label: "Affiliate Tiers", group: "Creators & Community" },
  { id: "blocks", label: "Intelligent Blocks", group: "Funnel & Content" },
  { id: "campaign", label: "Campaign Settings", group: "Funnel & Content" },
  { id: "links", label: "Links", group: "Funnel & Content" },
  { id: "roadmap", label: "Roadmap", group: "Funnel & Content" },
  { id: "waitlist", label: "Waitlist & Reposts", group: "Funnel & Content" },
  { id: "orders", label: "Orders", group: "Finance & Orders" },
  { id: "payments", label: "Payments", group: "Finance & Orders" },
  { id: "budget", label: "Budget Control", group: "Finance & Orders" },
  { id: "challenge", label: "Challenge & Messaging", group: "Engagement" },
  { id: "sms", label: "SMS Intelligence", group: "Engagement" },
  { id: "gamification", label: "Gamification (BC)", group: "Engagement" },
  { id: "risk", label: "Risk Engine", group: "Risk & Intelligence" },
  { id: "fraud", label: "Fraud Monitor", group: "Risk & Intelligence" },
  { id: "forecast", label: "Forecast AI", group: "Risk & Intelligence" },
  { id: "alerts", label: "Alerts", group: "Risk & Intelligence" },
  { id: "board", label: "Board", group: "Operations" },
  { id: "logs", label: "Logs", group: "Operations" },
  { id: "roles", label: "Roles", group: "Operations" },
];

// Default permissions per role
const DEFAULT_PERMISSIONS: Record<string, string[]> = {
  super_admin: ALL_SECTIONS.map(s => s.id), // everything
  admin: ALL_SECTIONS.map(s => s.id).filter(id => id !== "roles"), // everything except roles
  developer: ["dashboard", "board", "logs", "links", "roadmap", "blocks", "campaign", "forecast"],
  user: [],
};

// Store permissions in localStorage (could be DB but keeps it simple)
const STORAGE_KEY = "admin_role_permissions";

function getStoredPermissions(): Record<string, string[]> {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return JSON.parse(stored);
  } catch { /* ignore */ }
  return { ...DEFAULT_PERMISSIONS };
}

function savePermissions(perms: Record<string, string[]>) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(perms));
}

export function getRolePermissions(role: string): string[] {
  const perms = getStoredPermissions();
  return perms[role] || DEFAULT_PERMISSIONS[role] || [];
}

export default function RolesTab() {
  const qc = useQueryClient();
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteName, setInviteName] = useState("");
  const [invitePhone, setInvitePhone] = useState("");
  const [inviteRole, setInviteRole] = useState("developer");
  const [invitePassword, setInvitePassword] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newRole, setNewRole] = useState("admin");
  const [editingPermRole, setEditingPermRole] = useState<string | null>(null);
  const [permissions, setPermissions] = useState<Record<string, string[]>>(getStoredPermissions());
  const [resetUserId, setResetUserId] = useState<string | null>(null);
  const [newPassword, setNewPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showResetPassword, setShowResetPassword] = useState(false);

  const { data: roles = [], isLoading } = useQuery({
    queryKey: ["admin-roles"],
    queryFn: async () => {
      const { data, error } = await (supabase.from("user_roles" as any) as any).select("*");
      if (error) throw error;
      const userIds = (data || []).map((r: any) => r.user_id);
      const { data: profiles } = await supabase.from("creator_profiles").select("user_id, email, display_name").in("user_id", userIds);
      const profileMap = new Map((profiles || []).map(p => [p.user_id, p]));
      return (data || []).map((r: any) => ({
        ...r,
        email: profileMap.get(r.user_id)?.email || "Unknown",
        display_name: profileMap.get(r.user_id)?.display_name || null,
      }));
    },
  });

  const inviteUser = useMutation({
    mutationFn: async (params: { email: string; password: string; role: string; display_name: string; phone: string }) => {
      const { data, error } = await supabase.functions.invoke("invite-user", { body: params });
      if (error) throw new Error(error.message || "Failed to invite user");
      if (data?.error) throw new Error(data.error);
      return data;
    },
    onSuccess: (data) => {
      toast.success(`✅ ${data.email} invited as ${data.role}`);
      qc.invalidateQueries({ queryKey: ["admin-roles"] });
      setInviteEmail(""); setInviteName(""); setInvitePhone(""); setInvitePassword("");
    },
    onError: (e: any) => toast.error(e.message),
  });

  const addRole = useMutation({
    mutationFn: async ({ email, role }: { email: string; role: string }) => {
      const { data: profile, error: pErr } = await supabase
        .from("creator_profiles").select("user_id").eq("email", email).maybeSingle();
      if (pErr || !profile) throw new Error("User not found with that email.");
      const { error } = await (supabase.from("user_roles" as any) as any).insert({ user_id: profile.user_id, role });
      if (error) {
        if (error.code === "23505") throw new Error("This user already has that role.");
        throw error;
      }
    },
    onSuccess: () => { toast.success("Role assigned"); qc.invalidateQueries({ queryKey: ["admin-roles"] }); setNewEmail(""); },
    onError: (e: any) => toast.error(e.message),
  });

  const removeRole = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await (supabase.from("user_roles" as any) as any).delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { toast.success("Role removed"); qc.invalidateQueries({ queryKey: ["admin-roles"] }); },
    onError: (e: any) => toast.error(e.message),
  });

  const resetPassword = useMutation({
    mutationFn: async ({ user_id, new_password }: { user_id: string; new_password: string }) => {
      const { data, error } = await supabase.functions.invoke("manage-user", {
        body: { action: "reset_password", user_id, new_password },
      });
      if (error) throw new Error(error.message || "Failed to reset password");
      if (data?.error) throw new Error(data.error);
      return data;
    },
    onSuccess: () => {
      toast.success("✅ Password updated successfully");
      setResetUserId(null); setNewPassword(""); setShowResetPassword(false);
    },
    onError: (e: any) => toast.error(e.message),
  });

  const generatePassword = () => {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789!@$#";
    let pw = "Blessed$";
    for (let i = 0; i < 8; i++) pw += chars[Math.floor(Math.random() * chars.length)];
    setInvitePassword(pw);
  };

  const generateResetPassword = () => {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789!@$#";
    let pw = "Reset$";
    for (let i = 0; i < 8; i++) pw += chars[Math.floor(Math.random() * chars.length)];
    setNewPassword(pw);
  };

  const togglePermission = (role: string, sectionId: string) => {
    setPermissions(prev => {
      const current = prev[role] || [];
      const updated = current.includes(sectionId)
        ? current.filter(s => s !== sectionId)
        : [...current, sectionId];
      return { ...prev, [role]: updated };
    });
  };

  const saveRolePermissions = (role: string) => {
    savePermissions(permissions);
    toast.success(`✅ Permissions for ${ROLE_CONFIG[role]?.label || role} saved`);
    setEditingPermRole(null);
  };

  const resetToDefaults = (role: string) => {
    setPermissions(prev => ({ ...prev, [role]: DEFAULT_PERMISSIONS[role] || [] }));
  };

  const superAdminCount = roles.filter((r: any) => r.role === "super_admin").length;
  const adminCount = roles.filter((r: any) => r.role === "admin").length;
  const devCount = roles.filter((r: any) => r.role === "developer").length;

  const groups = [...new Set(ALL_SECTIONS.map(s => s.group))];

  return (
    <div className="space-y-6">
      <AdminSectionDashboard
        title="Role & Permission Management"
        description="Manage user roles, permissions per section, and credentials"
        kpis={[
          { label: "Super Admins", value: superAdminCount },
          { label: "Admins", value: adminCount },
          { label: "Developers", value: devCount },
          { label: "Total Roles", value: roles.length },
        ]}
      />

      {/* Role cards with edit permissions button */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {Object.entries(ROLE_CONFIG).map(([key, cfg]) => {
          const Icon = cfg.icon;
          const permCount = (permissions[key] || []).length;
          return (
            <div key={key} className="border border-border/30 rounded-xl p-4 bg-card/50">
              <div className="flex items-center gap-2 mb-2">
                <Icon className="w-4 h-4 text-primary" />
                <Badge className={cfg.color}>{cfg.label}</Badge>
              </div>
              <p className="text-xs text-muted-foreground mb-2">{cfg.description}</p>
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-muted-foreground">{permCount}/{ALL_SECTIONS.length} sections</span>
                {key !== "super_admin" && key !== "user" && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-[10px] h-6 px-2 gap-1"
                    onClick={() => setEditingPermRole(editingPermRole === key ? null : key)}
                  >
                    <Settings2 className="w-3 h-3" />
                    {editingPermRole === key ? "Close" : "Edit Permissions"}
                  </Button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Permission matrix editor */}
      {editingPermRole && (
        <div className="border border-primary/30 rounded-xl p-5 bg-primary/5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <Settings2 className="w-4 h-4 text-primary" />
              Edit Permissions: {ROLE_CONFIG[editingPermRole]?.label}
            </h3>
            <div className="flex gap-2">
              <Button size="sm" variant="ghost" className="text-xs" onClick={() => resetToDefaults(editingPermRole)}>
                Reset to Defaults
              </Button>
              <Button size="sm" className="gap-1 text-xs" onClick={() => saveRolePermissions(editingPermRole)}>
                <Save className="w-3 h-3" /> Save Permissions
              </Button>
            </div>
          </div>
          <div className="space-y-4">
            {groups.map(group => {
              const secs = ALL_SECTIONS.filter(s => s.group === group);
              const rolePerms = permissions[editingPermRole] || [];
              return (
                <div key={group}>
                  <p className="text-xs font-semibold text-muted-foreground mb-2">{group}</p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
                    {secs.map(sec => (
                      <label key={sec.id} className="flex items-center gap-2 text-xs cursor-pointer bg-card/50 border border-border/20 rounded-lg px-3 py-2 hover:bg-secondary/30 transition-colors">
                        <Switch
                          checked={rolePerms.includes(sec.id)}
                          onCheckedChange={() => togglePermission(editingPermRole, sec.id)}
                          className="scale-75"
                        />
                        <span className={rolePerms.includes(sec.id) ? "text-foreground" : "text-muted-foreground"}>
                          {sec.label}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Invite new user */}
      <div className="border border-primary/30 rounded-xl p-5 bg-primary/5">
        <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
          <UserPlus className="w-4 h-4 text-primary" /> Invite New Team Member
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Full Name</label>
            <Input value={inviteName} onChange={e => setInviteName(e.target.value)} placeholder="Diana Surita" className="text-sm" />
          </div>
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Email</label>
            <Input value={inviteEmail} onChange={e => setInviteEmail(e.target.value)} placeholder="user@example.com" className="text-sm" />
          </div>
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Phone (optional)</label>
            <Input value={invitePhone} onChange={e => setInvitePhone(e.target.value)} placeholder="+573025880823" className="text-sm" />
          </div>
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Role</label>
            <Select value={inviteRole} onValueChange={setInviteRole}>
              <SelectTrigger className="text-sm"><SelectValue /></SelectTrigger>
              <SelectContent>
                {ASSIGNABLE_ROLES.map(r => (
                  <SelectItem key={r} value={r}>{ROLE_CONFIG[r]?.label || r}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="sm:col-span-2">
            <label className="text-xs text-muted-foreground mb-1 block">Temporary Password</label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Input
                  type={showPassword ? "text" : "password"}
                  value={invitePassword}
                  onChange={e => setInvitePassword(e.target.value)}
                  placeholder="Click generate →"
                  className="text-sm font-mono pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <Button size="sm" variant="outline" onClick={generatePassword} type="button">Generate</Button>
            </div>
          </div>
        </div>
        <div className="mt-4">
          <Button
            onClick={() => inviteUser.mutate({ email: inviteEmail, password: invitePassword, role: inviteRole, display_name: inviteName, phone: invitePhone })}
            disabled={!inviteEmail || !invitePassword || !inviteName || inviteUser.isPending}
            className="gap-2"
          >
            {inviteUser.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Mail className="w-4 h-4" />}
            Create Account & Send Invitation
          </Button>
        </div>
      </div>

      {/* Assign role to existing user */}
      <div className="border border-border/30 rounded-xl p-4 bg-card/50">
        <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
          <Plus className="w-4 h-4" /> Assign Role to Existing User
        </h3>
        <div className="flex gap-2 items-end flex-wrap">
          <div className="flex-1 min-w-[200px]">
            <label className="text-xs text-muted-foreground mb-1 block">User Email</label>
            <Input value={newEmail} onChange={e => setNewEmail(e.target.value)} placeholder="user@example.com" className="text-sm" />
          </div>
          <div className="w-40">
            <label className="text-xs text-muted-foreground mb-1 block">Role</label>
            <Select value={newRole} onValueChange={setNewRole}>
              <SelectTrigger className="text-sm"><SelectValue /></SelectTrigger>
              <SelectContent>
                {ASSIGNABLE_ROLES.map(r => (
                  <SelectItem key={r} value={r}>{ROLE_CONFIG[r]?.label || r}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button size="sm" onClick={() => addRole.mutate({ email: newEmail, role: newRole })} disabled={!newEmail || addRole.isPending}>
            <Plus className="w-3 h-3 mr-1" /> Assign
          </Button>
        </div>
      </div>

      {/* Roles list with password management */}
      <div className="border border-border/30 rounded-xl bg-card/50 overflow-hidden">
        <div className="px-4 py-3 border-b border-border/20">
          <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
            <Shield className="w-4 h-4" /> Active Roles ({roles.length})
          </h3>
        </div>
        <div className="divide-y divide-border/20">
          {isLoading ? (
            <p className="text-sm text-muted-foreground p-4">Loading...</p>
          ) : roles.length === 0 ? (
            <p className="text-sm text-muted-foreground p-4">No roles assigned.</p>
          ) : (
            roles.map((r: any) => {
              const cfg = ROLE_CONFIG[r.role] || ROLE_CONFIG.user;
              const Icon = cfg.icon;
              const isSuperAdmin = r.role === "super_admin";
              const isResetOpen = resetUserId === r.user_id;
              return (
                <div key={r.id}>
                  <div className="flex items-center gap-3 px-4 py-3 hover:bg-secondary/20 transition-colors">
                    <Icon className="w-4 h-4 text-muted-foreground shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{r.display_name || r.email}</p>
                      <p className="text-[11px] text-muted-foreground truncate">{r.email} · {r.user_id.substring(0, 8)}...</p>
                    </div>
                    <Badge className={cfg.color}>{cfg.label}</Badge>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-muted-foreground hover:text-foreground"
                      onClick={() => { setResetUserId(isResetOpen ? null : r.user_id); setNewPassword(""); setShowResetPassword(false); }}
                      title="Reset password"
                    >
                      <Key className="w-3 h-3" />
                    </Button>
                    {!isSuperAdmin && (
                      <Button size="sm" variant="ghost" className="text-destructive hover:text-destructive"
                        onClick={() => removeRole.mutate(r.id)} disabled={removeRole.isPending}>
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    )}
                  </div>
                  {isResetOpen && (
                    <div className="px-4 pb-3 flex gap-2 items-end bg-secondary/10">
                      <div className="flex-1">
                        <label className="text-[10px] text-muted-foreground mb-1 block">New Password for {r.display_name || r.email}</label>
                        <div className="relative">
                          <Input
                            type={showResetPassword ? "text" : "password"}
                            value={newPassword}
                            onChange={e => setNewPassword(e.target.value)}
                            placeholder="Enter new password"
                            className="text-sm font-mono pr-10"
                          />
                          <button type="button" onClick={() => setShowResetPassword(!showResetPassword)}
                            className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                            {showResetPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      </div>
                      <Button size="sm" variant="outline" onClick={generateResetPassword} type="button" className="text-xs">Generate</Button>
                      <Button
                        size="sm"
                        onClick={() => resetPassword.mutate({ user_id: r.user_id, new_password: newPassword })}
                        disabled={!newPassword || newPassword.length < 8 || resetPassword.isPending}
                        className="gap-1"
                      >
                        {resetPassword.isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : <Key className="w-3 h-3" />}
                        Update
                      </Button>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
