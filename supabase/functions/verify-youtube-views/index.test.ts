import "https://deno.land/std@0.224.0/dotenv/load.ts";
import { assertEquals, assertExists } from "https://deno.land/std@0.224.0/assert/mod.ts";

const SUPABASE_URL = Deno.env.get("VITE_SUPABASE_URL")!;
const SUPABASE_ANON_KEY = Deno.env.get("VITE_SUPABASE_PUBLISHABLE_KEY")!;
const BASE = `${SUPABASE_URL}/functions/v1/verify-youtube-views`;

Deno.test("verify-youtube-views: rejects missing clip_id", async () => {
  const res = await fetch(BASE, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
    },
    body: JSON.stringify({}),
  });
  const status = res.status;
  assertEquals(status >= 400 && status < 600, true);
  await res.text();
});

Deno.test("verify-youtube-views: rejects nonexistent clip gracefully", async () => {
  const res = await fetch(BASE, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
    },
    body: JSON.stringify({ clip_id: "00000000-0000-0000-0000-000000000000" }),
  });
  // Should handle gracefully (not crash)
  const status = res.status;
  assertEquals(status < 500, true);
  await res.text();
});

Deno.test("verify-youtube-views: handles CORS preflight", async () => {
  const res = await fetch(BASE, { method: "OPTIONS" });
  assertEquals(res.status, 200);
  await res.text();
});
