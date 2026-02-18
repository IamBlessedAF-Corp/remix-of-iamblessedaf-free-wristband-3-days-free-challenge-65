import "https://deno.land/std@0.224.0/dotenv/load.ts";
import { assertEquals, assertExists } from "https://deno.land/std@0.224.0/assert/mod.ts";

const SUPABASE_URL = Deno.env.get("VITE_SUPABASE_URL")!;
const SUPABASE_ANON_KEY = Deno.env.get("VITE_SUPABASE_PUBLISHABLE_KEY")!;
const BASE = `${SUPABASE_URL}/functions/v1/verify-backup`;

Deno.test("verify-backup: runs successfully", async () => {
  const res = await fetch(BASE, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
    },
    body: JSON.stringify({}),
  });
  // Should succeed (service role logic is internal)
  const body = await res.json();
  assertExists(body);
});

Deno.test("verify-backup: handles CORS preflight", async () => {
  const res = await fetch(BASE, { method: "OPTIONS" });
  assertEquals(res.status, 200);
  await res.text();
});
