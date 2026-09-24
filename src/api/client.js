// client.js - instancia UNICA de axios + helpers del envelope + flujo de refresh de sesion.
//
// Todo servicio de src/api usa esta instancia y estos helpers; ningun componente hace fetch/axios
// suelto. Envelope del backend: { isSuccess | success, data, message, errors, utcTimeStamp }, en
// camelCase o PascalCase segun como serialice la API (se aceptan las dos formas).
//
// i18n: este modulo NO escribe texto visible. Los fallos que genera el propio cliente (red caida,
// timeout, error sin mensaje) se expresan como CLAVE de API_ERROR_KEYS y su texto vive en src/i18n. El
// mensaje que manda el BACKEND no se traduce: ya viene listo para el usuario y pasa tal cual.

import axios from 'axios'
import { env } from '../config/env.js'
import { translateMessage } from '../i18n/translate.js'
import { getAccessToken, getRefreshToken, setTokens, clearSession } from '../auth/session.js'

/** Claves i18n de los fallos que genera el CLIENTE (no el backend). Su texto vive en `common.*`. */
export const API_ERROR_KEYS = Object.freeze({
  network: 'common.errorNetwork',
  timeout: 'common.errorTimeout',
  unexpected: 'common.errorUnexpected',
  operationFailed: 'common.errorOperationFailed',
  sessionExpired: 'common.errorSessionExpired',
  forbidden: 'common.errorForbidden',
})

const AUTH_PREFIX = '/api/v1/auth/'
const REFRESH_URL = `${AUTH_PREFIX}refresh`

/** Cliente HTTP central. baseURL es el ORIGEN de la API (vacio = mismo origen, proxy de Vite). */
export const http = axios.create({
  baseURL: env.apiBaseUrl,
  headers: { 'Content-Type': 'application/json' },
  timeout: 20000,
})

/**
 * Adjunta el Bearer token a la request (una sola vez; ningun servicio lo hace a mano). Exportada para
 * probarla sin depender de los internals de los interceptores de axios.
 */
export function attachAuthorizationHeader(config) {
  const token = getAccessToken()
  if (token) {
    config.headers = config.headers ?? {}
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
}

http.interceptors.request.use(attachAuthorizationHeader)

// Un 401 de un endpoint de auth es legitimo (credenciales o refresh invalidos) y NO dispara el refresh:
// evita bucles y que un login fallido redirija a /login en vez de mostrar el mensaje.
function isAuthEndpoint(url = '') {
  return url.includes(AUTH_PREFIX)
}

function redirectToLogin() {
  if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
    window.location.assign('/login')
  }
}

// Refresh deduplicado: si varias peticiones caen en 401 a la vez comparten UNA llamada en vuelo, en
// vez de rotar el refresh token N veces (y que N-1 fallen porque el token ya se consumio).
let refreshPromise = null

/**
 * Renueva el par de tokens y los persiste en el mismo almacenamiento ("recordarme") que tenian.
 * Lanza si no hay refresh token o si el backend lo rechaza (sesion terminada).
 */
export async function performTokenRefresh() {
  if (refreshPromise) return refreshPromise
  const refreshToken = getRefreshToken()
  if (!refreshToken) {
    clearSession()
    throw new Error(API_ERROR_KEYS.sessionExpired)
  }
  refreshPromise = (async () => {
    try {
      const res = await http.post(REFRESH_URL, { refreshToken }, { _skipAuthRefresh: true })
      const data = resolveApiEnvelope(res)
      setTokens({ accessToken: data?.accessToken, refreshToken: data?.refreshToken })
      return data
    } finally {
      refreshPromise = null
    }
  })()
  return refreshPromise
}

/** Mensaje que el backend adjunto al error, si lo hay (envelope o ProblemDetails). */
function serverMessageOf(body) {
  if (!body || typeof body !== 'object') return null
  const message = body.message ?? body.Message ?? body.detail ?? null
  if (typeof message === 'string' && message.trim()) return message.trim()
  const errors = body.errors ?? body.Errors
  if (Array.isArray(errors)) {
    const texts = errors.filter((e) => typeof e === 'string' && e.trim())
    if (texts.length) return texts.join(' ')
  } else if (errors && typeof errors === 'object') {
    // Diccionario de validacion { campo: [mensajes] } (ProblemDetails de ASP.NET).
    const texts = Object.values(errors).flat().filter((e) => typeof e === 'string' && e.trim())
    if (texts.length) return texts.join(' ')
  }
  return null
}

/**
 * Maneja un error de respuesta: ante un 401 intenta el refresh UNA vez y reintenta la peticion
 * original; si el refresh falla, limpia la sesion y manda a /login (salvo que ya se este ahi).
 * Conserva el mensaje real del backend en `error.message`. Exportada para probarla directo.
 */
export async function handleResponseError(error) {
  const original = error?.config
  const status = error?.response?.status

  const canRefresh =
    status === 401 && original && !original._retry && !original._skipAuthRefresh && !isAuthEndpoint(original.url)

  if (canRefresh) {
    original._retry = true
    try {
      await performTokenRefresh()
      original.headers = original.headers ?? {}
      original.headers.Authorization = `Bearer ${getAccessToken()}`
      return http.request(original)
    } catch {
      clearSession()
      redirectToLogin()
    }
  }

  const backendMessage = serverMessageOf(error?.response?.data)
  if (backendMessage && error) {
    error.message = backendMessage
  }
  return Promise.reject(error)
}

http.interceptors.response.use((response) => response, handleResponseError)

// Una respuesta de axios trae status/headers/config; un cuerpo ya extraido, no.
function isAxiosResponse(value) {
  return Boolean(value) && typeof value === 'object' && 'status' in value && 'headers' in value && 'data' in value
}

/**
 * Resuelve el envelope. Acepta la respuesta de axios o el cuerpo ya extraido.
 * - Arreglo o valor plano -> se devuelve tal cual (endpoint sin envelope).
 * - `isSuccess`/`success` false -> lanza Error con el `message` del servidor (o la clave i18n del
 *   fallback) y el envelope adjunto en `error.envelope`.
 * - En exito -> devuelve `data` (o el cuerpo entero si no trae `data`).
 */
export function resolveApiEnvelope(response) {
  const body = isAxiosResponse(response) ? response.data : response
  if (Array.isArray(body) || !body || typeof body !== 'object') return body

  const flag = body.isSuccess ?? body.IsSuccess ?? body.success ?? body.Success
  if (flag === false) {
    const err = new Error(serverMessageOf(body) ?? API_ERROR_KEYS.operationFailed)
    err.envelope = body
    throw err
  }

  if ('data' in body) return body.data
  if ('Data' in body) return body.Data
  return body
}

/**
 * Clasifica un error en el texto que debe verse. PURA: sin i18n y sin React. Devuelve el mensaje del
 * backend tal cual o, si el fallo lo genero el propio cliente, una CLAVE de API_ERROR_KEYS. Util para
 * traducir en el render y que el mensaje siga al cambio de idioma: `t(extractApiErrorKey(err))`.
 * Nunca devuelve el texto ingles de axios ("Network Error", "Request failed with status code 500").
 */
export function extractApiErrorKey(error) {
  const serverMessage = serverMessageOf(error?.response?.data) ?? serverMessageOf(error?.envelope)
  if (serverMessage) return serverMessage

  // Un 403 de autorizacion lo corta el middleware ANTES del controlador y llega con cuerpo VACIO: sin
  // este caso caeria en `unexpected` y el usuario no sabria que el problema es de permisos.
  if (error?.response?.status === 403) return API_ERROR_KEYS.forbidden

  if (error?.code === 'ECONNABORTED' || error?.code === 'ETIMEDOUT') return API_ERROR_KEYS.timeout
  if (error?.code === 'ERR_NETWORK' || (error?.request && !error?.response)) return API_ERROR_KEYS.network
  if (error?.isAxiosError || error?.response) return API_ERROR_KEYS.unexpected

  // Error propio (el que lanza resolveApiEnvelope o performTokenRefresh): su message es el texto del
  // backend o una de nuestras claves. En los dos casos se devuelve sin tocar.
  if (typeof error?.message === 'string' && error.message) return error.message

  return API_ERROR_KEYS.unexpected
}

/**
 * Mensaje de error listo para pintar: traduce la clave cuando el fallo lo genero el cliente y deja
 * intacto el mensaje del backend (translateMessage devuelve tal cual lo que no es clave).
 */
export function extractApiErrorMessage(error) {
  return translateMessage(extractApiErrorKey(error))
}

/**
 * True si el fallo viene de haber ABORTADO la peticion (cambio de pagina, desmontaje), no de un error
 * real. Hay que distinguirlo en el catch de todo hook: si no, cancelar deja la vista en estado de error.
 * axios reporta la cancelacion con su CanceledError (ERR_CANCELED) o con el AbortError nativo.
 */
export function isAbortError(error) {
  return error?.code === 'ERR_CANCELED' || error?.name === 'AbortError' || error?.name === 'CanceledError'
}

export default http
