import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import {
  Users, Search, Key, Eye, EyeOff, ShieldCheck, Crown, Code,
  RefreshCw, Mail, Package, Calendar, Hash, ChevronDown, ChevronUp,
} from "lucide-react";
import AdminSectionDashboard from "../AdminSectionDashboard";

const ROLE_BADGE: Record<string, { label: string; color: string; icon: any }> = {
  super_admin: { label: "Super Admin", color: "bg-amber-500/15 text-amber-400 border-amber-500/30", icon: Crown },
  admin: { label: "Admin", color: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30", icon: ShieldCheck },
  developer: { label: "Developer", color: "bg-blue-500/15 text-blue-400 border-blue-500/30", icon: Code },
};

interface UserRow {
  user_id: string;
  email: string;
  display_name: string | null;
  referral_code: string;
  created_at: string;
  roles: string[];
  orders_count: number;
  blessings_confirmed: number;
}

export default function UserManagementTab() {
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [expandedUser, setExpandedUser] = useState<string | null>(null);
  const [resetPw, setResetPw] = useState<Record<string, string>>({});
  const [showPw, setShowPw] = useState<Record<string, boolean>>({});
  const [roleChange, setRoleChange] = useState<Record<string, string>>({});

  // Fetch all users with roles
  const { data: users = [], isLoading } = useQuery<UserRow[]>({
    queryKey: ["admin-user-management"],
    queryFn: async () => {
      // Get all creator profiles
      const { data: profiles, error: pErr } = await supabase
        .from("creator_profiles")
        .select("user_id, email, display_name, referral_code, created_at, blessings_confirmed")
        .order("created_at", { ascending: false });
      if (pErr) throw pErr;

      // Get all roles
      const { data: roles } = await (supabase.from("user_roles" as any) as any).select("user_id, role");
      const roleMap = new Map<string, string[]>();
      for (const r of roles || []) {
        const arr = roleMap.get(r.user_id) || [];
        arr.push(r.role);
        roleMap.set(r.user_id, arr);
      }

      // Get order counts per email
      const { data: orders } = await supabase
        .from("orders")
        .select("customer_email");
      const orderCount = new Map<string, number>();
      for (const o of orders || []) {
        if (o.customer_email) {
          orderCount.set(o.customer_email, (orderCount.get(o.customer_email) || 0) + 1);
        }
      }

      return (profiles || []).map((p) => ({
        user_id: p.user_id,
        email: p.email,
        display_name: p.display_name,
        referral_code: p.referral_code,
        created_at: p.created_at,
        roles: roleMap.get(p.user_id) || [],
        orders_count: orderCount.get(p.email) || 0,
        blessings_confirmed: p.blessings_confirmed,
      }));
    },
  });

  const filtered = users.filter((u) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      u.email.toLowerCase().includes(q) ||
      (u.display_name || "").toLowerCase().includes(q) ||
      u.referral_code.toLowerCase().includes(q)
    );
  });

  // Reset password mutation
  const resetPassword = useMutation({
    mutationFn: async ({ user_id, new_password }: { user_id: string; new_password: string }) => {
      const { data, error } = await supabase.functions.invoke("manage-user", {
        body: { action: "reset_password", user_id, new_password },
      });
      if (error) throw new Error(error.message || "Failed");
      if (data?.error) throw new Error(data.error);
      return data;
    },
    onSuccess: (_, vars) => {
      toast.success("✅ Password updated");
      setResetPw((p) => ({ ...p, [vars.user_id]: "" }));
      setShowPw((p) => ({ ...p, [vars.user_id]: false }));
    },
    onError: (e: any) => toast.error(e.message),
  });

  // Add role mutation
  const addRole = useMutation({
    mutationFn: async ({ user_id, role }: { user_id: string; role: string }) => {
      const { error } = await (supabase.from("user_roles" as any) as any).insert({ user_id, role });
      if (error) {
        if (error.code === "23505") throw new Error("Already has this role");
        throw error;
      }
    },
    onSuccess: () => {
      toast.success("Role assigned");
      qc.invalidateQueries({ queryKey: ["admin-user-management"] });
      qc.invalidateQueries({ queryKey: ["admin-roles"] });
    },
    onError: (e: any) => toast.error(e.message),
  });

  // Remove role mutation
  const removeRole = useMutation({
    mutationFn: async ({ user_id, role }: { user_id: string; role: string }) => {
      const { error } = await (supabase.from("user_roles" as any) as any)
        .delete()
        .eq("user_id", user_id)
        .eq("role", role);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Role removed");
      qc.invalidateQueries({ queryKey: ["admin-user-management"] });
      qc.invalidateQueries({ queryKey: ["admin-roles"] });
    },
    onError: (e: any) => toast.error(e.message),
  });

  const generatePw = (uid: string) => {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789!@$#";
    let pw = "Reset$";
    for (let i = 0; i < 8; i++) pw += chars[Math.floor(Math.random() * chars.length)];
    setResetPw((p) => ({ ...p, [uid]: pw }));
  };

  const totalUsers = users.length;
  const withRoles = users.filter((u) => u.roles.length > 0).length;
  const withOrders = users.filter((u) => u.orders_count > 0).length;

  return (
    <div className="space-y-6">
      <AdminSectionDashboard
        title="User Management"
        description="Search, view, and manage all users, roles, and credentials"
        kpis={[
          { label: "Total Users", value: totalUsers },
          { label: "With Roles", value: withRoles },
          { label: "With Orders", value: withOrders },
          { label: "Filtered", value: filtered.length },
        ]}
      />

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by email, name, or referral code…"
          className="pl-10 text-sm"
        />
      </div>

      {/* User list */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <RefreshCw className="w-5 h-5 animate-spin text-muted-foreground" />
        </div>
      ) : filtered.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-8">No users found.</p>
      ) : (
        <div className="space-y-2">
          {filtered.slice(0, 100).map((u) => {
            const isExpanded = expandedUser === u.user_id;
            return (
              <div key={u.user_id} className="border border-border/30 rounded-xl bg-card/50 overflow-hidden">
                {/* Summary row */}
                <button
                  onClick={() => setExpandedUser(isExpanded ? null : u.user_id)}
                  className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-secondary/30 transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary shrink-0">
                    {(u.display_name || u.email)[0].toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">
                      {u.display_name || u.email.split("@")[0]}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">{u.email}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {u.roles.map((r) => {
                      const cfg = ROLE_BADGE[r];
                      return cfg ? (
                        <Badge key={r} className={`${cfg.color} text-[10px]`}>{cfg.label}</Badge>
                      ) : null;
                    })}
                    {u.orders_count > 0 && (
                      <Badge variant="outline" className="text-[10px] gap-1">
                        <Package className="w-3 h-3" /> {u.orders_count}
                      </Badge>
                    )}
                    {isExpanded ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
                  </div>
                </button>

                {/* Expanded details */}
                {isExpanded && (
                  <div className="border-t border-border/20 px-4 py-4 space-y-4 bg-secondary/10">
                    {/* Info grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                      <div className="flex items-center gap-1.5 text-muted-foreground">
                        <Mail className="w-3.5 h-3.5" />
                        <span className="truncate">{u.email}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-muted-foreground">
                        <Hash className="w-3.5 h-3.5" />
                        <span className="font-mono">{u.referral_code}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-muted-foreground">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>{new Date(u.created_at).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-muted-foreground">
                        <Users className="w-3.5 h-3.5" />
                        <span>{u.blessings_confirmed} blessings</span>
                      </div>
                    </div>

                    {/* Role management */}
                    <div className="border border-border/20 rounded-lg p-3 space-y-2">
                      <p className="text-xs font-semibold text-foreground">Roles</p>
                      <div className="flex flex-wrap gap-2">
                        {u.roles.length === 0 && (
                          <span className="text-xs text-muted-foreground">No roles assigned</span>
                        )}
                        {u.roles.map((r) => (
                          <Badge key={r} className={`${ROLE_BADGE[r]?.color || "bg-muted"} text-xs gap-1`}>
                            {ROLE_BADGE[r]?.label || r}
                            {r !== "super_admin" && (
                              <button
                                onClick={() => removeRole.mutate({ user_id: u.user_id, role: r })}
                                className="ml-1 hover:text-destructive"
                                title="Remove role"
                              >
                                ×
                              </button>
                            )}
                          </Badge>
                        ))}
                      </div>
                      <div className="flex gap-2 mt-2">
                        <Select
                          value={roleChange[u.user_id] || ""}
                          onValueChange={(v) => setRoleChange((p) => ({ ...p, [u.user_id]: v }))}
                        >
                          <SelectTrigger className="text-xs h-8 w-36">
                            <SelectValue placeholder="Add role…" />
                          </SelectTrigger>
                          <SelectContent>
                            {["admin", "developer"].filter((r) => !u.roles.includes(r)).map((r) => (
                              <SelectItem key={r} value={r} className="text-xs">
                                {ROLE_BADGE[r]?.label || r}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-xs h-8"
                          disabled={!roleChange[u.user_id]}
                          onClick={() => {
                            if (roleChange[u.user_id]) {
                              addRole.mutate({ user_id: u.user_id, role: roleChange[u.user_id] });
                              setRoleChange((p) => ({ ...p, [u.user_id]: "" }));
                            }
                          }}
                        >
                          Assign
                        </Button>
                      </div>
                    </div>

                    {/* Password reset */}
                    <div className="border border-border/20 rounded-lg p-3 space-y-2">
                      <p className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                        <Key className="w-3.5 h-3.5 text-primary" /> Reset Password
                      </p>
                      <div className="flex gap-2">
                        <div className="relative flex-1">
                          <Input
                            type={showPw[u.user_id] ? "text" : "password"}
                            value={resetPw[u.user_id] || ""}
                            onChange={(e) => setResetPw((p) => ({ ...p, [u.user_id]: e.target.value }))}
                            placeholder="New password…"
                            className="text-xs h-8 font-mono pr-8"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPw((p) => ({ ...p, [u.user_id]: !p[u.user_id] }))}
                            className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                          >
                            {showPw[u.user_id] ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                        <Button size="sm" variant="outline" className="text-xs h-8" onClick={() => generatePw(u.user_id)}>
                          Generate
                        </Button>
                        <Button
                          size="sm"
                          className="text-xs h-8"
                          disabled={!resetPw[u.user_id] || resetPw[u.user_id].length < 8 || resetPassword.isPending}
                          onClick={() => resetPassword.mutate({ user_id: u.user_id, new_password: resetPw[u.user_id] })}
                        >
                          {resetPassword.isPending ? <RefreshCw className="w-3 h-3 animate-spin" /> : "Reset"}
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
          {filtered.length > 100 && (
            <p className="text-xs text-muted-foreground text-center py-2">
              Showing 100 of {filtered.length} users. Refine your search.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
