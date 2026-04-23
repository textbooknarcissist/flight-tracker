import type { FormEvent } from 'react'
import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'

import {
  BOOKING_STATUS_OPTIONS,
  updateAdminBookingStatus,
} from '../services/admin'
import { useAdminBooking } from '../hooks/useAdminBooking'
import type { BookingStatusLabel } from '../types/api'
import { formatDate } from '../utils/formatters'

interface UpdateFormState {
  status: BookingStatusLabel
  gate: string
  delayMinutes: string
}

export function AdminBookingPage() {
  const { ref } = useParams()
  const { booking, error: fetchError, isLoading, refetch } = useAdminBooking(ref)

  const [formState, setFormState] = useState<UpdateFormState>({
    status: 'Scheduled',
    gate: '',
    delayMinutes: '0',
  })
  const [message, setMessage] = useState<string | null>(null)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)

  // Sync form state when booking is loaded (using in-render state update pattern)
  const [lastSyncedRef, setLastSyncedRef] = useState<string | null>(null)
  
  if (booking && booking.bookingReference !== lastSyncedRef) {
    setLastSyncedRef(booking.bookingReference)
    setFormState({
      status: booking.status,
      gate: booking.gate ?? '',
      delayMinutes: String(booking.delayMinutes),
    })
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!ref) {
      return
    }

    setIsSaving(true)

    try {
      await updateAdminBookingStatus(ref, {
        status: formState.status,
        gate: formState.gate.trim() ? formState.gate.trim().toUpperCase() : null,
        delayMinutes: Number(formState.delayMinutes),
      })

      setMessage('Booking updated successfully.')
      setSaveError(null)
      refetch() // Reload booking data to reflect server state
    } catch (submitError) {
      setSaveError(submitError instanceof Error ? submitError.message : 'Unable to update booking.')
      setMessage(null)
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading && !booking) {
    return <section className="card loading-card">Loading booking...</section>
  }

  if (fetchError && !booking) {
    return (
      <section className="card empty-state">
        <h2>Booking unavailable</h2>
        <p>{fetchError}</p>
        <Link to="/admin" className="primary-button">
          Back to dashboard
        </Link>
      </section>
    )
  }

  return (
    <div className="stack">
      <section className="card">
        <div className="card-header">
          <div>
            <p className="eyebrow">Booking control</p>
            <h2>{booking?.bookingReference}</h2>
          </div>
          <Link to="/admin" className="ghost-button">
            Back to dashboard
          </Link>
        </div>

        {booking ? (
          <div className="booking-grid">
            <div>
              <span className="label">Passenger</span>
              <strong>
                {booking.firstName} {booking.lastName}
              </strong>
            </div>
            <div>
              <span className="label">Route</span>
              <strong>
                {booking.departureAirport} to {booking.arrivalAirport}
              </strong>
            </div>
            <div>
              <span className="label">Departure</span>
              <strong>{formatDate(booking.departureDate)}</strong>
            </div>
            <div>
              <span className="label">Seat</span>
              <strong>{booking.seat}</strong>
            </div>
          </div>
        ) : null}
      </section>

      <form className="card stack" onSubmit={handleSubmit}>
        <div className="card-header">
          <div>
            <p className="eyebrow">Status editor</p>
            <h2>Publish operational updates</h2>
          </div>
        </div>

        <label>
          <span>Status</span>
          <select
            value={formState.status}
            onChange={(event) =>
              setFormState((currentValue) => ({
                ...currentValue,
                status: event.target.value as BookingStatusLabel,
              }))
            }
          >
            {BOOKING_STATUS_OPTIONS.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </label>

        <label>
          <span>Gate</span>
          <input
            value={formState.gate}
            onChange={(event) =>
              setFormState((currentValue) => ({
                ...currentValue,
                gate: event.target.value.toUpperCase(),
              }))
            }
            placeholder="A2"
          />
        </label>

        <label>
          <span>Delay minutes</span>
          <input
            type="number"
            min="0"
            max="1440"
            value={formState.delayMinutes}
            onChange={(event) =>
              setFormState((currentValue) => ({
                ...currentValue,
                delayMinutes: event.target.value,
              }))
            }
          />
        </label>

        {message ? <p className="form-success">{message}</p> : null}
        {saveError ? <p className="form-error">{saveError}</p> : null}

        <button type="submit" className="primary-button" disabled={isSaving}>
          {isSaving ? 'Saving update...' : 'Save update'}
        </button>
      </form>
    </div>
  )
}
