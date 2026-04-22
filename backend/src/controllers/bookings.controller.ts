import { NextFunction, Request, Response } from "express";

import { createBooking, getPublicBookingByReference } from "../services/booking.service";
import { validateBookingReference, validateCreateBookingPayload } from "../utils/validation";

export async function createBookingHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const payload = validateCreateBookingPayload(req.body);
    const booking = await createBooking(payload);

    return res.status(201).json(booking);
  } catch (error) {
    return next(error);
  }
}

export async function getBookingHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const referenceParam = Array.isArray(req.params.ref) ? req.params.ref[0] : req.params.ref;
    const bookingReference = validateBookingReference(referenceParam);
    const booking = await getPublicBookingByReference(bookingReference);

    return res.json(booking);
  } catch (error) {
    return next(error);
  }
}
