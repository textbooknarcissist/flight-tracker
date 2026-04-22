import { BookingStatus } from "@prisma/client";

export type BookingStatusLabel = "Scheduled" | "Delayed" | "En Route" | "Landed";

export interface CreateBookingRequest {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  departureAirport: string;
  arrivalAirport: string;
  departureDate: string;
}

export interface PublicBookingResponse {
  firstName: string;
  bookingReference: string;
  route: string;
  date: string;
  status: BookingStatusLabel;
  seat: string;
  gate: string | null;
  delayMinutes: number;
}

export interface AdminBookingResponse {
  id: string;
  bookingReference: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  departureAirport: string;
  arrivalAirport: string;
  departureDate: string;
  status: BookingStatusLabel;
  seat: string;
  gate: string | null;
  delayMinutes: number;
  createdAt: string;
  updatedAt: string;
  updatedByAdminAt: string | null;
}

export interface AdminLoginRequest {
  username: string;
  password: string;
}

export interface AdminLoginResponse {
  token: string;
  admin: {
    username: string;
  };
}

export interface UpdateBookingStatusRequest {
  status: BookingStatusLabel;
  gate?: string | null;
  delayMinutes?: number;
}

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
