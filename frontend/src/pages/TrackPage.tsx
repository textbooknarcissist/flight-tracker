import type { FormEvent } from 'react'
import { useState } from 'react'

import { BookingStatusCard } from '../components/BookingStatusCard'
import { getBookingByReference } from '../services/bookings'
import type { PublicBooking } from '../types/api'
import { normalizeBookingReference } from '../utils/formatters'

export function TrackPage() {
  const [reference, setReference] = useState('')
  const [booking, setBooking] = useState<PublicBooking | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const normalizedReference = normalizeBookingReference(reference)

    if (!normalizedReference) {
      setError('Enter a booking reference first.')
      setBooking(null)
      return
    }

    setIsLoading(true)

    try {
      const nextBooking = await getBookingByReference(normalizedReference)
      setBooking(nextBooking)
      setError(null)
      setReference(normalizedReference)
    } catch (lookupError) {
      setBooking(null)
      setError(lookupError instanceof Error ? lookupError.message : 'Unable to track booking.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="stack">
      <section className="card search-card">
        <div className="card-header">
          <div>
            <p className="eyebrow">Track a flight</p>
            <h2>Look up the latest trip status</h2>
          </div>
          <span className="status-badge scheduled">Public access</span>
        </div>

        <form className="inline-form" onSubmit={handleSubmit}>
          <input
            value={reference}
            onChange={(event) => setReference(event.target.value.toUpperCase())}
            placeholder="FL-ABC123"
          />
          <button type="submit" className="primary-button" disabled={isLoading}>
            {isLoading ? 'Checking...' : 'Track booking'}
          </button>
        </form>

        {error ? <p className="form-error">{error}</p> : null}
      </section>

      {booking ? <BookingStatusCard booking={booking} /> : null}
    </div>
  )
}
