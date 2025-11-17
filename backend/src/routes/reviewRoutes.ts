import { Router } from "express";
import { v4 as uuidv4 } from "uuid";
import { z } from "zod";
import { mcpService } from "../services/mcp/mcpService.js";
import { supabaseService } from "../services/database/supabaseService.js";
import { getSession } from "../utils/session.js";
import { validate } from "../utils/validation.js";
import { logger } from "../utils/logger.js";

const router = Router();

const repoInfoSchema = z.object({
  owner: z.string().min(1),
  repo: z.string().min(1),
  ref: z.string().min(1),
  filePath: z.string().min(1),
});

const reviewRequestSchema = z.object({
  code: z.string().min(1, "Code is required"),
  language: z.string().min(1).optional(),
  reviewType: z.string().min(1).optional(),
  repoInfo: repoInfoSchema.optional(),
});

type ReviewRequest = z.infer<typeof reviewRequestSchema>;

const ratingParamsSchema = z.object({
  id: z.string().uuid("Invalid review ID format"),
});

const ratingBodySchema = z.object({
  rating: z
    .coerce.number()
    .refine((value) => value === 1 || value === -1, {
      message: "Rating must be 1 (thumbs up) or -1 (thumbs down)",
    }),
});

router.post("/", validate({ body: reviewRequestSchema }), async (req, res) => {
  try {
    const { code, language, reviewType, repoInfo } = req.body as ReviewRequest;

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

    if (repoInfo) {
      const session = getSession(req);
      if (!session || !session.ghToken) {
        return res
          .status(401)
          .json({ error: "GitHub authentication required for repo reviews" });
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
        language: language ?? "javascript",
        reviewType: reviewType ?? "best-practices",
        apiKey,
        repoContext,
      });
    } catch (error) {
      logger.error({ err: error }, "MCP review error");
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
        language: language ?? "javascript",
        reviewType: reviewType ?? "best-practices",
        aiFeedback: result,
        aiModel: result.aiModel,
      });
      logger.info({ reviewId }, "Review saved to database");
    } catch (dbError) {
      logger.warn({ err: dbError }, "Failed to save review to database");
    }

    res.json({
      id: reviewId,
      feedback: result,
      createdAt: new Date().toISOString(),
    });
  } catch (error) {
    logger.error({ err: error }, "Review error");
    res.status(500).json({
      error: "Failed to review code",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

router.patch(
  "/:id/rating",
  validate({ params: ratingParamsSchema, body: ratingBodySchema }),
  async (req, res) => {
  try {
    const { id } = req.params as z.infer<typeof ratingParamsSchema>;
    const { rating } = req.body as z.infer<typeof ratingBodySchema>;

    try {
      await supabaseService.updateRating(id, rating);
      logger.info({ id, rating }, "Rating saved");
    } catch (dbError) {
      logger.warn({ err: dbError, id }, "Failed to save rating to database");
    }

    res.json({
      success: true,
      message: "Rating received",
    });
  } catch (error) {
    logger.error({ err: error }, "Rating error");
    res.status(500).json({
      error: "Failed to update rating",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
  }
);

export { router as reviewRoutes };


