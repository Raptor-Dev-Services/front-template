import { describe, it, expect, vi, afterEach } from 'vitest'

import { http } from './client.js'
import { getMyAccount, beginTwoFactorSetup, enableTwoFactor, disableTwoFactor } from './account.js'

afterEach(() => vi.restoreAllMocks())

function axiosResponse(data) {
  return { data, status: 200, headers: {}, config: {} }
}

describe('account', () => {
  it('getMyAccount normaliza la forma y pasa la senal de cancelacion', async () => {
    const get = vi.spyOn(http, 'get').mockResolvedValue(
      axiosResponse({ isSuccess: true, data: { email: 'ana@acme.test', roles: ['Admin'], twoFactorEnabled: true } }),
    )
    const controller = new AbortController()

    const account = await getMyAccount({ signal: controller.signal })

    expect(get).toHaveBeenCalledWith('/api/v1/account/me', { signal: controller.signal })
    expect(account).toEqual({ email: 'ana@acme.test', roles: ['Admin'], lastLoginAtUtc: null, twoFactorEnabled: true })
  })

  it('los tres pasos del 2FA pegan a sus rutas con el codigo en el cuerpo', async () => {
    const post = vi
      .spyOn(http, 'post')
      .mockResolvedValueOnce(axiosResponse({ isSuccess: true, data: { secret: 'S', otpauthUri: 'otpauth://totp/x' } }))
      .mockResolvedValueOnce(axiosResponse({ isSuccess: true, data: { codes: ['AAAA-BBBB'] } }))
      .mockResolvedValueOnce(axiosResponse({ isSuccess: true, data: null }))

    expect(await beginTwoFactorSetup()).toEqual({ secret: 'S', otpauthUri: 'otpauth://totp/x' })
    expect(await enableTwoFactor('123456')).toEqual(['AAAA-BBBB'])
    await disableTwoFactor('654321')

    expect(post.mock.calls.map((call) => call.slice(0, 2))).toEqual([
      ['/api/v1/account/2fa/setup'],
      ['/api/v1/account/2fa/enable', { code: '123456' }],
      ['/api/v1/account/2fa/disable', { code: '654321' }],
    ])
  })
})
