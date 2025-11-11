// MCP Server for Lintelligent Repo Context
// Provides tools to fetch project context from GitHub repositories

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  executeGetProjectContext,
  type GetProjectContextInput,
  GetProjectContextInputShape,
  GetProjectContextInputSchema,
} from "./tools/getProjectContext.js";

async function main() {
  const server = new McpServer({
    name: "lintelligent-repo-context",
    version: "0.1.0",
  });

  // Register get_project_context tool with Zod shape so the MCP SDK handles validation
  (server as any).tool(
    "get_project_context",
    GetProjectContextInputShape as any,
    async (args: GetProjectContextInput, _extra: unknown): Promise<any> => {
      const result = await executeGetProjectContext(args);

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
