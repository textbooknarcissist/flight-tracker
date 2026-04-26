import type { ReactNode } from 'react'

import type { PublicBooking } from '../types/api'
import { displayGate, formatDate, getStatusTone } from '../utils/formatters'

interface BookingStatusCardProps {
  booking: PublicBooking
  eyebrow?: string
  title?: string
  footer?: ReactNode
}

export function BookingStatusCard({
  booking,
  eyebrow = 'Flight Status',
  title = 'Trip details',
  footer,
}: BookingStatusCardProps) {
  return (
    <section className="card booking-card">
      <div className="card-header">
        <div>
          <p className="eyebrow">{eyebrow}</p>
          <h2>{title}</h2>
        </div>
        <span className={`status-badge ${getStatusTone(booking.status)}`}>{booking.status}</span>
      </div>

      <div className="booking-grid">
        <div>
          <span className="label">Passenger</span>
          <strong>{booking.firstName}</strong>
        </div>
        <div>
          <span className="label">Reference</span>
          <strong>{booking.bookingReference}</strong>
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
        <div>
          <span className="label">Gate</span>
          <strong>{displayGate(booking.gate)}</strong>
        </div>
      </div>

      {booking.delayMinutes > 0 ? (
        <p className="delay-note">Delay update: {booking.delayMinutes} minute(s).</p>
      ) : null}

      {footer}
    </section>
  )
}
