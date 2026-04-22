import { Link } from 'react-router-dom'

import type { AdminBooking } from '../types/api'
import { displayGate, formatDate, getStatusTone } from '../utils/formatters'

interface AdminBookingTableProps {
  bookings: AdminBooking[]
}

export function AdminBookingTable({ bookings }: AdminBookingTableProps) {
  if (bookings.length === 0) {
    return (
      <section className="card empty-state">
        <h2>No bookings found</h2>
        <p>Try a different search term or create a new booking from the public form.</p>
      </section>
    )
  }

  return (
    <section className="card table-card">
      <div className="card-header">
        <div>
          <p className="eyebrow">Operations board</p>
          <h2>Manage active bookings</h2>
        </div>
        <span className="status-badge en-route">{bookings.length} flights</span>
      </div>

      <div className="table-shell">
        <table>
          <thead>
            <tr>
              <th>Reference</th>
              <th>Passenger</th>
              <th>Route</th>
              <th>Departure</th>
              <th>Status</th>
              <th>Gate</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {bookings.map((booking) => (
              <tr key={booking.id}>
                <td>{booking.bookingReference}</td>
                <td>
                  {booking.firstName} {booking.lastName}
                </td>
                <td>
                  {booking.departureAirport} to {booking.arrivalAirport}
                </td>
                <td>{formatDate(booking.departureDate)}</td>
                <td>
                  <span className={`status-badge ${getStatusTone(booking.status)}`}>{booking.status}</span>
                </td>
                <td>{displayGate(booking.gate)}</td>
                <td>
                  <Link to={`/admin/booking/${booking.bookingReference}`} className="table-link">
                    Manage
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}
