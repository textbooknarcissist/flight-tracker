import { NextFunction, Request, Response } from "express";

import {
  getAdminBookingByReference,
  getAdminMe,
  JWT_COOKIE_MAX_AGE_S,
  JWT_COOKIE_NAME,
  listBookings,
  loginAdmin,
  updateBookingStatus,
} from "../services/admin.service";
import {
  validateAdminLoginPayload,
  validateBookingReference,
  validateStatusUpdatePayload,
} from "../utils/validation";
import { AppError } from "../middleware/errorHandler";

const IS_PRODUCTION = process.env.NODE_ENV === "production";

// ---------------------------------------------------------------------------
// Auth
// ---------------------------------------------------------------------------

export async function loginAdminHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const payload = validateAdminLoginPayload(req.body);
    const result = await loginAdmin(payload.username, payload.password);

    // Issue token as HttpOnly cookie — the browser sends it automatically on
    // every subsequent request, and JS cannot read it (XSS-safe).
    res.cookie(JWT_COOKIE_NAME, result.token, {
      httpOnly: true,
      secure: IS_PRODUCTION,
      sameSite: "strict",
      maxAge: JWT_COOKIE_MAX_AGE_S * 1000,
    });

    // Return only the admin profile, not the raw token, in the response body.
    return res.json({ admin: result.admin });
  } catch (error) {
    return next(error);
  }
}

export async function logoutAdminHandler(_req: Request, res: Response) {
  res.clearCookie(JWT_COOKIE_NAME, {
    httpOnly: true,
    secure: IS_PRODUCTION,
    sameSite: "strict",
  });

  return res.json({ message: "Logged out." });
}

export async function meAdminHandler(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.admin) {
      throw new AppError("Authorization token is required.", 401);
    }

    const profile = await getAdminMe(req.admin.id);
    return res.json(profile);
  } catch (error) {
    return next(error);
  }
}

// ---------------------------------------------------------------------------
// Bookings
// ---------------------------------------------------------------------------

export async function listBookingsHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const page = Math.max(1, Number(req.query.page) || 1);
    const pageSize = Math.min(100, Math.max(1, Number(req.query.pageSize) || 50));
    const result = await listBookings(page, pageSize);

    return res.json(result);
  } catch (error) {
    return next(error);
  }
}

export async function getAdminBookingHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const referenceParam = Array.isArray(req.params.ref) ? req.params.ref[0] : req.params.ref;
    const bookingReference = validateBookingReference(referenceParam);
    const booking = await getAdminBookingByReference(bookingReference);

    return res.json(booking);
  } catch (error) {
    return next(error);
  }
}

export async function updateBookingStatusHandler(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.admin) {
      throw new AppError("Authorization token is required.", 401);
    }

    const referenceParam = Array.isArray(req.params.ref) ? req.params.ref[0] : req.params.ref;
    const bookingReference = validateBookingReference(referenceParam);
    const payload = validateStatusUpdatePayload(req.body);
    const booking = await updateBookingStatus(bookingReference, payload, req.admin.id);

    return res.json(booking);
  } catch (error) {
    return next(error);
  }
}
