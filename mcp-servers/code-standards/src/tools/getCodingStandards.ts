import { z } from "zod";

// Input schema for getting coding standards
export const GetCodingStandardsInputSchema = z.object({
  language: z.string().default("javascript"),
});

// Type inference from schema
type GetCodingStandardsInput = z.infer<typeof GetCodingStandardsInputSchema>;

// Output schema for coding standards
export const CodingStandardsOutputSchema = z.object({
  standards: z.array(z.string()),
  language: z.string(),
  source: z.string(),
});

// Type inference from schema
type CodingStandardsOutput = z.infer<typeof CodingStandardsOutputSchema>;

// Coding standards database
const CODING_STANDARDS = {
  javascript: [
    "Use const/let instead of var",
    "Use arrow functions for short functions",
    "Use template literals instead of string concatenation",
    "Use destructuring for object/array access",
    "Use async/await instead of promises.then()",
    "Use meaningful variable names",
    "Avoid deep nesting (max 3 levels)",
    "Use early returns to reduce complexity",
    "Handle errors properly with try/catch",
    "Use TypeScript for type safety",
  ],
  typescript: [
    "Define interfaces for object shapes",
    "Use strict type checking",
    "Avoid 'any' type",
    "Use union types for multiple possibilities",
    "Use generics for reusable code",
    "Use enums for constants",
    "Use readonly for immutable data",
    "Use optional chaining (?.)",
    "Use nullish coalescing (??)",
    "Export types and interfaces",
  ],
};

// Execute function - pure business logic
export async function executeGetCodingStandards(
  params: GetCodingStandardsInput
): Promise<CodingStandardsOutput> {
  const languageStandards =
    CODING_STANDARDS[params.language as keyof typeof CODING_STANDARDS] ||
    CODING_STANDARDS.javascript;

  return {
    standards: languageStandards,
    language: params.language,
    source: "Lintelligent coding standards database",
  };
}
