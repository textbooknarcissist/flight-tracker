import { useDeferredValue, useEffect, useState } from 'react'

import { AdminBookingTable } from '../components/AdminBookingTable'
import { getAdminBookings } from '../services/admin'
import { useAuthStore } from '../store/authStore'
import type { AdminBooking } from '../types/api'

export function AdminDashboardPage() {
  const username = useAuthStore((state) => state.username)
  const logout = useAuthStore((state) => state.logout)
  const [bookings, setBookings] = useState<AdminBooking[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const deferredSearchTerm = useDeferredValue(searchTerm)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function loadBookings() {
      setIsLoading(true)

      try {
        const nextBookings = await getAdminBookings()
        setBookings(nextBookings)
        setError(null)
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : 'Unable to load bookings.')
      } finally {
        setIsLoading(false)
      }
    }

    void loadBookings()
  }, [])

  const normalizedTerm = deferredSearchTerm.trim().toLowerCase()
  const visibleBookings = bookings.filter((booking) => {
    if (!normalizedTerm) {
      return true
    }

    return [
      booking.bookingReference,
      booking.firstName,
      booking.lastName,
      booking.departureAirport,
      booking.arrivalAirport,
      booking.status,
    ].some((value) => value.toLowerCase().includes(normalizedTerm))
  })

  return (
    <div className="stack">
      <section className="card admin-overview">
        <div className="card-header">
          <div>
            <p className="eyebrow">Operations</p>
            <h2>Welcome back, {username ?? 'admin'}</h2>
          </div>
          <button type="button" className="ghost-button" onClick={logout}>
            Log out
          </button>
        </div>

        <div className="inline-form">
          <input
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="Search by reference, name, route, or status"
          />
        </div>
      </section>

      {error ? <section className="card empty-state">{error}</section> : null}
      {isLoading ? <section className="card loading-card">Loading bookings...</section> : null}
      {!isLoading && !error ? <AdminBookingTable bookings={visibleBookings} /> : null}
    </div>
  )
}
