import { config } from "./config.js";

// Layer 2: Channel allowlist — Joel's DMs (DM channel IDs start with "D")
export function isAllowedChannel(channelId: string): boolean {
  // Allow the hardcoded channel OR any DM channel (starts with "D")
  return channelId === config.ALLOWED_CHANNEL_ID || channelId.startsWith("D");
}

// Layer 3: User allowlist — only Joel's Slack user ID
export function isAllowedUser(userId: string): boolean {
  return userId === config.ALLOWED_USER_ID;
}

// Layer 4: Bot self-message filter — prevent infinite loops
export function isBotMessage(event: {
  bot_id?: string;
  subtype?: string;
}): boolean {
  return !!event.bot_id || event.subtype === "bot_message";
}

// Layer 5: Rate limiter — sliding window, max N requests per window
const timestamps: number[] = [];

export function isRateLimited(): boolean {
  const now = Date.now();
  // Remove expired entries
  while (
    timestamps.length > 0 &&
    now - timestamps[0] > config.RATE_LIMIT_WINDOW_MS
  ) {
    timestamps.shift();
  }
  if (timestamps.length >= config.RATE_LIMIT_MAX) {
    return true;
  }
  timestamps.push(now);
  return false;
}
