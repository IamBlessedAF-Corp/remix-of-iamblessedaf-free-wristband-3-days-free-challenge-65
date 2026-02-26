import { useState } from "react";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard, Brain, Target, DollarSign, Users, Megaphone,
  ChevronLeft, Menu, ChevronDown, ChevronRight, Zap, BookOpen,
  BarChart3, Lightbulb, Layers, Settings,
} from "lucide-react";
import AlexChat from "@/components/alex/AlexChat";

// ─── Tab IDs ───
const ALL_TABS = [
  "dashboard", "offers", "leads", "pricing", "hiring", "operations", "scaling",
] as const;
type TabId = typeof ALL_TABS[number];

// ─── Sidebar structure ───
const SIDEBAR_MENU = [
  { id: "dashboard" as TabId, label: "Co-Founder Dashboard", icon: LayoutDashboard },
  { id: "offers" as TabId, label: "Offers & Value", icon: Lightbulb },
  { id: "leads" as TabId, label: "Lead Generation", icon: Megaphone },
  { id: "pricing" as TabId, label: "Pricing & Revenue", icon: DollarSign },
  { id: "hiring" as TabId, label: "Hiring & Team", icon: Users },
  { id: "operations" as TabId, label: "Operations & EOS", icon: Settings },
  { id: "scaling" as TabId, label: "Scaling Playbook", icon: Zap },
];

// ─── Placeholder content per tab ───
function TabContent({ tab }: { tab: TabId }) {
  const content: Record<TabId, { title: string; subtitle: string; icon: any; items: string[] }> = {
    dashboard: {
      title: "Co-Founder Command Center",
      subtitle: "Tu hub estratégico con Alex Hormozi AI",
      icon: LayoutDashboard,
      items: [
        "📊 Value Equation Score — mide tu offer actual",
        "🎯 Core Four Status — tu mix de lead generation",
        "💰 Money Model Stack — attraction → core → upsell → continuity",
        "👥 T-E-A-M Score — calidad de tu equipo",
        "⚡ Abre el chat de Alex (botón abajo-derecha) para consejo en tiempo real",
      ],
    },
    offers: {
      title: "Grand Slam Offer Framework",
      subtitle: "Value = (Dream Outcome × Perceived Likelihood) / (Time Delay × Effort)",
      icon: Lightbulb,
      items: [
        "1. Identifica el Dream Outcome de tu cliente ideal",
        "2. Lista TODOS los problemas entre el cliente y el resultado",
        "3. Crea soluciones para cada problema",
        "4. Trim & Stack — elimina lo débil, apila lo fuerte",
        "5. Enhancers: Scarcity + Urgency + Bonuses + Guarantees + Naming (MAGIC)",
      ],
    },
    leads: {
      title: "Core Four — Lead Generation",
      subtitle: "Scale: More → Better → New",
      icon: Megaphone,
      items: [
        "🤝 Warm Outreach (1-to-1, warm) — 'Lista de 100 personas'",
        "📱 Free Content (1-to-many, warm) — 'Regala secretos, vende implementación'",
        "📧 Cold Outreach (1-to-1, cold) — '100 cold outreach por día'",
        "💸 Paid Ads (1-to-many, cold) — 'Creative > Targeting'",
      ],
    },
    pricing: {
      title: "Pricing & Money Model",
      subtitle: "Never compete on price — compete on VALUE",
      icon: DollarSign,
      items: [
        "Attraction Offer: FREE/Low → genera leads",
        "Core Offer: $X,XXX → tu producto principal",
        "Upsell: +$X,XXX → más valor, más revenue",
        "Downsell: $XXX → captura los que no compran core",
        "Continuity: $XX/mo → recurring revenue",
        "Metrics: LTGP, CAC, LTV:CAC (mín 3:1)",
      ],
    },
    hiring: {
      title: "Hiring & Team (T-E-A-M)",
      subtitle: "Train → Equip → Assess → Mentor",
      icon: Users,
      items: [
        "Hiring Barbell: contrata junior barato O senior caro, nunca el medio",
        "T — Train: SOPs claros para cada puesto",
        "E — Equip: herramientas y recursos necesarios",
        "A — Assess: scorecards semanales con KPIs",
        "M — Mentor: 1-on-1s semanales de 15 min",
      ],
    },
    operations: {
      title: "Operations & EOS",
      subtitle: "Entrepreneurial Operating System",
      icon: Settings,
      items: [
        "📋 Scorecard — KPIs semanales por departamento",
        "🪨 Rocks — 3 prioridades por trimestre",
        "📞 L10 Meeting — Level 10 meetings semanales",
        "📝 SOPs — documenta todo proceso repetible",
        "🎯 Accountability Chart — quién owns qué",
      ],
    },
    scaling: {
      title: "Scaling Playbook",
      subtitle: "¿Why not 10x?",
      icon: Zap,
      items: [
        "3DS: Do it yourself → Do it with a team → Do it with systems",
        "Lead Getters: Referrals → Employees → Agencies → Affiliates",
        "K-Factor: cada cliente debe traer >1 cliente nuevo",
        "Premium pricing = premium clients = premium results",
        "Constraint Theory: encuentra el bottleneck y elimínalo",
      ],
    },
  };

  const c = content[tab];
  const Icon = c.icon;

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
          <Icon className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-foreground">{c.title}</h1>
          <p className="text-xs text-muted-foreground">{c.subtitle}</p>
        </div>
      </div>
      <div className="grid gap-3">
        {c.items.map((item, i) => (
          <div key={i} className="bg-card border border-border/50 rounded-xl px-4 py-3 text-sm text-foreground">
            {item}
          </div>
        ))}
      </div>
      {tab === "dashboard" && (
        <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 text-sm text-muted-foreground">
          💡 <strong className="text-foreground">Tip:</strong> Haz click en el botón de Alex (abajo a la derecha) para preguntarle cualquier cosa sobre tu negocio en tiempo real.
        </div>
      )}
    </div>
  );
}

export default function Alex() {
  const [activeTab, setActiveTab] = useState<TabId>("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="min-h-screen bg-background flex w-full">
      {/* Sidebar */}
      <aside className={cn(
        "bg-card border-r border-border/50 flex flex-col transition-all duration-200 shrink-0 sticky top-0 h-screen overflow-y-auto",
        sidebarOpen ? "w-64" : "w-14"
      )}>
        <div className="flex items-center gap-2 px-3 py-4 border-b border-border/30">
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="text-muted-foreground hover:text-foreground transition-colors">
            {sidebarOpen ? <ChevronLeft className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
          {sidebarOpen && <span className="text-sm font-bold text-foreground truncate flex-1">Alex Hormozi AI</span>}
        </div>

        <nav className="flex-1 py-2 px-1.5 space-y-0.5">
          {SIDEBAR_MENU.map((entry) => (
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
          ))}
        </nav>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto">
        <TabContent tab={activeTab} />
      </main>

      {/* Floating Alex Chat */}
      <AlexChat />
    </div>
  );
}
