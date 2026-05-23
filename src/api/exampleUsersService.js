import { apiClient, resolveApiEnvelope } from './clients'

// GET /api/users → [{ publicId, fullName, isActive, createdAtUtc, updatedAtUtc }]
export async function getExampleUsers() {
  const res = await apiClient.get('/api/users')
  return resolveApiEnvelope(res.data) || []
}

// POST /api/auth/register → creates credential + triggers UserProfile via integration event
export async function registerExampleUser(body) {
  const res = await apiClient.post('/api/auth/register', body)
  return resolveApiEnvelope(res.data)
}

// PUT /api/users/{publicId} → update fullName (Admin only)
export async function updateExampleUser(publicId, body) {
  const res = await apiClient.put(`/api/users/${publicId}`, body)
  return resolveApiEnvelope(res.data)
}

// DELETE /api/users/{publicId} → soft-disable user (Admin only)
export async function disableExampleUser(publicId) {
  const res = await apiClient.delete(`/api/users/${publicId}`)
  return resolveApiEnvelope(res.data)
}
