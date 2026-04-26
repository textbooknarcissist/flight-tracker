import { Booking, BookingStatus, Prisma } from "@prisma/client";

import { prisma } from "../config/prisma";
import { AppError } from "../middleware/errorHandler";
import { CreateBookingRequest, PublicBookingResponse, statusEnumToLabel } from "../types/api";
import { generateBookingReference } from "../utils/reference";
import { generateSeat } from "../utils/seat";

function mapPublicBooking(booking: Booking): PublicBookingResponse {
  return {
    firstName: booking.firstName,
    bookingReference: booking.bookingReference,
    departureAirport: booking.departureAirport,
    arrivalAirport: booking.arrivalAirport,
    departureDate: booking.departureDate.toISOString(),
    status: statusEnumToLabel[booking.status],
    seat: booking.seat,
    gate: booking.gate,
    delayMinutes: booking.delayMinutes,
  };
}

export async function createBooking(payload: CreateBookingRequest): Promise<PublicBookingResponse> {
  let lastError: unknown;

  for (let attempt = 0; attempt < 5; attempt += 1) {
    try {
      const booking = await prisma.booking.create({
        data: {
          bookingReference: generateBookingReference(),
          firstName: payload.firstName,
          lastName: payload.lastName,
          email: payload.email,
          phone: payload.phone,
          departureAirport: payload.departureAirport,
          arrivalAirport: payload.arrivalAirport,
          departureDate: new Date(payload.departureDate),
          status: BookingStatus.SCHEDULED,
          seat: generateSeat(),
          gate: null,
          delayMinutes: 0,
        },
      });

      return mapPublicBooking(booking);
    } catch (error) {
      lastError = error;

      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2002"
      ) {
        continue;
      }

      throw error;
    }
  }

  throw new AppError(
    lastError instanceof Error ? lastError.message : "Could not generate a booking reference.",
    500,
    false,
  );
}

export async function getPublicBookingByReference(reference: string): Promise<PublicBookingResponse> {
  const booking = await prisma.booking.findUnique({
    where: { bookingReference: reference },
  });

  if (!booking) {
    throw new AppError("Booking not found.", 404);
  }

  return mapPublicBooking(booking);
}
