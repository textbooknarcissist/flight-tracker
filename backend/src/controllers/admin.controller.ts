import { NextFunction, Request, Response } from "express";

import {
  getAdminBookingByReference,
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

export async function loginAdminHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const payload = validateAdminLoginPayload(req.body);
    const result = await loginAdmin(payload.username, payload.password);

    return res.json(result);
  } catch (error) {
    return next(error);
  }
}

export async function listBookingsHandler(_req: Request, res: Response, next: NextFunction) {
  try {
    const bookings = await listBookings();

    return res.json(bookings);
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
