// auth.js - servicio de autenticacion (modulo Authentication del back-template).
// Usa el cliente central + resolveApiEnvelope; persiste tokens via auth/session.js.

import { http, resolveApiEnvelope, performTokenRefresh } from './client.js'
import { setTokens, getRefreshToken, clearSession } from '../auth/session.js'

/**
 * Inicia sesion. POST /api/auth/login  body: { email, password }
 * Respuesta: { accessToken, refreshToken, expiresAtUtc }. Guarda los tokens en localStorage o
 * sessionStorage segun `rememberMe` y devuelve el payload.
 */
export async function login({ email, password, rememberMe = false }) {
  const res = await http.post('/api/auth/login', { email, password })
  const data = resolveApiEnvelope(res)
  setTokens({ accessToken: data?.accessToken, refreshToken: data?.refreshToken, rememberMe })
  return data
}

/** Renueva la sesion (rota el refresh en el backend). Delega en el flujo central deduplicado. */
export function refresh() {
  return performTokenRefresh()
}

/**
 * Cierra sesion: revoca el refresh en el backend (POST /api/auth/logout) y limpia el estado local.
 * Un fallo de red al cerrar NO impide limpiar: quedarse "medio logueado" es peor que un refresh token
 * huerfano que expira solo.
 */
export async function logout() {
  const refreshToken = getRefreshToken()
  try {
    if (refreshToken) {
      // Mismas dos formas del campo que en el refresh (ver performTokenRefresh).
      await http.post('/api/auth/logout', { refreshToken, token: refreshToken }, { _skipAuthRefresh: true })
    }
  } catch {
    // Ignorado a proposito: el estado local se limpia igual.
  } finally {
    clearSession()
  }
}

export default { login, refresh, logout }
