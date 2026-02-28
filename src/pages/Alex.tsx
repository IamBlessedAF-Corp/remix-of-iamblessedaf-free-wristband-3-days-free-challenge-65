import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard, DollarSign, Users, Megaphone,
  ChevronLeft, Menu, Zap, Lightbulb, Settings,
  TrendingUp, ShoppingCart, Film, Target, Award,
  AlertTriangle, Kanban, Map, Loader2,
  type LucideIcon,
} from "lucide-react";
import AlexChat from "@/components/alex/AlexChat";
import MetricCard from "@/components/alex/MetricCard";
import {
  useOrderMetrics, useLeadMetrics, useClipperMetrics,
  useOperationsMetrics, useReferralMetrics, useAbandonedCartMetrics,
} from "@/hooks/useCoFounderMetrics";

// ─── Tab IDs ───
const ALL_TABS = ["dashboard", "offers", "leads", "pricing", "hiring", "operations", "scaling"] as const;
type TabId = typeof ALL_TABS[number];

const SIDEBAR_MENU: { id: TabId; label: string; icon: LucideIcon }[] = [
  { id: "dashboard", label: "Command Center", icon: LayoutDashboard },
  { id: "offers", label: "Offers & Value", icon: Lightbulb },
  { id: "leads", label: "Lead Generation", icon: Megaphone },
  { id: "pricing", label: "Pricing & Revenue", icon: DollarSign },
  { id: "hiring", label: "Hiring & Team", icon: Users },
  { id: "operations", label: "Operations & EOS", icon: Settings },
  { id: "scaling", label: "Scaling Playbook", icon: Zap },
];

const fmt = (cents: number) => `$${(cents / 100).toLocaleString("en-US", { minimumFractionDigits: 0 })}`;

// ═══════════════════════════════════════
// DASHBOARD TAB
// ═══════════════════════════════════════
function DashboardTab({ nav, askAlex }: { nav: (path: string) => void; askAlex: (q: string) => void }) {
  const orders = useOrderMetrics();
  const leads = useLeadMetrics();
  const clippers = useClipperMetrics();
  const ops = useOperationsMetrics();
  const referrals = useReferralMetrics();
  const abandoned = useAbandonedCartMetrics();

  const loading = orders.isLoading || leads.isLoading || clippers.isLoading;

  if (loading) return <div className="flex items-center justify-center py-20"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-foreground">Co-Founder Command Center</h1>
        <p className="text-xs text-muted-foreground">Real-time business intelligence through Hormozi frameworks</p>
      </div>

      {/* Top-level KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <MetricCard
          icon={DollarSign} label="Total Revenue" value={fmt(orders.data?.revenue ?? 0)}
          subtitle={`${orders.data?.total ?? 0} orders completed`}
          onNavigate={() => nav("/admin")} navigateLabel="Orders"
          onAskAlex={() => askAlex("¿Cómo puedo aumentar mi revenue? Aquí están mis números actuales.")}
        />
        <MetricCard
          icon={Users} label="Total Leads" value={leads.data?.totalLeads ?? 0}
          subtitle={`${leads.data?.creators ?? 0} creators, ${leads.data?.expertLeads ?? 0} experts`}
          onNavigate={() => nav("/admin")} navigateLabel="Leads"
          onAskAlex={() => askAlex("Tengo " + (leads.data?.totalLeads ?? 0) + " leads totales. ¿Cómo mejoro mi Core Four?")}
        />
        <MetricCard
          icon={Film} label="Clips & Views" value={(clippers.data?.totalViews ?? 0).toLocaleString()}
          subtitle={`${clippers.data?.totalClips ?? 0} clips, ${clippers.data?.verifiedClips ?? 0} verified`}
          onNavigate={() => nav("/admin")} navigateLabel="Clippers"
          onAskAlex={() => askAlex("¿Cómo escalo mi programa de clippers para más views?")}
        />
        <MetricCard
          icon={Target} label="Referral Chains" value={referrals.data?.totalChains ?? 0}
          subtitle={`${referrals.data?.avgAcceptRate?.toFixed(1) ?? 0}% accept rate`}
          onNavigate={() => nav("/admin")} navigateLabel="Referrals"
          onAskAlex={() => askAlex("Mi K-factor está bajo. ¿Cómo aumento mi tasa de referral?")}
        />
      </div>

      {/* Secondary KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
        <MetricCard
          icon={ShoppingCart} label="Cart Recovery" value={`${abandoned.data?.recoveryRate?.toFixed(1) ?? 0}%`}
          subtitle={`${abandoned.data?.recovered ?? 0}/${abandoned.data?.total ?? 0} recovered`}
          onNavigate={() => nav("/admin")} navigateLabel="Carts"
          onAskAlex={() => askAlex("¿Cómo mejoro mi tasa de recuperación de carritos abandonados?")}
        />
        <MetricCard
          icon={Award} label="Blessings" value={referrals.data?.totalBlessings ?? 0}
          subtitle={`${referrals.data?.confirmedBlessings ?? 0} confirmed`}
          onNavigate={() => nav("/admin")} navigateLabel="Blessings"
          onAskAlex={() => askAlex("¿Cómo uso las blessings para aumentar mi virality?")}
        />
        <MetricCard
          icon={AlertTriangle} label="Open Errors" value={ops.data?.unresolvedErrors ?? 0}
          subtitle={`${ops.data?.totalCards ?? 0} board cards, ${ops.data?.completedCards ?? 0} done`}
          onNavigate={() => nav("/admin")} navigateLabel="Errors"
          onAskAlex={() => askAlex("Tengo " + (ops.data?.unresolvedErrors ?? 0) + " errores sin resolver. ¿Qué priorizo?")}
        />
      </div>

      {/* Quick Actions */}
      <div className="bg-primary/5 border border-primary/20 rounded-xl p-4">
        <h3 className="text-sm font-bold text-foreground mb-3">⚡ Quick Actions</h3>
        <div className="flex flex-wrap gap-2">
          {[
            { label: "📊 Admin Dashboard", action: () => nav("/admin") },
            { label: "🎯 View Board", action: () => nav("/admin") },
            { label: "🗺️ Roadmap", action: () => nav("/admin") },
            { label: "💬 Ask Alex: Grand Slam Offer", action: () => askAlex("Ayúdame a crear un Grand Slam Offer para mi negocio.") },
            { label: "💬 Ask Alex: Scale Plan", action: () => askAlex("Dame un plan de scaling usando 3DS.") },
          ].map(q => (
            <button key={q.label} onClick={q.action}
              className="text-[11px] font-medium border border-border rounded-full px-3 py-1.5 hover:bg-muted transition-colors text-foreground">
              {q.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════
// OFFERS TAB
// ═══════════════════════════════════════
function OffersTab({ nav, askAlex }: { nav: (path: string) => void; askAlex: (q: string) => void }) {
  const orders = useOrderMetrics();
  if (orders.isLoading) return <div className="flex items-center justify-center py-20"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>;

  const tiers = orders.data?.tierBreakdown ?? {};

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-foreground">Grand Slam Offer Framework</h1>
        <p className="text-xs text-muted-foreground">Value = (Dream Outcome × Perceived Likelihood) / (Time Delay × Effort)</p>
      </div>

      {/* Value Equation */}
      <div className="bg-card border border-border/50 rounded-xl p-4 space-y-3">
        <h3 className="text-sm font-bold text-foreground">📐 Value Equation</h3>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            { label: "Dream Outcome", emoji: "🎯", desc: "What they REALLY want" },
            { label: "Perceived Likelihood", emoji: "📈", desc: "Belief they'll get it" },
            { label: "Time Delay", emoji: "⏱️", desc: "How long to result (↓ = better)" },
            { label: "Effort & Sacrifice", emoji: "💪", desc: "What they give up (↓ = better)" },
          ].map(v => (
            <button key={v.label} onClick={() => askAlex(`Analiza mi "${v.label}" y dime cómo mejorarlo.`)}
              className="bg-muted/50 hover:bg-muted rounded-lg p-3 text-left transition-colors">
              <span className="text-lg">{v.emoji}</span>
              <p className="text-xs font-bold text-foreground mt-1">{v.label}</p>
              <p className="text-[10px] text-muted-foreground">{v.desc}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Live Offer Performance */}
      <div className="bg-card border border-border/50 rounded-xl p-4 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-foreground">💰 Offer Performance (Live)</h3>
          <button onClick={() => nav("/admin")} className="text-[10px] text-primary hover:underline">View in Admin →</button>
        </div>
        <div className="space-y-2">
          {Object.entries(tiers).sort((a, b) => b[1].revenue - a[1].revenue).map(([tier, data]) => (
            <button key={tier} onClick={() => askAlex(`Mi offer "${tier}" tiene ${data.count} ventas y ${fmt(data.revenue)} revenue. ¿Cómo la mejoro?`)}
              className="w-full flex items-center justify-between bg-muted/30 hover:bg-muted/50 rounded-lg px-3 py-2 transition-colors text-left">
              <div>
                <p className="text-xs font-bold text-foreground">{tier}</p>
                <p className="text-[10px] text-muted-foreground">{data.count} sales</p>
              </div>
              <span className="text-sm font-bold text-primary">{fmt(data.revenue)}</span>
            </button>
          ))}
          {Object.keys(tiers).length === 0 && <p className="text-xs text-muted-foreground text-center py-4">No orders yet</p>}
        </div>
      </div>

      {/* MAGIC Enhancers */}
      <div className="bg-card border border-border/50 rounded-xl p-4 space-y-3">
        <h3 className="text-sm font-bold text-foreground">✨ MAGIC Enhancers</h3>
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-2">
          {[
            { letter: "M", label: "Magnets", desc: "Lead magnets that attract" },
            { letter: "A", label: "Anchoring", desc: "Price anchoring strategy" },
            { letter: "G", label: "Guarantees", desc: "Risk reversal" },
            { letter: "I", label: "Incentives", desc: "Bonuses & urgency" },
            { letter: "C", label: "Copywriting", desc: "Words that sell" },
          ].map(m => (
            <button key={m.letter} onClick={() => askAlex(`Ayúdame con mi estrategia de ${m.label} (${m.desc}).`)}
              className="bg-primary/5 hover:bg-primary/10 rounded-lg p-3 text-center transition-colors">
              <span className="text-lg font-black text-primary">{m.letter}</span>
              <p className="text-[10px] font-bold text-foreground mt-1">{m.label}</p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════
// LEADS TAB
// ═══════════════════════════════════════
function LeadsTab({ nav, askAlex }: { nav: (path: string) => void; askAlex: (q: string) => void }) {
  const leads = useLeadMetrics();
  if (leads.isLoading) return <div className="flex items-center justify-center py-20"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-foreground">Core Four — Lead Generation</h1>
        <p className="text-xs text-muted-foreground">Scale: More → Better → New</p>
      </div>

      {/* Live Lead Sources */}
      <div className="grid grid-cols-2 gap-3">
        <MetricCard icon={Users} label="Creators" value={leads.data?.creators ?? 0}
          onNavigate={() => nav("/admin")} navigateLabel="View All"
          onAskAlex={() => askAlex("¿Cómo atraigo más creators a mi comunidad?")} />
        <MetricCard icon={Lightbulb} label="Expert Leads" value={leads.data?.expertLeads ?? 0}
          onNavigate={() => nav("/admin")} navigateLabel="View All"
          onAskAlex={() => askAlex("¿Cómo convierto más expert leads en clientes?")} />
        <MetricCard icon={Target} label="Challenge Participants" value={leads.data?.challengeParticipants ?? 0}
          onNavigate={() => nav("/admin")} navigateLabel="View All"
          onAskAlex={() => askAlex("¿Cómo escalo mi challenge para más participants?")} />
        <MetricCard icon={Award} label="Waitlist" value={leads.data?.waitlist ?? 0}
          onNavigate={() => nav("/admin")} navigateLabel="View All"
          onAskAlex={() => askAlex("¿Cómo convierto mi waitlist en compradores?")} />
      </div>

      {/* Core Four Framework */}
      <div className="bg-card border border-border/50 rounded-xl p-4 space-y-3">
        <h3 className="text-sm font-bold text-foreground">📋 Core Four Channels</h3>
        {[
          { emoji: "🤝", name: "Warm Outreach", desc: "1-to-1, warm — 'Lista de 100 personas'", q: "¿Cómo mejoro mi warm outreach?" },
          { emoji: "📱", name: "Free Content", desc: "1-to-many, warm — 'Regala secretos, vende implementación'", q: "¿Cómo mejoro mi content strategy?" },
          { emoji: "📧", name: "Cold Outreach", desc: "1-to-1, cold — '100 cold outreach por día'", q: "¿Cómo escalo mi cold outreach?" },
          { emoji: "💸", name: "Paid Ads", desc: "1-to-many, cold — 'Creative > Targeting'", q: "¿Cómo optimizo mis paid ads?" },
        ].map(c => (
          <button key={c.name} onClick={() => askAlex(c.q)}
            className="w-full flex items-center gap-3 bg-muted/30 hover:bg-muted/50 rounded-lg px-4 py-3 transition-colors text-left">
            <span className="text-xl">{c.emoji}</span>
            <div>
              <p className="text-xs font-bold text-foreground">{c.name}</p>
              <p className="text-[10px] text-muted-foreground">{c.desc}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════
// PRICING TAB
// ═══════════════════════════════════════
function PricingTab({ nav, askAlex }: { nav: (path: string) => void; askAlex: (q: string) => void }) {
  const orders = useOrderMetrics();
  const abandoned = useAbandonedCartMetrics();
  const clippers = useClipperMetrics();
  if (orders.isLoading) return <div className="flex items-center justify-center py-20"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-foreground">Pricing & Money Model</h1>
        <p className="text-xs text-muted-foreground">Never compete on price — compete on VALUE</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
        <MetricCard icon={DollarSign} label="Total Revenue" value={fmt(orders.data?.revenue ?? 0)}
          onNavigate={() => nav("/admin")} navigateLabel="Orders"
          onAskAlex={() => askAlex("¿Cómo puedo 3x mi revenue actual?")} />
        <MetricCard icon={ShoppingCart} label="Cart Recovery" value={`${abandoned.data?.recoveryRate?.toFixed(1) ?? 0}%`}
          subtitle={`${abandoned.data?.total ?? 0} abandoned`}
          onNavigate={() => nav("/admin")} navigateLabel="Carts"
          onAskAlex={() => askAlex("¿Cómo mejoro mi recovery rate de carritos?")} />
        <MetricCard icon={Film} label="Clipper Payouts" value={fmt(clippers.data?.totalPayouts ?? 0)}
          onNavigate={() => nav("/admin")} navigateLabel="Payouts"
          onAskAlex={() => askAlex("¿Estoy pagando demasiado o muy poco a mis clippers?")} />
      </div>

      {/* Money Model Stack */}
      <div className="bg-card border border-border/50 rounded-xl p-4 space-y-3">
        <h3 className="text-sm font-bold text-foreground">💰 Money Model Stack</h3>
        <div className="flex items-center gap-1 overflow-x-auto pb-2">
          {[
            { label: "Attraction", price: "FREE/Low", color: "bg-blue-500/10 text-blue-600" },
            { label: "Core Offer", price: "$X,XXX", color: "bg-primary/10 text-primary" },
            { label: "Upsell", price: "+$X,XXX", color: "bg-emerald-500/10 text-emerald-600" },
            { label: "Downsell", price: "$XXX", color: "bg-amber-500/10 text-amber-600" },
            { label: "Continuity", price: "$XX/mo", color: "bg-purple-500/10 text-purple-600" },
          ].map((s, i) => (
            <button key={s.label} onClick={() => askAlex(`Analiza mi ${s.label} (${s.price}) y dime cómo optimizarlo.`)}
              className={cn("flex-shrink-0 rounded-lg p-3 text-center transition-opacity hover:opacity-80 min-w-[100px]", s.color)}>
              <p className="text-xs font-bold">{s.label}</p>
              <p className="text-[10px] opacity-70">{s.price}</p>
              {i < 4 && <span className="text-muted-foreground ml-1">→</span>}
            </button>
          ))}
        </div>
        <p className="text-[10px] text-muted-foreground">Metrics: LTGP, CAC, LTV:CAC (mín 3:1) — Click any to ask Alex</p>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════
// HIRING TAB
// ═══════════════════════════════════════
function HiringTab({ askAlex }: { askAlex: (q: string) => void }) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-foreground">Hiring & Team (T-E-A-M)</h1>
        <p className="text-xs text-muted-foreground">Train → Equip → Assess → Mentor</p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {[
          { letter: "T", label: "Train", desc: "SOPs claros para cada puesto", emoji: "📋", q: "¿Cómo creo SOPs efectivos para mi equipo?" },
          { letter: "E", label: "Equip", desc: "Herramientas y recursos", emoji: "🛠️", q: "¿Qué herramientas necesita mi equipo?" },
          { letter: "A", label: "Assess", desc: "Scorecards semanales con KPIs", emoji: "📊", q: "¿Cómo hago scorecards semanales efectivos?" },
          { letter: "M", label: "Mentor", desc: "1-on-1s semanales de 15 min", emoji: "🎯", q: "¿Cómo hago 1-on-1s efectivos?" },
        ].map(t => (
          <button key={t.letter} onClick={() => askAlex(t.q)}
            className="bg-card border border-border/50 rounded-xl p-4 text-left hover:bg-muted/30 transition-colors">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xl">{t.emoji}</span>
              <span className="text-lg font-black text-primary">{t.letter}</span>
            </div>
            <p className="text-xs font-bold text-foreground">{t.label}</p>
            <p className="text-[10px] text-muted-foreground">{t.desc}</p>
          </button>
        ))}
      </div>

      <div className="bg-card border border-border/50 rounded-xl p-4 space-y-3">
        <h3 className="text-sm font-bold text-foreground">⚖️ Hiring Barbell Strategy</h3>
        <button onClick={() => askAlex("Explícame el Hiring Barbell Strategy y cómo aplicarlo.")}
          className="w-full bg-muted/30 hover:bg-muted/50 rounded-lg px-4 py-3 transition-colors text-left">
          <p className="text-xs text-foreground">Contrata <strong>junior barato</strong> O <strong>senior caro</strong>, nunca el medio.</p>
          <p className="text-[10px] text-muted-foreground mt-1">Click to ask Alex for details →</p>
        </button>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════
// OPERATIONS TAB
// ═══════════════════════════════════════
function OperationsTab({ nav, askAlex }: { nav: (path: string) => void; askAlex: (q: string) => void }) {
  const ops = useOperationsMetrics();
  if (ops.isLoading) return <div className="flex items-center justify-center py-20"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-foreground">Operations & EOS</h1>
        <p className="text-xs text-muted-foreground">Entrepreneurial Operating System</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <MetricCard icon={Kanban} label="Board Cards" value={ops.data?.totalCards ?? 0}
          subtitle={`${ops.data?.completedCards ?? 0} completed`}
          onNavigate={() => nav("/admin")} navigateLabel="Board"
          onAskAlex={() => askAlex("¿Cómo priorizo mis tasks en el board?")} />
        <MetricCard icon={Map} label="Roadmap Items" value={ops.data?.activeRoadmap ?? 0}
          subtitle="Active items"
          onNavigate={() => nav("/admin")} navigateLabel="Roadmap"
          onAskAlex={() => askAlex("¿Cuáles deberían ser mis Rocks este trimestre?")} />
        <MetricCard icon={AlertTriangle} label="Unresolved Errors" value={ops.data?.unresolvedErrors ?? 0}
          onNavigate={() => nav("/admin")} navigateLabel="Errors"
          onAskAlex={() => askAlex("¿Cómo implemento un sistema de error tracking efectivo?")} />
        <MetricCard icon={TrendingUp} label="Completion Rate"
          value={ops.data?.totalCards ? `${((ops.data.completedCards / ops.data.totalCards) * 100).toFixed(0)}%` : "0%"}
          onAskAlex={() => askAlex("Mi completion rate es bajo. ¿Cómo mejoro la ejecución?")} />
      </div>

      {/* EOS Tools */}
      <div className="bg-card border border-border/50 rounded-xl p-4 space-y-3">
        <h3 className="text-sm font-bold text-foreground">🏗️ EOS Toolkit</h3>
        {[
          { emoji: "📋", name: "Scorecard", desc: "KPIs semanales por departamento", q: "¿Cómo creo un scorecard efectivo para mi negocio?" },
          { emoji: "🪨", name: "Rocks", desc: "3 prioridades por trimestre", q: "¿Cuáles deberían ser mis Rocks este trimestre?" },
          { emoji: "📞", name: "L10 Meeting", desc: "Level 10 meetings semanales", q: "¿Cómo implemento L10 Meetings efectivos?" },
          { emoji: "📝", name: "SOPs", desc: "Documenta todo proceso repetible", q: "¿Cómo documento SOPs eficientemente?" },
          { emoji: "🎯", name: "Accountability Chart", desc: "Quién owns qué", q: "Ayúdame a crear mi accountability chart." },
        ].map(t => (
          <button key={t.name} onClick={() => askAlex(t.q)}
            className="w-full flex items-center gap-3 bg-muted/30 hover:bg-muted/50 rounded-lg px-4 py-3 transition-colors text-left">
            <span className="text-xl">{t.emoji}</span>
            <div>
              <p className="text-xs font-bold text-foreground">{t.name}</p>
              <p className="text-[10px] text-muted-foreground">{t.desc}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════
// SCALING TAB
// ═══════════════════════════════════════
function ScalingTab({ nav, askAlex }: { nav: (path: string) => void; askAlex: (q: string) => void }) {
  const referrals = useReferralMetrics();
  const clippers = useClipperMetrics();
  if (referrals.isLoading) return <div className="flex items-center justify-center py-20"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-foreground">Scaling Playbook</h1>
        <p className="text-xs text-muted-foreground">¿Why not 10x?</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <MetricCard icon={TrendingUp} label="K-Factor Inputs" value={referrals.data?.totalNominations ?? 0}
          subtitle={`${referrals.data?.avgAcceptRate?.toFixed(1) ?? 0}% accept rate`}
          onNavigate={() => nav("/admin")} navigateLabel="Virality"
          onAskAlex={() => askAlex("¿Cómo llevo mi K-factor por encima de 1?")} />
        <MetricCard icon={Target} label="Affiliates" value={referrals.data?.totalAffiliates ?? 0}
          onNavigate={() => nav("/admin")} navigateLabel="Affiliates"
          onAskAlex={() => askAlex("¿Cómo escalo mi programa de affiliates?")} />
        <MetricCard icon={Film} label="Total Views" value={(clippers.data?.totalViews ?? 0).toLocaleString()}
          onNavigate={() => nav("/admin")} navigateLabel="Clippers"
          onAskAlex={() => askAlex("¿Cómo 10x mis views con clippers?")} />
        <MetricCard icon={Award} label="Blessings" value={referrals.data?.confirmedBlessings ?? 0}
          subtitle={`of ${referrals.data?.totalBlessings ?? 0} total`}
          onNavigate={() => nav("/admin")} navigateLabel="Blessings"
          onAskAlex={() => askAlex("¿Cómo convierto blessings en un viral loop?")} />
      </div>

      {/* 3DS Framework */}
      <div className="bg-card border border-border/50 rounded-xl p-4 space-y-3">
        <h3 className="text-sm font-bold text-foreground">🔄 3DS Framework</h3>
        <div className="grid grid-cols-3 gap-2">
          {[
            { step: "1", label: "Do it yourself", desc: "Manual execution", q: "¿Cuándo debo dejar de hacer todo yo mismo?" },
            { step: "2", label: "Do it with a team", desc: "Delegate & train", q: "¿Cómo paso de 'do it myself' a 'do it with a team'?" },
            { step: "3", label: "Do it with systems", desc: "Automate & scale", q: "¿Cómo automatizo todo con systems?" },
          ].map(s => (
            <button key={s.step} onClick={() => askAlex(s.q)}
              className="bg-primary/5 hover:bg-primary/10 rounded-lg p-3 text-center transition-colors">
              <span className="text-lg font-black text-primary">{s.step}</span>
              <p className="text-[10px] font-bold text-foreground mt-1">{s.label}</p>
              <p className="text-[9px] text-muted-foreground">{s.desc}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Lead Getters */}
      <div className="bg-card border border-border/50 rounded-xl p-4 space-y-3">
        <h3 className="text-sm font-bold text-foreground">🎣 Lead Getters</h3>
        {[
          { emoji: "🔁", name: "Customer Referrals", q: "¿Cómo sistematizo customer referrals?" },
          { emoji: "👥", name: "Employees", q: "¿Cómo convierto a mis employees en lead getters?" },
          { emoji: "🏢", name: "Agencies", q: "¿Cuándo y cómo uso agencies para leads?" },
          { emoji: "🤝", name: "Affiliates", q: "¿Cómo escalo mi programa de affiliates?" },
        ].map(lg => (
          <button key={lg.name} onClick={() => askAlex(lg.q)}
            className="w-full flex items-center gap-3 bg-muted/30 hover:bg-muted/50 rounded-lg px-4 py-3 transition-colors text-left">
            <span className="text-lg">{lg.emoji}</span>
            <div>
              <p className="text-xs font-bold text-foreground">{lg.name}</p>
              <p className="text-[10px] text-muted-foreground">Click to ask Alex →</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════
// MAIN PAGE
// ═══════════════════════════════════════
export default function Alex() {
  const [activeTab, setActiveTab] = useState<TabId>("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const navigate = useNavigate();

  // Trigger Alex chat with a pre-loaded question
  const askAlex = useCallback((question: string) => {
    window.dispatchEvent(new CustomEvent("alex-ask", { detail: { question } }));
  }, []);

  const nav = useCallback((path: string) => navigate(path), [navigate]);

  const renderTab = () => {
    switch (activeTab) {
      case "dashboard": return <DashboardTab nav={nav} askAlex={askAlex} />;
      case "offers": return <OffersTab nav={nav} askAlex={askAlex} />;
      case "leads": return <LeadsTab nav={nav} askAlex={askAlex} />;
      case "pricing": return <PricingTab nav={nav} askAlex={askAlex} />;
      case "hiring": return <HiringTab askAlex={askAlex} />;
      case "operations": return <OperationsTab nav={nav} askAlex={askAlex} />;
      case "scaling": return <ScalingTab nav={nav} askAlex={askAlex} />;
    }
  };

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
            <button key={entry.id} onClick={() => setActiveTab(entry.id)} title={entry.label}
              className={cn(
                "w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-xs font-semibold transition-colors text-left",
                activeTab === entry.id ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
              )}>
              <entry.icon className="w-4 h-4 shrink-0" />
              {sidebarOpen && <span className="truncate">{entry.label}</span>}
            </button>
          ))}
        </nav>

        {/* Bottom: Go to Admin */}
        <div className="px-2 py-3 border-t border-border/30">
          <button onClick={() => navigate("/admin")}
            className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-colors text-left">
            <LayoutDashboard className="w-4 h-4 shrink-0" />
            {sidebarOpen && <span className="truncate">Go to Admin Hub</span>}
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto p-6">
        {renderTab()}
      </main>

      {/* Floating Alex Chat */}
      <AlexChat />
    </div>
  );
}
