/**
 * Shared type contract between backend and frontend.
 * Import from this file on BOTH sides to guarantee the shapes never drift.
 */

export type BookingStatusLabel = 'Scheduled' | 'Delayed' | 'En Route' | 'Landed'

// ---------------------------------------------------------------------------
// Booking requests
// ---------------------------------------------------------------------------

export interface CreateBookingRequest {
  firstName: string
  lastName: string
  email: string
  phone: string
  departureAirport: string
  arrivalAirport: string
  departureDate: string
}

export interface UpdateBookingStatusRequest {
  status: BookingStatusLabel
  gate?: string | null
  delayMinutes?: number
}

// ---------------------------------------------------------------------------
// Booking responses
// ---------------------------------------------------------------------------

export interface PublicBooking {
  firstName: string
  bookingReference: string
  departureAirport: string
  arrivalAirport: string
  departureDate: string
  status: BookingStatusLabel
  seat: string
  gate: string | null
  delayMinutes: number
}

export interface AdminBooking {
  id: string
  bookingReference: string
  firstName: string
  lastName: string
  email: string
  phone: string
  departureAirport: string
  arrivalAirport: string
  departureDate: string
  status: BookingStatusLabel
  seat: string
  gate: string | null
  delayMinutes: number
  createdAt: string
  updatedAt: string
  updatedByAdminAt: string | null
}

// ---------------------------------------------------------------------------
// Auth
// ---------------------------------------------------------------------------

export interface AdminLoginResponse {
  admin: {
    username: string
  }
}

export interface AdminMeResponse {
  username: string
}

// ---------------------------------------------------------------------------
// Pagination
// ---------------------------------------------------------------------------

export interface PaginatedBookings {
  total: number
  page: number
  pageSize: number
  bookings: AdminBooking[]
}
