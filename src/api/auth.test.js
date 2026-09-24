import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest'

import { http } from './client.js'
import { login, completeTwoFactorLogin, logout } from './auth.js'
import { getAccessToken, getRefreshToken, setTokens, clearSession } from '../auth/session.js'

beforeEach(() => clearSession())
afterEach(() => vi.restoreAllMocks())

function axiosResponse(data) {
  return { data, status: 200, headers: {}, config: {} }
}

describe('login', () => {
  it('sin segundo factor guarda los tokens y lo dice', async () => {
    const post = vi
      .spyOn(http, 'post')
      .mockResolvedValue(axiosResponse({ isSuccess: true, data: { accessToken: 'a.b.c', refreshToken: 'r1' } }))

    const result = await login({ email: 'ana@acme.test', password: 'x' })

    expect(post).toHaveBeenCalledWith('/api/v1/auth/login', { email: 'ana@acme.test', password: 'x' })
    expect(result).toEqual({ twoFactorRequired: false })
    expect(getAccessToken()).toBe('a.b.c')
  })

  it('con segundo factor devuelve el reto y NO guarda una sesion vacia', async () => {
    vi.spyOn(http, 'post').mockResolvedValue(
      axiosResponse({ isSuccess: true, data: { accessToken: null, twoFactorRequired: true, challengeToken: 'ch' } }),
    )

    const result = await login({ email: 'ana@acme.test', password: 'x' })

    expect(result).toEqual({ twoFactorRequired: true, challengeToken: 'ch' })
    expect(getAccessToken()).toBeFalsy()
  })
})

describe('completeTwoFactorLogin', () => {
  it('canjea reto y codigo por la sesion y la guarda', async () => {
    const post = vi
      .spyOn(http, 'post')
      .mockResolvedValue(axiosResponse({ isSuccess: true, data: { accessToken: 'a2', refreshToken: 'r2' } }))

    await completeTwoFactorLogin({ challengeToken: 'ch', code: '123456', rememberMe: true })

    expect(post).toHaveBeenCalledWith('/api/v1/auth/login/2fa', { challengeToken: 'ch', code: '123456' })
    expect(getAccessToken()).toBe('a2')
  })
})

describe('logout', () => {
  it('revoca con el campo refreshToken y limpia la sesion', async () => {
    setTokens({ accessToken: 'a', refreshToken: 'r1' })
    const post = vi.spyOn(http, 'post').mockResolvedValue(axiosResponse({ isSuccess: true, data: null }))

    await logout()

    expect(post).toHaveBeenCalledWith('/api/v1/auth/logout', { refreshToken: 'r1' }, { _skipAuthRefresh: true })
    expect(getRefreshToken()).toBeFalsy()
  })
})
