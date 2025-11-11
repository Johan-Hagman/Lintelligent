// backend/src/services/mcp/repoContextService.ts
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import path from "path";
import { fileURLToPath } from "url";

export interface RepoContextParams {
  owner: string;
  repo: string;
  ref: string;
  filePath: string;
  accessToken: string;
}

class RepoContextService {
  private client: Client | null = null;
  private readonly moduleDir = path.dirname(fileURLToPath(import.meta.url));

  async connect(): Promise<void> {
    if (this.client) return; // Already connected

    // Path to the repo-context MCP server
    const mcpServerPath = path.resolve(
      this.moduleDir,
      "../../../../mcp-servers/repo-context"
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

  async getProjectContext(params: RepoContextParams): Promise<string> {
    if (!this.client) {
      await this.connect();
    }

    try {
      // Validate params before calling MCP
      if (!params.filePath || typeof params.filePath !== "string") {
        console.warn("Invalid filePath in repo context params:", params);
        return "";
      }

      const mcpArgs = {
        owner: params.owner,
        repo: params.repo,
        ref: params.ref,
        filePath: params.filePath,
        accessToken: params.accessToken,
      };

      const result = await this.client!.callTool({
        name: "get_project_context",
        arguments: mcpArgs,
      });

      // MCP returns { content: [{ type: "text", text: JSON.stringify(result) }] }
      const content =
        Array.isArray(result.content) && result.content[0]?.type === "text"
          ? result.content[0]
          : null;

      if (!content?.text) {
        return "";
      }

      // Try to parse JSON, return empty string if it fails (MCP might return error message)
      let contextData;
      try {
        contextData = JSON.parse(content.text);
      } catch (parseError) {
        console.warn(
          "Failed to parse repo context JSON:",
          content.text.substring(0, 100)
        );
        return "";
      }

      // Check if MCP returned an error
      if (contextData.error) {
        console.warn("Repo context error:", contextData.message);
        return "";
      }

      // Format as compressed context string for AI
      const parts: string[] = [];
      parts.push(`Project: ${params.owner}/${params.repo} (${params.ref})`);
      parts.push(`Reviewing: ${params.filePath}`);

      if (contextData.configs?.packageJson) {
        parts.push(`Config: package.json dependencies`);
      }
      if (contextData.configs?.tsconfigJson) {
        parts.push(`Config: tsconfig.json`);
      }

      if (contextData.relatedFiles?.length > 0) {
        parts.push(
          `Related files: ${contextData.relatedFiles
            .map((f: any) => f.path)
            .join(", ")}`
        );
      }

      return parts.join(" | ");
    } catch (error) {
      console.warn("Could not get repo context:", error);
      return "";
    }
  }

  async disconnect(): Promise<void> {
    if (this.client) {
      await this.client.close();
      this.client = null;
    }
  }
}

// Export singleton instance
export const repoContextService = new RepoContextService();
