import { useCallback, useEffect, useRef, useState } from 'react'

import { getAdminBookings } from '../services/admin'
import type { AdminBooking, PaginatedBookings } from '../types/api'

interface UseAdminBookingsResult {
  bookings: AdminBooking[]
  total: number
  page: number
  pageSize: number
  error: string | null
  isLoading: boolean
  setPage: (page: number) => void
  refetch: () => void
}

/**
 * Fetches the paginated admin bookings list.
 *
 * Features:
 *   - Pagination via `setPage`
 *   - Manual `refetch()` for the Refresh button
 *   - Window-focus refetch: data is refreshed when the admin returns to
 *     the tab after updating a booking on the detail page
 */
export function useAdminBookings(pageSize = 50): UseAdminBookingsResult {
  const [page, setPage] = useState(1)
  const [result, setResult] = useState<PaginatedBookings>({
    bookings: [],
    total: 0,
    page: 1,
    pageSize,
  })
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [tick, setTick] = useState(0)

  const load = useCallback(async () => {
    setIsLoading(true)

    try {
      const data = await getAdminBookings(page, pageSize)
      setResult(data)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to load bookings.')
    } finally {
      setIsLoading(false)
    }
  }, [page, pageSize, tick]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    void load()
  }, [load])

  // Refetch when the window regains focus (admin may have updated a booking
  // on the detail page in another tab or after navigating back).
  const loadRef = useRef(load)
  loadRef.current = load

  useEffect(() => {
    function handleFocus() {
      void loadRef.current()
    }

    window.addEventListener('focus', handleFocus)
    return () => window.removeEventListener('focus', handleFocus)
  }, [])

  return {
    bookings: result.bookings,
    total: result.total,
    page: result.page,
    pageSize: result.pageSize,
    error,
    isLoading,
    setPage,
    refetch: () => setTick((n) => n + 1),
  }
}
