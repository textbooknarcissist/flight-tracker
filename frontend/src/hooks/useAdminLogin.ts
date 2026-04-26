import { useState } from 'react'

import { loginAdmin } from '../services/admin'
import { useAuthStore } from '../store/authStore'

interface UseAdminLoginResult {
  login: (username: string, password: string) => Promise<void>
  error: string | null
  isSubmitting: boolean
}

export function useAdminLogin(): UseAdminLoginResult {
  const setAuth = useAuthStore((state) => state.setAuth)
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function login(username: string, password: string) {
    setIsSubmitting(true)

    try {
      const response = await loginAdmin(username, password)
      setAuth(response.admin.username)
      setError(null)
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Unable to log in.')
      throw submitError
    } finally {
      setIsSubmitting(false)
    }
  }

  return { login, error, isSubmitting }
}
