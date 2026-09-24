// session.js - fuente de verdad UNICA de la sesion: access + refresh token y lectura de claims.
//
// "Recordarme": con la casilla marcada los tokens van a localStorage (sobreviven a cerrar el
// navegador); sin ella, a sessionStorage (mueren con la pestana). La preferencia se guarda aparte para
// que el refresh reescriba los tokens nuevos en el MISMO almacenamiento donde estaban.
//
// Todo acceso a storage va en try/catch: en modo privado o con el almacenamiento bloqueado, leerlo
// LANZA, y un error aqui tumbaria la app entera en el primer render.
//
// La decodificacion del JWT es solo para la UI y las guardas (no verifica la firma): la autoridad real
// es el backend en cada request. El tenant lo resuelve el backend desde el JWT; el front nunca lo envia.
import { decodeJwtPayload } from './jwt.js'

// Renombra el prefijo con el de tu producto al usar la plantilla (y los de i18n/locale.js y theme).
const ACCESS_TOKEN_KEY = 'app_access_token'
const REFRESH_TOKEN_KEY = 'app_refresh_token'
const REMEMBER_ME_KEY = 'app_remember_me'
const TOKEN_KEYS = [ACCESS_TOKEN_KEY, REFRESH_TOKEN_KEY]

function storage(kind) {
  try {
    return kind === 'session' ? window.sessionStorage : window.localStorage
  } catch {
    return null
  }
}

function read(kind, key) {
  try {
    return storage(kind)?.getItem(key) ?? null
  } catch {
    return null
  }
}

function write(kind, key, value) {
  try {
    const target = storage(kind)
    if (!target) return
    if (value) target.setItem(key, value)
    else target.removeItem(key)
  } catch {
    // Almacenamiento no disponible: se degrada en silencio (la sesion vive solo en esta carga).
  }
}

/** Lee primero la sesion de la pestana y despues la persistente. */
function readToken(key) {
  return read('session', key) || read('local', key) || null
}

/** Access token (JWT) actual, o null si no hay sesion. */
export function getAccessToken() {
  return readToken(ACCESS_TOKEN_KEY)
}

/** Refresh token actual, o null. */
export function getRefreshToken() {
  return readToken(REFRESH_TOKEN_KEY)
}

/** True si el usuario eligio "recordarme" en el ultimo login. */
export function getRememberPreference() {
  return read('local', REMEMBER_ME_KEY) === 'true'
}

/**
 * Guarda el par de tokens tras login o refresh. `rememberMe` decide el almacenamiento; si no se pasa
 * (refresh) se respeta la preferencia del ultimo login. Borra antes cualquier copia en el otro
 * almacenamiento: dos tokens vivos a la vez es como se acaba enviando uno viejo.
 */
export function setTokens({ accessToken, refreshToken, rememberMe } = {}) {
  const remember = rememberMe ?? getRememberPreference()
  const target = remember ? 'local' : 'session'
  const other = remember ? 'session' : 'local'

  if (accessToken) {
    write(other, ACCESS_TOKEN_KEY, null)
    write(target, ACCESS_TOKEN_KEY, accessToken)
  }
  if (refreshToken) {
    write(other, REFRESH_TOKEN_KEY, null)
    write(target, REFRESH_TOKEN_KEY, refreshToken)
  }
  write('local', REMEMBER_ME_KEY, remember ? 'true' : 'false')
}

/** Limpia toda la sesion (logout / refresh fallido) en los DOS almacenamientos. */
export function clearSession() {
  for (const key of TOKEN_KEYS) {
    write('local', key, null)
    write('session', key, null)
  }
}

// Un claim puede llegar como string unico o como arreglo segun cuantos valores tenga.
function toArray(value) {
  if (value === undefined || value === null || value === '') return []
  return Array.isArray(value) ? value : [value]
}

// ASP.NET escribe el rol como `role` (JwtSecurityTokenHandler mapea ClaimTypes.Role) o, sin ese mapeo,
// con la URI larga del esquema de Microsoft. Se aceptan las dos formas.
const ROLE_CLAIM_URI = 'http://schemas.microsoft.com/ws/2008/06/identity/claims/role'

/**
 * Claims del access token para UI y guardas:
 * { sub, userName, email, tenantId, roles[], permissions[], expiresAt } o null si no hay sesion.
 * `userName` nunca cae al `sub` (un id): sin nombre en el token es null y la UI usa su fallback.
 */
export function getClaims() {
  const token = getAccessToken()
  if (!token) return null
  const payload = decodeJwtPayload(token)
  if (!payload) return null
  return {
    sub: payload.sub ?? null,
    userName: payload.unique_name ?? payload.name ?? payload.email ?? null,
    email: payload.email ?? null,
    tenantId: payload.tenant_id ?? null,
    roles: toArray(payload.roles ?? payload.role ?? payload[ROLE_CLAIM_URI]),
    permissions: toArray(payload.permission ?? payload.permissions),
    expiresAt: typeof payload.exp === 'number' ? payload.exp * 1000 : null,
  }
}

/** True si el access token ya vencio segun el reloj local (sin `exp` se considera vigente). */
export function isAccessTokenExpired(now = Date.now()) {
  const expiresAt = getClaims()?.expiresAt
  return expiresAt != null && now >= expiresAt
}

/**
 * True si hay una sesion utilizable: un access token vigente, o uno vencido CON refresh token (la
 * primera peticion lo renovara en el interceptor). Es un chequeo de UX; la validez real la impone el
 * backend. Sin la segunda condicion, volver a la app tras la hora de vida del token mandaba al login a
 * alguien cuya sesion seguia siendo renovable.
 */
export function isAuthenticated() {
  if (!getClaims()) return false
  return !isAccessTokenExpired() || Boolean(getRefreshToken())
}

/** True si la sesion tiene alguno de los roles indicados. */
export function hasAnyRole(roles = []) {
  const claims = getClaims()
  if (!claims) return false
  return toArray(roles).some((role) => claims.roles.includes(role))
}

/** True si la sesion tiene el permiso indicado. */
export function hasPermission(permission) {
  const claims = getClaims()
  if (!claims) return false
  return claims.permissions.includes(permission)
}

export const session = {
  getAccessToken,
  getRefreshToken,
  getRememberPreference,
  setTokens,
  clearSession,
  getClaims,
  isAccessTokenExpired,
  isAuthenticated,
  hasAnyRole,
  hasPermission,
}

export default session
