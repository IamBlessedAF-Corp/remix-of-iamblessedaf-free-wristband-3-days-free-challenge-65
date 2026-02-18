import "https://deno.land/std@0.224.0/dotenv/load.ts";
import { assertEquals, assertExists } from "https://deno.land/std@0.224.0/assert/mod.ts";

const SUPABASE_URL = Deno.env.get("VITE_SUPABASE_URL")!;
const SUPABASE_ANON_KEY = Deno.env.get("VITE_SUPABASE_PUBLISHABLE_KEY")!;
const BASE = `${SUPABASE_URL}/functions/v1/confirm-blessing`;

Deno.test("confirm-blessing: rejects GET method", async () => {
  const res = await fetch(BASE, {
    method: "GET",
    headers: { Authorization: `Bearer ${SUPABASE_ANON_KEY}` },
  });
  assertEquals(res.status, 405);
  await res.text();
});

Deno.test("confirm-blessing: rejects invalid token format", async () => {
  const res = await fetch(BASE, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
    },
    body: JSON.stringify({ token: "not-a-uuid" }),
  });
  assertEquals(res.status, 400);
  const body = await res.json();
  assertEquals(body.success, false);
});

Deno.test("confirm-blessing: handles nonexistent UUID token", async () => {
  const res = await fetch(BASE, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
    },
    body: JSON.stringify({ token: "00000000-0000-0000-0000-000000000000" }),
  });
  // Should return 200 with success:false (not found by RPC)
  const body = await res.json();
  assertEquals(body.success, false);
});

Deno.test("confirm-blessing: handles CORS preflight", async () => {
  const res = await fetch(BASE, { method: "OPTIONS" });
  assertEquals(res.status, 200);
  await res.text();
});
