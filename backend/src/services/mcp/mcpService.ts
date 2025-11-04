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

    // Fetch MCP context from tools (compressed - only top 3-4 per category)
    let mcpContext = "";
    try {
      // Coding standards (get only top 3 most critical)
      const standardsResult = await this.client!.callTool({
        name: "get_coding_standards",
        arguments: {
          language: params.language || "javascript",
        },
      });

      // Security rules (get only top 3 most critical)
      const securityResult = await this.client!.callTool({
        name: "get_security_rules",
        arguments: {
          language: params.language || "javascript",
        },
      });

      // Compress: Extract only high-priority rules (severity: high, max 3 per category)
      // MCP returns { content: [{ type: "text", text: JSON.stringify(result) }] }
      const standardsContent =
        Array.isArray(standardsResult.content) &&
        standardsResult.content[0]?.type === "text"
          ? standardsResult.content[0]
          : null;
      const standardsData = standardsContent?.text
        ? JSON.parse(standardsContent.text)
        : null;

      const compressedStandards =
        standardsData?.rules
          ?.filter((r: any) => r.severity === "high")
          .slice(0, 3)
          .map((r: any) => `${r.title}: ${r.description}`)
          .join("; ") || "";

      const securityContent =
        Array.isArray(securityResult.content) &&
        securityResult.content[0]?.type === "text"
          ? securityResult.content[0]
          : null;
      const securityData = securityContent?.text
        ? JSON.parse(securityContent.text)
        : null;

      const compressedSecurity =
        securityData?.rules
          ?.filter((r: any) => r.severity === "high")
          .slice(0, 3)
          .map((r: any) => `${r.title}: ${r.description}`)
          .join("; ") || "";

      // Build minimal context string (not JSON dump)
      const parts = [];
      if (compressedStandards) parts.push(`Standards: ${compressedStandards}`);
      if (compressedSecurity) parts.push(`Security: ${compressedSecurity}`);
      mcpContext = parts.length > 0 ? parts.join(" | ") : "";

      console.log(
        "MCP Context compressed:",
        mcpContext.substring(0, 100) + "..."
      );
    } catch (error) {
      console.warn("Could not get MCP context:", error);
      // Continue without context if MCP tools fail
    }

    // Run AI review with MCP context
    const aiResult = await aiReviewCode({
      apiKey: params.apiKey,
      code: params.code,
      language: params.language || "javascript",
      reviewType: params.reviewType || "best-practices",
      mcpContext: mcpContext,
    });

    // Return AI result directly (no static analysis combination)
    return aiResult;
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
