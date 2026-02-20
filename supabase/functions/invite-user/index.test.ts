import "https://deno.land/std@0.224.0/dotenv/load.ts";
import { assertEquals, assertExists } from "https://deno.land/std@0.224.0/assert/mod.ts";

const SUPABASE_URL = Deno.env.get("VITE_SUPABASE_URL")!;
const SUPABASE_ANON_KEY = Deno.env.get("VITE_SUPABASE_PUBLISHABLE_KEY")!;
const BASE = `${SUPABASE_URL}/functions/v1/invite-user`;

Deno.test("invite-user: rejects unauthenticated requests", async () => {
  const res = await fetch(BASE, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: "test@test.com", password: "Test1234!", role: "developer" }),
  });
  assertEquals(res.status, 401);
  const body = await res.json();
  assertExists(body.error);
});

Deno.test("invite-user: rejects non-admin with anon key", async () => {
  const res = await fetch(BASE, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
    },
    body: JSON.stringify({ email: "test@test.com", password: "Test1234!", role: "developer" }),
  });
  // Should return 401 (invalid JWT) or 403 (not admin)
  const status = res.status;
  assertEquals(status === 401 || status === 403, true);
  const body = await res.json();
  assertExists(body.error);
});

Deno.test("invite-user: handles CORS preflight", async () => {
  const res = await fetch(BASE, { method: "OPTIONS" });
  assertEquals(res.status, 200);
  await res.text();
});
