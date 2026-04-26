import type { FormEvent } from 'react'
import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

import { useAdminLogin } from '../hooks/useAdminLogin'
import { useAuthStore } from '../store/authStore'

export function AdminLoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const { login, error, isSubmitting } = useAdminLogin()

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/admin', { replace: true })
    }
  }, [isAuthenticated, navigate])

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    try {
      await login(username.trim(), password)
      navigate(location.state?.from ?? '/admin', { replace: true })
    } catch {}
  }

  return (
    <section className="card auth-card">
      <div className="card-header">
        <div>
          <p className="eyebrow">Admin access</p>
          <h2>Control live flight updates</h2>
        </div>
        <span className="status-badge delayed">Protected</span>
      </div>

      <form className="stack" onSubmit={handleSubmit}>
        <label>
          <span>Username</span>
          <input value={username} onChange={(event) => setUsername(event.target.value)} />
        </label>
        <label>
          <span>Password</span>
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
        </label>
        {error ? <p className="form-error">{error}</p> : null}
        <button type="submit" className="primary-button" disabled={isSubmitting}>
          {isSubmitting ? 'Signing in...' : 'Sign in'}
        </button>
      </form>
    </section>
  )
}
