const TOKEN_KEY   = 'appToken'
const PROFILE_KEY = 'appProfile'
const REMEMBER_ME_KEY = 'appRememberMe'

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

export function setSession({ token, profile, rememberMe }) {
  const local   = safeStorage('local')
  const session = safeStorage('session')
  if (!local || !session) return

  local.removeItem(TOKEN_KEY);   local.removeItem(PROFILE_KEY)
  session.removeItem(TOKEN_KEY); session.removeItem(PROFILE_KEY)

  const target = rememberMe ? local : session
  target.setItem(TOKEN_KEY, token)
  target.setItem(PROFILE_KEY, JSON.stringify(profile || {}))
  setRememberPreference(rememberMe)
}

export function getToken()   { return readFromStorage(TOKEN_KEY) }

export function getProfile() {
  const raw = readFromStorage(PROFILE_KEY)
  if (!raw) return {}
  try { return JSON.parse(raw) } catch { return {} }
}

export function clearSession() {
  safeStorage('local')?.removeItem(TOKEN_KEY)
  safeStorage('local')?.removeItem(PROFILE_KEY)
  safeStorage('session')?.removeItem(TOKEN_KEY)
  safeStorage('session')?.removeItem(PROFILE_KEY)
}

export function isTokenValid() {
  const token = getToken()
  if (!token) return false
  const payload = decodeJwtPayload(token)
  if (!payload?.exp) return false
  return Date.now() < payload.exp * 1000
}

export function getUserGroups() {
  const payload = decodeJwtPayload(getToken() ?? '')
  if (!payload) return []
  const groups = payload['group']
  if (!groups) return []
  return Array.isArray(groups) ? groups : [groups]
}

export function isUserInGroup(groupName) {
  return getUserGroups().some((g) => String(g).trim() === groupName)
}
