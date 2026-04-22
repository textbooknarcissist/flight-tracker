import { Link, Navigate, Outlet, Route, Routes } from 'react-router-dom'

import { ProtectedRoute } from './components/ProtectedRoute'
import { useTheme } from './hooks/useTheme'
import { AdminBookingPage } from './pages/AdminBookingPage'
import { AdminDashboardPage } from './pages/AdminDashboardPage'
import { AdminLoginPage } from './pages/AdminLoginPage'
import { BoardingPassPage } from './pages/BoardingPassPage'
import { BookingPage } from './pages/BookingPage'
import { TrackPage } from './pages/TrackPage'

function AppLayout() {
  const { theme, toggleTheme } = useTheme()

  return (
    <div className="app-shell">
      <header className="topbar">
        <Link to="/" className="brand-mark">
          Altitude Atlas
        </Link>

        <nav className="nav-links">
          <Link to="/">Book</Link>
          <Link to="/track">Track</Link>
          <Link to="/admin">Admin</Link>
          <button type="button" className="ghost-button" onClick={toggleTheme}>
            {theme === 'dark' ? 'Light mode' : 'Dark mode'}
          </button>
        </nav>
      </header>

      <main className="content-shell">
        <Outlet />
      </main>
    </div>
  )
}

function NotFoundPage() {
  return (
    <section className="card empty-state">
      <h2>Route not found</h2>
      <p>The page you requested does not exist in this flight tracker.</p>
      <Link to="/" className="primary-button">
        Return home
      </Link>
    </section>
  )
}

export default function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route path="/" element={<BookingPage />} />
        <Route path="/boarding/:ref" element={<BoardingPassPage />} />
        <Route path="/track" element={<TrackPage />} />
        <Route path="/admin/login" element={<AdminLoginPage />} />
        <Route element={<ProtectedRoute />}>
          <Route path="/admin" element={<AdminDashboardPage />} />
          <Route path="/admin/booking/:ref" element={<AdminBookingPage />} />
        </Route>
        <Route path="/404" element={<NotFoundPage />} />
        <Route path="*" element={<Navigate to="/404" replace />} />
      </Route>
    </Routes>
  )
}
