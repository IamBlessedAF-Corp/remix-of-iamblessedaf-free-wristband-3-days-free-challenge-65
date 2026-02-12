import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  ChevronDown, ChevronRight, Copy, Check, Sparkles,
  ArrowRight, Loader2, Trophy, Search, FileDown, X, LogOut, Mic, CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { FRAMEWORK_SECTIONS, FRAMEWORKS } from "@/data/expertFrameworks";
import { useExpertScripts } from "@/hooks/useExpertScripts";
import { useAuth } from "@/hooks/useAuth";
import ExpertsAuthGate from "@/components/experts/ExpertsAuthGate";
import VoiceAgentModal from "@/components/experts/VoiceAgentModal";
import ReactMarkdown from "react-markdown";
import logoImg from "@/assets/logo.png";
import { toast } from "sonner";

const ELEVENLABS_AGENT_ID = "agent_3901kh7tvnf8ftpbf5p771dgmbyc";

/* ─── PDF Export helper ─── */
const exportPdf = (heroProfile: any, outputs: Record<string, string>) => {
  const profileSection = heroProfile
    ? `HERO PROFILE\n${"=".repeat(40)}\nName: ${heroProfile.name}\nBrand: ${heroProfile.brand}\nNiche: ${heroProfile.niche}\nAudience: ${heroProfile.audience}\nOrigin Story: ${heroProfile.originStory}\nTransformation: ${heroProfile.transformation}\nMechanism: ${heroProfile.mechanism}\nEnemy: ${heroProfile.enemy}\nBig Promise: ${heroProfile.bigPromise}\nProof: ${heroProfile.proof}\n\n`
    : "";

  const scriptsSection = FRAMEWORKS
    .filter((fw) => outputs[fw.id])
    .map((fw) => `${"=".repeat(40)}\n${fw.secret}: ${fw.name}\n${"=".repeat(40)}\n\n${outputs[fw.id]}`)
    .join("\n\n");

  const fullText = profileSection + scriptsSection;

  // Create a print window with formatted content
  const printWindow = window.open("", "_blank");
  if (!printWindow) {
    toast.error("Please allow popups to export PDF");
    return;
  }

  const htmlContent = `<!DOCTYPE html>
<html>
<head>
  <title>Expert Scripts — ${heroProfile?.brand || "Export"}</title>
  <style>
    body { font-family: Georgia, serif; max-width: 800px; margin: 40px auto; padding: 0 20px; color: #1a1a1a; line-height: 1.6; }
    h1 { font-size: 28px; border-bottom: 3px solid #7c3aed; padding-bottom: 10px; }
    h2 { font-size: 22px; color: #7c3aed; margin-top: 40px; border-bottom: 1px solid #e5e7eb; padding-bottom: 8px; }
    h3 { font-size: 18px; margin-top: 24px; }
    .profile { background: #f9fafb; padding: 20px; border-radius: 8px; margin-bottom: 30px; }
    .profile dt { font-weight: bold; color: #4b5563; margin-top: 8px; }
    .profile dd { margin-left: 0; margin-bottom: 4px; }
    .script-section { page-break-inside: avoid; margin-bottom: 40px; }
    .badge { display: inline-block; background: #7c3aed; color: white; padding: 2px 10px; border-radius: 12px; font-size: 12px; font-weight: bold; }
    hr { border: none; border-top: 2px solid #e5e7eb; margin: 30px 0; }
    @media print { body { margin: 20px; } }
  </style>
</head>
<body>
  <h1>🧠 Expert Scripts AI Lab</h1>
  ${heroProfile ? `
  <div class="profile">
    <h2>Hero Profile</h2>
    <dl>
      <dt>Name</dt><dd>${heroProfile.name}</dd>
      <dt>Brand</dt><dd>${heroProfile.brand}</dd>
      <dt>Niche</dt><dd>${heroProfile.niche}</dd>
      <dt>Audience</dt><dd>${heroProfile.audience}</dd>
      <dt>Origin Story</dt><dd>${heroProfile.originStory}</dd>
      <dt>Transformation</dt><dd>${heroProfile.transformation}</dd>
      <dt>Mechanism</dt><dd>${heroProfile.mechanism}</dd>
      <dt>Enemy</dt><dd>${heroProfile.enemy}</dd>
      <dt>Big Promise</dt><dd>${heroProfile.bigPromise}</dd>
      <dt>Proof</dt><dd>${heroProfile.proof}</dd>
    </dl>
  </div>
  ` : ""}
  ${FRAMEWORKS
    .filter((fw) => outputs[fw.id])
    .map((fw) => `
    <div class="script-section">
      <h2><span class="badge">${fw.secret}</span> ${fw.name}</h2>
      <div>${outputs[fw.id].replace(/\n/g, "<br>")}</div>
    </div>
    <hr>
  `).join("")}
  <script>window.onload = () => { window.print(); }</script>
</body>
</html>`;

  printWindow.document.write(htmlContent);
  printWindow.document.close();
  toast.success("PDF export opened — use Save as PDF in the print dialog!");
};

/* ─── Inner component (behind auth) ─── */
const ScriptsReviewInner = () => {
  const navigate = useNavigate();
  const { outputs, heroProfile, isLoading } = useExpertScripts();
  const { signOut, user } = useAuth();
  const [expandedScripts, setExpandedScripts] = useState<Record<string, boolean>>({});
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({});
  const [voiceSection, setVoiceSection] = useState<{ id: string; title: string } | null>(null);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  const completedCount = Object.keys(outputs).length;
  const totalFrameworks = FRAMEWORKS.length;
  const progressPct = Math.round((completedCount / totalFrameworks) * 100);
  const allDone = completedCount === totalFrameworks;
  const nextFramework = FRAMEWORKS.find((f) => !outputs[f.id]);

  // Filter frameworks by search query
  const query = searchQuery.toLowerCase().trim();
  const filteredFrameworks = query
    ? FRAMEWORKS.filter((fw) => {
        const nameMatch = fw.name.toLowerCase().includes(query);
        const secretMatch = fw.secret.toLowerCase().includes(query);
        const descMatch = fw.description.toLowerCase().includes(query);
        const outputMatch = outputs[fw.id]?.toLowerCase().includes(query);
        return nameMatch || secretMatch || descMatch || outputMatch;
      })
    : FRAMEWORKS;

  const toggleScript = (id: string) => {
    setExpandedScripts((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    toast.success("Copied to clipboard!");
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleCopyAll = () => {
    const allText = FRAMEWORKS
      .filter((fw) => outputs[fw.id])
      .map((fw) => `## ${fw.secret}: ${fw.name}\n\n${outputs[fw.id]}`)
      .join("\n\n---\n\n");

    if (!allText) {
      toast.error("No scripts generated yet");
      return;
    }

    const profileHeader = heroProfile
      ? `# Hero Profile\n- **Name:** ${heroProfile.name}\n- **Brand:** ${heroProfile.brand}\n- **Niche:** ${heroProfile.niche}\n- **Audience:** ${heroProfile.audience}\n- **Origin Story:** ${heroProfile.originStory}\n- **Transformation:** ${heroProfile.transformation}\n- **Mechanism:** ${heroProfile.mechanism}\n- **Enemy:** ${heroProfile.enemy}\n- **Big Promise:** ${heroProfile.bigPromise}\n- **Proof:** ${heroProfile.proof}\n\n---\n\n`
      : "";

    navigator.clipboard.writeText(profileHeader + allText);
    toast.success(`Copied all ${completedCount} scripts to clipboard!`);
  };

  const sectionStats = FRAMEWORK_SECTIONS.map((section) => {
    const sectionFrameworks = filteredFrameworks.filter((f) => f.section === section.id);
    const allSectionFw = FRAMEWORKS.filter((f) => f.section === section.id);
    const done = allSectionFw.filter((f) => outputs[f.id]).length;
    return { ...section, total: allSectionFw.length, done, frameworks: sectionFrameworks, allDone: done === allSectionFw.length };
  }).filter((s) => s.frameworks.length > 0);

  // Collapsible logic — first incomplete section is open by default
  const firstIncomplete = sectionStats.find((s) => !s.allDone)?.id;

  const isSectionOpen = (id: string) => {
    if (id in openSections) return openSections[id];
    return id === firstIncomplete;
  };

  const toggleSection = (id: string) => {
    setOpenSections((prev) => ({ ...prev, [id]: !isSectionOpen(id) }));
  };

  // Get frameworks for voice modal
  const voiceSectionFrameworks = voiceSection
    ? FRAMEWORKS.filter((f) => f.section === voiceSection.id)
    : [];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/95 backdrop-blur-md border-b border-border/30">
        <div className="max-w-3xl mx-auto px-4 py-2.5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <img src={logoImg} alt="Logo" className="h-6" />
            <span className="text-xs font-bold text-foreground">Scripts Review</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Button
              variant="outline"
              size="sm"
              onClick={() => exportPdf(heroProfile, outputs)}
              className="text-xs h-8 px-2.5 gap-1"
              disabled={completedCount === 0}
            >
              <FileDown className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">PDF</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleCopyAll}
              className="text-xs h-8 px-2.5 gap-1"
              disabled={completedCount === 0}
            >
              <Copy className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Copy All</span>
            </Button>
            <Button
              size="sm"
              onClick={() => navigate("/experts")}
              className="text-xs h-8 px-2.5 gap-1 bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              <Sparkles className="w-3.5 h-3.5" />
              Build
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => signOut()}
              className="text-xs h-8 px-2 gap-1 text-muted-foreground"
            >
              <LogOut className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-4 pt-4 pb-16">
        {/* Search bar */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search frameworks, scripts, keywords..."
            className="pl-9 pr-9 h-10 rounded-xl bg-card border-border/40"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Search results count */}
        {query && (
          <p className="text-xs text-muted-foreground mb-3">
            {filteredFrameworks.length} framework{filteredFrameworks.length !== 1 ? "s" : ""} matching "{searchQuery}"
          </p>
        )}

        {/* Progress overview */}
        <motion.div
          className="rounded-2xl p-4 mb-4 bg-card border border-border/40"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-foreground">
              {allDone ? "🏆 All 22 scripts complete!" : `${completedCount}/${totalFrameworks} scripts generated`}
            </span>
            <span className="text-xs font-bold text-primary">{progressPct}%</span>
          </div>
          <Progress value={progressPct} className="h-1.5 mb-3" />

          {heroProfile ? (
            <div className="space-y-2">
              <div className="flex flex-wrap gap-1.5">
                {[
                  { label: "Expert", value: heroProfile.name },
                  { label: "Brand", value: heroProfile.brand },
                  { label: "Niche", value: heroProfile.niche },
                ].map((chip, i) => (
                  <span
                    key={i}
                    className="text-[10px] font-medium text-muted-foreground bg-muted px-2 py-0.5 rounded-full truncate max-w-[200px]"
                  >
                    {chip.label}: {chip.value}
                  </span>
                ))}
              </div>
              <details className="text-xs text-muted-foreground">
                <summary className="cursor-pointer font-semibold text-foreground hover:text-primary transition-colors">
                  View full Hero Profile ↓
                </summary>
                <div className="mt-2 space-y-1.5 bg-muted/50 rounded-lg p-3">
                  {Object.entries(heroProfile).map(([key, value]) => (
                    <div key={key}>
                      <span className="font-semibold text-foreground capitalize">{key.replace(/([A-Z])/g, " $1")}:</span>{" "}
                      <span className="text-muted-foreground">{value || "—"}</span>
                    </div>
                  ))}
                </div>
              </details>
            </div>
          ) : (
            <p className="text-xs text-muted-foreground">
              No hero profile yet.{" "}
              <button onClick={() => navigate("/experts")} className="text-primary underline">
                Start the questionnaire →
              </button>
            </p>
          )}
        </motion.div>

        {/* Next step CTA */}
        {nextFramework && !allDone && !query && (
          <motion.button
            className="w-full mb-4 bg-primary/5 hover:bg-primary/10 border border-primary/20 rounded-xl p-3 flex items-center gap-3 text-left transition-colors"
            onClick={() => navigate("/experts")}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
              <ArrowRight className="w-4 h-4 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <span className="text-[9px] font-bold uppercase tracking-wider text-primary">Continue building</span>
              <p className="text-xs font-semibold text-foreground truncate">
                Next: {nextFramework.secret} — {nextFramework.name}
              </p>
            </div>
            <ChevronRight className="w-4 h-4 text-primary shrink-0" />
          </motion.button>
        )}

        {allDone && !query && (
          <motion.div
            className="mb-4 bg-accent border border-primary/10 rounded-2xl p-5 text-center"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <Trophy className="w-8 h-8 text-primary mx-auto mb-2" />
            <h3 className="text-sm font-bold text-foreground mb-1">Funnel Master 🎉</h3>
            <p className="text-xs text-muted-foreground">All 22 scripts are ready. Export as PDF or Copy All!</p>
          </motion.div>
        )}

        {/* Scripts by section — collapsible */}
        <div className="space-y-2">
          {sectionStats.map((section) => {
            const isOpen = isSectionOpen(section.id);

            return (
              <div key={section.id} className="rounded-xl border border-border/40 bg-card overflow-hidden">
                {/* Section header — tappable to collapse */}
                <button
                  className="w-full px-4 py-3 flex items-center gap-2.5 text-left hover:bg-accent/50 transition-colors"
                  onClick={() => toggleSection(section.id)}
                >
                  {section.allDone ? (
                    <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />
                  ) : (
                    <div className="w-4 h-4 rounded-full border-2 border-border shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    <h2 className="text-xs font-bold text-foreground leading-tight truncate">
                      {section.title}
                    </h2>
                    <p className="text-[10px] text-muted-foreground mt-0.5 truncate">{section.subtitle}</p>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${
                    section.allDone
                      ? "bg-green-500/10 text-green-600"
                      : section.done > 0
                      ? "bg-primary/10 text-primary"
                      : "bg-muted text-muted-foreground"
                  }`}>
                    {section.done}/{section.total}
                  </span>

                  {/* Voice AI button */}
                  {ELEVENLABS_AGENT_ID && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setVoiceSection({ id: section.id, title: section.title });
                      }}
                      className="p-1.5 rounded-md hover:bg-primary/10 transition-colors shrink-0"
                      title="Voice AI Interview"
                    >
                      <Mic className="w-3.5 h-3.5 text-primary" />
                    </button>
                  )}

                  <ChevronDown
                    className={`w-3.5 h-3.5 text-muted-foreground shrink-0 transition-transform duration-200 ${
                      isOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {/* Section content — collapsible */}
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2, ease: "easeInOut" }}
                      className="overflow-hidden"
                    >
                      <div className="divide-y divide-border/20">
                        {section.frameworks.map((fw) => {
                          const hasOutput = !!outputs[fw.id];
                          const isExpanded = expandedScripts[fw.id];

                          return (
                            <div key={fw.id}>
                              <button
                                className={`w-full px-4 py-3 flex items-center gap-3 text-left transition-colors ${
                                  hasOutput ? "hover:bg-accent/50" : "opacity-50"
                                }`}
                                onClick={() => hasOutput && toggleScript(fw.id)}
                                disabled={!hasOutput}
                              >
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-1.5 mb-0.5">
                                    <span className={`text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full ${
                                      hasOutput ? "text-primary bg-primary/10" : "text-muted-foreground bg-muted"
                                    }`}>
                                      {fw.secret}
                                    </span>
                                    {hasOutput && (
                                      <span className="text-[9px] font-bold uppercase tracking-wider text-green-600 bg-green-500/10 px-1.5 py-0.5 rounded-full">
                                        ✓ Done
                                      </span>
                                    )}
                                  </div>
                                  <h3 className="text-[13px] font-semibold text-foreground leading-tight">{fw.name}</h3>
                                </div>

                                {hasOutput ? (
                                  <div className="flex items-center gap-2 shrink-0">
                                    <button
                                      onClick={(e) => { e.stopPropagation(); handleCopy(fw.id, outputs[fw.id]); }}
                                      className="p-1.5 rounded-md hover:bg-muted transition-colors"
                                    >
                                      {copiedId === fw.id ? (
                                        <Check className="w-3.5 h-3.5 text-green-500" />
                                      ) : (
                                        <Copy className="w-3.5 h-3.5 text-muted-foreground" />
                                      )}
                                    </button>
                                    <ChevronDown className={`w-3.5 h-3.5 text-muted-foreground transition-transform duration-200 ${isExpanded ? "rotate-180" : ""}`} />
                                  </div>
                                ) : (
                                  <span className="text-[10px] text-muted-foreground shrink-0">Not generated</span>
                                )}
                              </button>

                              <AnimatePresence initial={false}>
                                {isExpanded && hasOutput && (
                                  <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: "auto", opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    transition={{ duration: 0.2, ease: "easeInOut" }}
                                    className="overflow-hidden"
                                  >
                                    <div className="px-4 pb-4">
                                      <div className="bg-muted/50 border border-border/30 rounded-xl p-4">
                                        <div className="prose prose-sm max-w-none text-foreground">
                                          <ReactMarkdown>{outputs[fw.id]}</ReactMarkdown>
                                        </div>
                                      </div>
                                    </div>
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            </div>
                          );
                        })}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}

          {query && filteredFrameworks.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              <Search className="w-8 h-8 mx-auto mb-2 opacity-40" />
              <p className="text-sm">No frameworks matching "{searchQuery}"</p>
            </div>
          )}
        </div>
      </div>

      {/* Voice Agent Modal */}
      <AnimatePresence>
        {voiceSection && ELEVENLABS_AGENT_ID && (
          <VoiceAgentModal
            frameworks={voiceSectionFrameworks}
            sectionTitle={voiceSection.title}
            onClose={() => setVoiceSection(null)}
            agentId={ELEVENLABS_AGENT_ID}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

const ScriptsReview = () => (
  <ExpertsAuthGate>
    <ScriptsReviewInner />
  </ExpertsAuthGate>
);

export default ScriptsReview;
