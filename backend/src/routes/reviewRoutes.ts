import { Router } from "express";
import { v4 as uuidv4 } from "uuid";
import { mcpService } from "../services/mcp/mcpService.js";
import { supabaseService } from "../services/database/supabaseService.js";
import { getSession } from "../utils/session.js";

const router = Router();

router.post("/", async (req, res) => {
  try {
    const {
      code,
      language = "javascript",
      reviewType = "best-practices",
      repoInfo,
    } = req.body;

    console.log(
      "Backend received repoInfo:",
      JSON.stringify(repoInfo, null, 2)
    );

    if (!code) {
      return res.status(400).json({ error: "Code is required" });
    }

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: "AI API key not configured" });
    }

    let repoContext:
      | {
          owner: string;
          repo: string;
          ref: string;
          filePath: string;
          accessToken: string;
        }
      | undefined;

    if (
      repoInfo &&
      repoInfo.owner &&
      repoInfo.repo &&
      repoInfo.ref &&
      repoInfo.filePath
    ) {
      const session = getSession(req);
      if (!session || !session.ghToken) {
        return res
          .status(401)
          .json({ error: "GitHub authentication required for repo reviews" });
      }

      if (
        typeof repoInfo.owner !== "string" ||
        typeof repoInfo.repo !== "string" ||
        typeof repoInfo.ref !== "string" ||
        typeof repoInfo.filePath !== "string"
      ) {
        console.warn("Invalid repoInfo fields:", repoInfo);
        return res
          .status(400)
          .json({ error: "Invalid repository information" });
      }

      repoContext = {
        owner: repoInfo.owner,
        repo: repoInfo.repo,
        ref: repoInfo.ref,
        filePath: repoInfo.filePath,
        accessToken: session.ghToken,
      };
    }

    let result;
    try {
      result = await mcpService.reviewCode({
        code,
        language,
        reviewType,
        apiKey,
        repoContext,
      });
    } catch (error) {
      console.error("MCP review error:", error);
      return res.status(500).json({
        error:
          error instanceof Error
            ? error.message
            : "Failed to review code. Check server logs for details.",
      });
    }

    const reviewId = uuidv4();

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
    }

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

router.patch("/:id/rating", async (req, res) => {
  try {
    const { id } = req.params;
    const { rating } = req.body;

    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(id)) {
      return res.status(400).json({ error: "Invalid review ID format" });
    }

    const ratingNum = Number(rating);
    if (![1, -1].includes(ratingNum)) {
      return res.status(400).json({
        error: "Rating must be 1 (thumbs up) or -1 (thumbs down)",
      });
    }

    try {
      await supabaseService.updateRating(id, ratingNum);
      console.log("Rating saved:", id, ratingNum === 1 ? "👍" : "👎");
    } catch (dbError) {
      console.warn("Failed to save rating to database:", dbError);
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

export { router as reviewRoutes };


