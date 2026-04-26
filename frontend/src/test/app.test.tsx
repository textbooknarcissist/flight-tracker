import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { vi } from 'vitest'

import App from '../App'
import * as adminService from '../services/admin'
import * as bookingService from '../services/bookings'
import { useAuthStore } from '../store/authStore'
import type { AdminBooking, PublicBooking } from '../types/api'

vi.mock('../services/bookings', async () => {
  const actual = await vi.importActual<typeof import('../services/bookings')>('../services/bookings')
  return {
    ...actual,
    createBooking: vi.fn(),
    getBookingByReference: vi.fn(),
  }
})

vi.mock('../services/admin', async () => {
  const actual = await vi.importActual<typeof import('../services/admin')>('../services/admin')
  return {
    ...actual,
    loginAdmin: vi.fn(),
    logoutAdmin: vi.fn(),
    getAdminMe: vi.fn(),
    getAdminBookings: vi.fn(),
    getAdminBookingByReference: vi.fn(),
    updateAdminBookingStatus: vi.fn(),
  }
})

const mockedCreateBooking = vi.mocked(bookingService.createBooking)
const mockedGetBookingByReference = vi.mocked(bookingService.getBookingByReference)
const mockedGetAdminMe = vi.mocked(adminService.getAdminMe)
const mockedGetAdminBookings = vi.mocked(adminService.getAdminBookings)
const mockedGetAdminBookingByReference = vi.mocked(adminService.getAdminBookingByReference)
const mockedUpdateAdminBookingStatus = vi.mocked(adminService.updateAdminBookingStatus)
const mockedLogoutAdmin = vi.mocked(adminService.logoutAdmin)

const publicBooking: PublicBooking = {
  firstName: 'Ada',
  bookingReference: 'FL-ABC123',
  departureAirport: 'LOS',
  arrivalAirport: 'ABV',
  departureDate: '2030-05-01T10:30:00.000Z',
  status: 'Scheduled',
  seat: '12A',
  gate: null,
  delayMinutes: 0,
}

const adminBooking: AdminBooking = {
  ...publicBooking,
  id: 'booking-1',
  lastName: 'Okafor',
  email: 'ada@example.com',
  phone: '+2348000000000',
  departureDate: publicBooking.departureDate,
  createdAt: publicBooking.departureDate,
  updatedAt: publicBooking.departureDate,
  updatedByAdminAt: null,
}

function renderApp(initialEntry = '/') {
  return render(
    <MemoryRouter initialEntries={[initialEntry]}>
      <App />
    </MemoryRouter>,
  )
}

describe('frontend app', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockedGetAdminMe.mockRejectedValue(new Error('Unauthorized'))
    mockedLogoutAdmin.mockResolvedValue(undefined)
  })

  it('shows booking form validation errors before submit', async () => {
    const user = userEvent.setup()
    renderApp('/')

    await user.click(screen.getByRole('button', { name: /create booking/i }))

    expect(screen.getByText(/enter a valid first name/i)).toBeInTheDocument()
    expect(screen.getByText(/enter a valid last name/i)).toBeInTheDocument()
    expect(screen.getByText(/select a departure date/i)).toBeInTheDocument()
  })

  it('creates a booking and navigates to the boarding pass page', async () => {
    const user = userEvent.setup()
    mockedCreateBooking.mockResolvedValue(publicBooking)
    mockedGetBookingByReference.mockResolvedValue(publicBooking)

    renderApp('/')

    await user.type(screen.getByLabelText(/first name/i), 'Ada')
    await user.type(screen.getByLabelText(/last name/i), 'Okafor')
    await user.type(screen.getByLabelText(/email/i), 'ada@example.com')
    await user.type(screen.getByLabelText(/phone/i), '+2348000000000')
    await user.type(screen.getByLabelText(/departure airport/i), 'LOS')
    await user.type(screen.getByLabelText(/arrival airport/i), 'ABV')
    await user.type(screen.getByLabelText(/departure date/i), '2030-05-01T10:30')
    await user.click(screen.getByRole('button', { name: /create booking/i }))

    expect(await screen.findByText(/ready for departure/i)).toBeInTheDocument()
    expect(await screen.findByText(/FL-ABC123/)).toBeInTheDocument()
  })

  it('shows API errors on the track page', async () => {
    const user = userEvent.setup()
    mockedGetBookingByReference.mockRejectedValue(new Error('Booking not found.'))

    renderApp('/track')

    await user.type(screen.getByPlaceholderText(/fl-abc123/i), 'FL-MISS1')
    await user.click(screen.getByRole('button', { name: /track booking/i }))

    expect(await screen.findByText(/booking not found/i)).toBeInTheDocument()
  })

  it('redirects unauthenticated users to the admin login page', async () => {
    renderApp('/admin')

    expect(await screen.findByText(/control live flight updates/i)).toBeInTheDocument()
  })

  it('updates a booking from the admin detail page', async () => {
    const user = userEvent.setup()
    useAuthStore.setState({
      username: 'ops-admin',
      isAuthenticated: true,
      isRehydrating: false,
    })

    mockedGetAdminBookingByReference.mockResolvedValue(adminBooking)
    mockedUpdateAdminBookingStatus.mockResolvedValue({
      ...adminBooking,
      status: 'Delayed',
      gate: 'B2',
      delayMinutes: 25,
    })

    renderApp('/admin/booking/FL-ABC123')

    expect(await screen.findByText(/publish operational updates/i)).toBeInTheDocument()

    await user.selectOptions(screen.getByLabelText(/status/i), 'Delayed')
    await user.clear(screen.getByLabelText(/gate/i))
    await user.type(screen.getByLabelText(/gate/i), 'B2')
    await user.clear(screen.getByLabelText(/delay minutes/i))
    await user.type(screen.getByLabelText(/delay minutes/i), '25')
    await user.click(screen.getByRole('button', { name: /save update/i }))

    await waitFor(() => {
      expect(mockedUpdateAdminBookingStatus).toHaveBeenCalledWith('FL-ABC123', {
        status: 'Delayed',
        gate: 'B2',
        delayMinutes: 25,
      })
    })

    expect(await screen.findByText(/booking updated successfully/i)).toBeInTheDocument()
  })

  it('clears stale booking data after a failed track lookup', async () => {
    const user = userEvent.setup()
    mockedGetBookingByReference
      .mockResolvedValueOnce(publicBooking)
      .mockRejectedValueOnce(new Error('Booking not found.'))

    renderApp('/track')

    await user.type(screen.getByPlaceholderText(/fl-abc123/i), 'FL-ABC123')
    await user.click(screen.getByRole('button', { name: /track booking/i }))

    expect(await screen.findByText(/trip details/i)).toBeInTheDocument()

    await user.clear(screen.getByPlaceholderText(/fl-abc123/i))
    await user.type(screen.getByPlaceholderText(/fl-abc123/i), 'FL-MISS1')
    await user.click(screen.getByRole('button', { name: /track booking/i }))

    expect(await screen.findByText(/booking not found/i)).toBeInTheDocument()
    expect(screen.queryByText(/trip details/i)).not.toBeInTheDocument()
  })

  it('logs out from the admin dashboard through the API', async () => {
    const user = userEvent.setup()
    useAuthStore.setState({
      username: 'ops-admin',
      isAuthenticated: true,
      isRehydrating: false,
    })
    mockedGetAdminBookings.mockResolvedValue({
      bookings: [adminBooking],
      total: 1,
      page: 1,
      pageSize: 50,
    })

    renderApp('/admin')

    expect(await screen.findByText(/welcome back, ops-admin/i)).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /log out/i }))

    await waitFor(() => {
      expect(mockedLogoutAdmin).toHaveBeenCalledTimes(1)
    })
    expect(await screen.findByText(/control live flight updates/i)).toBeInTheDocument()
    expect(useAuthStore.getState().isAuthenticated).toBe(false)
  })
})
