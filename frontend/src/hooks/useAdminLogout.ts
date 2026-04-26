import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { logoutAdmin } from '../services/admin'
import { useAuthStore } from '../store/authStore'

interface UseAdminLogoutResult {
  error: string | null
  isSubmitting: boolean
  logout: () => Promise<void>
}

export function useAdminLogout(): UseAdminLogoutResult {
  const navigate = useNavigate()
  const clearAuth = useAuthStore((state) => state.logout)
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function logout() {
    setIsSubmitting(true)

    try {
      await logoutAdmin()
      setError(null)
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Unable to log out.')
    } finally {
      clearAuth()
      setIsSubmitting(false)
      navigate('/admin/login', { replace: true })
    }
  }

  return { error, isSubmitting, logout }
}
