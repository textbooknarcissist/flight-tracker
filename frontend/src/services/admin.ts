import { AxiosError } from 'axios'

import { api } from './api'
import type {
  AdminBooking,
  AdminMeResponse,
  BookingStatusLabel,
  PaginatedBookings,
  UpdateBookingStatusRequest,
} from '../types/api'

function getApiErrorMessage(error: unknown, fallback: string) {
  if (error instanceof AxiosError) {
    return error.response?.data?.message ?? fallback
  }

  return fallback
}

export async function loginAdmin(username: string, password: string) {
  try {
    // Server sets an HttpOnly cookie; the response body contains only admin profile.
    const { data } = await api.post<{ admin: { username: string } }>('/api/admin/login', {
      username,
      password,
    })

    return data
  } catch (error) {
    throw new Error(getApiErrorMessage(error, 'Unable to log in.'))
  }
}

export async function logoutAdmin() {
  try {
    await api.post('/api/admin/logout')
  } catch {
    // Best-effort logout — store is cleared regardless
  }
}

export async function getAdminMe(): Promise<AdminMeResponse> {
  const { data } = await api.get<AdminMeResponse>('/api/admin/me')
  return data
}

export async function getAdminBookings(page = 1, pageSize = 50): Promise<PaginatedBookings> {
  try {
    const { data } = await api.get<PaginatedBookings>('/api/admin/bookings', {
      params: { page, pageSize },
    })
    return data
  } catch (error) {
    throw new Error(getApiErrorMessage(error, 'Unable to load bookings.'))
  }
}

export async function getAdminBookingByReference(reference: string): Promise<AdminBooking> {
  try {
    const { data } = await api.get<AdminBooking>(`/api/admin/bookings/${reference}`)
    return data
  } catch (error) {
    throw new Error(getApiErrorMessage(error, 'Unable to load booking.'))
  }
}

export async function updateAdminBookingStatus(
  reference: string,
  payload: UpdateBookingStatusRequest,
): Promise<AdminBooking> {
  try {
    const { data } = await api.patch<AdminBooking>(
      `/api/admin/bookings/${reference}/status`,
      payload,
    )
    return data
  } catch (error) {
    throw new Error(getApiErrorMessage(error, 'Unable to update booking.'))
  }
}

export const BOOKING_STATUS_OPTIONS: BookingStatusLabel[] = [
  'Scheduled',
  'Delayed',
  'En Route',
  'Landed',
]
