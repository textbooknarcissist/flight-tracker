import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'

import { BoardingPassCard } from '../components/BoardingPassCard'
import { getBookingByReference } from '../services/bookings'
import type { PublicBooking } from '../types/api'

export function BoardingPassPage() {
  const { ref } = useParams()
  const [booking, setBooking] = useState<PublicBooking | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const bookingReference = ref

    if (!bookingReference) {
      setError('Missing booking reference.')
      setIsLoading(false)
      return
    }

    const safeBookingReference: string = bookingReference

    async function loadBooking() {
      setIsLoading(true)

      try {
        const nextBooking = await getBookingByReference(safeBookingReference)
        setBooking(nextBooking)
        setError(null)
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : 'Unable to load booking.')
      } finally {
        setIsLoading(false)
      }
    }

    void loadBooking()
  }, [ref])

  if (isLoading) {
    return <section className="card loading-card">Loading boarding pass...</section>
  }

  if (error || !booking) {
    return (
      <section className="card empty-state">
        <h2>Boarding pass unavailable</h2>
        <p>{error ?? 'Booking not found.'}</p>
        <Link to="/track" className="primary-button">
          Track another booking
        </Link>
      </section>
    )
  }

  return <BoardingPassCard booking={booking} />
}
