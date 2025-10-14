import express, { Request, Response } from "express";
import "dotenv/config";

const app = express();
const PORT = Number(process.env.PORT) || 3001;

app.use(express.json());

app.get("/", (_req: Request, res: Response) => {
  res.json({ message: "API Server is running!" });
});

app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`API Server running on port ${PORT}`);
});
