import { useState } from "react";
import { Link2, RefreshCw, ArrowLeft, Shield } from "lucide-react";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { useLinkAnalytics } from "@/hooks/useLinkAnalytics";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import LinkStatsCards from "@/components/admin/LinkStatsCards";
import LinkPieCharts from "@/components/admin/LinkPieCharts";
import DailyClicksChart from "@/components/admin/DailyClicksChart";
import CampaignTable from "@/components/admin/CampaignTable";
import TopLinksTable from "@/components/admin/TopLinksTable";
import UtmBuilder from "@/components/admin/UtmBuilder";
import RecentBuilderLinks from "@/components/admin/RecentBuilderLinks";
import BoardLoginForm from "@/components/board/BoardLoginForm";

const PERIOD_OPTIONS = [
  { label: "7d", days: 7 },
  { label: "30d", days: 30 },
  { label: "90d", days: 90 },
];

export default function AdminLinks() {
  const { isAdmin, loading: authLoading, signInWithEmail, signOut, user } = useAdminAuth();
  const [days, setDays] = useState(30);
  const { stats, loading, refetch } = useLinkAnalytics(days);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <RefreshCw className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  if (!user || !isAdmin) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="max-w-sm w-full">
          <div className="flex items-center justify-center gap-2 mb-6">
            <Shield className="w-5 h-5 text-primary" />
            <h1 className="text-lg font-bold text-foreground">Admin Access Required</h1>
          </div>
          <BoardLoginForm signInWithEmail={signInWithEmail} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/50 bg-card/50 backdrop-blur-sm sticky top-0 z-20">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <a href="/board" className="text-muted-foreground hover:text-foreground transition-colors">
              <ArrowLeft className="w-4 h-4" />
            </a>
            <Link2 className="w-5 h-5 text-primary" />
            <h1 className="text-base font-bold text-foreground">Link Analytics</h1>
          </div>

          <div className="flex items-center gap-2">
            {/* Period selector */}
            <div className="flex bg-secondary rounded-lg p-0.5">
              {PERIOD_OPTIONS.map((opt) => (
                <button
                  key={opt.days}
                  onClick={() => setDays(opt.days)}
                  className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors ${
                    days === opt.days
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>

            <Button variant="outline" size="sm" onClick={refetch} className="gap-1.5">
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </Button>

            <Button variant="ghost" size="sm" onClick={signOut} className="text-xs text-muted-foreground">
              Sign out
            </Button>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-6xl mx-auto px-4 py-6 space-y-6">
        {loading && !stats ? (
          <div className="flex items-center justify-center py-20">
            <RefreshCw className="w-6 h-6 animate-spin text-primary" />
          </div>
        ) : stats ? (
          <>
            <LinkStatsCards
              totalLinks={stats.totalLinks}
              totalClicks={stats.totalClicks}
              activeLinks={stats.activeLinks}
              periodClicks={stats.dailyClicks.reduce((s, d) => s + d.clicks, 0)}
            />

            <DailyClicksChart dailyClicks={stats.dailyClicks} />

            <LinkPieCharts
              deviceBreakdown={stats.deviceBreakdown}
              browserBreakdown={stats.browserBreakdown}
              osBreakdown={stats.osBreakdown}
            />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <CampaignTable campaigns={stats.topCampaigns} />
              <div className="bg-card border border-border/50 rounded-xl p-5">
                <h3 className="text-sm font-bold text-foreground mb-4">Quick Stats</h3>
                <div className="space-y-3 text-xs">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Avg clicks/link</span>
                    <span className="font-bold text-foreground">
                      {stats.totalLinks > 0
                        ? (stats.totalClicks / stats.totalLinks).toFixed(1)
                        : "0"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Top device</span>
                    <span className="font-bold text-foreground">
                      {Object.entries(stats.deviceBreakdown).sort((a, b) => b[1] - a[1])[0]?.[0] || "—"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Top browser</span>
                    <span className="font-bold text-foreground">
                      {Object.entries(stats.browserBreakdown).sort((a, b) => b[1] - a[1])[0]?.[0] || "—"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Top OS</span>
                    <span className="font-bold text-foreground">
                      {Object.entries(stats.osBreakdown).sort((a, b) => b[1] - a[1])[0]?.[0] || "—"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Busiest day</span>
                    <span className="font-bold text-foreground">
                      {stats.dailyClicks.sort((a, b) => b.clicks - a.clicks)[0]?.date.substring(5) || "—"}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <UtmBuilder />

            <RecentBuilderLinks />

            <TopLinksTable links={stats.topLinks} />
          </>
        ) : (
          <p className="text-center text-muted-foreground py-20">No data available.</p>
        )}
      </main>
    </div>
  );
}
