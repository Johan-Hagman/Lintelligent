import { Router } from "express";
import { clearSession, getSession, setSession } from "../utils/session.js";
import { logger } from "../utils/logger.js";

const router = Router();

router.get("/github/login", (_req, res) => {
  const clientId = process.env.GITHUB_CLIENT_ID;
  const redirectUri =
    process.env.GITHUB_REDIRECT_URI ||
    "http://localhost:3001/api/auth/github/callback";
  const scope = "repo read:user";

  if (!clientId) {
    logger.error("GitHub OAuth not configured");
    return res.status(500).json({ error: "GitHub OAuth not configured" });
  }

  const state = Math.random().toString(36).slice(2) + Date.now().toString(36);
  res.cookie("oauth_state", state, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    signed: true,
    maxAge: 1000 * 60 * 10,
  });

  const url = `https://github.com/login/oauth/authorize?client_id=${encodeURIComponent(
    clientId
  )}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${encodeURIComponent(
    scope
  )}&state=${state}`;
  res.redirect(url);
});

router.get("/github/callback", async (req, res) => {
  const code = req.query.code as string;
  const state = req.query.state as string;

  if (!code) {
    return res.status(400).send("Missing authorization code");
  }

  if (!state) {
    return res.status(400).send("Missing state parameter");
  }

  const storedState = req.signedCookies?.oauth_state;
  if (!storedState || storedState !== state) {
    logger.warn("Invalid OAuth state");
    return res
      .status(403)
      .send("Invalid state parameter - possible CSRF attack");
  }

  res.clearCookie("oauth_state");

  try {
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

    const userRes = await fetch("https://api.github.com/user", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: "application/json",
      },
    });

    if (!userRes.ok) {
      return res.status(400).send("Failed to fetch user info");
    }

    const ghUser = await userRes.json();
    setSession(res, { ghToken: accessToken, ghUser });
    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";
    res.redirect(frontendUrl);
  } catch (error) {
    logger.error({ err: error }, "OAuth callback error");
    res.status(500).send("Authentication failed");
  }
});

router.get("/me", (req, res) => {
  const session = getSession(req);
  if (!session) {
    return res.json({ authenticated: false });
  }
  res.json({
    authenticated: true,
    user: session.ghUser,
  });
});

router.post("/logout", (_req, res) => {
  clearSession(res);
  res.json({ success: true });
});

export { router as authRoutes };
