import { AxiosError } from 'axios'

import { api } from './api'
import type {
  AdminBooking,
  AdminLoginResponse,
  BookingStatusLabel,
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
    const { data } = await api.post<AdminLoginResponse>('/api/admin/login', {
      username,
      password,
    })

    return data
  } catch (error) {
    throw new Error(getApiErrorMessage(error, 'Unable to log in.'))
  }
}

export async function getAdminBookings() {
  try {
    const { data } = await api.get<AdminBooking[]>('/api/admin/bookings')
    return data
  } catch (error) {
    throw new Error(getApiErrorMessage(error, 'Unable to load bookings.'))
  }
}

export async function getAdminBookingByReference(reference: string) {
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
) {
  try {
    const { data } = await api.patch<AdminBooking>(`/api/admin/bookings/${reference}/status`, payload)
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
