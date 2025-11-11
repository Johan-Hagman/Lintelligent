import Anthropic from "@anthropic-ai/sdk";

export interface ReviewCodeParams {
  apiKey: string;
  code: string;
  language?: string;
  reviewType?: string;
  mcpContext?: string;
  repoContext?: string;
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
  repoContext = "",
}: ReviewCodeParams): Promise<ReviewResult> {
  const client = new Anthropic({ apiKey });

  // Build compressed MCP context (only if available, placed at end to minimize influence)
  const mcpCompressedHint = mcpContext
    ? `\n\nOPTIONAL HINTS (use only if code evidence supports them, ignore if they conflict with actual code behavior): ${mcpContext}`
    : "";

  // Build repo context (project structure, related files, configs)
  const repoContextHint = repoContext
    ? `\n\nPROJECT CONTEXT: ${repoContext}. Use this to understand the codebase structure, dependencies, and how this file fits into the project.`
    : "";

  const result = await client.messages.create({
    model: "claude-3-haiku-20240307",
    max_tokens: 1500,
    temperature: 0.1,
    messages: [
      {
        role: "user",
        content:
          "You are a code reviewer. Return ONLY valid JSON in this format: " +
          '{"suggestions":[{"severity":"low|medium|high","line":number,"message":string,"reason":string,"fixedCode":string}], "summary":"plain text summary", "aiModel":"claude-3-haiku-20240307"}. ' +
          "Return ONLY raw JSON, no markdown, no prose, no code fences. " +
          "PRIORITY: Code evidence FIRST. Examine actual code behavior before external hints. " +
          "SEVERITY GUIDE: Type mismatches (API/method returns different type than declared/expected) = medium+. Runtime errors (ReferenceError, undefined access, out-of-scope variables) = medium+. Logic errors = medium+. Security risks = high. Style-only = low. " +
          "CRITICAL: When a method/API returns a different type than the function declares or expects, that's a TYPE MISMATCH bug (medium+), not a style suggestion. " +
          "When a variable is accessed outside its scope, that's a RUNTIME ERROR (medium+), not a style issue. " +
          "Look for: type mismatches, logic errors, scope issues, API misuse, security risks. " +
          "Each suggestion MUST cite exact line number and quote the exact offending code. " +
          "Only flag issues actually present in the code." +
          "Review TARGET FILE line by line. When needed, look at related files from PROJECT CONTEXT to confirm how shared state or helpers behave.",
      },
      {
        role: "user",
        content: [
          "Review this code:",
          `Language: ${language}`,
          "",
          "CODE:",
          "```",
          code,
          "```",
          "",
          "Requirements:",
          "- Cite exact line number and quote exact code for each issue.",
          "- Show suggested fixes in fixedCode when relevant.",
          repoContextHint,
          mcpCompressedHint,
        ]
          .filter(Boolean)
          .join("\n"),
      },
    ],
  });

  const content = (result as any)?.content?.[0]?.text ?? "";
  let parsed: ReviewResult;
  try {
    const first = content.indexOf("{");
    const last = content.lastIndexOf("}");
    const candidate =
      first >= 0 && last > first ? content.slice(first, last + 1) : content;
    parsed = JSON.parse(candidate);
  } catch {
    parsed = {
      suggestions: [],
      summary: "Failed to parse AI response. Please try again.",
      aiModel: (result as any)?.model || "unknown",
    };
  }
  if (!parsed.aiModel) parsed.aiModel = (result as any)?.model || "unknown";
  return parsed;
}
