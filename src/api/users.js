// users.js - servicio de perfiles de usuario (modulo Users del back-template). Usa SIEMPRE el cliente
// central y el helper de envelope; toda transformacion ocurre DESPUES de resolver el envelope.
//
// El tenant lo resuelve el backend desde el JWT: este servicio nunca envia tenant_id.

import { http, resolveApiEnvelope } from './client.js'
import { fetchAllPages } from './paging.js'

/** Un perfil con forma estable, venga la API en camelCase o PascalCase. */
export function normalizeUser(row = {}) {
  return {
    publicId: row.publicId ?? row.PublicId ?? row.id ?? row.Id ?? null,
    fullName: row.fullName ?? row.FullName ?? '',
    isActive: Boolean(row.isActive ?? row.IsActive),
    createdAtUtc: row.createdAtUtc ?? row.CreatedAtUtc ?? null,
    updatedAtUtc: row.updatedAtUtc ?? row.UpdatedAtUtc ?? null,
  }
}

/**
 * Normaliza una respuesta paginada a { items, total }. El back-template ha devuelto la lista como
 * `profiles` y la plantilla la espera como `items`: se aceptan las dos, igual que el casing.
 */
export function normalizePage(data) {
  if (Array.isArray(data)) return { items: data.map(normalizeUser), total: data.length }
  const rows = data?.items ?? data?.Items ?? data?.profiles ?? data?.Profiles ?? data?.results ?? []
  const total = data?.total ?? data?.Total ?? data?.totalCount ?? data?.TotalCount ?? rows.length
  return { items: rows.map(normalizeUser), total: Number(total) || 0 }
}

/** Lista paginada. GET /api/v1/users?page&pageSize -> { items, total }. */
export async function listUsers({ page = 1, pageSize = 20, signal } = {}) {
  const res = await http.get('/api/v1/users', { params: { page, pageSize }, signal })
  return normalizePage(resolveApiEnvelope(res))
}

/** TODOS los usuarios, recorriendo las paginas que haga falta (ver api/paging.js y `truncated`). */
export function listAllUsers({ signal } = {}) {
  return fetchAllPages((page, pageSize) => listUsers({ page, pageSize, signal }))
}

/** Edita el nombre. PUT /api/v1/users/{publicId}  body: { fullName } */
export async function updateUser(publicId, { fullName }) {
  const res = await http.put(`/api/v1/users/${encodeURIComponent(publicId)}`, { fullName })
  return resolveApiEnvelope(res)
}

/** Da de baja (soft, nunca borrado fisico). DELETE /api/v1/users/{publicId} */
export async function disableUser(publicId) {
  const res = await http.delete(`/api/v1/users/${encodeURIComponent(publicId)}`)
  return resolveApiEnvelope(res)
}

export default { listUsers, listAllUsers, updateUser, disableUser }
