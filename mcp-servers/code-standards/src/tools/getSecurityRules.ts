import { z } from "zod";

// Input schema
export const GetSecurityRulesInputSchema = z.object({
  language: z.string().default("javascript"),
});

// Type inference
type GetSecurityRulesInput = z.infer<typeof GetSecurityRulesInputSchema>;

// Output schema
export const SecurityRulesOutputSchema = z.object({
  rules: z.array(z.string()),
  language: z.string(),
  category: z.string(),
});

// Type inference
type SecurityRulesOutput = z.infer<typeof SecurityRulesOutputSchema>;

// Security rules database
const SECURITY_RULES = {
  javascript: [
    "Never use eval() or Function() constructor",
    "Always sanitize user input before use",
    "Use parameterized queries to prevent SQL injection",
    "Validate and sanitize all API inputs",
    "Use HTTPS for all external requests",
    "Never store sensitive data in localStorage",
    "Implement proper error handling without exposing stack traces",
    "Use Content Security Policy (CSP) headers",
    "Avoid using innerHTML with user data",
    "Implement rate limiting on API endpoints",
  ],
  typescript: [
    "Never use 'any' type for user input",
    "Always validate external data with type guards",
    "Use readonly for sensitive data",
    "Implement proper type checking for API responses",
    "Use strict TypeScript configuration",
    "Validate environment variables at startup",
    "Use branded types for sensitive values",
    "Implement exhaustive type checking",
    "Never bypass type system with 'as any'",
    "Use discriminated unions for safe state management",
  ],
};

// Execute function
export async function executeGetSecurityRules(
  params: GetSecurityRulesInput
): Promise<SecurityRulesOutput> {
  const languageRules =
    SECURITY_RULES[params.language as keyof typeof SECURITY_RULES] ||
    SECURITY_RULES.javascript;

  return {
    rules: languageRules,
    language: params.language,
    category: "security",
  };
}
