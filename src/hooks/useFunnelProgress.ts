import { useState, useEffect, useCallback, useMemo } from "react";
import { useLocation } from "react-router-dom";

/**
 * Funnel steps — the canonical journey from challenge → highest tier.
 * Each step has an XP value awarded when the user first reaches it.
 */
export interface FunnelStep {
  id: string;
  label: string;
  shortLabel: string;
  path: string | string[];  // matching route(s)
  xp: number;               // XP awarded on first visit
  emoji: string;
}

export const FUNNEL_STEPS: FunnelStep[] = [
  { id: "challenge",   label: "Join Challenge",        shortLabel: "Join",      path: "/challenge",        xp: 10,  emoji: "🚀" },
  { id: "thanks",      label: "Challenge Confirmed",   shortLabel: "Confirmed", path: "/challenge/thanks",  xp: 25,  emoji: "✅" },
  { id: "confirm",     label: "Blessing Confirmed",    shortLabel: "Blessed",   path: "/confirm",          xp: 50,  emoji: "🙏" },
  { id: "offer-22",    label: "Starter Gift Pack",     shortLabel: "$22",       path: "/",                 xp: 75,  emoji: "📿" },
  { id: "offer-111",   label: "Identity Pack",         shortLabel: "$111",      path: ["/offer/111", "/offer/111/grok", "/offer/111/gpt"], xp: 150, emoji: "👕" },
  { id: "offer-444",   label: "Habit Lock Pack",       shortLabel: "$444",      path: "/offer/444",        xp: 300, emoji: "🔒" },
  { id: "offer-1111",  label: "Kingdom Pack",          shortLabel: "$1,111",    path: "/offer/1111",       xp: 750, emoji: "👑" },
  { id: "offer-4444",  label: "Ambassador",            shortLabel: "$4,444",    path: "/offer/4444",       xp: 1500, emoji: "💎" },
  { id: "portal",      label: "Ambassador Portal",     shortLabel: "Portal",    path: "/portal",           xp: 2000, emoji: "🏛️" },
];

const STORAGE_KEY = "funnel-progress";

interface FunnelProgressState {
  completedSteps: string[];  // step ids
  totalXp: number;
  currentStepId: string | null;
  lastAwardedStep: string | null;
}

function loadState(): FunnelProgressState {
  try {
    // Try sessionStorage first, fall back to localStorage for migration
    const raw = sessionStorage.getItem(STORAGE_KEY) || localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      // Migrate to sessionStorage if only in localStorage
      if (!sessionStorage.getItem(STORAGE_KEY) && localStorage.getItem(STORAGE_KEY)) {
        sessionStorage.setItem(STORAGE_KEY, raw);
      }
      return parsed;
    }
  } catch {}
  return { completedSteps: [], totalXp: 0, currentStepId: null, lastAwardedStep: null };
}

function saveState(state: FunnelProgressState) {
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  // Also keep localStorage as backup for cross-tab
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

/**
 * Returns the path of the furthest funnel step the user has reached.
 * Useful for redirecting users back to where they left off.
 */
export function getFunnelResumeRoute(): string | null {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY) || localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const state: FunnelProgressState = JSON.parse(raw);
    if (!state.currentStepId) return null;
    const step = FUNNEL_STEPS.find((s) => s.id === state.currentStepId);
    if (!step) return null;
    return Array.isArray(step.path) ? step.path[0] : step.path;
  } catch {
    return null;
  }
}

export function useFunnelProgress() {
  const location = useLocation();
  const [state, setState] = useState<FunnelProgressState>(loadState);
  const [xpJustEarned, setXpJustEarned] = useState<number | null>(null);

  // Determine current step based on route
  const currentStep = useMemo(() => {
    const path = location.pathname;
    return FUNNEL_STEPS.find((s) => {
      if (Array.isArray(s.path)) return s.path.some((p) => path.startsWith(p));
      // /confirm/:token should match /confirm
      return path.startsWith(s.path);
    }) ?? null;
  }, [location.pathname]);

  // Current step index (for progress %)
  const currentStepIndex = currentStep
    ? FUNNEL_STEPS.findIndex((s) => s.id === currentStep.id)
    : -1;

  // Progress percentage
  const progressPercent = useMemo(() => {
    if (state.completedSteps.length === 0 && currentStepIndex < 0) return 0;
    // Find the highest completed step index
    const highestCompleted = Math.max(
      ...state.completedSteps.map((id) => FUNNEL_STEPS.findIndex((s) => s.id === id)),
      currentStepIndex
    );
    // +1 because we count current step as "reached"
    return Math.round(((highestCompleted + 1) / FUNNEL_STEPS.length) * 100);
  }, [state.completedSteps, currentStepIndex]);

  // Auto-track step visits and award XP
  useEffect(() => {
    if (!currentStep) return;
    if (state.completedSteps.includes(currentStep.id)) {
      // Already completed, just update current
      setState((s) => {
        const updated = { ...s, currentStepId: currentStep.id };
        saveState(updated);
        return updated;
      });
      return;
    }

    // New step reached — award XP!
    setXpJustEarned(currentStep.xp);
    setState((s) => {
      const updated: FunnelProgressState = {
        ...s,
        completedSteps: [...s.completedSteps, currentStep.id],
        totalXp: s.totalXp + currentStep.xp,
        currentStepId: currentStep.id,
        lastAwardedStep: currentStep.id,
      };
      saveState(updated);
      return updated;
    });

    // Clear the XP notification after 3s
    const timer = setTimeout(() => setXpJustEarned(null), 3000);
    return () => clearTimeout(timer);
  }, [currentStep?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  /** Manually mark a step as complete (e.g., after checkout) */
  const completeStep = useCallback((stepId: string) => {
    const step = FUNNEL_STEPS.find((s) => s.id === stepId);
    if (!step) return;

    setState((s) => {
      if (s.completedSteps.includes(stepId)) return s;
      const updated: FunnelProgressState = {
        ...s,
        completedSteps: [...s.completedSteps, stepId],
        totalXp: s.totalXp + step.xp,
        lastAwardedStep: stepId,
      };
      saveState(updated);
      return updated;
    });
    setXpJustEarned(step.xp);
    setTimeout(() => setXpJustEarned(null), 3000);
  }, []);

  return {
    steps: FUNNEL_STEPS,
    completedSteps: state.completedSteps,
    currentStep,
    currentStepIndex,
    totalXp: state.totalXp,
    progressPercent,
    xpJustEarned,
    completeStep,
  };
}
