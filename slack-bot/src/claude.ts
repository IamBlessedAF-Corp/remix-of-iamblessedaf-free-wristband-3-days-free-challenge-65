import Anthropic from "@anthropic-ai/sdk";
import { config } from "./config.js";
import { getSystemPrompt } from "./knowledge.js";
import { classifyTopic } from "./router.js";

const anthropic = new Anthropic({
  apiKey: config.ANTHROPIC_API_KEY,
});

export async function getHormoziResponse(
  userMessage: string,
  onPartial?: (text: string) => void
): Promise<string> {
  // Step 1: Classify topic (instant — zero API calls)
  const topic = classifyTopic(userMessage);
  console.log(`  Topic: ${topic}`);

  // Step 2: Build system prompt with only relevant KB
  const systemPrompt = getSystemPrompt(topic);
  console.log(`  Prompt size: ${(systemPrompt.length / 1024).toFixed(1)}KB`);

  // Step 3: Stream response with prompt caching
  let fullText = "";

  const stream = anthropic.messages.stream({
    model: config.CLAUDE_MODEL,
    max_tokens: config.CLAUDE_MAX_TOKENS,
    system: [
      {
        type: "text",
        text: systemPrompt,
        cache_control: { type: "ephemeral" },
      },
    ],
    messages: [{ role: "user", content: userMessage }],
  });

  for await (const event of stream) {
    if (
      event.type === "content_block_delta" &&
      event.delta.type === "text_delta"
    ) {
      fullText += event.delta.text;
      if (onPartial) onPartial(fullText);
    }
  }

  if (fullText.length === 0) {
    return "No pude generar una respuesta. Intenta de nuevo, Joel.";
  }

  return fullText;
}
