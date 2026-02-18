import { useState, useEffect } from "react";
import {
  LayoutDashboard, Film, Award, Users, Link2, Settings, Blocks,
  ShieldAlert, CreditCard, Kanban, Map, ScrollText, Brain, Database,
  Trophy, Bell, LogOut, RefreshCw, Menu, ChevronLeft, Shield,
  DollarSign, Zap, Target, ChevronDown, ChevronRight, Search, Globe, Type, MessageSquare,
} from "lucide-react";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { useQuery } from "@tanstack/react-query";
import BoardLoginForm from "@/components/board/BoardLoginForm";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { getRolePermissions, fetchRolePermissions } from "@/components/admin/RolesTab";

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

import EditableCampaignSettings from "@/components/admin/EditableCampaignSettings";
import OrdersTab from "@/components/admin/OrdersTab";
import BlessingsTab from "@/components/admin/BlessingsTab";
import ChallengeTab from "@/components/admin/ChallengeTab";
import MessagingTab from "@/components/admin/MessagingTab";
import CopyManagerTab from "@/components/admin/CopyManagerTab";
import SmsTab from "@/components/admin/SmsTab";
import GamificationTab from "@/components/admin/GamificationTab";
import AffiliatesTab from "@/components/admin/AffiliatesTab";
import WaitlistTab from "@/components/admin/WaitlistTab";
import RolesTab from "@/components/admin/RolesTab";
import ChangelogTab from "@/components/admin/ChangelogTab";
import BudgetControlTab from "@/components/admin/BudgetControlTab";
import GlobalSearchModal from "@/components/admin/GlobalSearchModal";

// ─── Tab definitions ───
const ALL_TAB_IDS = [
  "dashboard", "clippers", "congrats", "experts", "links",
  "campaign", "blocks", "risk", "payments", "board",
  "roadmap", "logs", "forecast", "fraud", "leaderboard",
  "alerts", "budget", "orders", "blessings", "challenge",
  "messaging", "copymanager", "sms", "gamification", "affiliates", "waitlist", "roles", "users",
  "integrations", "database",
] as const;

type TabId = typeof ALL_TAB_IDS[number];

type SidebarItem = { id: TabId; label: string; icon: any };
type SidebarGroup = { group: string; icon: any; items: SidebarItem[] };
type SidebarEntry = SidebarItem | SidebarGroup;

const SIDEBAR_MENU: SidebarEntry[] = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  {
    group: "Creators & Community",
    icon: Users,
    items: [
      { id: "clippers", label: "Clippers", icon: Film },
      { id: "congrats", label: "Congrats", icon: Award },
      { id: "experts", label: "Experts", icon: Users },
      { id: "leaderboard", label: "Leaderboard", icon: Trophy },
      { id: "blessings", label: "Blessings & Creators", icon: Award },
      { id: "affiliates", label: "Affiliate Tiers", icon: Target },
    ],
  },
  {
    group: "Funnel & Content",
    icon: Blocks,
    items: [
      { id: "blocks", label: "Intelligent Blocks", icon: Blocks },
      { id: "campaign", label: "Campaign Settings", icon: Settings },
      { id: "links", label: "Links", icon: Link2 },
      { id: "roadmap", label: "Roadmap", icon: Map },
      { id: "waitlist", label: "Waitlist & Reposts", icon: ScrollText },
    ],
  },
  {
    group: "Finance & Orders",
    icon: DollarSign,
    items: [
      { id: "orders", label: "Orders", icon: CreditCard },
      { id: "payments", label: "Payments", icon: CreditCard },
      { id: "budget", label: "Budget Control", icon: DollarSign },
    ],
  },
  {
    group: "Engagement",
    icon: Zap,
    items: [
      { id: "challenge", label: "Challenge", icon: Target },
      { id: "messaging", label: "Messaging", icon: MessageSquare },
      { id: "copymanager", label: "Copy Manager", icon: Type },
      { id: "sms", label: "SMS Intelligence", icon: Bell },
      { id: "gamification", label: "Gamification (BC)", icon: Award },
    ],
  },
  {
    group: "Risk & Intelligence",
    icon: ShieldAlert,
    items: [
      { id: "risk", label: "Risk Engine", icon: ShieldAlert },
      { id: "fraud", label: "Fraud Monitor", icon: Brain },
      { id: "forecast", label: "Forecast AI", icon: Brain },
      { id: "alerts", label: "Alerts", icon: Bell },
    ],
  },
  {
    group: "Operations",
    icon: Kanban,
    items: [
      { id: "board", label: "Board", icon: Kanban },
      { id: "logs", label: "Logs", icon: ScrollText },
      { id: "database", label: "Database", icon: Database },
      { id: "roles", label: "Roles", icon: Shield },
      { id: "users", label: "Users", icon: Users },
      { id: "integrations", label: "Integrations & API", icon: Globe },
    ],
  },
];

// ─── Tab Router ───
function TabContent({ tab }: { tab: TabId }) {
  switch (tab) {
    case "dashboard": return <DashboardTab />;
    case "clippers": return <ClippersTab />;
    case "congrats": return <CongratsTab />;
    case "experts": return <ExpertsTab />;
    case "links": return <LinksTab />;
    case "campaign": return <EditableCampaignSettings />;
    case "blocks": return <IntelligentBlocksTab />;
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
    case "blessings": return <BlessingsTab />;
    case "challenge": return <ChallengeTab />;
    case "messaging": return <MessagingTab />;
    case "copymanager": return <CopyManagerTab />;
    case "sms": return <SmsTab />;
    case "gamification": return <GamificationTab />;
    case "affiliates": return <AffiliatesTab />;
    case "waitlist": return <WaitlistTab />;
    case "roles": return <RolesTab />;
    case "users": return <UserManagementTab />;
    case "integrations": return <IntegrationsTab />;
    case "database": return <DatabaseTab />;
    default: return null;
  }
}

// ═══════════════════════════════════════════════
// MAIN ADMIN HUB
// ═══════════════════════════════════════════════
export default function AdminHub() {
  const { user, isAdmin, userRole, loading: authLoading, signInWithEmail, signOut } = useAdminAuth();
  const [activeTab, setActiveTab] = useState<TabId>("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({});

  // Preload role permissions from DB
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

  if (authLoading) return <div className="min-h-screen bg-background flex items-center justify-center"><RefreshCw className="w-6 h-6 animate-spin text-primary" /></div>;
  if (!user) return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="max-w-sm w-full">
        <div className="flex items-center justify-center gap-2 mb-6"><Shield className="w-5 h-5 text-primary" /><h1 className="text-lg font-bold text-foreground">Admin Access</h1></div>
        <BoardLoginForm signInWithEmail={signInWithEmail} />
      </div>
    </div>
  );
  if (!isAdmin) return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 text-center">
      <div><Shield className="w-10 h-10 text-destructive mx-auto mb-3" /><h2 className="text-lg font-bold text-foreground mb-1">Access Denied</h2><p className="text-sm text-muted-foreground mb-4">Admin role required.</p><Button variant="outline" onClick={signOut}>Sign Out</Button></div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background flex w-full">
      <GlobalSearchModal />
      {/* Sidebar */}
      <aside className={cn("bg-card border-r border-border/50 flex flex-col transition-all duration-200 shrink-0 sticky top-0 h-screen overflow-y-auto", sidebarOpen ? "w-56" : "w-14")}>
        <div className="flex items-center gap-2 px-3 py-4 border-b border-border/30">
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="text-muted-foreground hover:text-foreground transition-colors">
            {sidebarOpen ? <ChevronLeft className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
          {sidebarOpen && <span className="text-sm font-bold text-foreground truncate flex-1">Growth Intelligence OS</span>}
          <button onClick={() => window.dispatchEvent(new KeyboardEvent("keydown", { key: "k", metaKey: true }))} className="text-muted-foreground hover:text-foreground transition-colors" title="Search (⌘K)">
            <Search className="w-4 h-4" />
          </button>
        </div>
        <nav className="flex-1 py-2 space-y-0.5 px-2">
          {(() => {
            const allowedTabs = userRole === "super_admin" ? null : getRolePermissions(userRole || "user");
            const isAllowed = (id: string) => !allowedTabs || allowedTabs.includes(id);

            return SIDEBAR_MENU.map((entry) => {
              if ("group" in entry) {
                const visibleItems = entry.items.filter(i => isAllowed(i.id));
                if (visibleItems.length === 0) return null;
                const isGroupOpen = openGroups[entry.group] ?? visibleItems.some(i => i.id === activeTab);
                const groupActive = visibleItems.some(i => i.id === activeTab);
                const toggleGroup = () => setOpenGroups(prev => ({ ...prev, [entry.group]: !isGroupOpen }));
                return (
                  <div key={entry.group} className="mt-1">
                    <button onClick={toggleGroup} title={entry.group}
                      className={cn("w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-xs font-semibold transition-colors",
                        groupActive ? "text-primary" : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
                      )}>
                      <entry.icon className="w-4 h-4 shrink-0" />
                      {sidebarOpen && <>
                        <span className="truncate flex-1 text-left">{entry.group}</span>
                        {isGroupOpen ? <ChevronDown className="w-3 h-3 shrink-0" /> : <ChevronRight className="w-3 h-3 shrink-0" />}
                      </>}
                    </button>
                    {(isGroupOpen || !sidebarOpen) && (
                      <div className={cn("space-y-0.5", sidebarOpen ? "ml-4 mt-0.5 border-l border-border/30 pl-2" : "")}>
                        {visibleItems.map(item => (
                          <button key={item.id} onClick={() => setActiveTab(item.id)} title={item.label}
                            className={cn("w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors",
                              activeTab === item.id ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
                            )}>
                            <item.icon className="w-3.5 h-3.5 shrink-0" />
                            {sidebarOpen && <span className="truncate">{item.label}</span>}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                );
              }
              if (!isAllowed(entry.id)) return null;
              return (
                <button key={entry.id} onClick={() => setActiveTab(entry.id)} title={entry.label}
                  className={cn("w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-xs font-medium transition-colors",
                    activeTab === entry.id ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
                  )}>
                  <entry.icon className="w-4 h-4 shrink-0" />
                  {sidebarOpen && <span className="truncate">{entry.label}</span>}
                </button>
              );
            });
          })()}
        </nav>
        <div className="border-t border-border/30 p-3">
          {sidebarOpen && <p className="text-[10px] text-muted-foreground truncate mb-2">{user.email}</p>}
          <Button variant="ghost" size="sm" onClick={signOut} className="w-full justify-start gap-2 text-xs text-muted-foreground">
            <LogOut className="w-3.5 h-3.5" />{sidebarOpen && "Sign Out"}
          </Button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 min-w-0 overflow-y-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
          <TabContent tab={activeTab} />
        </div>
      </main>
    </div>
  );
}
