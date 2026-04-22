import "dotenv/config";

import cors from "cors";
import express from "express";
import helmet from "helmet";
import morgan from "morgan";

import adminRouter from "./routes/admin.routes";
import bookingsRouter from "./routes/bookings.routes";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler";
import { globalApiLimiter } from "./middleware/rateLimit";

const app = express();

app.use(
  cors({
    origin: process.env.FRONTEND_ORIGIN ?? "http://localhost:5173",
  }),
);
app.use(helmet());
app.use(morgan("dev"));
app.use(express.json());
app.use(globalApiLimiter);

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.use("/api/bookings", bookingsRouter);
app.use("/api/admin", adminRouter);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;
