// backend/src/services/ai/reviewService.js
import Anthropic from "@anthropic-ai/sdk";

export async function reviewCode({
  apiKey,
  code,
  language = "javascript",
  reviewType = "best-practices",
}) {
  const client = new Anthropic({ apiKey });

  const result = await client.messages.create({
    model: "claude-3-haiku-20240307",
    max_tokens: 700,
    messages: [
      {
        role: "user",
        content:
          "You are a thorough code reviewer. Respond ONLY with valid JSON according to this schema: " +
          '{"suggestions":[{"severity":"low|medium|high","line":number,"message":string,"reason":string,"fixedCode":string}], "summary":string, "aiModel":string}. ' +
          "No extra text outside JSON.",
      },
      {
        role: "user",
        content: [
          "Review the code below.",
          `Language: ${language}`,
          `Review type: ${reviewType}`,
          "Show a few lines of suggested fixes in fixedCode when relevant.",
          "",
          "CODE:",
          "```",
          code,
          "```",
        ].join("\n"),
      },
    ],
  });

  const content = result?.content?.[0]?.text ?? "";
  let parsed;
  try {
    parsed = JSON.parse(content);
  } catch {
    parsed = {
      suggestions: [],
      summary: content || "No structured JSON returned",
      aiModel: result?.model || "unknown",
    };
  }
  if (!parsed.aiModel) parsed.aiModel = result?.model || "unknown";
  return parsed;
}
