import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest'

import { http } from './client.js'
import { login, TWO_FACTOR_REQUIRED } from './auth.js'
import { getAccessToken, clearSession } from '../auth/session.js'

beforeEach(() => clearSession())
afterEach(() => vi.restoreAllMocks())

function axiosResponse(data) {
  return { data, status: 200, headers: {}, config: {} }
}

describe('login', () => {
  it('guarda los tokens cuando el backend los devuelve', async () => {
    const post = vi
      .spyOn(http, 'post')
      .mockResolvedValue(axiosResponse({ isSuccess: true, data: { accessToken: 'a.b.c', refreshToken: 'r1' } }))

    await login({ email: 'ana@acme.test', password: 'x' })

    expect(post).toHaveBeenCalledWith('/api/v1/auth/login', { email: 'ana@acme.test', password: 'x' })
    expect(getAccessToken()).toBe('a.b.c')
  })

  it('con 2FA corta con un error propio y NO guarda una sesion vacia', async () => {
    vi.spyOn(http, 'post').mockResolvedValue(
      axiosResponse({ isSuccess: true, data: { twoFactorRequired: true, challengeToken: 'ch' } }),
    )

    await expect(login({ email: 'ana@acme.test', password: 'x' })).rejects.toMatchObject({ code: TWO_FACTOR_REQUIRED })
    expect(getAccessToken()).toBeFalsy()
  })
})
