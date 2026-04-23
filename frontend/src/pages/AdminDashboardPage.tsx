import { useDeferredValue, useState } from 'react'

import { AdminBookingTable } from '../components/AdminBookingTable'
import { useAdminBookings } from '../hooks/useAdminBookings'
import { useAuthStore } from '../store/authStore'

export function AdminDashboardPage() {
  const username = useAuthStore((state) => state.username)
  const logoutStore = useAuthStore((state) => state.logout)
  
  const [searchTerm, setSearchTerm] = useState('')
  const deferredSearchTerm = useDeferredValue(searchTerm)
  
  const { 
    bookings, 
    total, 
    page, 
    pageSize, 
    error, 
    isLoading, 
    setPage, 
    refetch 
  } = useAdminBookings(50)

  const handleLogout = () => {
    logoutStore()
    // The 401 interceptor or ProtectedRoute will handle the actual redirect
  }

  const normalizedTerm = deferredSearchTerm.trim().toLowerCase()
  
  // Note: For a high-traffic app, search should be server-side.
  // Given the low-traffic context (<100 users/mo), we fetch a generous page
  // size and filter client-side for simplicity.
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

  const totalPages = Math.ceil(total / pageSize)

  return (
    <div className="stack">
      <section className="card admin-overview">
        <div className="card-header">
          <div>
            <p className="eyebrow">Operations</p>
            <h2>Welcome back, {username ?? 'admin'}</h2>
          </div>
          <div className="actions-row">
            <button type="button" className="ghost-button" onClick={refetch} disabled={isLoading}>
              {isLoading ? 'Refreshing...' : 'Refresh'}
            </button>
            <button type="button" className="ghost-button" onClick={handleLogout}>
              Log out
            </button>
          </div>
        </div>

        <div className="inline-form">
          <input
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="Search on this page (reference, name, route, status)"
          />
        </div>
      </section>

      {error ? <section className="card empty-state">{error}</section> : null}
      
      {isLoading && bookings.length === 0 ? (
        <section className="card loading-card">Loading bookings...</section>
      ) : (
        <>
          <AdminBookingTable bookings={visibleBookings} />
          
          {totalPages > 1 ? (
            <div className="pagination-controls card" style={{ display: 'flex', gap: '1rem', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
              <button 
                className="secondary-button" 
                disabled={page <= 1 || isLoading} 
                onClick={() => setPage(page - 1)}
              >
                Previous
              </button>
              <span>Page {page} of {totalPages} ({total} total)</span>
              <button 
                className="secondary-button" 
                disabled={page >= totalPages || isLoading} 
                onClick={() => setPage(page + 1)}
              >
                Next
              </button>
            </div>
          ) : null}
        </>
      )}
    </div>
  )
}
