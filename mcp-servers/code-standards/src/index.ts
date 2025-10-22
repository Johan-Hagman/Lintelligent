// MCP Server for Lintelligent Code Standards
// Registers tools that AI can use to gather context for code reviews

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  ReviewCodeInputSchema,
  executeReviewCode,
} from "./tools/reviewCode.js";
import {
  GetCodingStandardsInputSchema,
  executeGetCodingStandards,
} from "./tools/getCodingStandards.js";

async function main() {
  const server = new McpServer({
    name: "lintelligent-code-standards",
    version: "0.1.0",
  });

  // Register review_code tool
  // Pass the full Zod schema object - SDK handles validation
  server.tool(
    "review_code",
    ReviewCodeInputSchema as any,
    async (params: any): Promise<any> => {
      console.log("Review code tool called with:", params);

      const result = await executeReviewCode(params);

      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify(result),
          },
        ],
      };
    }
  );

  // Register get_coding_standards tool
  // Pass the full Zod schema object - SDK handles validation
  server.tool(
    "get_coding_standards",
    GetCodingStandardsInputSchema as any,
    async (params: any): Promise<any> => {
      console.log("Get coding standards tool called with:", params);

      const result = await executeGetCodingStandards(params);

      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify(result),
          },
        ],
      };
    }
  );

  const transport = new StdioServerTransport();
  await server.connect(transport);

  console.log("MCP server started with stdio transport");

  // Keep the server running
  process.stdin.resume();

  process.on("SIGINT", async () => {
    await server.close();
    process.exit(0);
  });
}

main().catch((err) => {
  // eslint-disable-next-line no-console
  console.error(err);
  process.exit(1);
});
