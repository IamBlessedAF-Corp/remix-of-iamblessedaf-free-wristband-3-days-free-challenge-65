import "https://deno.land/std@0.224.0/dotenv/load.ts";
import { assertEquals, assertExists } from "https://deno.land/std@0.224.0/assert/mod.ts";

const SUPABASE_URL = Deno.env.get("VITE_SUPABASE_URL")!;
const SUPABASE_ANON_KEY = Deno.env.get("VITE_SUPABASE_PUBLISHABLE_KEY")!;
const BASE = `${SUPABASE_URL}/functions/v1/expert-scripts`;

Deno.test("expert-scripts: rejects unauthenticated requests", async () => {
  const res = await fetch(BASE, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ framework: "origin-story", heroProfile: {} }),
  });
  assertEquals(res.status, 401);
  const body = await res.json();
  assertExists(body.error);
});

Deno.test("expert-scripts: rejects invalid token", async () => {
  const res = await fetch(BASE, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer invalid-token-xyz",
    },
    body: JSON.stringify({ framework: "origin-story", heroProfile: {} }),
  });
  assertEquals(res.status, 401);
  const body = await res.json();
  assertExists(body.error);
});

Deno.test("expert-scripts: rejects invalid framework with anon key", async () => {
  const res = await fetch(BASE, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
    },
    body: JSON.stringify({
      framework: "nonexistent-framework-xyz",
      heroProfile: {
        name: "Test",
        brand: "Test",
        niche: "Test",
        audience: "Test",
        originStory: "Test",
        transformation: "Test",
        mechanism: "Test",
        enemy: "Test",
        bigPromise: "Test",
        proof: "Test",
      },
    }),
  });
  // Should return 401 (invalid JWT) or 400 (bad framework)
  const status = res.status;
  assertEquals(status === 401 || status === 400, true);
  await res.json();
});

Deno.test("expert-scripts: handles CORS preflight", async () => {
  const res = await fetch(BASE, { method: "OPTIONS" });
  assertEquals(res.status, 200);
  await res.text();
});
