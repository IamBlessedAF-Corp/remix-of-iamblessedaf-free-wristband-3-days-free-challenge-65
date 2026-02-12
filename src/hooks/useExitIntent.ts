import { useEffect, useRef, useCallback } from "react";

/**
 * useExitIntent — Detects exit intent on desktop (mouse leaves viewport top)
 * and mobile (visibility change / back button).
 * 
 * Fires the callback once per session (per page). Respects a cooldown
 * so users aren't spammed across offer pages.
 * 
 * @param onExitIntent - callback when exit intent is detected
 * @param options.enabled - whether detection is active (default true)
 * @param options.delayMs - minimum ms on page before detection activates (default 5000)
 * @param options.sessionKey - unique key per page to prevent re-triggering
 */

interface ExitIntentOptions {
  enabled?: boolean;
  delayMs?: number;
  sessionKey?: string;
}

const COOLDOWN_KEY = "exit-intent-cooldown";
const COOLDOWN_MS = 60_000; // 1 min between triggers across pages

export function useExitIntent(
  onExitIntent: () => void,
  options: ExitIntentOptions = {}
) {
  const { enabled = true, delayMs = 5000, sessionKey = "default" } = options;
  const firedRef = useRef(false);
  const readyRef = useRef(false);
  const callbackRef = useRef(onExitIntent);
  callbackRef.current = onExitIntent;

  const fire = useCallback(() => {
    if (firedRef.current || !readyRef.current) return;

    // Check cooldown
    const lastFired = sessionStorage.getItem(COOLDOWN_KEY);
    if (lastFired && Date.now() - parseInt(lastFired, 10) < COOLDOWN_MS) return;

    // Check if already fired for this page
    const pageKey = `exit-intent-fired-${sessionKey}`;
    if (sessionStorage.getItem(pageKey)) return;

    firedRef.current = true;
    sessionStorage.setItem(pageKey, "1");
    sessionStorage.setItem(COOLDOWN_KEY, String(Date.now()));
    callbackRef.current();
  }, [sessionKey]);

  useEffect(() => {
    if (!enabled) return;

    // Delay before activation
    const timer = setTimeout(() => {
      readyRef.current = true;
    }, delayMs);

    // Desktop: mouse leaves top of viewport
    const handleMouseLeave = (e: MouseEvent) => {
      if (e.clientY <= 0) {
        fire();
      }
    };

    // Mobile: tab switch / app background
    const handleVisibility = () => {
      if (document.visibilityState === "hidden") {
        fire();
      }
    };

    document.addEventListener("mouseleave", handleMouseLeave);
    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      clearTimeout(timer);
      document.removeEventListener("mouseleave", handleMouseLeave);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, [enabled, delayMs, fire]);
}
