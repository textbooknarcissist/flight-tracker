import { Link, useParams } from 'react-router-dom'

import { BoardingPassCard } from '../components/BoardingPassCard'
import { usePublicBooking } from '../hooks/usePublicBooking'

export function BoardingPassPage() {
  const { ref } = useParams()
  const { booking, error, isLoading } = usePublicBooking(ref)

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
