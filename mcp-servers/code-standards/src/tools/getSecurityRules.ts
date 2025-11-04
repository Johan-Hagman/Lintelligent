import { z } from "zod";

export const GetSecurityRulesInputSchema = z.object({
  language: z.enum(["javascript", "typescript"]).default("javascript"),
  focus: z.enum(["node", "browser", "both"]).default("both"),
});

type GetSecurityRulesInput = z.infer<typeof GetSecurityRulesInputSchema>;

const RuleSchema = z.object({
  id: z.string(),
  title: z.string(),
  severity: z.enum(["low", "medium", "high"]),
  description: z.string(),
  examples: z
    .object({
      bad: z.string().optional(),
      good: z.string().optional(),
    })
    .optional(),
});

export const SecurityRulesOutputSchema = z.object({
  rules: z.array(RuleSchema),
  meta: z.object({
    source: z.literal("security-rules"),
    version: z.literal("v1"),
    language: z.enum(["javascript", "typescript"]),
    focus: z.enum(["node", "browser", "both"]),
  }),
});

type SecurityRulesOutput = z.infer<typeof SecurityRulesOutputSchema>;

const BASE_RULES: Array<z.infer<typeof RuleSchema>> = [
  {
    id: "no-eval",
    title: "Never use eval() or Function constructor",
    severity: "high",
    description: "Allows arbitrary code execution and injection.",
    examples: {
      bad: "eval(userInput)",
      good: "Use safe parsers / whitelisted handlers",
    },
  },
  {
    id: "validate-and-sanitize-input",
    title: "Validate and sanitize all external input",
    severity: "high",
    description:
      "Prevents injection, XSS, and logic bypass; validate shape and sanitize content.",
  },
  {
    id: "parameterized-queries",
    title: "Use parameterized queries for DB access",
    severity: "high",
    description: "Avoid string concatenation in SQL to prevent injection.",
  },
  {
    id: "no-secrets-in-client-storage",
    title: "Do not store secrets in localStorage/sessionStorage",
    severity: "high",
    description:
      "Client storage is readable by scripts and prone to XSS exfiltration.",
  },
  {
    id: "error-handling-no-stack-trace-leak",
    title: "Handle errors without leaking stack traces in production",
    severity: "medium",
    description: "Return generic messages; log details server-side only.",
  },
  {
    id: "rate-limiting",
    title: "Apply rate limiting to sensitive endpoints",
    severity: "medium",
    description: "Mitigates brute force and abuse; reduces cost amplification.",
  },
];

const BROWSER_RULES: Array<z.infer<typeof RuleSchema>> = [
  {
    id: "no-dangerously-set-inner-html",
    title: "Avoid dangerouslySetInnerHTML / innerHTML with user data",
    severity: "high",
    description: "Raw HTML injection enables XSS; sanitize or escape properly.",
  },
  {
    id: "csp-no-unsafe-eval",
    title: "Use a CSP that forbids unsafe-eval and inline scripts",
    severity: "high",
    description:
      "Strong CSP reduces XSS impact and prevents eval-like constructs.",
  },
  {
    id: "escape-urls-and-attributes",
    title: "Escape data in URLs/attributes before insertion",
    severity: "medium",
    description:
      "Avoid breaking out of attributes or URLs; prevents XSS vectors.",
  },
];

const NODE_RULES: Array<z.infer<typeof RuleSchema>> = [
  {
    id: "helmet-and-secure-headers",
    title: "Use Helmet / secure headers for Express apps",
    severity: "medium",
    description:
      "Sets security headers like HSTS, X-Frame-Options, and MIME sniffing protections.",
  },
  {
    id: "ssrf-protection",
    title: "Protect against SSRF on outbound requests",
    severity: "high",
    description:
      "Whitelist destinations or validate hosts to avoid internal network access.",
  },
  {
    id: "validate-env",
    title: "Validate environment variables at startup",
    severity: "medium",
    description: "Prevents misconfiguration; avoids insecure defaults.",
  },
];

export async function executeGetSecurityRules(
  params: GetSecurityRulesInput
): Promise<SecurityRulesOutput> {
  const rules: Array<z.infer<typeof RuleSchema>> = [
    ...BASE_RULES,
    ...(params.focus !== "node" ? BROWSER_RULES : []),
    ...(params.focus !== "browser" ? NODE_RULES : []),
  ];

  return {
    rules: rules.slice(0, 12),
    meta: {
      source: "security-rules",
      version: "v1",
      language: params.language,
      focus: params.focus,
    },
  };
}
