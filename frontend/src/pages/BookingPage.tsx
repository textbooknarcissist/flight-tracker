import { useNavigate } from 'react-router-dom'

import { BookingForm } from '../components/BookingForm'
import { useCreateBooking } from '../hooks/useCreateBooking'
import type { CreateBookingRequest } from '../types/api'

export function BookingPage() {
  const navigate = useNavigate()
  const { create } = useCreateBooking()

  async function handleCreateBooking(payload: CreateBookingRequest) {
    const booking = await create(payload)
    navigate(`/boarding/${booking.bookingReference}`)
  }

  return (
    <div className="page-grid">
      <section className="hero-panel">
        <p className="eyebrow">Flight Tracker</p>
        <h1>Book, board, and monitor your trip without calling the desk.</h1>
        <p>
          Create a booking, pull up your boarding pass, and keep tabs on changes from a single
          streamlined flow.
        </p>
      </section>

      <BookingForm onSubmit={handleCreateBooking} />
    </div>
  )
}
