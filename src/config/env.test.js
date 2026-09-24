import { describe, it, expect } from 'vitest'

import { readVar, env } from './env.js'

describe('readVar', () => {
  it('devuelve el valor cuando existe', () => {
    expect(readVar({ VITE_X: 'https://api.example.com' }, 'VITE_X', 'fallback')).toBe('https://api.example.com')
  })

  it.each([[undefined], [null], ['']])('trata %j como ausente y cae al fallback', (value) => {
    // `VITE_X=` en un .env llega como '' y no como undefined: sin esta regla el fallback no aplica nunca.
    expect(readVar({ VITE_X: value }, 'VITE_X', 'fallback')).toBe('fallback')
  })

  it('sin fuente no revienta', () => {
    expect(readVar(undefined, 'VITE_X', 'fb')).toBe('fb')
  })
})

describe('env.apiBaseUrl', () => {
  it('por defecto es el mismo origen, SIN prefijo /api', () => {
    // Regresion: el default era '/api' y los servicios piden '/api/...', asi que toda llamada salia a
    // /api/api/... y respondia 404. El prefijo lo pone el servicio; la base es solo el origen.
    expect(env.apiBaseUrl.endsWith('/api')).toBe(false)
  })
})
