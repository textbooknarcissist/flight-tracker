import type { FormEvent } from 'react'
import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'

import {
  BOOKING_STATUS_OPTIONS,
  getAdminBookingByReference,
  updateAdminBookingStatus,
} from '../services/admin'
import type { AdminBooking, BookingStatusLabel } from '../types/api'
import { formatDate } from '../utils/formatters'

interface UpdateFormState {
  status: BookingStatusLabel
  gate: string
  delayMinutes: string
}

export function AdminBookingPage() {
  const { ref } = useParams()
  const [booking, setBooking] = useState<AdminBooking | null>(null)
  const [formState, setFormState] = useState<UpdateFormState>({
    status: 'Scheduled',
    gate: '',
    delayMinutes: '0',
  })
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

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
        const nextBooking = await getAdminBookingByReference(safeBookingReference)
        setBooking(nextBooking)
        setFormState({
          status: nextBooking.status,
          gate: nextBooking.gate ?? '',
          delayMinutes: String(nextBooking.delayMinutes),
        })
        setError(null)
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : 'Unable to load booking.')
      } finally {
        setIsLoading(false)
      }
    }

    void loadBooking()
  }, [ref])

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const bookingReference = ref

    if (!bookingReference) {
      return
    }

    setIsSaving(true)

    try {
      const updatedBooking = await updateAdminBookingStatus(bookingReference, {
        status: formState.status,
        gate: formState.gate.trim() ? formState.gate.trim().toUpperCase() : null,
        delayMinutes: Number(formState.delayMinutes),
      })

      setBooking(updatedBooking)
      setFormState({
        status: updatedBooking.status,
        gate: updatedBooking.gate ?? '',
        delayMinutes: String(updatedBooking.delayMinutes),
      })
      setMessage('Booking updated successfully.')
      setError(null)
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Unable to update booking.')
      setMessage(null)
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return <section className="card loading-card">Loading booking...</section>
  }

  if (error && !booking) {
    return (
      <section className="card empty-state">
        <h2>Booking unavailable</h2>
        <p>{error}</p>
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
        {error ? <p className="form-error">{error}</p> : null}

        <button type="submit" className="primary-button" disabled={isSaving}>
          {isSaving ? 'Saving update...' : 'Save update'}
        </button>
      </form>
    </div>
  )
}
