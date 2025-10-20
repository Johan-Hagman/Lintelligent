import { z } from "zod";
import { zodToJsonSchema } from "zod-to-json-schema";

export function zodToMCPToolSchema(schema: z.ZodTypeAny) {
  const jsonSchema = zodToJsonSchema(schema);

  const isObjectSchema = (
    schema: any
  ): schema is { type: "object"; properties?: any; required?: string[] } => {
    return schema && typeof schema === "object" && schema.type === "object";
  };

  if (isObjectSchema(jsonSchema)) {
    return {
      type: "object" as const,
      properties: jsonSchema.properties || {},
      required: jsonSchema.required || [],
    };
  }

  return {
    type: "object" as const,
    properties: {
      value: jsonSchema,
    },
    required: ["value"],
  };
}
