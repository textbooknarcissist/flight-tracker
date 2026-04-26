import { useState } from 'react'

import { updateAdminBookingStatus } from '../services/admin'
import type { AdminBooking, UpdateBookingStatusRequest } from '../types/api'

interface UseAdminBookingUpdateResult {
  error: string | null
  isSaving: boolean
  update: (reference: string, payload: UpdateBookingStatusRequest) => Promise<AdminBooking>
}

export function useAdminBookingUpdate(): UseAdminBookingUpdateResult {
  const [error, setError] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)

  async function update(reference: string, payload: UpdateBookingStatusRequest) {
    setIsSaving(true)

    try {
      const booking = await updateAdminBookingStatus(reference, payload)
      setError(null)
      return booking
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Unable to update booking.')
      throw submitError
    } finally {
      setIsSaving(false)
    }
  }

  return { error, isSaving, update }
}
