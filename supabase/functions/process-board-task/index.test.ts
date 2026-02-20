import "https://deno.land/std@0.224.0/dotenv/load.ts";
import { assertEquals, assertExists } from "https://deno.land/std@0.224.0/assert/mod.ts";

const SUPABASE_URL = Deno.env.get("VITE_SUPABASE_URL")!;
const SUPABASE_ANON_KEY = Deno.env.get("VITE_SUPABASE_PUBLISHABLE_KEY")!;
const BASE = `${SUPABASE_URL}/functions/v1/process-board-task`;

Deno.test("process-board-task: rejects unauthenticated requests", async () => {
  const res = await fetch(BASE, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ cardId: "test-card-id" }),
  });
  assertEquals(res.status, 401);
  await res.text();
});

Deno.test("process-board-task: rejects invalid token", async () => {
  const res = await fetch(BASE, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer invalid-token-xyz",
    },
    body: JSON.stringify({ cardId: "test-card-id" }),
  });
  assertEquals(res.status, 401);
  await res.text();
});

Deno.test("process-board-task: rejects missing cardId", async () => {
  const res = await fetch(BASE, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
    },
    body: JSON.stringify({}),
  });
  // 400 (missing field) or 401 (invalid JWT)
  const status = res.status;
  assertEquals(status === 400 || status === 401, true);
  await res.text();
});

Deno.test("process-board-task: handles CORS preflight", async () => {
  const res = await fetch(BASE, { method: "OPTIONS" });
  assertEquals(res.status, 200);
  await res.text();
});
