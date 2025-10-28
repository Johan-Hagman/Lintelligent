import express, { Request, Response } from "express";
import "dotenv/config";
import cors from "cors";
import helmet from "helmet";
import { v4 as uuidv4 } from "uuid";
import { mcpService } from "./services/mcp/mcpService.js";
import { supabaseService } from "./services/database/supabaseService.js";

const app = express();
const PORT = Number(process.env.PORT) || 3001;

app.use(helmet());
app.use(
  cors({ origin: ["http://localhost:3000"], methods: ["GET", "POST", "PATCH"] })
);
app.use(express.json({ limit: "100kb" }));

app.disable("x-powered-by");

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

    // Generate review ID
    const reviewId = uuidv4();

    // Try to save to database (non-blocking - don't fail if DB fails)
    try {
      await supabaseService.saveReview({
        id: reviewId,
        code,
        language,
        reviewType,
        aiFeedback: result,
        aiModel: result.aiModel,
      });
      console.log("Review saved to database:", reviewId);
    } catch (dbError) {
      console.warn("Failed to save to database:", dbError);
      // Continue anyway - user still gets their review!
    }

    // Return response (same format as before!)
    res.json({
      id: reviewId,
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

// PATCH /api/review/:id/rating - Update rating for a review
app.patch("/api/review/:id/rating", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { rating } = req.body;

    // Validate UUID format
    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(id)) {
      return res.status(400).json({ error: "Invalid review ID format" });
    }

    // Validate and coerce rating
    const ratingNum = Number(rating);
    if (![1, -1].includes(ratingNum)) {
      return res
        .status(400)
        .json({ error: "Rating must be 1 (thumbs up) or -1 (thumbs down)" });
    }

    // Try to update in database
    try {
      await supabaseService.updateRating(id, ratingNum);
      console.log("Rating saved:", id, ratingNum === 1 ? "👍" : "👎");
    } catch (dbError) {
      console.warn("Failed to save rating to database:", dbError);
      // Return success anyway - we got the user's feedback
    }

    res.json({
      success: true,
      message: "Rating received",
    });
  } catch (error) {
    console.error("Rating error:", error);
    res.status(500).json({
      error: "Failed to update rating",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`API Server running on port ${PORT}`);
});
