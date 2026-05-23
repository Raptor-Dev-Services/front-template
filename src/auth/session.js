const TOKEN_KEY         = 'appToken'
const REFRESH_TOKEN_KEY = 'appRefreshToken'
const REMEMBER_ME_KEY   = 'appRememberMe'

function safeStorage(type) {
  if (typeof window === 'undefined') return null
  return type === 'session' ? window.sessionStorage : window.localStorage
}

function readFromStorage(key) {
  const sessionValue = safeStorage('session')?.getItem(key)
  if (sessionValue) return sessionValue
  return safeStorage('local')?.getItem(key) || ''
}

function decodeJwtPayload(token) {
  try {
    const payload = token.split('.')[1]
    if (!payload) return null
    const normalized = payload.replace(/-/g, '+').replace(/_/g, '/')
    const padded = normalized + '='.repeat((4 - (normalized.length % 4)) % 4)
    return JSON.parse(atob(padded))
  } catch {
    return null
  }
}

export function getRememberPreference() {
  return safeStorage('local')?.getItem(REMEMBER_ME_KEY) === 'true'
}

export function setRememberPreference(value) {
  safeStorage('local')?.setItem(REMEMBER_ME_KEY, value ? 'true' : 'false')
}

export function setSession({ token, refreshToken, rememberMe }) {
  const local   = safeStorage('local')
  const session = safeStorage('session')
  if (!local || !session) return

  ;[TOKEN_KEY, REFRESH_TOKEN_KEY].forEach((k) => {
    local.removeItem(k)
    session.removeItem(k)
  })

  const target = rememberMe ? local : session
  target.setItem(TOKEN_KEY, token)
  if (refreshToken) target.setItem(REFRESH_TOKEN_KEY, refreshToken)
  setRememberPreference(rememberMe)
}

export function getToken()        { return readFromStorage(TOKEN_KEY) }
export function getRefreshToken() { return readFromStorage(REFRESH_TOKEN_KEY) }

// Returns the decoded JWT payload as { sub, email, role, tenantId }.
// Claims come from back-template: sub (PublicId GUID), email, role, tenant_id.
export function getProfile() {
  const payload = decodeJwtPayload(getToken() ?? '')
  if (!payload) return {}
  return {
    sub:      payload.sub      ?? '',
    email:    payload.email    ?? '',
    role:     payload.role     ?? '',
    tenantId: payload.tenant_id ? Number(payload.tenant_id) : null,
  }
}

export function clearSession() {
  ;[TOKEN_KEY, REFRESH_TOKEN_KEY].forEach((k) => {
    safeStorage('local')?.removeItem(k)
    safeStorage('session')?.removeItem(k)
  })
}

export function isTokenValid() {
  const token = getToken()
  if (!token) return false
  const payload = decodeJwtPayload(token)
  if (!payload?.exp) return false
  return Date.now() < payload.exp * 1000
}

export function getUserRole() {
  return getProfile().role || ''
}

export function hasRole(roleName) {
  return getUserRole() === roleName
}

export function getCurrentTenantId() {
  return getProfile().tenantId ?? null
}
