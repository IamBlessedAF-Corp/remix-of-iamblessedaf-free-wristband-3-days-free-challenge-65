import { App } from "@slack/bolt";
import { config } from "./config.js";
import { handleMessage } from "./handlers/message.js";

const app = new App({
  token: config.SLACK_BOT_TOKEN,
  signingSecret: config.SLACK_SIGNING_SECRET,
  appToken: config.SLACK_APP_TOKEN,
  socketMode: true, // WebSocket — no public URL needed
  // Layer 1: Slack request signature verification is built-in via signingSecret
});

// Register message handler (all security checks inside)
app.message(handleMessage);

// Global error handler
app.error(async (error) => {
  console.error(
    `[${new Date().toISOString()}] Unhandled error:`,
    error.message || error
  );
});

// Start
(async () => {
  await app.start(config.PORT);
  console.log(
    `[${new Date().toISOString()}] Hormozi Bot running (Socket Mode)`
  );
  console.log(`  Allowed user:    ${config.ALLOWED_USER_ID}`);
  console.log(`  Allowed channel: ${config.ALLOWED_CHANNEL_ID}`);
  console.log(`  Claude model:    ${config.CLAUDE_MODEL}`);
  console.log(
    `  Rate limit:      ${config.RATE_LIMIT_MAX} req / ${config.RATE_LIMIT_WINDOW_MS / 1000}s`
  );
})();
