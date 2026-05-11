import axios from 'axios'
import { API_BASE_URL } from '../config/env'
import { getToken } from '../auth/session'

const JSON_HEADERS = { 'Content-Type': 'application/json' }

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
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
  const isSuccess = payload?.isSuccess ?? payload?.IsSuccess
  const message = payload?.message ?? payload?.Message ?? fallbackMessage

  if (hasSuccessFlag && !isSuccess) throw new Error(message)

  if ('data' in payload || 'Data' in payload) return payload?.data ?? payload?.Data

  return payload
}

apiClient.interceptors.request.use((config) => {
  const token = getToken()
  if (token) {
    config.headers = config.headers || {}
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const normalizedError = new Error(extractApiErrorMessage(error))
    normalizedError.response = error?.response
    normalizedError.status = error?.response?.status
    normalizedError.cause = error
    return Promise.reject(normalizedError)
  },
)
