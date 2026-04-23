/**
 * Backend re-exports shared types and adds backend-specific utilities
 * (enum↔label maps) that the frontend never needs.
 */
import { BookingStatus } from "@prisma/client";

export type {
  AdminBooking,
  AdminLoginResponse,
  AdminMeResponse,
  BookingStatusLabel,
  CreateBookingRequest,
  PaginatedBookings,
  PublicBooking,
  UpdateBookingStatusRequest,
} from "@shared/types";

import type { BookingStatusLabel } from "@shared/types";

// Re-export response shape aliases the services use internally
export type PublicBookingResponse = import("@shared/types").PublicBooking;
export type AdminBookingResponse = import("@shared/types").AdminBooking;

export interface AuthTokenPayload {
  adminId: string;
  username: string;
}

export const statusLabelToEnum: Record<BookingStatusLabel, BookingStatus> = {
  Scheduled: BookingStatus.SCHEDULED,
  Delayed: BookingStatus.DELAYED,
  "En Route": BookingStatus.EN_ROUTE,
  Landed: BookingStatus.LANDED,
};

export const statusEnumToLabel: Record<BookingStatus, BookingStatusLabel> = {
  [BookingStatus.SCHEDULED]: "Scheduled",
  [BookingStatus.DELAYED]: "Delayed",
  [BookingStatus.EN_ROUTE]: "En Route",
  [BookingStatus.LANDED]: "Landed",
};
