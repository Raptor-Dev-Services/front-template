import axios from 'axios'
import { API_BASE_URL } from '../config/env'
import { resolveApiEnvelope } from './clients'

// Bare instance — no auth interceptors, no Bearer header.
// Used for login/register/refresh so those requests never trigger the 401 handler.
const authAxios = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
})

// POST /api/auth/login → { accessToken, refreshToken, expiresAtUtc }
export async function login(email, password) {
  const res = await authAxios.post('/api/auth/login', { email, password })
  return resolveApiEnvelope(res.data)
}

// POST /api/auth/register → creates credential + triggers UserProfile creation via integration event
export async function register(body) {
  const res = await authAxios.post('/api/auth/register', body)
  return resolveApiEnvelope(res.data)
}

// POST /api/auth/refresh → { accessToken, refreshToken, expiresAtUtc }
export async function refreshToken(token) {
  const res = await authAxios.post('/api/auth/refresh', { refreshToken: token })
  return resolveApiEnvelope(res.data)
}
