import type { Request, Response, NextFunction } from "express";

export interface GitHubUser {
  id: number;
  login: string;
  avatar_url?: string;
}

export interface SessionData {
  ghToken: string;
  ghUser: GitHubUser;
}

declare module "express-serve-static-core" {
  interface ResponseLocals {
    session?: SessionData;
  }
}

export function setSession(res: Response, data: SessionData): void {
  const value = Buffer.from(JSON.stringify(data)).toString("base64url");
  res.cookie("sess", value, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    signed: true,
    maxAge: 1000 * 60 * 60 * 8,
  });
}

export function getSession(req: Request): SessionData | null {
  const raw = req.signedCookies?.sess;
  if (!raw) return null;
  try {
    return JSON.parse(Buffer.from(raw, "base64url").toString("utf8"));
  } catch {
    return null;
  }
}

export function clearSession(res: Response): void {
  res.clearCookie("sess");
}

export const requireSession = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const session = getSession(req);
  if (!session) {
    return res.status(401).json({ error: "Not authenticated" });
  }
  res.locals.session = session;
  next();
};


