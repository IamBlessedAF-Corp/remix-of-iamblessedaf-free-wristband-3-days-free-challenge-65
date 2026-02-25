import type {
  AllMiddlewareArgs,
  SlackEventMiddlewareArgs,
} from "@slack/bolt";
import {
  isAllowedUser,
  isAllowedChannel,
  isBotMessage,
  isRateLimited,
} from "../security.js";
import { getHormoziResponse } from "../claude.js";

type MessageEvent = SlackEventMiddlewareArgs<"message"> & AllMiddlewareArgs;

export async function handleMessage({
  event,
  say,
  client,
}: MessageEvent): Promise<void> {
  // Layer 4: Skip bot messages (prevent infinite loops)
  if (isBotMessage(event)) return;

  // Layer 2: Channel allowlist — silently ignore unauthorized channels
  if (!isAllowedChannel(event.channel)) return;

  // Layer 3: User allowlist — silently ignore unauthorized users
  if (!("user" in event) || !event.user || !isAllowedUser(event.user)) return;

  // Layer 5: Rate limiting
  if (isRateLimited()) {
    await say(
      "Tranquilo, Joel. Estoy procesando. Espera un momento antes de enviar otro mensaje."
    );
    return;
  }

  // Skip non-text messages (images, files, etc.)
  if (!("text" in event) || !event.text || event.text.trim().length === 0)
    return;

  const userMessage = event.text.trim();

  // Log metadata only — NEVER log message content
  console.log(
    `[${new Date().toISOString()}] Processing message from ${event.user} in ${event.channel}`
  );

  try {
    // Post a placeholder message immediately so the user sees "thinking"
    const placeholder = await client.chat.postMessage({
      channel: event.channel,
      text: "_Procesando..._",
    });

    const messageTs = placeholder.ts!;
    let lastUpdate = Date.now();

    const response = await getHormoziResponse(userMessage, (partial) => {
      // Update the message every 1.5s so user sees progress
      const now = Date.now();
      if (now - lastUpdate > 1500 && partial.length > 20) {
        lastUpdate = now;
        client.chat
          .update({
            channel: event.channel,
            ts: messageTs,
            text: partial + "\n\n_...escribiendo_",
          })
          .catch(() => {}); // non-critical, ignore errors
      }
    });

    // Final update with complete response
    if (response.length <= 4000) {
      await client.chat.update({
        channel: event.channel,
        ts: messageTs,
        text: response,
      });
    } else {
      // First chunk replaces placeholder
      const chunks = splitResponse(response, 4000);
      await client.chat.update({
        channel: event.channel,
        ts: messageTs,
        text: chunks[0],
      });
      // Additional chunks as new messages
      for (let i = 1; i < chunks.length; i++) {
        await say(chunks[i]);
      }
    }
  } catch (error) {
    console.error(
      `[${new Date().toISOString()}] Error:`,
      error instanceof Error ? error.message : "Unknown error"
    );
    await say("Error interno. Intenta de nuevo en un momento, Joel.");
  }
}

function splitResponse(text: string, maxLength: number): string[] {
  const chunks: string[] = [];
  let remaining = text;

  while (remaining.length > 0) {
    if (remaining.length <= maxLength) {
      chunks.push(remaining);
      break;
    }

    // Find last paragraph break before limit
    let splitIndex = remaining.lastIndexOf("\n\n", maxLength);
    if (splitIndex === -1 || splitIndex < maxLength * 0.5) {
      splitIndex = remaining.lastIndexOf("\n", maxLength);
    }
    if (splitIndex === -1 || splitIndex < maxLength * 0.5) {
      splitIndex = maxLength;
    }

    chunks.push(remaining.slice(0, splitIndex));
    remaining = remaining.slice(splitIndex).trimStart();
  }

  return chunks;
}
