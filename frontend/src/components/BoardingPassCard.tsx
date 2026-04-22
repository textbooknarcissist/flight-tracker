import { QRCodeSVG } from 'qrcode.react'

import type { PublicBooking } from '../types/api'
import { BookingStatusCard } from './BookingStatusCard'

interface BoardingPassCardProps {
  booking: PublicBooking
}

export function BoardingPassCard({ booking }: BoardingPassCardProps) {
  return (
    <BookingStatusCard
      booking={booking}
      eyebrow="Boarding Pass"
      title="Ready for departure"
      footer={
        <div className="boarding-pass-extra">
          <div className="qr-panel">
            <QRCodeSVG value={booking.bookingReference} size={144} includeMargin />
          </div>
          <button type="button" className="secondary-button" disabled>
            Send via Email
          </button>
        </div>
      }
    />
  )
}
