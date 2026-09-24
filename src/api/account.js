// account.js - la cuenta del usuario de la sesion (AccountController del back-template). Todo es "lo mio":
// el backend resuelve el usuario desde el token, asi que ninguna llamada manda un id.

import { http, resolveApiEnvelope } from './client.js'

/**
 * GET /api/v1/account/me
 * -> { userId, tenantId, email, roles[], permissions[], lastLoginAtUtc, twoFactorEnabled }
 */
export async function getMyAccount({ signal } = {}) {
  const res = await http.get('/api/v1/account/me', { signal })
  const data = resolveApiEnvelope(res)
  return {
    email: data?.email ?? '',
    roles: data?.roles ?? [],
    lastLoginAtUtc: data?.lastLoginAtUtc ?? null,
    twoFactorEnabled: Boolean(data?.twoFactorEnabled),
  }
}

/**
 * 2FA, paso 1: el backend genera un secreto PENDIENTE (no activa nada todavia).
 * POST /api/v1/account/2fa/setup -> { secret, otpauthUri }
 */
export async function beginTwoFactorSetup() {
  const res = await http.post('/api/v1/account/2fa/setup')
  return resolveApiEnvelope(res)
}

/**
 * 2FA, paso 2: confirma con un codigo de la app y lo activa. Devuelve los codigos de recuperacion EN
 * CLARO, y es la unica vez: en la base solo queda su hash.
 * POST /api/v1/account/2fa/enable  body: { code } -> { codes[] }
 */
export async function enableTwoFactor(code) {
  const res = await http.post('/api/v1/account/2fa/enable', { code })
  const data = resolveApiEnvelope(res)
  return data?.codes ?? []
}

/**
 * Apaga el 2FA. Exige un codigo vigente (de la app o de recuperacion): la sesion sola no basta.
 * POST /api/v1/account/2fa/disable  body: { code }
 */
export async function disableTwoFactor(code) {
  const res = await http.post('/api/v1/account/2fa/disable', { code })
  return resolveApiEnvelope(res)
}

export default { getMyAccount, beginTwoFactorSetup, enableTwoFactor, disableTwoFactor }
