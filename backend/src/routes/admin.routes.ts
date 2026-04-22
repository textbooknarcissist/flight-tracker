import { Router } from "express";

import {
  getAdminBookingHandler,
  listBookingsHandler,
  loginAdminHandler,
  updateBookingStatusHandler,
} from "../controllers/admin.controller";
import { requireAdminAuth } from "../middleware/auth";
import { adminLoginLimiter } from "../middleware/rateLimit";

const adminRouter = Router();

adminRouter.post("/login", adminLoginLimiter, loginAdminHandler);
adminRouter.get("/bookings", requireAdminAuth, listBookingsHandler);
adminRouter.get("/bookings/:ref", requireAdminAuth, getAdminBookingHandler);
adminRouter.patch("/bookings/:ref/status", requireAdminAuth, updateBookingStatusHandler);

export default adminRouter;
