import { useEffect, useState } from 'react'

import { getBookingByReference } from '../services/bookings'
import type { PublicBooking } from '../types/api'

interface UsePublicBookingResult {
  booking: PublicBooking | null
  error: string | null
  isLoading: boolean
  refetch: () => void
}

/**
 * Fetches a public booking by reference. Provides a `refetch` callback so
 * callers can trigger a manual refresh (e.g. a "Refresh status" button).
 *
 * Extracts data-fetching logic out of pages so pages remain thin UI shells.
 */
export function usePublicBooking(reference: string | undefined): UsePublicBookingResult {
  const [booking, setBooking] = useState<PublicBooking | null>(null)
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
        const data = await getBookingByReference(reference as string)
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
