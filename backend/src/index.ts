import { createApp } from "./app.js";

const PORT = Number(process.env.PORT) || 3001;
const app = createApp();

if (process.env.NODE_ENV !== "test") {
  app.listen(PORT, () => {
    // eslint-disable-next-line no-console
    console.log(`API Server running on port ${PORT}`);
  });
}

export { app };

