import { useState, useEffect } from "react";
import type { BlockSubFilter } from "@/types/adminBlocks";
import { useRealtimeSync } from "@/hooks/useRealtimeSync";
import {
  LayoutDashboard, Film, Award, Users, Link2, Settings, Blocks,
  ShieldAlert, CreditCard, Kanban, Map, ScrollText, Brain, Database,
  Trophy, Bell, LogOut, RefreshCw, Menu, ChevronLeft, Shield,
  DollarSign, Zap, Target, ChevronDown, ChevronRight, Search, Globe, Type, MessageSquare, BarChart3, TrendingUp, ShoppingCart,
  Bug, Video, FileText, Play, Edit3, Scissors, Star, FlaskConical,
} from "lucide-react";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { useQuery } from "@tanstack/react-query";
import BoardLoginForm from "@/components/board/BoardLoginForm";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { getRolePermissions, fetchRolePermissions } from "@/components/admin/RolesTab";
import AlexChat from "@/components/alex/AlexChat";

// Tab imports
import DashboardTab from "@/components/admin/tabs/DashboardTab";
import ClippersTab from "@/components/admin/tabs/ClippersTab";
import CongratsTab from "@/components/admin/tabs/CongratsTab";
import ExpertsTab from "@/components/admin/tabs/ExpertsTab";
import LinksTab from "@/components/admin/tabs/LinksTab";
import IntelligentBlocksTab from "@/components/admin/tabs/IntelligentBlocksTab";
import RiskEngineTab from "@/components/admin/tabs/RiskEngineTab";
import PaymentsTab from "@/components/admin/tabs/PaymentsTab";
import BoardTab from "@/components/admin/tabs/BoardTab";
import RoadmapTab from "@/components/admin/tabs/RoadmapTab";
import ForecastTab from "@/components/admin/tabs/ForecastTab";
import FraudMonitorTab from "@/components/admin/tabs/FraudMonitorTab";
import LeaderboardTab from "@/components/admin/tabs/LeaderboardTab";
import AlertsTab from "@/components/admin/tabs/AlertsTab";
import UserManagementTab from "@/components/admin/tabs/UserManagementTab";
import IntegrationsTab from "@/components/admin/tabs/IntegrationsTab";
import DatabaseTab from "@/components/admin/tabs/DatabaseTab";
import TrafficTab from "@/components/admin/tabs/TrafficTab";
import EditableCampaignSettings from "@/components/admin/EditableCampaignSettings";
import OrdersTab from "@/components/admin/OrdersTab";
import BlessingsTab from "@/components/admin/BlessingsTab";
import ChallengeTab from "@/components/admin/ChallengeTab";
import MessagingTab from "@/components/admin/MessagingTab";
import CopyManagerTab from "@/components/admin/CopyManagerTab";
import SmsTab from "@/components/admin/SmsTab";
import GamificationTab from "@/components/admin/GamificationTab";
import AffiliatesTab from "@/components/admin/AffiliatesTab";
import ReferralAttributionFunnel from "@/components/admin/ReferralAttributionFunnel";
import BackupVerificationPanel from "@/components/admin/BackupVerificationPanel";
import WaitlistTab from "@/components/admin/WaitlistTab";
import RolesTab from "@/components/admin/RolesTab";
import ChangelogTab from "@/components/admin/ChangelogTab";
import BudgetControlTab from "@/components/admin/BudgetControlTab";
import AuditLogTab from "@/components/admin/tabs/AuditLogTab";
import ErrorMonitorTab from "@/components/admin/tabs/ErrorMonitorTab";
import AbandonedCartsTab from "@/components/admin/tabs/AbandonedCartsTab";
import RegressionTestsTab from "@/components/admin/tabs/RegressionTestsTab";
import KFactorDashboard from "@/components/admin/KFactorDashboard";
import GlobalSearchModal from "@/components/admin/GlobalSearchModal";

export type { BlockSubFilter } from "@/types/adminBlocks";

// ─── Tab definitions ───
const ALL_TAB_IDS = [
  "dashboard", "clippers", "congrats", "experts", "links", "traffic", "virality",
  "campaign", "blocks", "risk", "payments", "board",
  "roadmap", "logs", "forecast", "fraud", "leaderboard",
  "alerts", "budget", "orders", "abandonedcarts", "blessings", "challenge",
  "messaging", "copymanager", "sms", "gamification", "affiliates", "referrals", "waitlist", "roles", "users",
  "integrations", "database", "auditlog", "backups", "errors", "regression",
] as const;

type TabId = typeof ALL_TAB_IDS[number];

// ─── Types ───
type SidebarSubTab = { label: string; value: string; icon: any };
type SidebarSubItem = { id: TabId; label: string; icon: any; subTabs?: SidebarSubTab[] };
type SidebarGroupDef = { group: string; icon: any; items: SidebarSubItem[] };
type SidebarSingleItem = { id: TabId; label: string; icon: any };
type SidebarEntry = SidebarSingleItem | SidebarGroupDef;

// ─── Block sub-filter constants ───
const BLOCK_CAT_COUNTS: Record<string, number> = {
  Content: 6, Product: 5, CTA: 6, Hero: 6, Trust: 5, Urgency: 4, Viral: 4, "Value Stack": 5, System: 6,
  clippers: 4, affiliates: 4, retention: 4,
};

const BLOCK_SUB_CATEGORIES: { id: BlockSubFilter; label: string; icon: any }[] = [
  { id: "all", label: `All (${Object.values(BLOCK_CAT_COUNTS).reduce((a, b) => a + b, 0)})`, icon: Blocks },
  { id: "Content", label: `Content (${BLOCK_CAT_COUNTS.Content})`, icon: ScrollText },
  { id: "Product", label: `Product (${BLOCK_CAT_COUNTS.Product})`, icon: Star },
  { id: "CTA", label: `CTA (${BLOCK_CAT_COUNTS.CTA})`, icon: Target },
  { id: "Hero", label: `Hero (${BLOCK_CAT_COUNTS.Hero})`, icon: BarChart3 },
  { id: "Trust", label: `Trust (${BLOCK_CAT_COUNTS.Trust})`, icon: ShieldAlert },
  { id: "Urgency", label: `Urgency (${BLOCK_CAT_COUNTS.Urgency})`, icon: Bell },
  { id: "Viral", label: `Viral (${BLOCK_CAT_COUNTS.Viral})`, icon: TrendingUp },
  { id: "Value Stack", label: `Value Stack (${BLOCK_CAT_COUNTS["Value Stack"]})`, icon: Zap },
  { id: "System", label: `System (${BLOCK_CAT_COUNTS.System})`, icon: Database },
  { id: "clippers", label: `Clippers (${BLOCK_CAT_COUNTS.clippers})`, icon: Film },
  { id: "affiliates", label: `Affiliates (${BLOCK_CAT_COUNTS.affiliates})`, icon: Award },
  { id: "retention", label: `Retention (${BLOCK_CAT_COUNTS.retention})`, icon: Trophy },
];

const VIDEO_BLOCK_SUBS: { id: BlockSubFilter; label: string; icon: any }[] = [
  { id: "video-testimonial-ig", label: "IG Profile Testimonial", icon: Video },
  { id: "video-testimonial-video", label: "Video Testimonial", icon: Play },
  { id: "written-testimonial", label: "Written Testimonial", icon: Edit3 },
  { id: "screenshot-testimonial", label: "Screenshot Testimonial", icon: FileText },
];

const VAULT_SUBS: { id: BlockSubFilter; label: string; icon: any }[] = [
  { id: "vault-editing", label: "Editing Style", icon: Scissors },
  { id: "vault-repost", label: "Ready to Repost", icon: Film },
  { id: "vault-edit", label: "Ready to Edit", icon: Edit3 },
  { id: "vault-clip", label: "Ready to Clip", icon: Scissors },
];

// ─── Sidebar menu structure ───
const SIDEBAR_MENU: SidebarEntry[] = [
  { id: "dashboard", label: "Growth Intelligence Command Center", icon: LayoutDashboard },
  {
    group: "Creators & Community", icon: Users,
    items: [
      { id: "clippers", label: "Clippers", icon: Film },
      { id: "congrats", label: "Congrats", icon: Award },
      { id: "experts", label: "Experts", icon: Users },
      { id: "leaderboard", label: "Leaderboard", icon: Trophy },
      { id: "blessings", label: "Blessings & Creators", icon: Award },
      { id: "affiliates", label: "Affiliate Tiers", icon: Target },
      { id: "referrals", label: "Referral Funnel", icon: TrendingUp },
    ],
  },
  {
    group: "Funnel & Content", icon: Blocks,
    items: [
      { id: "blocks", label: "Intelligent Blocks", icon: Blocks },
      { id: "campaign", label: "Campaign Settings", icon: Settings },
      { id: "links", label: "Links", icon: Link2 },
      { id: "virality", label: "K-Factor / Virality", icon: TrendingUp },
      { id: "traffic", label: "Traffic", icon: BarChart3 },
      { id: "roadmap", label: "Roadmap", icon: Map },
      { id: "waitlist", label: "Waitlist & Reposts", icon: ScrollText },
    ],
  },
  {
    group: "Finance & Orders", icon: DollarSign,
    items: [
      { id: "orders", label: "Orders", icon: CreditCard },
      { id: "abandonedcarts", label: "Abandoned Carts", icon: ShoppingCart },
      { id: "payments", label: "Payments", icon: CreditCard },
      { id: "budget", label: "Budget Control", icon: DollarSign },
    ],
  },
  {
    group: "Engagement", icon: Zap,
    items: [
      {
        id: "challenge", label: "Challenge", icon: Target,
        subTabs: [
          { label: "Overview", value: "overview", icon: LayoutDashboard },
          { label: "Participants", value: "participants", icon: Users },
          { label: "Streaks", value: "streaks", icon: TrendingUp },
        ],
      },
      {
        id: "messaging", label: "Messaging", icon: MessageSquare,
        subTabs: [
          { label: "Engagement Blueprint", value: "blueprint", icon: LayoutDashboard },
          { label: "Messages", value: "messages", icon: MessageSquare },
          { label: "Follow-ups", value: "followups", icon: ChevronRight },
          { label: "TGF Contacts", value: "tgf", icon: Award },
        ],
      },
      { id: "copymanager", label: "Copy Manager", icon: Type },
      { id: "sms", label: "SMS Intelligence", icon: Bell },
      { id: "gamification", label: "Gamification (BC)", icon: Award },
    ],
  },
  {
    group: "Risk & Intelligence", icon: ShieldAlert,
    items: [
      { id: "risk", label: "Risk Engine", icon: ShieldAlert },
      { id: "fraud", label: "Fraud Monitor", icon: Brain },
      { id: "forecast", label: "Forecast AI", icon: Brain },
      { id: "alerts", label: "Alerts", icon: Bell },
    ],
  },
  {
    group: "Operations", icon: Kanban,
    items: [
      { id: "board", label: "Board", icon: Kanban },
      { id: "logs", label: "Logs", icon: ScrollText },
      { id: "database", label: "Database", icon: Database },
      { id: "backups", label: "Backup Verification", icon: ShieldAlert },
      { id: "errors", label: "Error Monitor", icon: Bug },
      { id: "auditlog", label: "Audit Log", icon: ScrollText },
      { id: "regression", label: "Regression Tests", icon: FlaskConical },
      { id: "roles", label: "Roles", icon: Shield },
      { id: "users", label: "Users", icon: Users },
      { id: "integrations", label: "Integrations & API", icon: Globe },
    ],
  },
];

// ─── Tab Router ───
function TabContent({ tab, blockSubFilter }: { tab: TabId; blockSubFilter: BlockSubFilter }) {
  switch (tab) {
    case "dashboard": return <DashboardTab />;
    case "clippers": return <ClippersTab />;
    case "congrats": return <CongratsTab />;
    case "experts": return <ExpertsTab />;
    case "links": return <LinksTab />;
    case "traffic": return <TrafficTab />;
    case "campaign": return <EditableCampaignSettings />;
    case "blocks": return <IntelligentBlocksTab blockSubFilter={blockSubFilter} />;
    case "risk": return <RiskEngineTab />;
    case "payments": return <PaymentsTab />;
    case "board": return <BoardTab />;
    case "roadmap": return <RoadmapTab />;
    case "logs": return <ChangelogTab />;
    case "forecast": return <ForecastTab />;
    case "fraud": return <FraudMonitorTab />;
    case "leaderboard": return <LeaderboardTab />;
    case "alerts": return <AlertsTab />;
    case "budget": return <BudgetControlTab />;
    case "orders": return <OrdersTab />;
    case "abandonedcarts": return <AbandonedCartsTab />;
    case "blessings": return <BlessingsTab />;
    case "challenge": return <ChallengeTab />;
    case "messaging": return <MessagingTab />;
    case "copymanager": return <CopyManagerTab />;
    case "sms": return <SmsTab />;
    case "gamification": return <GamificationTab />;
    case "affiliates": return <AffiliatesTab />;
    case "referrals": return <ReferralAttributionFunnel />;
    case "waitlist": return <WaitlistTab />;
    case "roles": return <RolesTab />;
    case "users": return <UserManagementTab />;
    case "integrations": return <IntegrationsTab />;
    case "database": return <DatabaseTab />;
    case "auditlog": return <AuditLogTab />;
    case "backups": return <BackupVerificationPanel />;
    case "errors": return <ErrorMonitorTab />;
    case "virality": return <KFactorDashboard />;
    case "regression": return <RegressionTestsTab />;
    default: return null;
  }
}

// ═══════════════════════════════════════════════
// MAIN ADMIN HUB
// ═══════════════════════════════════════════════
export default function AdminHub() {
  const { user, isAdmin, userRole, loading: authLoading, signInWithEmail, signInWithGoogle, signInWithApple, signOut } = useAdminAuth();
  const [activeTab, setActiveTab] = useState<TabId>("dashboard");
  const [blockSubFilter, setBlockSubFilter] = useState<BlockSubFilter>("all");
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // All groups pre-expanded by default
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    SIDEBAR_MENU.forEach(entry => { if ("group" in entry) initial[entry.group] = true; });
    return initial;
  });

  // Intelligent Blocks 3rd-level — pre-expanded
  const [openBlocksSub, setOpenBlocksSub] = useState(true);
  const [openVideoBlocksSub, setOpenVideoBlocksSub] = useState(true);
  const [openVaultSub, setOpenVaultSub] = useState(true);

  // Sub-tab expansion state per sidebar item id (e.g. "messaging" -> open/closed)
  const [openSubTabs, setOpenSubTabs] = useState<Record<string, boolean>>({ messaging: true, challenge: true });
  // Active sub-tab per item id
  const [activeSubTabs, setActiveSubTabs] = useState<Record<string, string>>({});

  useRealtimeSync();
  useQuery({ queryKey: ["role-permissions"], queryFn: fetchRolePermissions });

  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (detail?.tab && ALL_TAB_IDS.includes(detail.tab)) {
        setActiveTab(detail.tab as TabId);
        for (const entry of SIDEBAR_MENU) {
          if ("group" in entry && entry.items.some(i => i.id === detail.tab)) {
            setOpenGroups(prev => ({ ...prev, [entry.group]: true }));
          }
        }
      }
    };
    window.addEventListener("admin-navigate-tab", handler);
    return () => window.removeEventListener("admin-navigate-tab", handler);
  }, []);

  if (authLoading) return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <RefreshCw className="w-6 h-6 animate-spin text-primary" />
    </div>
  );

  if (!user) return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="max-w-sm w-full">
        <div className="flex items-center justify-center gap-2 mb-6">
          <Shield className="w-5 h-5 text-primary" />
          <h1 className="text-lg font-bold text-foreground">Admin Access</h1>
        </div>
        <BoardLoginForm signInWithEmail={signInWithEmail} signInWithGoogle={signInWithGoogle} signInWithApple={signInWithApple} />
      </div>
    </div>
  );

  if (!isAdmin) return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 text-center">
      <div>
        <Shield className="w-10 h-10 text-destructive mx-auto mb-3" />
        <h2 className="text-lg font-bold text-foreground mb-1">Access Denied</h2>
        <p className="text-sm text-muted-foreground mb-4">Admin role required.</p>
        <Button variant="outline" onClick={signOut}>Sign Out</Button>
      </div>
    </div>
  );

  const goToBlock = (sub: BlockSubFilter) => {
    setBlockSubFilter(sub);
    setActiveTab("blocks");
    setOpenGroups(prev => ({ ...prev, "Funnel & Content": true }));
    setOpenBlocksSub(true);
  };

  const allowedTabs = userRole === "super_admin" ? null : getRolePermissions(userRole || "user");
  const isAllowed = (id: string) => !allowedTabs || allowedTabs.includes(id);

  return (
    <div className="min-h-screen bg-background flex w-full">
      <GlobalSearchModal />

      {/* ── Sidebar ── */}
      <aside className={cn(
        "bg-card border-r border-border/50 flex flex-col transition-all duration-200 shrink-0 sticky top-0 h-screen overflow-y-auto",
        sidebarOpen ? "w-64" : "w-14"
      )}>
        {/* Header */}
        <div className="flex items-center gap-2 px-3 py-4 border-b border-border/30">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            {sidebarOpen ? <ChevronLeft className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
          {sidebarOpen && (
            <span className="text-sm font-bold text-foreground truncate flex-1">Growth Intelligence OS</span>
          )}
          <button
            onClick={() => window.dispatchEvent(new KeyboardEvent("keydown", { key: "k", metaKey: true }))}
            className="text-muted-foreground hover:text-foreground transition-colors"
            title="Search (⌘K)"
          >
            <Search className="w-4 h-4" />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 py-2 px-1.5 space-y-0.5">
          {SIDEBAR_MENU.map((entry) => {
            // ── Single top-level item ──
            if (!("group" in entry)) {
              if (!isAllowed(entry.id)) return null;
              return (
                <button
                  key={entry.id}
                  onClick={() => setActiveTab(entry.id)}
                  title={entry.label}
                  className={cn(
                    "w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-xs font-semibold transition-colors text-left",
                    activeTab === entry.id
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
                  )}
                >
                  <entry.icon className="w-4 h-4 shrink-0" />
                  {sidebarOpen && <span className="truncate">{entry.label}</span>}
                </button>
              );
            }

            // ── Group ──
            const visibleItems = entry.items.filter(i => isAllowed(i.id));
            if (visibleItems.length === 0) return null;

            const isGroupOpen = openGroups[entry.group] ?? true;
            const groupActive = visibleItems.some(i => i.id === activeTab);
            const isFunnelGroup = entry.group === "Funnel & Content";

            return (
              <div key={entry.group} className="mt-1">
                {/* Group header */}
                <button
                  onClick={() => setOpenGroups(prev => ({ ...prev, [entry.group]: !isGroupOpen }))}
                  title={entry.group}
                  className={cn(
                    "w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-xs font-semibold transition-colors text-left",
                    groupActive ? "text-primary" : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
                  )}
                >
                  <entry.icon className="w-4 h-4 shrink-0" />
                  {sidebarOpen && (
                    <>
                      <span className="truncate flex-1">{entry.group}</span>
                      {isGroupOpen
                        ? <ChevronDown className="w-3 h-3 shrink-0" />
                        : <ChevronRight className="w-3 h-3 shrink-0" />}
                    </>
                  )}
                </button>

                {/* Group items */}
                {isGroupOpen && (
                  <div className={cn("space-y-0.5", sidebarOpen ? "ml-3 mt-0.5 border-l border-border/30 pl-2" : "")}>
                    {visibleItems.map(item => {
                      const isBlocksItem = item.id === "blocks" && isFunnelGroup;
                      const hasSubTabs = !isBlocksItem && item.subTabs && item.subTabs.length > 0;
                      const isSubTabsOpen = openSubTabs[item.id] ?? true;
                      const activeSubTab = activeSubTabs[item.id];

                      const handleSubTabClick = (subValue: string) => {
                        setActiveTab(item.id);
                        setActiveSubTabs(prev => ({ ...prev, [item.id]: subValue }));
                        window.dispatchEvent(new CustomEvent("admin-set-subtab", { detail: { tabId: item.id, subTab: subValue } }));
                      };

                      return (
                        <div key={item.id}>
                          {/* Level-2 item */}
                          <button
                            onClick={() => {
                              setActiveTab(item.id);
                              if (isBlocksItem) setOpenBlocksSub(prev => !prev);
                              if (hasSubTabs) setOpenSubTabs(prev => ({ ...prev, [item.id]: !isSubTabsOpen }));
                            }}
                            title={item.label}
                            className={cn(
                              "w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors text-left",
                              activeTab === item.id
                                ? "bg-primary/10 text-primary"
                                : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
                            )}
                          >
                            <item.icon className="w-3.5 h-3.5 shrink-0" />
                            {sidebarOpen && <span className="truncate flex-1">{item.label}</span>}
                            {sidebarOpen && isBlocksItem && (
                              openBlocksSub
                                ? <ChevronDown className="w-3 h-3 shrink-0" />
                                : <ChevronRight className="w-3 h-3 shrink-0" />
                            )}
                            {sidebarOpen && hasSubTabs && (
                              isSubTabsOpen
                                ? <ChevronDown className="w-3 h-3 shrink-0" />
                                : <ChevronRight className="w-3 h-3 shrink-0" />
                            )}
                          </button>

                          {/* ── Level-3: Generic sub-tabs (Messaging, Challenge, etc.) ── */}
                          {sidebarOpen && hasSubTabs && isSubTabsOpen && activeTab === item.id && (
                            <div className="ml-3 mt-0.5 border-l border-border/20 pl-2 space-y-0.5">
                              {item.subTabs!.map(sub => (
                                <button
                                  key={sub.value}
                                  onClick={() => handleSubTabClick(sub.value)}
                                  className={cn(
                                    "w-full flex items-center gap-2 px-2 py-1 rounded-md text-[10px] font-medium transition-colors text-left",
                                    activeSubTab === sub.value
                                      ? "bg-primary/15 text-primary"
                                      : "text-muted-foreground hover:text-foreground hover:bg-secondary/40"
                                  )}
                                >
                                  <sub.icon className="w-3 h-3 shrink-0" />
                                  <span className="truncate">{sub.label}</span>
                                </button>
                              ))}
                            </div>
                          )}

                          {/* ── Level-3: Intelligent Blocks sub-categories ── */}
                          {sidebarOpen && isBlocksItem && openBlocksSub && (
                            <div className="ml-3 mt-0.5 border-l border-border/20 pl-2 space-y-0.5">

                              {/* Standard block categories */}
                              {BLOCK_SUB_CATEGORIES.map(sub => (
                                <button
                                  key={sub.id}
                                  onClick={() => goToBlock(sub.id)}
                                  className={cn(
                                    "w-full flex items-center gap-2 px-2 py-1 rounded-md text-[10px] font-medium transition-colors text-left",
                                    blockSubFilter === sub.id && activeTab === "blocks"
                                      ? "bg-primary/15 text-primary"
                                      : "text-muted-foreground hover:text-foreground hover:bg-secondary/40"
                                  )}
                                >
                                  <sub.icon className="w-3 h-3 shrink-0" />
                                  <span className="truncate">{sub.label}</span>
                                </button>
                              ))}

                              {/* Video Blocks sub-group */}
                              <button
                                onClick={() => setOpenVideoBlocksSub(p => !p)}
                                className="w-full flex items-center gap-2 px-2 py-1 rounded-md text-[10px] font-semibold text-muted-foreground hover:text-foreground hover:bg-secondary/40 transition-colors mt-1 text-left"
                              >
                                <Video className="w-3 h-3 shrink-0 text-purple-400" />
                                <span className="flex-1">Video Blocks</span>
                                {openVideoBlocksSub
                                  ? <ChevronDown className="w-2.5 h-2.5" />
                                  : <ChevronRight className="w-2.5 h-2.5" />}
                              </button>
                              {openVideoBlocksSub && (
                                <div className="ml-3 border-l border-border/20 pl-2 space-y-0.5">
                                  {VIDEO_BLOCK_SUBS.map(sub => (
                                    <button
                                      key={sub.id}
                                      onClick={() => goToBlock(sub.id)}
                                      className={cn(
                                        "w-full flex items-center gap-2 px-2 py-1 rounded-md text-[10px] font-medium transition-colors text-left",
                                        blockSubFilter === sub.id && activeTab === "blocks"
                                          ? "bg-primary/15 text-primary"
                                          : "text-muted-foreground hover:text-foreground hover:bg-secondary/40"
                                      )}
                                    >
                                      <sub.icon className="w-2.5 h-2.5 shrink-0" />
                                      <span className="truncate">{sub.label}</span>
                                    </button>
                                  ))}
                                </div>
                              )}

                              {/* Vault Videos sub-group */}
                              <button
                                onClick={() => setOpenVaultSub(p => !p)}
                                className="w-full flex items-center gap-2 px-2 py-1 rounded-md text-[10px] font-semibold text-muted-foreground hover:text-foreground hover:bg-secondary/40 transition-colors mt-1 text-left"
                              >
                                <Film className="w-3 h-3 shrink-0 text-amber-500" />
                                <span className="flex-1">Vault Videos</span>
                                {openVaultSub
                                  ? <ChevronDown className="w-2.5 h-2.5" />
                                  : <ChevronRight className="w-2.5 h-2.5" />}
                              </button>
                              {openVaultSub && (
                                <div className="ml-3 border-l border-border/20 pl-2 space-y-0.5">
                                  {VAULT_SUBS.map(sub => (
                                    <button
                                      key={sub.id}
                                      onClick={() => goToBlock(sub.id)}
                                      className={cn(
                                        "w-full flex items-center gap-2 px-2 py-1 rounded-md text-[10px] font-medium transition-colors text-left",
                                        blockSubFilter === sub.id && activeTab === "blocks"
                                          ? "bg-primary/15 text-primary"
                                          : "text-muted-foreground hover:text-foreground hover:bg-secondary/40"
                                      )}
                                    >
                                      <sub.icon className="w-2.5 h-2.5 shrink-0" />
                                      <span className="truncate">{sub.label}</span>
                                    </button>
                                  ))}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="border-t border-border/30 p-3">
          {sidebarOpen && <p className="text-[10px] text-muted-foreground truncate mb-2">{user.email}</p>}
          <Button variant="ghost" size="sm" onClick={signOut} className="w-full justify-start gap-2 text-xs text-muted-foreground">
            <LogOut className="w-3.5 h-3.5" />{sidebarOpen && "Sign Out"}
          </Button>
        </div>
      </aside>

      {/* ── Main content ── */}
      <main className="flex-1 min-w-0 overflow-y-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
          <TabContent tab={activeTab} blockSubFilter={blockSubFilter} />
        </div>
      </main>
      <AlexChat />
    </div>
  );
}
