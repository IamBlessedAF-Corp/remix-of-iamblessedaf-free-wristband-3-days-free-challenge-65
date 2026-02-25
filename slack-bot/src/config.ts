import { z } from "zod";
import "dotenv/config";

const envSchema = z.object({
  // Slack credentials
  SLACK_BOT_TOKEN: z.string().startsWith("xoxb-"),
  SLACK_SIGNING_SECRET: z.string().min(20),
  SLACK_APP_TOKEN: z.string().startsWith("xapp-"), // Socket Mode

  // Anthropic
  ANTHROPIC_API_KEY: z.string().startsWith("sk-ant-"),

  // Security — hardcoded defaults for Joel only
  ALLOWED_USER_ID: z.string().default("U0AGS9Y2ULB"),
  ALLOWED_CHANNEL_ID: z.string().default("D0AGH88QWR5"),

  // Rate limiting
  RATE_LIMIT_MAX: z.coerce.number().default(10),
  RATE_LIMIT_WINDOW_MS: z.coerce.number().default(60_000),

  // Claude model
  CLAUDE_MODEL: z.string().default("claude-sonnet-4-20250514"),
  CLAUDE_MAX_TOKENS: z.coerce.number().default(4096),

  // Server
  PORT: z.coerce.number().default(3000),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error("FATAL: Invalid environment configuration:");
  console.error(parsed.error.flatten().fieldErrors);
  process.exit(1);
}

export const config = parsed.data;
