import { z } from "zod";

export const GetCodingStandardsInputSchema = z.object({
  language: z.enum(["javascript", "typescript"]).default("javascript"),
  styleGuide: z
    .enum(["recommended", "airbnb", "google", "standard"]) // optional influence ordering/nuance
    .optional()
    .default("recommended"),
});

type GetCodingStandardsInput = z.infer<typeof GetCodingStandardsInputSchema>;

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

export const CodingStandardsOutputSchema = z.object({
  rules: z.array(RuleSchema),
  meta: z.object({
    source: z.literal("coding-standards"),
    version: z.literal("v1"),
    language: z.enum(["javascript", "typescript"]),
    styleGuide: z
      .enum(["recommended", "airbnb", "google", "standard"])
      .optional(),
  }),
});

type CodingStandardsOutput = z.infer<typeof CodingStandardsOutputSchema>;

const JS_RULES: Array<z.infer<typeof RuleSchema>> = [
  {
    id: "prefer-const",
    title: "Prefer const for values that are not reassigned",
    severity: "medium",
    description: "Improves readability and prevents accidental reassignment.",
    examples: {
      bad: "let x = 1; // never reassigned",
      good: "const x = 1;",
    },
  },
  {
    id: "no-var",
    title: "Do not use var",
    severity: "high",
    description:
      "var is function-scoped and can cause subtle bugs; use let/const.",
    examples: {
      bad: "var total = 0;",
      good: "let total = 0; // or const",
    },
  },
  {
    id: "early-returns",
    title: "Use early returns to reduce nesting",
    severity: "medium",
    description: "Keeps control flow shallow and easier to reason about.",
    examples: {
      bad: "if (a) { if (b) { doWork(); }}",
      good: "if (!a || !b) return;\ndoWork();",
    },
  },
  {
    id: "consistent-error-handling",
    title: "Handle errors consistently",
    severity: "high",
    description:
      "Always handle rejections and thrown errors; avoid silent failures.",
    examples: {
      bad: "fetch(url).then(res => res.json()); // no catch",
      good: "try { await fetch(url); } catch (e) { log(e); }",
    },
  },
  {
    id: "no-dead-code",
    title: "Avoid dead code and unused variables",
    severity: "medium",
    description:
      "Remove unused branches/variables to keep code clear and lean.",
  },
  {
    id: "no-nested-ternaries",
    title: "Avoid deeply nested ternaries",
    severity: "low",
    description:
      "Nested ternaries harm readability; prefer if/else or helper functions.",
  },
  {
    id: "destructure-when-clear",
    title: "Use destructuring when it improves clarity",
    severity: "low",
    description: "Destructuring reduces boilerplate for object/array access.",
    examples: {
      bad: "const name = user.name; const id = user.id;",
      good: "const { name, id } = user;",
    },
  },
  {
    id: "template-literals",
    title: "Use template literals for string composition",
    severity: "low",
    description: "Improves readability over string concatenation.",
    examples: {
      bad: "" + "Hello " + "name",
      good: "`Hello ${name}`",
    },
  },
  {
    id: "async-await",
    title: "Prefer async/await over raw promise chains",
    severity: "medium",
    description: "Leads to clearer control flow and error handling.",
  },
  {
    id: "pure-functions-where-possible",
    title: "Favor pure functions in business logic",
    severity: "low",
    description: "Minimize hidden side-effects; makes testing easier.",
  },
  {
    id: "no-magic-numbers",
    title: "Avoid unexplained magic numbers",
    severity: "low",
    description: "Extract named constants to convey meaning.",
  },
  {
    id: "module-boundaries",
    title: "Keep module boundaries clean",
    severity: "medium",
    description: "Separate concerns; avoid cross-module reach-ins.",
  },
];

const TS_RULES: Array<z.infer<typeof RuleSchema>> = [
  {
    id: "no-implicit-any",
    title: "Disallow implicit any",
    severity: "high",
    description: "Enable strict typing to prevent type holes and runtime bugs.",
    examples: {
      bad: "function f(x) { return x.toFixed(); }",
      good: "function f(x: number) { return x.toFixed(); }",
    },
  },
  {
    id: "avoid-any",
    title: "Avoid the any type; prefer unknown or proper types",
    severity: "high",
    description: "any disables type safety; unknown enforces narrowing.",
  },
  {
    id: "narrowing-with-guards",
    title: "Use type guards to narrow unions",
    severity: "medium",
    description: "Safely access members after refining types.",
  },
  {
    id: "strict-null-checks",
    title: "Enable and respect strict null checks",
    severity: "medium",
    description: "Handle undefined/null explicitly to avoid surprises.",
  },
  {
    id: "readonly-for-immutability",
    title: "Use readonly for immutable properties",
    severity: "low",
    description: "Communicates intent and prevents accidental mutation.",
  },
  {
    id: "prefer-interfaces",
    title: "Prefer interfaces for object shapes",
    severity: "low",
    description:
      "Interfaces compose well and are widely used in TS ecosystems.",
  },
  {
    id: "generics-for-reuse",
    title: "Use generics to express reusable abstractions",
    severity: "low",
    description: "Capture type relationships instead of resorting to any.",
  },
  {
    id: "discriminated-unions",
    title: "Model state with discriminated unions",
    severity: "medium",
    description: "Improves exhaustiveness and safety in control flow.",
  },
  {
    id: "export-types",
    title: "Export types and interfaces from modules",
    severity: "low",
    description: "Encourages reuse and clear boundaries.",
  },
  {
    id: "prefer-enums-or-literals",
    title: "Prefer enums or string literal unions for finite sets",
    severity: "low",
    description: "Avoid magic strings; make valid values explicit.",
  },
  {
    id: "no-unsafe-casts",
    title: "Avoid unsafe casts; narrow instead",
    severity: "medium",
    description: "Overusing 'as' hides type issues; prefer proper typing.",
  },
  {
    id: "typed-apis",
    title: "Type external API responses and inputs",
    severity: "medium",
    description: "Prevents runtime errors and documents expectations.",
  },
];

export async function executeGetCodingStandards(
  params: GetCodingStandardsInput
): Promise<CodingStandardsOutput> {
  const rules = params.language === "typescript" ? TS_RULES : JS_RULES;
  return {
    rules: rules.slice(0, 12),
    meta: {
      source: "coding-standards",
      version: "v1",
      language: params.language,
      styleGuide: params.styleGuide,
    },
  };
}
