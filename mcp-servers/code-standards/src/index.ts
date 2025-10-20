// Minimal MCP server template
// Adjust schemas and tool implementations in ./tools/

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { z } from "zod";
import { reviewCodeTool } from "./tools/reviewCode.js";

// Define a basic server with one tool. You can add transports later.
// For development, most MCP examples run via stdio, but you can also
// expose HTTP or sockets depending on your host/client.

async function main() {
  const server = new Server({
    name: "lintelligent-code-standards",
    version: "0.1.0",
    tools: [
      reviewCodeTool,
      // Add more tools here
    ],
    // Optional: declare resources here later
    resources: [],
  });

  // Placeholder: set up stdio transport if desired
  // import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
  // await server.connect(new StdioServerTransport());

  // For now, just log that server is constructed.
  // Replace with actual transport when integrating.
  // eslint-disable-next-line no-console
  console.log("MCP server constructed (add transport to start)");
}

main().catch((err) => {
  // eslint-disable-next-line no-console
  console.error(err);
  process.exit(1);
});
