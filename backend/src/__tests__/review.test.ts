import { beforeEach, describe, expect, it, vi } from "vitest";
import request from "supertest";

const reviewCodeMock = vi.fn();
const saveReviewMock = vi.fn();
const updateRatingMock = vi.fn();
const fixedUuid = "123e4567-e89b-42d3-a456-426614174000";
const uuidMock = vi.fn(() => fixedUuid);

vi.mock("../services/mcp/mcpService.js", () => ({
  mcpService: {
    reviewCode: reviewCodeMock,
  },
}));

vi.mock("../services/database/supabaseService.js", () => ({
  supabaseService: {
    saveReview: saveReviewMock,
    updateRating: updateRatingMock,
  },
}));

vi.mock("uuid", () => ({
  v4: uuidMock,
}));

describe("Backend API", () => {
  beforeEach(async () => {
    vi.clearAllMocks();
    process.env.NODE_ENV = "test";
    process.env.SESSION_SECRET = "test-secret";
    process.env.ANTHROPIC_API_KEY = "test-anthropic-key";

    reviewCodeMock.mockResolvedValue({
      suggestions: [],
      summary: "Looks good",
      aiModel: "anthropic-test",
    });

    saveReviewMock.mockResolvedValue(fixedUuid);
    updateRatingMock.mockResolvedValue(undefined);
    uuidMock.mockReturnValue(fixedUuid);

    // Ensure we always import a fresh instance of the app with mocks applied
    vi.resetModules();
  });

  describe("POST /api/review", () => {
    it("returns 400 when code is missing", async () => {
      const { app } = await import("../index.js");

      const response = await request(app).post("/api/review").send({
        language: "typescript",
      });

      expect(response.status).toBe(400);
      expect(response.body).toEqual(
        expect.objectContaining({
          error: "Validation failed",
        })
      );
      expect(response.body.details.fieldErrors.code).toContain("Required");
    });

    it("returns 500 when Anthropic API key is missing", async () => {
      delete process.env.ANTHROPIC_API_KEY;
      const { app } = await import("../index.js");

      const response = await request(app).post("/api/review").send({
        code: "const a = 1;",
      });

      expect(response.status).toBe(500);
      expect(response.body).toEqual(
        expect.objectContaining({ error: "AI API key not configured" })
      );
    });

    it("creates a review with minimal payload", async () => {
      const { app } = await import("../index.js");

      const response = await request(app).post("/api/review").send({
        code: "const a = 1;",
        language: "typescript",
        reviewType: "best-practices",
      });

      expect(response.status).toBe(200);
      expect(reviewCodeMock).toHaveBeenCalledWith(
        expect.objectContaining({
          code: "const a = 1;",
          language: "typescript",
          reviewType: "best-practices",
          apiKey: "test-anthropic-key",
          repoContext: undefined,
        })
      );
      expect(saveReviewMock).toHaveBeenCalledWith(
        expect.objectContaining({
          id: fixedUuid,
          code: "const a = 1;",
          language: "typescript",
          reviewType: "best-practices",
          aiFeedback: {
            suggestions: [],
            summary: "Looks good",
            aiModel: "anthropic-test",
          },
          aiModel: "anthropic-test",
        })
      );
      expect(response.body).toEqual(
        expect.objectContaining({
          id: fixedUuid,
          feedback: {
            suggestions: [],
            summary: "Looks good",
            aiModel: "anthropic-test",
          },
        })
      );
    });

    it("requires GitHub authentication when repoInfo is provided", async () => {
      const { app } = await import("../index.js");

      const response = await request(app)
        .post("/api/review")
        .send({
          code: "const a = 1;",
          repoInfo: {
            owner: "user",
            repo: "repo",
            ref: "main",
            filePath: "src/index.ts",
          },
        });

      expect(response.status).toBe(401);
      expect(response.body).toEqual(
        expect.objectContaining({
          error: "GitHub authentication required for repo reviews",
        })
      );
    });
  });

  describe("PATCH /api/review/:id/rating", () => {
    it("returns 400 for invalid UUID", async () => {
      const { app } = await import("../index.js");

      const response = await request(app)
        .patch("/api/review/not-a-uuid/rating")
        .send({ rating: 1 });

      expect(response.status).toBe(400);
      expect(response.body).toEqual(
        expect.objectContaining({
          error: "Validation failed",
        })
      );
      expect(response.body.details.fieldErrors.id).toContain(
        "Invalid review ID format"
      );
    });

    it("returns 400 for invalid rating values", async () => {
      const { app } = await import("../index.js");

      const response = await request(app)
        .patch(`/api/review/${fixedUuid}/rating`)
        .send({ rating: 0 });

      expect(response.status).toBe(400);
      expect(response.body).toEqual(
        expect.objectContaining({
          error: "Validation failed",
        })
      );
      expect(response.body.details.fieldErrors.rating).toContain(
        "Rating must be 1 (thumbs up) or -1 (thumbs down)"
      );
    });

    it("accepts a valid rating payload", async () => {
      const { app } = await import("../index.js");

      const response = await request(app)
        .patch(`/api/review/${fixedUuid}/rating`)
        .send({ rating: 1 });

      expect(response.status).toBe(200);
      expect(updateRatingMock).toHaveBeenCalledWith(fixedUuid, 1);
      expect(response.body).toEqual(
        expect.objectContaining({
          success: true,
        })
      );
    });
  });
});
