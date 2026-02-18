import { supabase } from "@/integrations/supabase/client";

/** Session ID for grouping errors from the same browser session */
const SESSION_ID = `ses_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;

interface ErrorPayload {
  source: "frontend" | "edge_function";
  level: "error" | "warn" | "fatal";
  message: string;
  stack?: string;
  component?: string;
  page_url?: string;
  user_agent?: string;
  session_id?: string;
  metadata?: Record<string, unknown>;
}

/** Debounce map to avoid flooding identical errors */
const recentFingerprints = new Map<string, number>();
const DEBOUNCE_MS = 5_000;

function quickFingerprint(msg: string): string {
  let hash = 0;
  for (let i = 0; i < msg.length; i++) {
    hash = ((hash << 5) - hash) + msg.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash).toString(36);
}

function shouldReport(message: string): boolean {
  const fp = quickFingerprint(message);
  const now = Date.now();
  const last = recentFingerprints.get(fp);
  if (last && now - last < DEBOUNCE_MS) return false;
  recentFingerprints.set(fp, now);

  // Cleanup old entries
  if (recentFingerprints.size > 100) {
    for (const [key, ts] of recentFingerprints.entries()) {
      if (now - ts > DEBOUNCE_MS) recentFingerprints.delete(key);
    }
  }
  return true;
}

/**
 * Send an error event to the ingest-error edge function.
 * Non-blocking — never throws.
 */
export async function captureError(
  error: Error | string,
  extra?: { component?: string; level?: "error" | "warn" | "fatal"; metadata?: Record<string, unknown> }
): Promise<void> {
  try {
    const message = typeof error === "string" ? error : error.message;
    if (!shouldReport(message)) return;

    const payload: ErrorPayload = {
      source: "frontend",
      level: extra?.level || "error",
      message,
      stack: typeof error === "object" ? error.stack : undefined,
      component: extra?.component,
      page_url: window.location.href,
      user_agent: navigator.userAgent,
      session_id: SESSION_ID,
      metadata: extra?.metadata,
    };

    // Fire-and-forget
    supabase.functions.invoke("ingest-error", { body: payload }).catch(() => {
      // Silently fail — we can't report errors about error reporting
    });
  } catch {
    // Never throw from the error capture system
  }
}

/**
 * Install global error handlers for uncaught errors and unhandled rejections.
 * Call once at app startup (e.g., in main.tsx).
 */
export function installGlobalErrorHandlers(): void {
  window.addEventListener("error", (event) => {
    captureError(event.error || event.message, {
      component: "window.onerror",
      metadata: {
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
      },
    });
  });

  window.addEventListener("unhandledrejection", (event) => {
    const reason = event.reason;
    const message = reason instanceof Error ? reason.message : String(reason);
    captureError(reason instanceof Error ? reason : message, {
      component: "unhandledrejection",
    });
  });
}
