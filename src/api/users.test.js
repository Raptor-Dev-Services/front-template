import { describe, it, expect, vi, afterEach } from 'vitest'

import { http } from './client.js'
import { listUsers, normalizePage, updateUser, disableUser } from './users.js'

afterEach(() => vi.restoreAllMocks())

function axiosResponse(data) {
  return { data, status: 200, headers: {}, config: {} }
}

describe('normalizePage', () => {
  it('acepta la lista como `profiles` (forma actual del back-template)', () => {
    const page = normalizePage({ profiles: [{ publicId: 'a', fullName: 'Ana', isActive: true }], total: 41, page: 1, pageSize: 20 })
    expect(page.total).toBe(41)
    expect(page.items[0]).toMatchObject({ publicId: 'a', fullName: 'Ana', isActive: true })
  })

  it('acepta `items` y PascalCase', () => {
    const page = normalizePage({ Items: [{ PublicId: 'b', FullName: 'Beto', IsActive: false }], TotalCount: 3 })
    expect(page).toEqual({
      items: [{ publicId: 'b', fullName: 'Beto', isActive: false, createdAtUtc: null, updatedAtUtc: null }],
      total: 3,
    })
  })

  it('el total es el del SERVIDOR, no el largo de la pagina', () => {
    expect(normalizePage({ items: [{}, {}], total: 250 }).total).toBe(250)
  })
})

describe('listUsers', () => {
  it('pide la pagina con page/pageSize y pasa la senal de cancelacion', async () => {
    const get = vi.spyOn(http, 'get').mockResolvedValue(axiosResponse({ isSuccess: true, data: { items: [], total: 0 } }))
    const controller = new AbortController()

    await listUsers({ page: 3, pageSize: 20, signal: controller.signal })

    expect(get).toHaveBeenCalledWith('/api/v1/users', { params: { page: 3, pageSize: 20 }, signal: controller.signal })
  })

  it('un fallo de negocio del envelope se propaga como error', async () => {
    vi.spyOn(http, 'get').mockResolvedValue(axiosResponse({ isSuccess: false, message: 'Tenant suspendido' }))
    await expect(listUsers()).rejects.toThrow('Tenant suspendido')
  })
})

describe('escrituras', () => {
  it('updateUser manda solo el nombre y escapa el id', async () => {
    const put = vi.spyOn(http, 'put').mockResolvedValue(axiosResponse({ isSuccess: true, data: null }))
    await updateUser('a/b', { fullName: 'Ana' })
    expect(put).toHaveBeenCalledWith('/api/v1/users/a%2Fb', { fullName: 'Ana' })
  })

  it('disableUser usa DELETE (baja logica en el backend)', async () => {
    const del = vi.spyOn(http, 'delete').mockResolvedValue(axiosResponse({ isSuccess: true, data: null }))
    await disableUser('abc')
    expect(del).toHaveBeenCalledWith('/api/v1/users/abc')
  })
})
