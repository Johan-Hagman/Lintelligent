import express from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import "dotenv/config";
import { authRoutes } from "./routes/authRoutes.js";
import { githubRoutes } from "./routes/githubRoutes.js";
import { reviewRoutes } from "./routes/reviewRoutes.js";

export function createApp() {
  const app = express();

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

  app.get("/", (_req, res) => {
    res.json({ message: "API Server is running!" });
  });

  app.use("/api/auth", authRoutes);
  app.use("/api/github", githubRoutes);
  app.use("/api/review", reviewRoutes);

  return app;
}


