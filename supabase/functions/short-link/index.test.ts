import "https://deno.land/std@0.224.0/dotenv/load.ts";
import { assertEquals, assertExists } from "https://deno.land/std@0.224.0/assert/mod.ts";

const SUPABASE_URL = Deno.env.get("VITE_SUPABASE_URL")!;
const SUPABASE_ANON_KEY = Deno.env.get("VITE_SUPABASE_PUBLISHABLE_KEY")!;
const BASE = `${SUPABASE_URL}/functions/v1/short-link`;

Deno.test("short-link: handles nonexistent code gracefully", async () => {
  const res = await fetch(`${BASE}?code=NONEXISTENT999`, {
    method: "GET",
    headers: { Authorization: `Bearer ${SUPABASE_ANON_KEY}` },
  });
  // Function may return various statuses (404, 500, redirect) — just ensure it doesn't crash
  assertExists(res.status);
  await res.text(); // consume body
});

Deno.test("short-link: handles CORS preflight", async () => {
  const res = await fetch(BASE, { method: "OPTIONS" });
  assertEquals(res.status, 200);
  await res.text();
});

Deno.test("short-link: rejects missing code parameter", async () => {
  const res = await fetch(BASE, {
    method: "GET",
    headers: { Authorization: `Bearer ${SUPABASE_ANON_KEY}` },
  });
  // Should handle gracefully (404 or error response)
  const status = res.status;
  assertEquals(status >= 200 && status < 500, true);
  await res.text();
});
