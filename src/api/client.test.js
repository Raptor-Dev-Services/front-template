import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

import {
  http,
  resolveApiEnvelope,
  extractApiErrorKey,
  extractApiErrorMessage,
  attachAuthorizationHeader,
  handleResponseError,
  performTokenRefresh,
  isAbortError,
  API_ERROR_KEYS,
} from './client.js'
import { getAccessToken, getRefreshToken, setTokens } from '../auth/session.js'
import { LOCALE_STORAGE_KEY } from '../i18n/locale.js'

// jsdom no deja espiar window.location.assign directo (su descriptor no es configurable): se reemplaza
// window.location por un objeto plano con un mock, y se restaura al terminar cada prueba.
const REAL_LOCATION = window.location

function stubLocation(pathname = '/users') {
  const assign = vi.fn()
  Object.defineProperty(window, 'location', {
    configurable: true,
    value: { ...window.location, pathname, assign },
  })
  return assign
}

/** Respuesta de axios minima (status/headers/data) para los helpers que la distinguen del cuerpo. */
function axiosResponse(data, status = 200) {
  return { data, status, headers: {}, config: {} }
}

beforeEach(() => {
  localStorage.clear()
  sessionStorage.clear()
})

afterEach(() => {
  vi.restoreAllMocks()
  Object.defineProperty(window, 'location', { configurable: true, value: REAL_LOCATION })
})

describe('resolveApiEnvelope', () => {
  it('exito camelCase: devuelve data', () => {
    const res = axiosResponse({ isSuccess: true, data: { id: 7 }, message: null, utcTimeStamp: '2026-01-01T00:00:00Z' })
    expect(resolveApiEnvelope(res)).toEqual({ id: 7 })
  })

  it('exito PascalCase: devuelve Data', () => {
    expect(resolveApiEnvelope(axiosResponse({ IsSuccess: true, Data: [1, 2] }))).toEqual([1, 2])
  })

  it('acepta `success` como bandera, ademas de `isSuccess`', () => {
    expect(() => resolveApiEnvelope({ success: false, message: 'No' })).toThrowError('No')
    expect(resolveApiEnvelope({ success: true, data: 3 })).toBe(3)
  })

  it('acepta el cuerpo ya extraido, no solo la respuesta de axios', () => {
    expect(resolveApiEnvelope({ isSuccess: true, data: 'jwt' })).toBe('jwt')
  })

  it('data primitiva o null se devuelve tal cual', () => {
    expect(resolveApiEnvelope(axiosResponse({ isSuccess: true, data: 0 }))).toBe(0)
    expect(resolveApiEnvelope(axiosResponse({ isSuccess: true, data: null }))).toBeNull()
  })

  it('un arreglo sin envelope pasa tal cual', () => {
    expect(resolveApiEnvelope(axiosResponse([{ id: 1 }]))).toEqual([{ id: 1 }])
  })

  it('fallo de negocio: lanza con el message del servidor y adjunta el envelope', () => {
    const envelope = { isSuccess: false, message: 'El correo ya esta registrado', data: null }
    let caught
    try {
      resolveApiEnvelope(axiosResponse(envelope))
    } catch (error) {
      caught = error
    }
    expect(caught.message).toBe('El correo ya esta registrado')
    expect(caught.envelope).toEqual(envelope)
  })

  it('fallo con Message en PascalCase', () => {
    expect(() => resolveApiEnvelope({ IsSuccess: false, Message: 'Sin permiso' })).toThrowError('Sin permiso')
  })

  it('fallo sin message usa la lista `errors` del envelope', () => {
    expect(() => resolveApiEnvelope({ isSuccess: false, errors: ['Nombre requerido.', 'Correo invalido.'] })).toThrowError(
      'Nombre requerido. Correo invalido.',
    )
  })

  it('fallo sin ningun texto: lanza la CLAVE i18n, nunca texto en duro', () => {
    expect(() => resolveApiEnvelope({ isSuccess: false })).toThrowError(API_ERROR_KEYS.operationFailed)
  })
})

describe('extractApiErrorKey', () => {
  it('prefiere el mensaje del servidor sobre el texto de axios', () => {
    const error = {
      isAxiosError: true,
      response: { status: 409, data: { isSuccess: false, message: 'El registro ya existe' } },
      message: 'Request failed with status code 409',
    }
    expect(extractApiErrorKey(error)).toBe('El registro ya existe')
  })

  it('lee el diccionario de validacion de un ProblemDetails', () => {
    const error = {
      isAxiosError: true,
      response: { status: 400, data: { title: 'One or more validation errors occurred.', errors: { Email: ['Correo requerido.'] } } },
    }
    expect(extractApiErrorKey(error)).toBe('Correo requerido.')
  })

  it('red caida -> clave de red', () => {
    expect(extractApiErrorKey({ isAxiosError: true, code: 'ERR_NETWORK', message: 'Network Error' })).toBe(API_ERROR_KEYS.network)
    expect(extractApiErrorKey({ isAxiosError: true, request: {}, message: 'Network Error' })).toBe(API_ERROR_KEYS.network)
  })

  it('timeout -> clave de timeout', () => {
    expect(extractApiErrorKey({ isAxiosError: true, code: 'ECONNABORTED', message: 'timeout of 20000ms exceeded' })).toBe(
      API_ERROR_KEYS.timeout,
    )
  })

  it('403 con cuerpo vacio -> clave de permisos, no "error inesperado"', () => {
    expect(extractApiErrorKey({ isAxiosError: true, response: { status: 403, data: '' } })).toBe(API_ERROR_KEYS.forbidden)
  })

  it('500 sin mensaje util -> clave generica, NUNCA el texto ingles de axios', () => {
    const key = extractApiErrorKey({ isAxiosError: true, response: { status: 500, data: {} }, message: 'Request failed with status code 500' })
    expect(key).toBe(API_ERROR_KEYS.unexpected)
  })

  it('un cuerpo de texto (una pagina HTML de error) no se muestra', () => {
    const key = extractApiErrorKey({ isAxiosError: true, response: { status: 502, data: '<html>Bad gateway</html>' } })
    expect(key).toBe(API_ERROR_KEYS.unexpected)
  })

  it('el error que lanza resolveApiEnvelope conserva su texto', () => {
    expect(extractApiErrorKey(new Error('Saldo insuficiente'))).toBe('Saldo insuficiente')
  })
})

describe('extractApiErrorMessage segun idioma', () => {
  it('traduce el fallo del cliente al idioma activo', () => {
    const error = { isAxiosError: true, code: 'ERR_NETWORK' }
    localStorage.setItem(LOCALE_STORAGE_KEY, 'en')
    expect(extractApiErrorMessage(error)).toBe('We could not reach the server. Check your connection and try again.')
    localStorage.setItem(LOCALE_STORAGE_KEY, 'es')
    expect(extractApiErrorMessage(error)).toBe('No pudimos conectar con el servidor. Revisa tu conexion e intenta de nuevo.')
  })

  it('NO traduce el mensaje del backend', () => {
    localStorage.setItem(LOCALE_STORAGE_KEY, 'en')
    expect(extractApiErrorMessage({ response: { data: { message: 'El correo ya esta registrado' } } })).toBe(
      'El correo ya esta registrado',
    )
  })

  it('sin nada que decir devuelve el generico traducido', () => {
    expect(extractApiErrorMessage({})).toBe('Ocurrio un error inesperado.')
    expect(extractApiErrorMessage(undefined)).toBe('Ocurrio un error inesperado.')
  })
})

describe('attachAuthorizationHeader', () => {
  it('adjunta el Bearer de la sesion', () => {
    setTokens({ accessToken: 'jwt.de.prueba', rememberMe: true })
    expect(attachAuthorizationHeader({ headers: {} }).headers.Authorization).toBe('Bearer jwt.de.prueba')
  })

  it('sin sesion no inventa un header', () => {
    expect(attachAuthorizationHeader({ headers: {} }).headers.Authorization).toBeUndefined()
  })
})

describe('handleResponseError', () => {
  it('401 fuera de auth: refresca UNA vez, persiste los tokens nuevos y reintenta la peticion', async () => {
    setTokens({ accessToken: 'viejo', refreshToken: 'r-viejo', rememberMe: true })
    const postSpy = vi.spyOn(http, 'post').mockResolvedValue(
      axiosResponse({ isSuccess: true, data: { accessToken: 'nuevo', refreshToken: 'r-nuevo' } }),
    )
    const retry = vi.spyOn(http, 'request').mockResolvedValue(axiosResponse({ isSuccess: true, data: 'ok' }))
    const error = { config: { url: '/api/users', headers: {} }, response: { status: 401 } }

    const result = await handleResponseError(error)

    expect(postSpy).toHaveBeenCalledTimes(1)
    expect(postSpy.mock.calls[0][0]).toBe('/api/auth/refresh')
    expect(postSpy.mock.calls[0][1]).toMatchObject({ refreshToken: 'r-viejo' })
    expect(getAccessToken()).toBe('nuevo')
    expect(getRefreshToken()).toBe('r-nuevo')
    expect(error.config.headers.Authorization).toBe('Bearer nuevo')
    expect(error.config._retry).toBe(true)
    expect(retry).toHaveBeenCalledTimes(1)
    expect(result.data.data).toBe('ok')
  })

  it('401 concurrentes comparten UN solo refresh en vuelo', async () => {
    setTokens({ refreshToken: 'r1', accessToken: 'a1' })
    let resolver
    const postSpy = vi.spyOn(http, 'post').mockReturnValue(new Promise((resolve) => (resolver = resolve)))

    const a = performTokenRefresh()
    const b = performTokenRefresh()
    resolver(axiosResponse({ isSuccess: true, data: { accessToken: 'a2', refreshToken: 'r2' } }))
    await Promise.all([a, b])

    expect(postSpy).toHaveBeenCalledTimes(1)
  })

  it('si el refresh falla: limpia la sesion y manda a /login', async () => {
    setTokens({ accessToken: 'viejo', refreshToken: 'r-vencido' })
    vi.spyOn(http, 'post').mockRejectedValue({ response: { status: 401 } })
    const assign = stubLocation('/users')
    const error = { config: { url: '/api/users' }, response: { status: 401, data: {} } }

    await expect(handleResponseError(error)).rejects.toBe(error)

    expect(getAccessToken()).toBeNull()
    expect(assign).toHaveBeenCalledWith('/login')
  })

  it('estando ya en /login no redirige (evita recargar el formulario en bucle)', async () => {
    vi.spyOn(http, 'post').mockRejectedValue({ response: { status: 401 } })
    const assign = stubLocation('/login')
    setTokens({ accessToken: 'a', refreshToken: 'r' })

    await expect(handleResponseError({ config: { url: '/api/users' }, response: { status: 401 } })).rejects.toBeTruthy()

    expect(assign).not.toHaveBeenCalled()
  })

  it('un 401 del LOGIN no dispara refresh: conserva el mensaje del backend', async () => {
    const postSpy = vi.spyOn(http, 'post')
    const assign = stubLocation('/login')
    const error = {
      config: { url: '/api/auth/login' },
      response: { status: 401, data: { isSuccess: false, message: 'Credenciales invalidas' } },
      message: 'Request failed with status code 401',
    }

    await expect(handleResponseError(error)).rejects.toBe(error)

    expect(postSpy).not.toHaveBeenCalled()
    expect(assign).not.toHaveBeenCalled()
    expect(error.message).toBe('Credenciales invalidas')
  })

  it('una peticion ya reintentada no vuelve a refrescar', async () => {
    const postSpy = vi.spyOn(http, 'post')
    const error = { config: { url: '/api/users', _retry: true }, response: { status: 401 } }
    await expect(handleResponseError(error)).rejects.toBe(error)
    expect(postSpy).not.toHaveBeenCalled()
  })
})

describe('isAbortError', () => {
  it.each([
    ['CanceledError de axios', { code: 'ERR_CANCELED', name: 'CanceledError' }],
    ['AbortError nativo', { name: 'AbortError' }],
  ])('reconoce %s como cancelacion', (_caso, error) => {
    expect(isAbortError(error)).toBe(true)
  })

  it.each([
    ['un fallo de red', { code: 'ERR_NETWORK' }],
    ['un 500', { response: { status: 500 } }],
    ['null', null],
  ])('no confunde %s con una cancelacion', (_caso, error) => {
    expect(isAbortError(error)).toBe(false)
  })
})
