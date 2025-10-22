import { z } from "zod";

// Input schema for reviewing code
export const ReviewCodeInputSchema = z.object({
  code: z.string().min(1),
  language: z.string().default("javascript"),
  reviewType: z
    .union([z.string(), z.array(z.string()).nonempty()])
    .default("best-practices"),
});

// Type inference from schema
type ReviewCodeInput = z.infer<typeof ReviewCodeInputSchema>;

export const ReviewSuggestionSchema = z.object({
  severity: z.enum(["low", "medium", "high"]),
  line: z.number().int().min(1),
  message: z.string(),
  reason: z.string(),
  fixedCode: z.string().optional().default(""),
});

// Output schema
export const ReviewCodeOutputSchema = z.object({
  suggestions: z.array(ReviewSuggestionSchema),
  summary: z.string(),
  aiModel: z.string(),
});

// Type inference from schema
type ReviewCodeOutput = z.infer<typeof ReviewCodeOutputSchema>;

// Execute function - pure business logic
export async function executeReviewCode(
  params: ReviewCodeInput
): Promise<ReviewCodeOutput> {
  // This tool is now used for gathering context, not direct AI calls
  // The actual AI review happens in the backend AI service
  return {
    suggestions: [],
    summary: `Context gathered for ${params.language} code review with types: ${
      Array.isArray(params.reviewType)
        ? params.reviewType.join(", ")
        : params.reviewType
    }`,
    aiModel: "context-gatherer",
  };
}
