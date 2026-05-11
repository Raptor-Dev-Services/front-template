import { apiClient, resolveApiEnvelope } from './clients'

export async function getExampleUsers() {
  const res = await apiClient.get('/api/example/users')
  return resolveApiEnvelope(res.data) || []
}

export async function getExampleUserById(userId) {
  const res = await apiClient.get(`/api/example/users/${userId}`)
  return resolveApiEnvelope(res.data)
}

export async function createExampleUser(body) {
  const res = await apiClient.post('/api/example/users', body)
  return resolveApiEnvelope(res.data)
}

export async function updateExampleUser(userId, body) {
  const res = await apiClient.put(`/api/example/users/${userId}`, body)
  return resolveApiEnvelope(res.data)
}

export async function deleteExampleUser(userId) {
  const res = await apiClient.delete(`/api/example/users/${userId}`)
  return resolveApiEnvelope(res.data)
}
