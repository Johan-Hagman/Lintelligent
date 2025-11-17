import express from "express";
import type { Request, Response, NextFunction, RequestHandler } from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import rateLimit from "express-rate-limit";
import "dotenv/config";
import { authRoutes } from "./routes/authRoutes.js";
import { githubRoutes } from "./routes/githubRoutes.js";
import { reviewRoutes } from "./routes/reviewRoutes.js";
import { logger } from "./utils/logger.js";

export function createApp() {
  const app = express();
  app.set("trust proxy", 1);

  const sessionSecret = process.env.SESSION_SECRET;
  if (!sessionSecret) {
    throw new Error("SESSION_SECRET environment variable is required");
  }

  app.use(
    helmet({
      contentSecurityPolicy:
        process.env.NODE_ENV === "production"
          ? {
              directives: {
                defaultSrc: ["'self'"],
                scriptSrc: ["'self'"],
                styleSrc: ["'self'", "'unsafe-inline'"],
                imgSrc: ["'self'", "data:"],
                connectSrc: ["'self'"],
              },
            }
          : false,
    })
  );
  const apiLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: 100,
    standardHeaders: "draft-7",
    legacyHeaders: false,
  });
  app.use("/api", apiLimiter as unknown as RequestHandler);

  const allowedOrigins = [
    "http://localhost:3000",
    "https://lintelligent.vercel.app",
  ];

  app.use(
    cors({
      origin: allowedOrigins,
      methods: ["GET", "POST", "PATCH"],
      credentials: true,
    })
  );
  app.use(express.json({ limit: "100kb" }));
  app.use(cookieParser(sessionSecret));

  app.disable("x-powered-by");

  app.get("/", (_req, res) => {
    res.json({ message: "API Server is running!" });
  });

  app.use("/api/auth", authRoutes);
  app.use("/api/github", githubRoutes);
  app.use("/api/review", reviewRoutes);

  app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
    logger.error({ err }, "Unhandled error");
    res.status(500).json({ error: "Internal server error" });
  });

  return app;
}
