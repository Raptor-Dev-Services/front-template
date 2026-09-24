import axios from 'axios'
import { env } from '../config/env'
import { getToken, getRefreshToken, setSession, clearSession, getRememberPreference } from '../auth/session'

const JSON_HEADERS = { 'Content-Type': 'application/json' }

export const apiClient = axios.create({
  baseURL: env.apiBaseUrl,
  headers: JSON_HEADERS,
})

export function extractApiErrorMessage(error, fallbackMessage = 'Request failed') {
  const response = error?.response?.data
  if (typeof response === 'string' && response.trim()) return response.trim()
  return (
    response?.message ||
    response?.Message ||
    response?.detail ||
    error?.message ||
    fallbackMessage
  )
}

export function resolveApiEnvelope(payload, fallbackMessage = 'Request failed') {
  if (Array.isArray(payload)) return payload
  if (!payload || typeof payload !== 'object') return payload

  const hasSuccessFlag = 'isSuccess' in payload || 'IsSuccess' in payload
  const isSuccess      = payload?.isSuccess ?? payload?.IsSuccess
  const message        = payload?.message   ?? payload?.Message ?? fallbackMessage

  if (hasSuccessFlag && !isSuccess) throw new Error(message)

  if ('data' in payload || 'Data' in payload) return payload?.data ?? payload?.Data

  return payload
}

// ── Request interceptor: attach Bearer token ────────────────────────────────
apiClient.interceptors.request.use((config) => {
  const token = getToken()
  if (token) {
    config.headers = config.headers || {}
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// ── Response interceptor: 401 → refresh → retry ────────────────────────────
let isRefreshing = false
let failedQueue  = []

function processQueue(error, token = null) {
  failedQueue.forEach((p) => (error ? p.reject(error) : p.resolve(token)))
  failedQueue = []
}

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config

    if (error?.response?.status === 401 && !original._retry) {
      const storedRefresh = getRefreshToken()

      if (!storedRefresh) {
        clearSession()
        window.location.href = '/login'
        return Promise.reject(error)
      }

      if (isRefreshing) {
        return new Promise((resolve, reject) => failedQueue.push({ resolve, reject }))
          .then((token) => {
            original.headers.Authorization = `Bearer ${token}`
            return apiClient(original)
          })
      }

      original._retry = true
      isRefreshing    = true

      try {
        const res = await axios.post(
          `${env.apiBaseUrl}/api/auth/refresh`,
          { refreshToken: storedRefresh },
          { headers: JSON_HEADERS },
        )
        const payload  = res.data?.data ?? res.data
        const newToken = payload?.accessToken
        const newRefresh = payload?.refreshToken
        setSession({ token: newToken, refreshToken: newRefresh, rememberMe: getRememberPreference() })
        apiClient.defaults.headers.common.Authorization = `Bearer ${newToken}`
        processQueue(null, newToken)
        original.headers.Authorization = `Bearer ${newToken}`
        return apiClient(original)
      } catch (refreshError) {
        processQueue(refreshError, null)
        clearSession()
        window.location.href = '/login'
        return Promise.reject(refreshError)
      } finally {
        isRefreshing = false
      }
    }

    const normalizedError = new Error(extractApiErrorMessage(error))
    normalizedError.response = error?.response
    normalizedError.status   = error?.response?.status
    normalizedError.cause    = error
    return Promise.reject(normalizedError)
  },
)
