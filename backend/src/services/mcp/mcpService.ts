// backend/src/services/mcp/mcpService.ts
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import path from "path";
import { reviewCode as aiReviewCode } from "../ai/aiService.js";

export interface MCPReviewParams {
  code: string;
  language?: string;
  reviewType?: string;
  apiKey: string; // Required for AI service
}

export interface MCPReviewResult {
  suggestions: Array<{
    severity: "low" | "medium" | "high";
    line: number;
    message: string;
    reason: string;
    fixedCode?: string;
  }>;
  summary: string;
  aiModel: string;
}

class MCPService {
  private client: Client | null = null;

  async connect(): Promise<void> {
    if (this.client) return; // Already connected

    // Path to the MCP server
    const mcpServerPath = path.join(
      process.cwd(),
      "../mcp-servers/code-standards"
    );

    const transport = new StdioClientTransport({
      command: "npx",
      args: ["tsx", "src/index.ts"],
      cwd: mcpServerPath,
    });

    this.client = new Client(
      { name: "lintelligent-backend", version: "1.0.0" },
      { capabilities: {} }
    );

    await this.client.connect(transport);
  }

  async reviewCode(params: MCPReviewParams): Promise<MCPReviewResult> {
    if (!this.client) {
      await this.connect();
    }

    // Step 1: Get MCP context from both tools
    let mcpContext = "";
    try {
      // Get coding standards (best practices)
      const standardsResult = await this.client!.callTool({
        name: "get_coding_standards",
        arguments: {
          language: params.language || "javascript",
        },
      });

      // Get security rules
      const securityResult = await this.client!.callTool({
        name: "get_security_rules",
        arguments: {
          language: params.language || "javascript",
        },
      });

      mcpContext = JSON.stringify({
        codingStandards: standardsResult,
        securityRules: securityResult,
      });
      console.log("MCP Context received from both tools");
    } catch (error) {
      console.warn("Could not get MCP context:", error);
      // Continue without context if MCP tools fail
    }

    // Step 2: Use AI Service with MCP context
    const result = await aiReviewCode({
      apiKey: params.apiKey,
      code: params.code,
      language: params.language || "javascript",
      reviewType: params.reviewType || "best-practices",
      mcpContext: mcpContext,
    });

    return result;
  }

  async disconnect(): Promise<void> {
    if (this.client) {
      await this.client.close();
      this.client = null;
    }
  }
}

// Export singleton instance
export const mcpService = new MCPService();
