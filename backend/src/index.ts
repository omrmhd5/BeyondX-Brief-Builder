import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import { getAllowedOrigins, isOriginAllowed } from "./config/cors.js";
import { errorHandler } from "./middleware/errorHandler.js";
import briefsRoutes from "./routes/briefs.routes.js";

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT) || 5000;
const HOST = process.env.HOST ?? "0.0.0.0";

app.use(
  cors({
    origin(origin, callback) {
      if (isOriginAllowed(origin)) {
        callback(null, true);
        return;
      }
      callback(null, false);
    },
    methods: ["GET", "POST", "DELETE", "OPTIONS"],
  }),
);
app.use(express.json({ limit: "20kb" }));

app.get("/health", (_req, res) => {
  res.json({
    status: "ok",
    environment: process.env.NODE_ENV ?? "development",
  });
});

app.use("/api/briefs", briefsRoutes);

app.use(errorHandler);

if (process.env.NODE_ENV !== "test") {
  app.listen(PORT, HOST, () => {
    const origins = getAllowedOrigins();
    console.log(`Backend running on http://${HOST}:${PORT}`);
    console.log(`CORS origins: ${origins.length ? origins.join(", ") : "(none — set FRONTEND_ORIGIN)"}`);
  });
}

export default app;
