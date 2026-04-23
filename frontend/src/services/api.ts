import axios, { AxiosError } from 'axios'

import { useAuthStore } from '../store/authStore'

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:4000',
  headers: {
    'Content-Type': 'application/json',
  },
  /**
   * withCredentials = true causes the browser to send the HttpOnly auth
   * cookie on every cross-origin request to the backend. Without this flag
   * the cookie is silently omitted, breaking authentication.
   */
  withCredentials: true,
})

/**
 * 401 response interceptor — the sturdiest fix:
 *   - Clears auth state immediately so the UI reflects reality.
 *   - Hard-redirects to /admin/login so the user can re-authenticate.
 *   - Does NOT call logout API here (the server already rejected the token).
 *   - Skips redirect if we are already on the login page to avoid loops.
 */
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (
      error.response?.status === 401 &&
      !window.location.pathname.includes('/admin/login')
    ) {
      useAuthStore.getState().logout()
      window.location.replace('/admin/login')
    }

    return Promise.reject(error)
  },
)
