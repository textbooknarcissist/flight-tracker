export type BookingStatusLabel = 'Scheduled' | 'Delayed' | 'En Route' | 'Landed'

export interface CreateBookingRequest {
  firstName: string
  lastName: string
  email: string
  phone: string
  departureAirport: string
  arrivalAirport: string
  departureDate: string
}

export interface PublicBooking {
  firstName: string
  bookingReference: string
  route: string
  date: string
  status: BookingStatusLabel
  seat: string
  gate: string | null
  delayMinutes: number
}

export interface AdminBooking extends PublicBooking {
  id: string
  lastName: string
  email: string
  phone: string
  departureAirport: string
  arrivalAirport: string
  departureDate: string
  createdAt: string
  updatedAt: string
  updatedByAdminAt: string | null
}

export interface AdminLoginResponse {
  token: string
  admin: {
    username: string
  }
}

export interface UpdateBookingStatusRequest {
  status: BookingStatusLabel
  gate?: string | null
  delayMinutes?: number
}
