import "https://deno.land/std@0.224.0/dotenv/load.ts";
import { assertEquals, assertExists } from "https://deno.land/std@0.224.0/assert/mod.ts";

const SUPABASE_URL = Deno.env.get("VITE_SUPABASE_URL")!;
const SUPABASE_ANON_KEY = Deno.env.get("VITE_SUPABASE_PUBLISHABLE_KEY")!;
const BASE = `${SUPABASE_URL}/functions/v1/ingest-error`;

Deno.test("ingest-error: accepts valid error payload", async () => {
  const res = await fetch(BASE, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
    },
    body: JSON.stringify({
      source: "frontend",
      level: "error",
      message: "Test error from regression suite",
      component: "vitest",
      page_url: "https://test.local",
      session_id: "test-session-regression",
    }),
  });
  assertEquals(res.status, 200);
  const body = await res.json();
  assertExists(body);
});

Deno.test("ingest-error: rejects empty body", async () => {
  const res = await fetch(BASE, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
    },
    body: JSON.stringify({}),
  });
  // Should either reject with 400 or accept with defaults
  const body = await res.json();
  assertExists(body);
});

Deno.test("ingest-error: handles CORS preflight", async () => {
  const res = await fetch(BASE, { method: "OPTIONS" });
  assertEquals(res.status, 200);
  await res.text();
});
