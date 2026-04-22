import type { BookingStatusLabel } from '../types/api'

export function formatDate(dateString: string) {
  return new Intl.DateTimeFormat('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(dateString))
}

export function getStatusTone(status: BookingStatusLabel) {
  switch (status) {
    case 'Landed':
      return 'landed'
    case 'Delayed':
      return 'delayed'
    case 'En Route':
      return 'en-route'
    default:
      return 'scheduled'
  }
}

export function displayGate(gate: string | null) {
  return gate ?? 'TBD'
}

export function normalizeBookingReference(reference: string) {
  return reference.trim().toUpperCase()
}
