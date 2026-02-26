import { useState } from "react";
import {
  LayoutDashboard, Eye, BarChart3, Layers, AlertCircle,
  CheckSquare, Calendar, Users, UserCheck, FileText,
  LogOut, RefreshCw, Menu, ChevronLeft, Shield,
} from "lucide-react";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import BoardLoginForm from "@/components/board/BoardLoginForm";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// Tab components
import EosDashboardTab from "@/components/co-founder/tabs/EosDashboardTab";
import VtoTab from "@/components/co-founder/tabs/VtoTab";
import ScorecardTab from "@/components/co-founder/tabs/ScorecardTab";
import RocksTab from "@/components/co-founder/tabs/RocksTab";
import IssuesTab from "@/components/co-founder/tabs/IssuesTab";
import TodosTab from "@/components/co-founder/tabs/TodosTab";
import L10Tab from "@/components/co-founder/tabs/L10Tab";
import AccountabilityTab from "@/components/co-founder/tabs/AccountabilityTab";
import PeopleTab from "@/components/co-founder/tabs/PeopleTab";
import ProcessesTab from "@/components/co-founder/tabs/ProcessesTab";

// ─── Tab IDs ───
const EOS_TAB_IDS = [
  "eos-dashboard", "vto", "scorecard", "rocks", "issues",
  "todos", "l10", "accountability", "people", "processes",
] as const;

type EosTabId = typeof EOS_TAB_IDS[number];

// ─── Sidebar menu structure ───
const SIDEBAR_MENU: { id: EosTabId; label: string; icon: any; section?: string }[] = [
  { id: "eos-dashboard", label: "Dashboard", icon: LayoutDashboard, section: "Overview" },
  { id: "vto", label: "V/TO", icon: Eye, section: "Vision" },
  { id: "scorecard", label: "Scorecard", icon: BarChart3, section: "Execution" },
  { id: "rocks", label: "Rocks", icon: Layers, section: "Execution" },
  { id: "issues", label: "Issues (IDS)", icon: AlertCircle, section: "Execution" },
  { id: "todos", label: "To-Dos", icon: CheckSquare, section: "Execution" },
  { id: "l10", label: "L10 Meeting", icon: Calendar, section: "Meetings" },
  { id: "accountability", label: "Accountability Chart", icon: Users, section: "People" },
  { id: "people", label: "People Analyzer", icon: UserCheck, section: "People" },
  { id: "processes", label: "Core Processes", icon: FileText, section: "People" },
];

// ─── Tab Router ───
function TabContent({ tab }: { tab: EosTabId }) {
  switch (tab) {
    case "eos-dashboard": return <EosDashboardTab />;
    case "vto": return <VtoTab />;
    case "scorecard": return <ScorecardTab />;
    case "rocks": return <RocksTab />;
    case "issues": return <IssuesTab />;
    case "todos": return <TodosTab />;
    case "l10": return <L10Tab />;
    case "accountability": return <AccountabilityTab />;
    case "people": return <PeopleTab />;
    case "processes": return <ProcessesTab />;
    default: return null;
  }
}

// ═══════════════════════════════════════════════
// CO-FOUNDER EOS HUB
// ═══════════════════════════════════════════════
export default function CoFounder() {
  const { user, isAdmin, userRole, loading: authLoading, signInWithEmail, signOut } = useAdminAuth();
  const [activeTab, setActiveTab] = useState<EosTabId>("eos-dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // ── Loading ──
  if (authLoading) return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <RefreshCw className="w-6 h-6 animate-spin text-primary" />
    </div>
  );

  // ── Login ──
  if (!user) return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="max-w-sm w-full">
        <div className="flex items-center justify-center gap-2 mb-6">
          <Shield className="w-5 h-5 text-primary" />
          <h1 className="text-lg font-bold text-foreground">Co-Founder Access</h1>
        </div>
        <BoardLoginForm signInWithEmail={signInWithEmail} />
      </div>
    </div>
  );

  // ── Access: Only admin and super_admin ──
  if (!isAdmin || (userRole !== "super_admin" && userRole !== "admin")) return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 text-center">
      <div>
        <Shield className="w-10 h-10 text-destructive mx-auto mb-3" />
        <h2 className="text-lg font-bold text-foreground mb-1">Access Denied</h2>
        <p className="text-sm text-muted-foreground mb-4">Co-Founder access requires admin or super-admin role.</p>
        <Button variant="outline" onClick={signOut}>Sign Out</Button>
      </div>
    </div>
  );

  // Build sections for sidebar
  const sections: { label: string; items: typeof SIDEBAR_MENU }[] = [];
  let currentSection = "";
  for (const item of SIDEBAR_MENU) {
    if (item.section && item.section !== currentSection) {
      currentSection = item.section;
      sections.push({ label: currentSection, items: [] });
    }
    sections[sections.length - 1].items.push(item);
  }

  return (
    <div className="min-h-screen bg-background flex w-full">
      {/* ── Sidebar ── */}
      <aside className={cn(
        "bg-card border-r border-border/50 flex flex-col transition-all duration-200 shrink-0 sticky top-0 h-screen overflow-y-auto",
        sidebarOpen ? "w-60" : "w-14"
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
            <div className="flex-1 min-w-0">
              <span className="text-sm font-bold text-foreground truncate block">EOS</span>
              <span className="text-[10px] text-muted-foreground truncate block">IamBlessedAF</span>
            </div>
          )}
        </div>

        {/* Nav */}
        <nav className="flex-1 py-2 px-1.5 space-y-0.5">
          {sections.map((section) => (
            <div key={section.label} className="mt-2">
              {sidebarOpen && (
                <div className="px-2.5 py-1.5 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                  {section.label}
                </div>
              )}
              {section.items.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  title={item.label}
                  className={cn(
                    "w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-xs font-medium transition-colors text-left",
                    activeTab === item.id
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
                  )}
                >
                  <item.icon className="w-4 h-4 shrink-0" />
                  {sidebarOpen && <span className="truncate">{item.label}</span>}
                </button>
              ))}
            </div>
          ))}
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
          <TabContent tab={activeTab} />
        </div>
      </main>
    </div>
  );
}
