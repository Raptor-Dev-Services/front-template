import { describe, it, expect, afterEach, vi } from 'vitest'

import { decodeJwtPayload } from './jwt.js'
import {
  getAccessToken,
  getRefreshToken,
  getRememberPreference,
  setTokens,
  clearSession,
  getClaims,
  isAuthenticated,
  hasAnyRole,
  hasPermission,
} from './session.js'
import { fakeJwt, expIn } from '../testUtils/fakeJwt.js'

afterEach(() => {
  localStorage.clear()
  sessionStorage.clear()
  vi.restoreAllMocks()
})

describe('decodeJwtPayload', () => {
  it('decodifica claims con acentos y enes sin mojibake', () => {
    // Regresion: la version anterior hacia JSON.parse(atob(...)) directo y "Jose" con tilde salia
    // como "JosÃ©": atob devuelve bytes, no texto UTF-8.
    const token = fakeJwt({ name: 'José Muñoz Peña', sub: '1' })
    expect(decodeJwtPayload(token).name).toBe('José Muñoz Peña')
  })

  it.each([[''], ['no-es-un-jwt'], ['a.@@@.c'], [null], [undefined]])('devuelve null ante %j', (token) => {
    expect(decodeJwtPayload(token)).toBeNull()
  })
})

describe('setTokens / recordarme', () => {
  it('con recordarme guarda en localStorage (sobrevive al cierre del navegador)', () => {
    setTokens({ accessToken: 'a1', refreshToken: 'r1', rememberMe: true })
    expect(localStorage.getItem('app_access_token')).toBe('a1')
    expect(sessionStorage.getItem('app_access_token')).toBeNull()
    expect(getRememberPreference()).toBe(true)
  })

  it('sin recordarme guarda en sessionStorage', () => {
    setTokens({ accessToken: 'a1', refreshToken: 'r1', rememberMe: false })
    expect(sessionStorage.getItem('app_access_token')).toBe('a1')
    expect(localStorage.getItem('app_access_token')).toBeNull()
  })

  it('el refresh (sin rememberMe) reescribe en el MISMO almacenamiento y no deja copias viejas', () => {
    setTokens({ accessToken: 'a1', refreshToken: 'r1', rememberMe: true })
    setTokens({ accessToken: 'a2', refreshToken: 'r2' })
    expect(localStorage.getItem('app_access_token')).toBe('a2')
    expect(getAccessToken()).toBe('a2')
    expect(getRefreshToken()).toBe('r2')
  })

  it('cambiar de recordarme a no recordarme borra la copia persistente', () => {
    setTokens({ accessToken: 'a1', refreshToken: 'r1', rememberMe: true })
    setTokens({ accessToken: 'a2', refreshToken: 'r2', rememberMe: false })
    expect(localStorage.getItem('app_access_token')).toBeNull()
    expect(sessionStorage.getItem('app_access_token')).toBe('a2')
  })

  it('clearSession limpia los DOS almacenamientos', () => {
    setTokens({ accessToken: 'a1', refreshToken: 'r1', rememberMe: true })
    sessionStorage.setItem('app_access_token', 'huerfano')
    clearSession()
    expect(getAccessToken()).toBeNull()
    expect(getRefreshToken()).toBeNull()
  })

  it('con el almacenamiento bloqueado no lanza (modo privado)', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('SecurityError')
    })
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('SecurityError')
    })
    expect(() => setTokens({ accessToken: 'a', refreshToken: 'r', rememberMe: true })).not.toThrow()
    expect(getAccessToken()).toBeNull()
    expect(isAuthenticated()).toBe(false)
  })
})

describe('getClaims', () => {
  it('lee sub, nombre, correo, tenant, roles y permisos', () => {
    setTokens({
      accessToken: fakeJwt({
        sub: 'b6b1c3d2-0000-4000-8000-000000000001',
        email: 'ana@empresa.com',
        unique_name: 'Ana Pérez',
        tenant_id: '7',
        role: 'Admin',
        permission: ['users.read', 'users.manage'],
        exp: expIn(60),
      }),
    })
    expect(getClaims()).toMatchObject({
      sub: 'b6b1c3d2-0000-4000-8000-000000000001',
      userName: 'Ana Pérez',
      email: 'ana@empresa.com',
      tenantId: '7',
      roles: ['Admin'],
      permissions: ['users.read', 'users.manage'],
    })
  })

  it('un solo permiso como string se normaliza a arreglo', () => {
    setTokens({ accessToken: fakeJwt({ sub: '1', permission: 'users.read', exp: expIn(60) }) })
    expect(getClaims().permissions).toEqual(['users.read'])
    expect(hasPermission('users.read')).toBe(true)
    expect(hasPermission('users.manage')).toBe(false)
  })

  it('acepta el rol con la URI larga de Microsoft', () => {
    setTokens({
      accessToken: fakeJwt({ sub: '1', 'http://schemas.microsoft.com/ws/2008/06/identity/claims/role': ['Admin', 'User'] }),
    })
    expect(hasAnyRole(['User'])).toBe(true)
    expect(hasAnyRole('Auditor')).toBe(false)
  })

  it('sin nombre en el token, userName cae al correo y nunca al sub', () => {
    setTokens({ accessToken: fakeJwt({ sub: '42', email: 'x@y.com' }) })
    expect(getClaims().userName).toBe('x@y.com')
    setTokens({ accessToken: fakeJwt({ sub: '42' }) })
    expect(getClaims().userName).toBeNull()
  })

  it('sin sesion devuelve null y ningun permiso', () => {
    expect(getClaims()).toBeNull()
    expect(hasPermission('users.read')).toBe(false)
    expect(hasAnyRole(['Admin'])).toBe(false)
  })
})

describe('isAuthenticated', () => {
  it('token vigente -> si', () => {
    setTokens({ accessToken: fakeJwt({ sub: '1', exp: expIn(10) }) })
    expect(isAuthenticated()).toBe(true)
  })

  it('token vencido SIN refresh -> no', () => {
    setTokens({ accessToken: fakeJwt({ sub: '1', exp: expIn(-10) }) })
    expect(isAuthenticated()).toBe(false)
  })

  it('token vencido CON refresh -> si: la primera peticion lo renovara', () => {
    setTokens({ accessToken: fakeJwt({ sub: '1', exp: expIn(-10) }), refreshToken: 'r1' })
    expect(isAuthenticated()).toBe(true)
  })

  it('un token que no es JWT no cuenta como sesion', () => {
    setTokens({ accessToken: 'basura', refreshToken: 'r1' })
    expect(isAuthenticated()).toBe(false)
  })
})
