import express, { Request, Response } from "express";
import "dotenv/config";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import { v4 as uuidv4 } from "uuid";
import { mcpService } from "./services/mcp/mcpService.js";
import { supabaseService } from "./services/database/supabaseService.js";

const app = express();
const PORT = Number(process.env.PORT) || 3001;

app.use(helmet());
app.use(
  cors({
    origin: ["http://localhost:3000"],
    methods: ["GET", "POST", "PATCH"],
    credentials: true,
  })
);
app.use(express.json({ limit: "100kb" }));
app.use(
  cookieParser(
    process.env.SESSION_SECRET || "default-secret-change-in-production"
  )
);

app.disable("x-powered-by");

// Session helper functions
interface GitHubUser {
  id: number;
  login: string;
  avatar_url?: string;
}

interface SessionData {
  ghToken: string;
  ghUser: GitHubUser;
}

function setSession(res: Response, data: SessionData): void {
  const value = Buffer.from(JSON.stringify(data)).toString("base64url");
  res.cookie("sess", value, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    signed: true,
    maxAge: 1000 * 60 * 60 * 8, // 8 hours
  });
}

function getSession(req: Request): SessionData | null {
  const raw = req.signedCookies?.sess;
  if (!raw) return null;
  try {
    return JSON.parse(Buffer.from(raw, "base64url").toString("utf8"));
  } catch {
    return null;
  }
}

// Health check
app.get("/", (_req: Request, res: Response) => {
  res.json({ message: "API Server is running!" });
});

// GitHub OAuth routes
app.get("/api/auth/github/login", (_req: Request, res: Response) => {
  const clientId = process.env.GITHUB_CLIENT_ID;
  const redirectUri =
    process.env.GITHUB_REDIRECT_URI ||
    "http://localhost:3001/api/auth/github/callback";
  const scope = "repo read:user";

  if (!clientId) {
    return res.status(500).json({ error: "GitHub OAuth not configured" });
  }

  const state = Math.random().toString(36).slice(2);
  const url = `https://github.com/login/oauth/authorize?client_id=${encodeURIComponent(
    clientId
  )}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${encodeURIComponent(
    scope
  )}&state=${state}`;
  res.redirect(url);
});

app.get("/api/auth/github/callback", async (req: Request, res: Response) => {
  const code = req.query.code as string;
  if (!code) {
    return res.status(400).send("Missing authorization code");
  }

  try {
    // Exchange code for access token
    const tokenRes = await fetch(
      "https://github.com/login/oauth/access_token",
      {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          client_id: process.env.GITHUB_CLIENT_ID,
          client_secret: process.env.GITHUB_CLIENT_SECRET,
          code,
          redirect_uri:
            process.env.GITHUB_REDIRECT_URI ||
            "http://localhost:3001/api/auth/github/callback",
        }),
      }
    );

    if (!tokenRes.ok) {
      return res.status(400).send("Failed to exchange code for token");
    }

    const tokenData = await tokenRes.json();
    const accessToken = tokenData.access_token;

    if (!accessToken) {
      return res.status(400).send("No access token received");
    }

    // Fetch user info
    const userRes = await fetch("https://api.github.com/user", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: "application/json",
      },
    });

    if (!userRes.ok) {
      return res.status(400).send("Failed to fetch user info");
    }

    const ghUser = (await userRes.json()) as GitHubUser;

    // Set session
    setSession(res, { ghToken: accessToken, ghUser });

    // Redirect to frontend
    res.redirect("http://localhost:3000");
  } catch (error) {
    console.error("OAuth callback error:", error);
    res.status(500).send("Authentication failed");
  }
});

// Check auth status
app.get("/api/auth/me", (req: Request, res: Response) => {
  const session = getSession(req);
  if (!session) {
    return res.status(401).json({ authenticated: false });
  }
  res.json({
    authenticated: true,
    user: session.ghUser,
  });
});

// Logout
app.post("/api/auth/logout", (_req: Request, res: Response) => {
  res.clearCookie("sess");
  res.json({ success: true });
});

// GitHub API endpoints (require authentication)
app.get("/api/github/repos", async (req: Request, res: Response) => {
  const session = getSession(req);
  if (!session) {
    return res.status(401).json({ error: "Not authenticated" });
  }

  try {
    const reposRes = await fetch(
      "https://api.github.com/user/repos?per_page=100&sort=updated",
      {
        headers: {
          Authorization: `Bearer ${session.ghToken}`,
          Accept: "application/json",
        },
      }
    );

    if (!reposRes.ok) {
      return res
        .status(reposRes.status)
        .json({ error: "Failed to fetch repositories" });
    }

    const repos = await reposRes.json();
    res.json(repos);
  } catch (error) {
    console.error("GitHub repos error:", error);
    res.status(500).json({ error: "Failed to fetch repositories" });
  }
});

app.get(
  "/api/github/repos/:owner/:repo/branches",
  async (req: Request, res: Response) => {
    const session = getSession(req);
    if (!session) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    const { owner, repo } = req.params;

    try {
      const branchesRes = await fetch(
        `https://api.github.com/repos/${owner}/${repo}/branches`,
        {
          headers: {
            Authorization: `Bearer ${session.ghToken}`,
            Accept: "application/json",
          },
        }
      );

      if (!branchesRes.ok) {
        return res
          .status(branchesRes.status)
          .json({ error: "Failed to fetch branches" });
      }

      const branches = await branchesRes.json();
      res.json(branches);
    } catch (error) {
      console.error("GitHub branches error:", error);
      res.status(500).json({ error: "Failed to fetch branches" });
    }
  }
);

app.get(
  "/api/github/repos/:owner/:repo/tree/:branch",
  async (req: Request, res: Response) => {
    const session = getSession(req);
    if (!session) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    const { owner, repo, branch } = req.params;

    try {
      // Get commit SHA for branch
      const branchRes = await fetch(
        `https://api.github.com/repos/${owner}/${repo}/branches/${branch}`,
        {
          headers: {
            Authorization: `Bearer ${session.ghToken}`,
            Accept: "application/json",
          },
        }
      );

      if (!branchRes.ok) {
        return res
          .status(branchRes.status)
          .json({ error: "Failed to fetch branch" });
      }

      const branchData = await branchRes.json();
      const treeSha = branchData.commit.sha;

      // Get tree recursively
      const treeRes = await fetch(
        `https://api.github.com/repos/${owner}/${repo}/git/trees/${treeSha}?recursive=1`,
        {
          headers: {
            Authorization: `Bearer ${session.ghToken}`,
            Accept: "application/json",
          },
        }
      );

      if (!treeRes.ok) {
        return res
          .status(treeRes.status)
          .json({ error: "Failed to fetch file tree" });
      }

      const treeData = await treeRes.json();
      res.json(treeData);
    } catch (error) {
      console.error("GitHub tree error:", error);
      res.status(500).json({ error: "Failed to fetch file tree" });
    }
  }
);

app.get(
  "/api/github/repos/:owner/:repo/contents",
  async (req: Request, res: Response) => {
    const session = getSession(req);
    if (!session) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    const { owner, repo } = req.params;
    const { path, ref } = req.query;

    if (!path) {
      return res.status(400).json({ error: "Missing path parameter" });
    }

    try {
      const url = new URL(
        `https://api.github.com/repos/${owner}/${repo}/contents/${path}`
      );
      if (ref) {
        url.searchParams.set("ref", String(ref));
      }

      const contentRes = await fetch(url.toString(), {
        headers: {
          Authorization: `Bearer ${session.ghToken}`,
          Accept: "application/json",
        },
      });

      if (!contentRes.ok) {
        return res
          .status(contentRes.status)
          .json({ error: "Failed to fetch file content" });
      }

      const content = await contentRes.json();
      res.json(content);
    } catch (error) {
      console.error("GitHub content error:", error);
      res.status(500).json({ error: "Failed to fetch file content" });
    }
  }
);

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
