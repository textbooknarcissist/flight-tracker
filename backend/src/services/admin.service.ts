import bcrypt from "bcrypt";
import { Booking, BookingStatus, Prisma } from "@prisma/client";
import jwt from "jsonwebtoken";

import { prisma } from "../config/prisma";
import { AppError } from "../middleware/errorHandler";
import {
  AdminBookingResponse,
  AdminLoginResponse,
  AdminMeResponse,
  BookingStatusLabel,
  PaginatedBookings,
  UpdateBookingStatusRequest,
  statusEnumToLabel,
  statusLabelToEnum,
} from "../types/api";

const JWT_COOKIE_MAX_AGE_MS = 8 * 60 * 60 * 1000; // 8 hours
export const JWT_COOKIE_MAX_AGE_S = JWT_COOKIE_MAX_AGE_MS / 1000;
export const JWT_COOKIE_NAME = "auth_token";

function mapAdminBooking(booking: Booking): AdminBookingResponse {
  return {
    id: booking.id,
    bookingReference: booking.bookingReference,
    firstName: booking.firstName,
    lastName: booking.lastName,
    email: booking.email,
    phone: booking.phone,
    departureAirport: booking.departureAirport,
    arrivalAirport: booking.arrivalAirport,
    departureDate: booking.departureDate.toISOString(),
    status: statusEnumToLabel[booking.status],
    seat: booking.seat,
    gate: booking.gate,
    delayMinutes: booking.delayMinutes,
    createdAt: booking.createdAt.toISOString(),
    updatedAt: booking.updatedAt.toISOString(),
    updatedByAdminAt: booking.updatedByAdminAt ? booking.updatedByAdminAt.toISOString() : null,
  };
}

function issueToken(adminId: string, username: string): string {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new AppError("JWT secret is not configured.", 500, false);
  }

  return jwt.sign({ adminId, username }, secret, { expiresIn: "8h" });
}

export async function loginAdmin(
  username: string,
  password: string,
): Promise<AdminLoginResponse & { token: string }> {
  const admin = await prisma.admin.findUnique({ where: { username } });

  if (!admin) {
    throw new AppError("Invalid username or password.", 401);
  }

  const passwordMatches = await bcrypt.compare(password, admin.passwordHash);

  if (!passwordMatches) {
    throw new AppError("Invalid username or password.", 401);
  }

  return {
    token: issueToken(admin.id, admin.username),
    admin: { username: admin.username },
  };
}

export async function getAdminMe(adminId: string): Promise<AdminMeResponse> {
  const admin = await prisma.admin.findUnique({ where: { id: adminId } });

  if (!admin) {
    throw new AppError("Admin not found.", 404);
  }

  return { username: admin.username };
}

export async function listBookings(
  page = 1,
  pageSize = 50,
): Promise<PaginatedBookings> {
  const skip = (page - 1) * pageSize;

  const [total, bookings] = await prisma.$transaction([
    prisma.booking.count(),
    prisma.booking.findMany({
      orderBy: { createdAt: "desc" },
      skip,
      take: pageSize,
    }),
  ]);

  return {
    total,
    page,
    pageSize,
    bookings: bookings.map(mapAdminBooking),
  };
}

export async function getAdminBookingByReference(reference: string): Promise<AdminBookingResponse> {
  const booking = await prisma.booking.findUnique({
    where: { bookingReference: reference },
  });

  if (!booking) {
    throw new AppError("Booking not found.", 404);
  }

  return mapAdminBooking(booking);
}

function normalizeStatusUpdate(status: BookingStatusLabel, delayMinutes?: number) {
  const enumStatus = statusLabelToEnum[status];

  if (status === "Delayed") {
    return { status: enumStatus, delayMinutes: delayMinutes ?? 15 };
  }

  return { status: enumStatus, delayMinutes: delayMinutes ?? 0 };
}

export async function updateBookingStatus(
  reference: string,
  payload: UpdateBookingStatusRequest,
  adminId: string,
): Promise<AdminBookingResponse> {
  const normalizedStatus = normalizeStatusUpdate(payload.status, payload.delayMinutes);
  const updateData: {
    status: BookingStatus;
    gate?: string | null;
    delayMinutes: number;
    updatedByAdminAt: Date;
  } = {
    status: normalizedStatus.status,
    delayMinutes: normalizedStatus.delayMinutes,
    updatedByAdminAt: new Date(),
  };

  if (payload.gate !== undefined) {
    updateData.gate = payload.gate;
  }

  try {
    const booking = await prisma.$transaction(async (tx) => {
      const updatedBooking = await tx.booking.update({
        where: { bookingReference: reference },
        data: updateData,
      });

      await tx.adminLog.create({
        data: {
          adminId,
          action: `Updated booking to ${statusEnumToLabel[updatedBooking.status]}`,
          bookingReference: updatedBooking.bookingReference,
        },
      });

      return updatedBooking;
    });

    return mapAdminBooking(booking);
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2025"
    ) {
      throw new AppError("Booking not found.", 404);
    }

    throw error;
  }
}
