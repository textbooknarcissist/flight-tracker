import "dotenv/config";

import cookieParser from "cookie-parser";
import cors from "cors";
import express, { NextFunction, Request, Response } from "express";
import helmet from "helmet";
import morgan from "morgan";

import adminRouter from "./routes/admin.routes";
import bookingsRouter from "./routes/bookings.routes";
import { errorHandler, notFoundHandler, AppError } from "./middleware/errorHandler";
import { globalApiLimiter } from "./middleware/rateLimit";

// ---------------------------------------------------------------------------
// CORS — explicit allowlist, never accept wildcard
// ---------------------------------------------------------------------------
const ALLOWED_ORIGINS = (process.env.FRONTEND_ORIGIN ?? "http://localhost:5173")
  .split(",")
  .map((o) => o.trim());

const app = express();

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (e.g. same-origin server-to-server, curl in dev)
      if (!origin || ALLOWED_ORIGINS.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true, // required to allow HttpOnly cookies cross-origin
  }),
);
app.use(helmet());
app.use(morgan("dev"));
app.use(cookieParser());
app.use(express.json());
app.use(globalApiLimiter);

// ---------------------------------------------------------------------------
// Content-Type guard — reject non-JSON mutation requests early
// ---------------------------------------------------------------------------
app.use((req: Request, res: Response, next: NextFunction) => {
  if (["POST", "PUT", "PATCH"].includes(req.method)) {
    const contentType = req.headers["content-type"];

    if (!contentType?.includes("application/json")) {
      return next(new AppError("Content-Type must be application/json.", 415));
    }
  }

  return next();
});

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.use("/api/bookings", bookingsRouter);
app.use("/api/admin", adminRouter);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;
