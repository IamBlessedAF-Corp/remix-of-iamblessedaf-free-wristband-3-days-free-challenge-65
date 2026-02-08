import { useMemo } from "react";

const STORAGE_KEY = "urgency_visit_count";
const VISIT_TS_KEY = "urgency_first_visit_ts";

/**
 * Returns a "remaining" count that decays for returning visitors.
 * Each new session (tab/page load) increments the visit counter in localStorage.
 * The remaining count decreases by `decayPerVisit` for each revisit,
 * clamped to a minimum floor so it never hits zero (maintaining urgency).
 *
 * @param total        – Total units originally available (e.g. 1111 wristbands)
 * @param baseRemaining – Remaining count shown to first-time visitors (e.g. 91)
 * @param decayPerVisit – How many fewer to show per revisit (default 7)
 * @param floor         – Never go below this number (default 3)
 */
export function useUrgencyStock(
  total: number,
  baseRemaining: number,
  decayPerVisit = 7,
  floor = 3
) {
  const remaining = useMemo(() => {
    // Get or init visit count
    let visits = 1;
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        visits = parseInt(stored, 10) + 1;
      }
      localStorage.setItem(STORAGE_KEY, String(visits));

      // Also store first visit timestamp for potential future time-based decay
      if (!localStorage.getItem(VISIT_TS_KEY)) {
        localStorage.setItem(VISIT_TS_KEY, String(Date.now()));
      }
    } catch {
      // localStorage unavailable (incognito etc.), default to 1
    }

    // First visit sees baseRemaining, subsequent visits see fewer
    const decayed = baseRemaining - (visits - 1) * decayPerVisit;
    return Math.max(decayed, floor);
  }, [baseRemaining, decayPerVisit, floor]);

  const claimedPercent = Math.round(((total - remaining) / total) * 100);

  return { remaining, total, claimedPercent };
}
