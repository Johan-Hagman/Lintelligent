import express, { Request, Response } from "express";
import "dotenv/config";
import cors from "cors";
import { mcpService } from "./services/mcp/mcpService.js";

const app = express();
const PORT = Number(process.env.PORT) || 3001;

app.use(cors());
app.use(express.json());

app.get("/", (_req: Request, res: Response) => {
  res.json({ message: "API Server is running!" });
});

// POST /api/review - Submit code for review via MCP
app.post("/api/review", async (req: Request, res: Response) => {
  try {
    const {
      code,
      language = "javascript",
      reviewType = "best-practices",
    } = req.body;

    if (!code) {
      return res.status(400).json({ error: "Code is required" });
    }

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: "AI API key not configured" });
    }

    const result = await mcpService.reviewCode({
      code,
      language,
      reviewType,
      apiKey,
    });

    res.json({
      id: `review_${Date.now()}`,
      feedback: result,
      createdAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Review error:", error);
    res.status(500).json({
      error: "Failed to review code",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`API Server running on port ${PORT}`);
});
