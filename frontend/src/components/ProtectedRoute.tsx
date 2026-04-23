import { useEffect } from 'react'
import { Navigate, Outlet, useLocation } from 'react-router-dom'

import { getAdminMe } from '../services/admin'
import { useAuthStore } from '../store/authStore'

/**
 * Guards admin routes.
 *
 * On first render (or after a page refresh), `isRehydrating` is true and
 * we attempt to validate the HttpOnly cookie via GET /api/admin/me.
 *   - If the cookie is valid  → setRehydrated(true, username), render children.
 *   - If the cookie is absent → setRehydrated(false), redirect to login.
 */
export function ProtectedRoute() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const isRehydrating = useAuthStore((state) => state.isRehydrating)
  const setRehydrated = useAuthStore((state) => state.setRehydrated)
  const location = useLocation()

  useEffect(() => {
    if (isAuthenticated || !isRehydrating) return

    async function rehydrate() {
      try {
        const me = await getAdminMe()
        setRehydrated(true, me.username)
      } catch {
        setRehydrated(false)
      }
    }

    void rehydrate()
  }, [isAuthenticated, isRehydrating, setRehydrated])

  if (isRehydrating) {
    return <section className="card loading-card">Checking session...</section>
  }

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace state={{ from: location.pathname }} />
  }

  return <Outlet />
}
