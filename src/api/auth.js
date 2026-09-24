// auth.js - servicio de autenticacion (modulo Authentication del back-template).
// Usa el cliente central + resolveApiEnvelope; persiste tokens via auth/session.js.

import { http, resolveApiEnvelope, performTokenRefresh } from './client.js'
import { setTokens, getRefreshToken, clearSession } from '../auth/session.js'

/**
 * Primer paso del login. POST /api/v1/auth/login  body: { email, password }
 *
 * Sin segundo factor el backend devuelve la sesion: se guardan los tokens (localStorage o sessionStorage
 * segun `rememberMe`) y se devuelve `{ twoFactorRequired: false }`.
 *
 * Con segundo factor NO hay tokens todavia: devuelve `{ twoFactorRequired: true, challengeToken }`, un
 * reto efimero que se canjea con el codigo en `completeTwoFactorLogin`. No se guarda nada: una sesion
 * sin tokens rebotaria al login en la primera peticion.
 */
export async function login({ email, password, rememberMe = false }) {
  const res = await http.post('/api/v1/auth/login', { email, password })
  const data = resolveApiEnvelope(res)
  if (data?.twoFactorRequired ?? data?.TwoFactorRequired) {
    return { twoFactorRequired: true, challengeToken: data.challengeToken ?? data.ChallengeToken }
  }
  setTokens({ accessToken: data?.accessToken, refreshToken: data?.refreshToken, rememberMe })
  return { twoFactorRequired: false }
}

/**
 * Segundo paso: canjea el reto del primer paso y un codigo (el de la app autenticadora o uno de
 * recuperacion) por la sesion. POST /api/v1/auth/login/2fa  body: { challengeToken, code }
 * Cuelga de /auth/, asi que un 401 aqui (codigo malo o reto vencido) no dispara el refresh.
 */
export async function completeTwoFactorLogin({ challengeToken, code, rememberMe = false }) {
  const res = await http.post('/api/v1/auth/login/2fa', { challengeToken, code })
  const data = resolveApiEnvelope(res)
  setTokens({ accessToken: data?.accessToken, refreshToken: data?.refreshToken, rememberMe })
  return data
}

/** Renueva la sesion (rota el refresh en el backend). Delega en el flujo central deduplicado. */
export function refresh() {
  return performTokenRefresh()
}

/**
 * Cierra sesion: revoca el refresh en el backend (POST /api/v1/auth/logout) y limpia el estado local.
 * Un fallo de red al cerrar NO impide limpiar: quedarse "medio logueado" es peor que un refresh token
 * huerfano que expira solo.
 */
export async function logout() {
  const refreshToken = getRefreshToken()
  try {
    if (refreshToken) {
      await http.post('/api/v1/auth/logout', { refreshToken }, { _skipAuthRefresh: true })
    }
  } catch {
    // Ignorado a proposito: el estado local se limpia igual.
  } finally {
    clearSession()
  }
}

export default { login, completeTwoFactorLogin, refresh, logout }
