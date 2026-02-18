import { useState, useEffect, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandSeparator,
} from "@/components/ui/command";
import {
  LayoutDashboard, Film, Award, Users, Link2, Settings, Blocks,
  ShieldAlert, CreditCard, Kanban, Map, ScrollText, Brain,
  Trophy, Bell, Shield, DollarSign, Zap, Target, Search,
  Mail, User, ExternalLink, Package,
} from "lucide-react";

// ── Tab definitions for navigation search ──
const TAB_ENTRIES = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "clippers", label: "Clippers", icon: Film },
  { id: "congrats", label: "Congrats", icon: Award },
  { id: "experts", label: "Experts", icon: Users },
  { id: "links", label: "Links", icon: Link2 },
  { id: "campaign", label: "Campaign Settings", icon: Settings },
  { id: "blocks", label: "Intelligent Blocks", icon: Blocks },
  { id: "risk", label: "Risk Engine", icon: ShieldAlert },
  { id: "payments", label: "Payments", icon: CreditCard },
  { id: "board", label: "Board", icon: Kanban },
  { id: "roadmap", label: "Roadmap", icon: Map },
  { id: "logs", label: "Logs", icon: ScrollText },
  { id: "forecast", label: "Forecast AI", icon: Brain },
  { id: "fraud", label: "Fraud Monitor", icon: Brain },
  { id: "leaderboard", label: "Leaderboard", icon: Trophy },
  { id: "alerts", label: "Alerts", icon: Bell },
  { id: "budget", label: "Budget Control", icon: DollarSign },
  { id: "orders", label: "Orders", icon: CreditCard },
  { id: "blessings", label: "Blessings & Creators", icon: Award },
  { id: "challenge", label: "Challenge & Messaging", icon: Target },
  { id: "sms", label: "SMS Intelligence", icon: Bell },
  { id: "gamification", label: "Gamification (BC)", icon: Award },
  { id: "affiliates", label: "Affiliate Tiers", icon: Target },
  { id: "waitlist", label: "Waitlist & Reposts", icon: ScrollText },
  { id: "roles", label: "Roles", icon: Shield },
  { id: "users", label: "Users", icon: Users },
];

function navigateToTab(tabId: string) {
  window.dispatchEvent(new CustomEvent("admin-navigate-tab", { detail: { tab: tabId } }));
}

export default function GlobalSearchModal() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebounced(query, 300);
  const hasQuery = debouncedQuery.trim().length >= 2;

  // Keyboard shortcut
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen(prev => !prev);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  // ── DB searches (only when query length >= 2) ──
  const { data: orders = [] } = useQuery({
    queryKey: ["admin-search-orders", debouncedQuery],
    queryFn: async () => {
      const { data } = await supabase
        .from("orders")
        .select("id, customer_email, tier, amount_cents, status")
        .or(`customer_email.ilike.%${debouncedQuery}%,tier.ilike.%${debouncedQuery}%`)
        .limit(5);
      return data || [];
    },
    enabled: hasQuery,
  });

  const { data: creators = [] } = useQuery({
    queryKey: ["admin-search-creators", debouncedQuery],
    queryFn: async () => {
      const { data } = await supabase
        .from("creator_profiles")
        .select("id, display_name, email, referral_code")
        .or(`email.ilike.%${debouncedQuery}%,display_name.ilike.%${debouncedQuery}%,referral_code.ilike.%${debouncedQuery}%`)
        .limit(5);
      return data || [];
    },
    enabled: hasQuery,
  });

  const { data: clips = [] } = useQuery({
    queryKey: ["admin-search-clips", debouncedQuery],
    queryFn: async () => {
      const { data } = await supabase
        .from("clip_submissions")
        .select("id, clip_url, platform, status, view_count")
        .or(`clip_url.ilike.%${debouncedQuery}%,platform.ilike.%${debouncedQuery}%`)
        .limit(5);
      return data || [];
    },
    enabled: hasQuery,
  });

  const { data: waitlist = [] } = useQuery({
    queryKey: ["admin-search-waitlist", debouncedQuery],
    queryFn: async () => {
      const { data } = await supabase
        .from("smart_wristband_waitlist")
        .select("id, email, first_name")
        .or(`email.ilike.%${debouncedQuery}%,first_name.ilike.%${debouncedQuery}%`)
        .limit(5);
      return data || [];
    },
    enabled: hasQuery,
  });

  const select = (tabId: string) => {
    navigateToTab(tabId);
    setOpen(false);
    setQuery("");
  };

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput placeholder="Search tabs, orders, creators, clips…" value={query} onValueChange={setQuery} />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>

        {/* Tab navigation */}
        <CommandGroup heading="Navigate">
          {TAB_ENTRIES.map(t => (
            <CommandItem key={t.id} value={`tab-${t.label}`} onSelect={() => select(t.id)}>
              <t.icon className="mr-2 h-4 w-4 text-muted-foreground" />
              <span>{t.label}</span>
            </CommandItem>
          ))}
        </CommandGroup>

        {/* Orders */}
        {orders.length > 0 && (
          <>
            <CommandSeparator />
            <CommandGroup heading="Orders">
              {orders.map(o => (
                <CommandItem key={o.id} value={`order-${o.customer_email}-${o.id}`} onSelect={() => select("orders")}>
                  <Package className="mr-2 h-4 w-4 text-muted-foreground" />
                  <span className="flex-1 truncate">{o.customer_email || "—"}</span>
                  <span className="text-xs text-muted-foreground ml-2">{o.tier} · ${(o.amount_cents / 100).toFixed(0)}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          </>
        )}

        {/* Creators */}
        {creators.length > 0 && (
          <>
            <CommandSeparator />
            <CommandGroup heading="Creators">
              {creators.map(c => (
                <CommandItem key={c.id} value={`creator-${c.email}-${c.id}`} onSelect={() => select("blessings")}>
                  <User className="mr-2 h-4 w-4 text-muted-foreground" />
                  <span className="flex-1 truncate">{c.display_name || c.email}</span>
                  <span className="text-xs text-muted-foreground ml-2">{c.referral_code}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          </>
        )}

        {/* Clips */}
        {clips.length > 0 && (
          <>
            <CommandSeparator />
            <CommandGroup heading="Clips">
              {clips.map(c => (
                <CommandItem key={c.id} value={`clip-${c.clip_url}-${c.id}`} onSelect={() => select("clippers")}>
                  <ExternalLink className="mr-2 h-4 w-4 text-muted-foreground" />
                  <span className="flex-1 truncate text-xs">{c.clip_url}</span>
                  <span className="text-xs text-muted-foreground ml-2">{c.platform} · {(c.view_count || 0).toLocaleString()} views</span>
                </CommandItem>
              ))}
            </CommandGroup>
          </>
        )}

        {/* Waitlist */}
        {waitlist.length > 0 && (
          <>
            <CommandSeparator />
            <CommandGroup heading="Waitlist">
              {waitlist.map(w => (
                <CommandItem key={w.id} value={`waitlist-${w.email}-${w.id}`} onSelect={() => select("waitlist")}>
                  <Mail className="mr-2 h-4 w-4 text-muted-foreground" />
                  <span className="flex-1 truncate">{w.first_name || "—"}</span>
                  <span className="text-xs text-muted-foreground ml-2">{w.email}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          </>
        )}
      </CommandList>
    </CommandDialog>
  );
}

// ── Tiny debounce hook ──
function useDebounced(value: string, ms: number) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), ms);
    return () => clearTimeout(t);
  }, [value, ms]);
  return debounced;
}
