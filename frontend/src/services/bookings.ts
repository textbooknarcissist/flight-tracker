import { AxiosError } from 'axios'

import { api } from './api'
import type { CreateBookingRequest, PublicBooking } from '../types/api'

function getApiErrorMessage(error: unknown, fallback: string) {
  if (error instanceof AxiosError) {
    return error.response?.data?.message ?? fallback
  }

  return fallback
}

export async function createBooking(payload: CreateBookingRequest) {
  try {
    const { data } = await api.post<PublicBooking>('/api/bookings', payload)
    return data
  } catch (error) {
    throw new Error(getApiErrorMessage(error, 'Unable to create booking.'))
  }
}

export async function getBookingByReference(reference: string) {
  try {
    const { data } = await api.get<PublicBooking>(`/api/bookings/${reference}`)
    return data
  } catch (error) {
    throw new Error(getApiErrorMessage(error, 'Unable to find booking.'))
  }
}
