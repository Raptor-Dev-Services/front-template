import { useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { login } from '../api/auth'
import { isAuthenticated } from '../auth/session'
import { ui } from '../styles/designSystem'
import { extractApiErrorMessage } from '../api/client'

export default function Login() {
  const navigate  = useNavigate()
  const [email, setEmail]         = useState('')
  const [password, setPassword]   = useState('')
  const [rememberMe, setRememberMe] = useState(false)
  const [loading, setLoading]     = useState(false)
  const [error, setError]         = useState('')

  if (isAuthenticated()) return <Navigate to="/app" replace />

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      await login({ email, password, rememberMe })
      navigate('/app', { replace: true })
    } catch (err) {
      setError(extractApiErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <div className={`${ui.surface.panel} w-full max-w-sm p-8`}>
        <div className="mb-8 text-center">
          <h1 className="text-lg font-black tracking-tight text-slate-900">front-template</h1>
          <p className={`mt-1 ${ui.typography.body}`}>Inicia sesión para continuar</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              placeholder="usuario@empresa.com"
              className={`w-full ${ui.controls.input}`}
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700">Contraseña</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              placeholder="••••••••"
              className={`w-full ${ui.controls.input}`}
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              id="remember-me"
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className={ui.controls.checkbox}
            />
            <label htmlFor="remember-me" className={ui.typography.body}>Recordarme</label>
          </div>

          {error && <div className={ui.feedback.errorBanner}>{error}</div>}

          <button
            type="submit"
            disabled={loading}
            className={`w-full ${ui.controls.primaryButton}`}
          >
            {loading ? 'Iniciando sesión…' : 'Iniciar sesión'}
          </button>
        </form>
      </div>
    </div>
  )
}
