import "https://deno.land/std@0.224.0/dotenv/load.ts";
import { assertEquals, assertExists } from "https://deno.land/std@0.224.0/assert/mod.ts";

const SUPABASE_URL = Deno.env.get("VITE_SUPABASE_URL")!;
const SUPABASE_ANON_KEY = Deno.env.get("VITE_SUPABASE_PUBLISHABLE_KEY")!;
const BASE = `${SUPABASE_URL}/functions/v1/create-checkout`;

Deno.test("create-checkout: rejects missing tier", async () => {
  const res = await fetch(BASE, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
    },
    body: JSON.stringify({}),
  });
  assertEquals(res.status, 400);
  const body = await res.json();
  assertExists(body.error);
});

Deno.test("create-checkout: rejects invalid tier", async () => {
  const res = await fetch(BASE, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
    },
    body: JSON.stringify({ tier: "nonexistent-tier-xyz" }),
  });
  assertEquals(res.status, 400);
  const body = await res.json();
  assertExists(body.error);
});

Deno.test("create-checkout: handles CORS preflight", async () => {
  const res = await fetch(BASE, { method: "OPTIONS" });
  assertEquals(res.status, 200);
  await res.text();
});
