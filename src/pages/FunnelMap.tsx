import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, FunnelChart, Funnel, LabelList, Cell, LineChart, Line, Legend, PieChart, Pie } from "recharts";
import { TrendingUp, Users, DollarSign, Eye, Video, ArrowRight, ArrowDown, Zap, Target, BarChart3, Settings2, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

/* ─── Funnel Steps Definition ─── */
const FUNNEL_STEPS = [
  { id: 1, route: "/", name: "Free Wristband", sells: "Lead capture (wristband gratis)", defaultConv: 0.65 },
  { id: 2, route: "Intro", name: "Science Hook", sells: "Educación (nada)", defaultConv: 0.85 },
  { id: 3, route: "Setup", name: "Friend Capture", sells: "Data capture (nada)", defaultConv: 0.78 },
  { id: 4, route: "Checkout", name: "Wristband Checkout", sells: "$9.95–$22 wristbands", defaultConv: 0.35 },
  { id: 5, route: "/challenge/thanks", name: "Viral Activation", sells: "Nada (share loop)", defaultConv: 0.42 },
  { id: 6, route: "/offer/22", name: "$22 Starter Pack", sells: "3 wristbands ($22)", defaultConv: 0.18 },
  { id: 7, route: "/offer/111", name: "$111 Identity Pack", sells: "Shirt + wristbands ($111)", defaultConv: 0.08 },
  { id: 8, route: "/offer/444", name: "$444 Habit Lock", sells: "1,111 meals ($444)", defaultConv: 0.035 },
  { id: 9, route: "/offer/1111", name: "$1,111 Kingdom", sells: "11,111 meals ($1,111)", defaultConv: 0.012 },
  { id: 10, route: "/offer/4444", name: "$4,444 Ambassador", sells: "44,444 meals ($4,444)", defaultConv: 0.004 },
];

const TIER_PRICES = [0, 0, 0, 16, 0, 22, 111, 444, 1111, 4444];
const DOWNSELL_PRICE = 11;
const DOWNSELL_RATE = 0.06;

const SCENARIOS = [
  { key: "conservative", label: "Conservative", color: "hsl(var(--muted-foreground))", multiplier: 0.7 },
  { key: "base", label: "Base Case", color: "hsl(var(--primary))", multiplier: 1.0 },
  { key: "optimistic", label: "Optimistic", color: "hsl(142 71% 45%)", multiplier: 1.4 },
] as const;

export default function FunnelMap() {
  /* ─── Clipper Inputs ─── */
  const [clippers, setClippers] = useState(50);
  const [videosPerClipper, setVideosPerClipper] = useState(4);
  const [viewsPerClip, setViewsPerClip] = useState(25000);
  const [pricePerClip, setPricePerClip] = useState(2.22);

  /* ─── Funnel Conversion Overrides ─── */
  const [convOverrides, setConvOverrides] = useState<Record<number, number>>({});
  const getConv = (step: typeof FUNNEL_STEPS[0]) => convOverrides[step.id] ?? step.defaultConv;

  /* ─── Projections Engine ─── */
  const projections = useMemo(() => {
    const totalClips = clippers * videosPerClipper;
    const totalViews = totalClips * viewsPerClip;
    const clipperCost = totalClips * pricePerClip;

    return SCENARIOS.map((s) => {
      let visitors = Math.round(totalViews * 0.012 * s.multiplier); // CTR to site
      const stepResults = FUNNEL_STEPS.map((step, i) => {
        const conv = getConv(step) * s.multiplier;
        const entering = visitors;
        const converted = Math.round(entering * Math.min(conv, 1));
        const skipped = entering - converted;
        const downsellConverted = i >= 5 ? Math.round(skipped * DOWNSELL_RATE * s.multiplier) : 0;
        const revenue = converted * TIER_PRICES[i] + downsellConverted * DOWNSELL_PRICE;
        visitors = converted;
        return { ...step, entering, converted, skipped, downsellConverted, revenue, convRate: conv };
      });
      const totalRevenue = stepResults.reduce((s, r) => s + r.revenue, 0);
      const downsellRevenue = stepResults.reduce((s, r) => s + r.downsellConverted * DOWNSELL_PRICE, 0);
      return {
        ...s,
        totalClips,
        totalViews,
        clipperCost,
        visitors: Math.round(totalViews * 0.012 * s.multiplier),
        steps: stepResults,
        totalRevenue,
        downsellRevenue,
        roi: totalRevenue / (clipperCost || 1),
        day1: Math.round(totalRevenue * 0.15),
        day7: Math.round(totalRevenue * 0.45),
        day30: totalRevenue,
      };
    });
  }, [clippers, videosPerClipper, viewsPerClip, pricePerClip, convOverrides]);

  const base = projections[1];

  /* ─── Chart configs ─── */
  const funnelChartData = base.steps.map((s) => ({
    name: s.name,
    value: s.entering,
    fill: s.entering > 100 ? "hsl(var(--primary))" : "hsl(var(--muted-foreground))",
  }));

  const revenueByTier = base.steps.filter((s) => s.revenue > 0).map((s) => ({
    name: s.name,
    revenue: s.revenue,
  }));

  const timelineData = SCENARIOS.map((s, i) => ({
    scenario: s.label,
    "Day 1": projections[i].day1,
    "Day 7": projections[i].day7,
    "Day 30": projections[i].day30,
  }));

  const convChartData = base.steps.map((s) => ({
    name: s.name.replace("$", "").substring(0, 12),
    "Conv %": Math.round(s.convRate * 100),
    "Skip %": Math.round((1 - s.convRate) * 100),
  }));

  return (
    <div className="min-h-screen bg-background">
      {/* ─── Header ─── */}
      <header className="border-b bg-card sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-foreground tracking-tight flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-primary" /> Funnel Command Center
            </h1>
            <p className="text-xs text-muted-foreground mt-0.5">Gratitude Engine™ — Executive Dashboard</p>
          </div>
          <Badge variant="outline" className="text-xs">Board-Ready</Badge>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        {/* ═══ SECTION 1: Executive Summary KPIs ═══ */}
        <motion.section initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { label: "Total Clips", value: base.totalClips.toLocaleString(), icon: Video, sub: `${clippers} clippers × ${videosPerClipper} vids` },
              { label: "Total Views", value: `${(base.totalViews / 1_000_000).toFixed(1)}M`, icon: Eye, sub: `${(viewsPerClip / 1000).toFixed(0)}K avg/clip` },
              { label: "Projected Revenue", value: `$${base.totalRevenue.toLocaleString()}`, icon: DollarSign, sub: `${base.roi.toFixed(1)}x ROI` },
              { label: "Funnel Visitors", value: base.visitors.toLocaleString(), icon: Users, sub: "1.2% clip→site CTR" },
            ].map((kpi, i) => (
              <Card key={i} className="border bg-card">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-1">
                    <kpi.icon className="h-4 w-4 text-primary" />
                    <span className="text-xs font-medium text-muted-foreground">{kpi.label}</span>
                  </div>
                  <p className="text-2xl font-bold text-foreground">{kpi.value}</p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">{kpi.sub}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </motion.section>

        {/* ═══ SECTION 2: Visual Funnel Flowchart ═══ */}
        <motion.section initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2"><Sparkles className="h-4 w-4 text-primary" /> Funnel Flow</CardTitle>
              <CardDescription>Visual progression from lead capture to Ambassador</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap items-center gap-1 md:gap-0 justify-center py-2">
                {FUNNEL_STEPS.map((step, i) => (
                  <div key={step.id} className="flex items-center">
                    <div className="flex flex-col items-center text-center w-20 md:w-24">
                      <div className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold border-2 ${i <= 4 ? "border-primary bg-primary/10 text-primary" : "border-muted-foreground/30 bg-muted text-muted-foreground"}`}>
                        {step.id}
                      </div>
                      <span className="text-[10px] font-medium text-foreground mt-1 leading-tight">{step.name}</span>
                      <span className="text-[9px] text-muted-foreground leading-tight">{Math.round(getConv(step) * 100)}%</span>
                    </div>
                    {i < FUNNEL_STEPS.length - 1 && (
                      <ArrowRight className="h-3 w-3 text-muted-foreground/40 shrink-0 hidden md:block" />
                    )}
                  </div>
                ))}
              </div>
              {/* Downsell annotation */}
              <div className="flex items-center justify-center gap-2 mt-2 text-[10px] text-muted-foreground">
                <ArrowDown className="h-3 w-3" />
                <span>Every skip triggers $11/mo downsell (≈{Math.round(DOWNSELL_RATE * 100)}% accept)</span>
              </div>
            </CardContent>
          </Card>
        </motion.section>

        {/* ═══ TABS: Projections · Conversions · Revenue ═══ */}
        <Tabs defaultValue="projections" className="space-y-4">
          <TabsList className="w-full md:w-auto">
            <TabsTrigger value="projections" className="gap-1"><Settings2 className="h-3.5 w-3.5" /> Projections</TabsTrigger>
            <TabsTrigger value="conversions" className="gap-1"><Target className="h-3.5 w-3.5" /> Conversions</TabsTrigger>
            <TabsTrigger value="revenue" className="gap-1"><TrendingUp className="h-3.5 w-3.5" /> Revenue</TabsTrigger>
          </TabsList>

          {/* ─── TAB: Projections ─── */}
          <TabsContent value="projections" className="space-y-4">
            {/* Editable Inputs */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Scenario Inputs</CardTitle>
                <CardDescription className="text-xs">Adjust to model different outcomes</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    { label: "# Clippers", value: clippers, set: setClippers, icon: Users },
                    { label: "Videos / Clipper", value: videosPerClipper, set: setVideosPerClipper, icon: Video },
                    { label: "Avg Views / Clip", value: viewsPerClip, set: setViewsPerClip, icon: Eye },
                    { label: "$ per Clip", value: pricePerClip, set: setPricePerClip, icon: DollarSign, step: 0.01 },
                  ].map((inp) => (
                    <div key={inp.label}>
                      <label className="text-xs font-medium text-muted-foreground flex items-center gap-1 mb-1">
                        <inp.icon className="h-3 w-3" /> {inp.label}
                      </label>
                      <Input
                        type="number"
                        value={inp.value}
                        step={inp.step ?? 1}
                        min={0}
                        onChange={(e) => inp.set(Number(e.target.value))}
                        className="h-9 text-sm font-medium"
                      />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* 3-Scenario Comparison Table */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">3-Scenario Projections</CardTitle>
              </CardHeader>
              <CardContent className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-xs">Metric</TableHead>
                      {SCENARIOS.map((s) => (
                        <TableHead key={s.key} className="text-xs text-center">{s.label}</TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {[
                      { label: "Funnel Visitors", key: "visitors" },
                      { label: "Clipper Cost", key: "clipperCost", fmt: "$" },
                      { label: "Total Revenue", key: "totalRevenue", fmt: "$" },
                      { label: "Downsell Revenue", key: "downsellRevenue", fmt: "$" },
                      { label: "ROI", key: "roi", fmt: "x" },
                      { label: "Day 1 Sales", key: "day1", fmt: "$" },
                      { label: "Day 7 Sales", key: "day7", fmt: "$" },
                      { label: "Day 30 Sales", key: "day30", fmt: "$" },
                    ].map((row) => (
                      <TableRow key={row.key}>
                        <TableCell className="text-xs font-medium">{row.label}</TableCell>
                        {projections.map((p, i) => (
                          <TableCell key={i} className="text-center text-sm font-semibold" style={{ color: SCENARIOS[i].color }}>
                            {row.fmt === "$" ? `$${(p as any)[row.key].toLocaleString()}` : row.fmt === "x" ? `${(p as any)[row.key].toFixed(1)}x` : (p as any)[row.key].toLocaleString()}
                          </TableCell>
                        ))}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            {/* Editable Conversion Rates per Step */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Conversion Rates by Step</CardTitle>
                <CardDescription className="text-xs">Edit to model custom scenarios</CardDescription>
              </CardHeader>
              <CardContent className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-xs w-8">#</TableHead>
                      <TableHead className="text-xs">Step</TableHead>
                      <TableHead className="text-xs">Sells</TableHead>
                      <TableHead className="text-xs text-center w-24">Conv %</TableHead>
                      <TableHead className="text-xs text-right">Entering</TableHead>
                      <TableHead className="text-xs text-right">Converted</TableHead>
                      <TableHead className="text-xs text-right">Revenue</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {base.steps.map((step) => (
                      <TableRow key={step.id}>
                        <TableCell className="text-xs text-muted-foreground">{step.id}</TableCell>
                        <TableCell className="text-xs font-medium">{step.name}</TableCell>
                        <TableCell className="text-[11px] text-muted-foreground max-w-[160px] truncate">{step.sells}</TableCell>
                        <TableCell className="text-center p-1">
                          <Input
                            type="number"
                            min={0}
                            max={100}
                            step={1}
                            value={Math.round(getConv(step) * 100)}
                            onChange={(e) => setConvOverrides((prev) => ({ ...prev, [step.id]: Number(e.target.value) / 100 }))}
                            className="h-7 w-16 text-xs text-center mx-auto"
                          />
                        </TableCell>
                        <TableCell className="text-xs text-right">{step.entering.toLocaleString()}</TableCell>
                        <TableCell className="text-xs text-right font-medium">{step.converted.toLocaleString()}</TableCell>
                        <TableCell className="text-xs text-right font-semibold text-primary">{step.revenue > 0 ? `$${step.revenue.toLocaleString()}` : "—"}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ─── TAB: Conversions ─── */}
          <TabsContent value="conversions" className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              {/* Conversion Rate Bar Chart */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Conversion vs Skip Rate</CardTitle>
                </CardHeader>
                <CardContent>
                  <ChartContainer config={{ "Conv %": { label: "Converted", color: "hsl(var(--primary))" }, "Skip %": { label: "Skipped", color: "hsl(var(--muted))" } }} className="h-[280px]">
                    <BarChart data={convChartData} layout="vertical" margin={{ left: 60 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 10 }} />
                      <YAxis type="category" dataKey="name" tick={{ fontSize: 10 }} width={60} />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Bar dataKey="Conv %" stackId="a" fill="hsl(var(--primary))" radius={[0, 0, 0, 0]} />
                      <Bar dataKey="Skip %" stackId="a" fill="hsl(var(--muted))" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ChartContainer>
                </CardContent>
              </Card>

              {/* Funnel Drop-off */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Funnel Drop-off (Visitors)</CardTitle>
                </CardHeader>
                <CardContent>
                  <ChartContainer config={{ value: { label: "Visitors", color: "hsl(var(--primary))" } }} className="h-[280px]">
                    <BarChart data={funnelChartData} margin={{ left: 10 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="name" tick={{ fontSize: 9 }} angle={-35} textAnchor="end" height={60} />
                      <YAxis tick={{ fontSize: 10 }} />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Bar dataKey="value" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ChartContainer>
                </CardContent>
              </Card>
            </div>

            {/* Downsell Performance */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Downsell Performance ($11/mo)</CardTitle>
              </CardHeader>
              <CardContent className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-xs">Stage</TableHead>
                      <TableHead className="text-xs text-right">Skipped</TableHead>
                      <TableHead className="text-xs text-right">Downsell Accepted</TableHead>
                      <TableHead className="text-xs text-right">Downsell Rev</TableHead>
                      <TableHead className="text-xs text-right">Accept Rate</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {base.steps.filter((s) => s.id >= 6).map((s) => (
                      <TableRow key={s.id}>
                        <TableCell className="text-xs font-medium">{s.name}</TableCell>
                        <TableCell className="text-xs text-right">{s.skipped.toLocaleString()}</TableCell>
                        <TableCell className="text-xs text-right">{s.downsellConverted}</TableCell>
                        <TableCell className="text-xs text-right font-medium">${(s.downsellConverted * DOWNSELL_PRICE).toLocaleString()}</TableCell>
                        <TableCell className="text-xs text-right">{s.skipped > 0 ? `${((s.downsellConverted / s.skipped) * 100).toFixed(1)}%` : "—"}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ─── TAB: Revenue ─── */}
          <TabsContent value="revenue" className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              {/* Revenue by Tier */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Revenue by Tier (Base Case)</CardTitle>
                </CardHeader>
                <CardContent>
                  <ChartContainer config={{ revenue: { label: "Revenue", color: "hsl(var(--primary))" } }} className="h-[280px]">
                    <BarChart data={revenueByTier}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="name" tick={{ fontSize: 9 }} angle={-25} textAnchor="end" height={50} />
                      <YAxis tick={{ fontSize: 10 }} />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Bar dataKey="revenue" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ChartContainer>
                </CardContent>
              </Card>

              {/* Sales Timeline */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Sales Timeline — 3 Scenarios</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {timelineData.map((row, i) => (
                      <div key={i} className="flex items-center gap-3">
                        <span className="text-xs font-medium w-24" style={{ color: SCENARIOS[i].color }}>{row.scenario}</span>
                        <div className="flex-1 grid grid-cols-3 gap-2 text-center">
                          <div>
                            <p className="text-[10px] text-muted-foreground">Day 1</p>
                            <p className="text-sm font-bold" style={{ color: SCENARIOS[i].color }}>${row["Day 1"].toLocaleString()}</p>
                          </div>
                          <div>
                            <p className="text-[10px] text-muted-foreground">Day 7</p>
                            <p className="text-sm font-bold" style={{ color: SCENARIOS[i].color }}>${row["Day 7"].toLocaleString()}</p>
                          </div>
                          <div>
                            <p className="text-[10px] text-muted-foreground">Day 30</p>
                            <p className="text-sm font-bold" style={{ color: SCENARIOS[i].color }}>${row["Day 30"].toLocaleString()}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Revenue Split Pie */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Revenue Split: Funnel vs Downsell</CardTitle>
              </CardHeader>
              <CardContent className="flex items-center justify-center gap-8">
                <div className="text-center">
                  <p className="text-3xl font-bold text-foreground">${(base.totalRevenue - base.downsellRevenue).toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground">Funnel Tiers</p>
                </div>
                <Separator orientation="vertical" className="h-12" />
                <div className="text-center">
                  <p className="text-3xl font-bold text-primary">${base.downsellRevenue.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground">$11/mo Downsell</p>
                </div>
                <Separator orientation="vertical" className="h-12" />
                <div className="text-center">
                  <p className="text-3xl font-bold text-foreground">${base.clipperCost.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground">Clipper Cost</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Footer */}
        <p className="text-center text-[10px] text-muted-foreground py-4">
          Gratitude Engine™ · Funnel Command Center · Projections are estimates based on editable inputs
        </p>
      </main>
    </div>
  );
}
