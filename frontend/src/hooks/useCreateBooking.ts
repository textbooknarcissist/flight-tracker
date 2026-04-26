import { useState } from 'react'

import { createBooking } from '../services/bookings'
import type { CreateBookingRequest, PublicBooking } from '../types/api'

interface UseCreateBookingResult {
  create: (payload: CreateBookingRequest) => Promise<PublicBooking>
  error: string | null
  isSubmitting: boolean
}

export function useCreateBooking(): UseCreateBookingResult {
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function create(payload: CreateBookingRequest) {
    setIsSubmitting(true)

    try {
      const booking = await createBooking(payload)
      setError(null)
      return booking
    } catch (submitError) {
      const message =
        submitError instanceof Error ? submitError.message : 'Unable to create booking.'
      setError(message)
      throw submitError
    } finally {
      setIsSubmitting(false)
    }
  }

  return { create, error, isSubmitting }
}
