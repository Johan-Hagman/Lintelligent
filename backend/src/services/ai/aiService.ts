import Anthropic from "@anthropic-ai/sdk";

export interface ReviewCodeParams {
  apiKey: string;
  code: string;
  language?: string;
  reviewType?: string;
  mcpContext?: string;
}

export interface ReviewSuggestion {
  severity: "low" | "medium" | "high";
  line: number;
  message: string;
  reason: string;
  fixedCode: string;
}

export interface ReviewResult {
  suggestions: ReviewSuggestion[];
  summary: string;
  aiModel: string;
}

export async function reviewCode({
  apiKey,
  code,
  language = "javascript",
  reviewType = "best-practices",
  mcpContext = "",
}: ReviewCodeParams): Promise<ReviewResult> {
  const client = new Anthropic({ apiKey });

  // Build prompt with MCP context if available
  const contextPrompt = mcpContext
    ? `\n\nCONTEXT FROM MCP SERVER:\n${mcpContext}\n\n`
    : "";

  const result = await client.messages.create({
    model: "claude-3-haiku-20240307",
    max_tokens: 700,
    messages: [
      {
        role: "user",
        content:
          "You are a thorough code reviewer. Respond ONLY with valid JSON according to this schema: " +
          '{"suggestions":[{"severity":"low|medium|high","line":number,"message":string,"reason":string,"fixedCode":string}], "summary":string, "aiModel":string}. ' +
          "No extra text outside JSON. " +
          "Rules: Each suggestion MUST (1) reference an existing line number, (2) include an evidence snippet quoting the exact offending code, and (3) only flag issues that actually appear in the provided code. " +
          "If a rule (e.g. var vs let) does not apply because the token is not present, DO NOT include that suggestion.",
      },
      {
        role: "user",
        content: [
          "Review the code below.",
          `Language: ${language}`,
          `Review type: ${reviewType}`,
          contextPrompt,
          "Requirements:",
          "- For every suggestion, cite the exact line number and quote the exact code that is wrong.",
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

  const content = (result as any)?.content?.[0]?.text ?? "";
  let parsed: ReviewResult;
  try {
    parsed = JSON.parse(content);
  } catch {
    parsed = {
      suggestions: [],
      summary: content || "No structured JSON returned",
      aiModel: (result as any)?.model || "unknown",
    };
  }
  if (!parsed.aiModel) parsed.aiModel = (result as any)?.model || "unknown";
  return parsed;
}
