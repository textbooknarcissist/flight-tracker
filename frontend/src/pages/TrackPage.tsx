import type { FormEvent } from 'react'
import { useState } from 'react'

import { BookingStatusCard } from '../components/BookingStatusCard'
import { usePublicBooking } from '../hooks/usePublicBooking'
import { normalizeBookingReference } from '../utils/formatters'

export function TrackPage() {
  const [inputValue, setInputValue] = useState('')
  const [searchedReference, setSearchedReference] = useState<string | undefined>(undefined)
  
  const { booking, error, isLoading, refetch } = usePublicBooking(searchedReference)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const normalized = normalizeBookingReference(inputValue)
    
    if (!normalized) {
      return
    }
    
    setSearchedReference(normalized)
    setInputValue(normalized)
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
            value={inputValue}
            onChange={(event) => setInputValue(event.target.value.toUpperCase())}
            placeholder="FL-ABC123"
          />
          <button type="submit" className="primary-button" disabled={isLoading && !!searchedReference}>
            {isLoading && !!searchedReference ? 'Checking...' : 'Track booking'}
          </button>
        </form>

        {error && searchedReference ? <p className="form-error">{error}</p> : null}
      </section>

      {booking ? (
        <div className="stack">
          <div className="actions-row" style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button 
              type="button" 
              className="ghost-button" 
              onClick={refetch} 
              disabled={isLoading}
            >
              {isLoading ? 'Refreshing...' : 'Refresh status'}
            </button>
          </div>
          <BookingStatusCard booking={booking} />
        </div>
      ) : null}
    </div>
  )
}
