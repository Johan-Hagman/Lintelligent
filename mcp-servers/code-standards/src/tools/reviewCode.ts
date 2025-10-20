import { z } from "zod";
import type { Tool } from "@modelcontextprotocol/sdk/types.js";
import { zodToMCPToolSchema } from "../utils/zodToMcpSchema.js";

// Placeholder schemas — edit these to your real shapes
export const ReviewCodeInputSchema = z.object({
  code: z.string().min(1),
  language: z.string().default("javascript"),
  reviewType: z
    .union([z.string(), z.array(z.string()).nonempty()])
    .default("best-practices"),
});

export const ReviewSuggestionSchema = z.object({
  severity: z.enum(["low", "medium", "high"]),
  line: z.number().int().min(1),
  message: z.string(),
  reason: z.string(),
  fixedCode: z.string().optional().default(""),
});

export const ReviewCodeOutputSchema = z.object({
  suggestions: z.array(ReviewSuggestionSchema),
  summary: z.string(),
  aiModel: z.string(),
});

export const reviewCodeTool: Tool = {
  name: "review_code",
  description: "Review code for issues and best practices.",
  inputSchema: zodToMCPToolSchema(ReviewCodeInputSchema),
  outputSchema: zodToMCPToolSchema(ReviewCodeOutputSchema),
  execute: async ({ input }: { input: unknown }) => {
    const parsed = ReviewCodeInputSchema.parse(input);

    // TODO: wire to backend service via HTTP or direct import if co-located
    // For now, return a placeholder so you can focus on schemas
    return {
      suggestions: [
        {
          severity: "low",
          line: 1,
          message: "Placeholder suggestion — connect tool to reviewService",
          reason: "Schema scaffolding",
          fixedCode: "",
        },
      ],
      summary: `Reviewed ${parsed.language} code with types: ${
        Array.isArray(parsed.reviewType)
          ? parsed.reviewType.join(", ")
          : parsed.reviewType
      }`,
      aiModel: "pending-implementation",
    };
  },
};
