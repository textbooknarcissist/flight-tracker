import { create } from 'zustand'

interface AuthState {
  username: string | null
  isAuthenticated: boolean
  /** True while the app is checking the /me endpoint on page load */
  isRehydrating: boolean
  setAuth: (username: string) => void
  logout: () => void
  setRehydrated: (authenticated: boolean, username?: string) => void
}

/**
 * Auth state lives in memory only — no localStorage persistence.
 * The JWT is stored in an HttpOnly cookie by the server; the browser sends
 * it automatically on every request. On page refresh, ProtectedRoute calls
 * GET /api/admin/me to rehydrate this store from the live cookie.
 */
export const useAuthStore = create<AuthState>()((set) => ({
  username: null,
  isAuthenticated: false,
  isRehydrating: true, // assume rehydration is pending until /me responds
  setAuth: (username) =>
    set({
      username,
      isAuthenticated: true,
      isRehydrating: false,
    }),
  logout: () =>
    set({
      username: null,
      isAuthenticated: false,
      isRehydrating: false,
    }),
  setRehydrated: (authenticated, username) =>
    set({
      username: username ?? null,
      isAuthenticated: authenticated,
      isRehydrating: false,
    }),
}))
