import { useEffect, useState } from 'react'

import { getAdminBookingByReference } from '../services/admin'
import type { AdminBooking } from '../types/api'

interface UseAdminBookingResult {
  booking: AdminBooking | null
  error: string | null
  isLoading: boolean
  refetch: () => void
}

/**
 * Fetches a single booking for the admin detail/edit page.
 * Exposes `refetch` so the page can re-load after a successful update.
 */
export function useAdminBooking(reference: string | undefined): UseAdminBookingResult {
  const [booking, setBooking] = useState<AdminBooking | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [tick, setTick] = useState(0)

  useEffect(() => {
    if (!reference) {
      setError('Missing booking reference.')
      setIsLoading(false)
      return
    }

    let cancelled = false

    async function load() {
      setIsLoading(true)

      try {
        const data = await getAdminBookingByReference(reference as string)
        if (!cancelled) {
          setBooking(data)
          setError(null)
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Unable to load booking.')
        }
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }

    void load()

    return () => {
      cancelled = true
    }
  }, [reference, tick])

  return {
    booking,
    error,
    isLoading,
    refetch: () => setTick((n) => n + 1),
  }
}
