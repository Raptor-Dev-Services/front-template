import { describe, it, expect } from 'vitest'
import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { buildCsp, inlineScriptHashes } from './csp.js'

// La CSP no se puede estrenar en modo advisory (un <meta> no admite report-to), asi que estas pruebas
// son la red que la sustituye: la politica DERIVA de la configuracion real y no deja pasar lo que
// existe para bloquear.

const PROD = { VITE_API_BASE_URL: 'https://api.example.com' }

function directive(policy, name) {
  const found = policy.split('; ').find((d) => d === name || d.startsWith(`${name} `))
  return found ? found.slice(name.length).trim().split(' ').filter(Boolean) : null
}

describe('buildCsp', () => {
  it('permite hablar con la API configurada, no con una hardcodeada', () => {
    expect(directive(buildCsp(PROD), 'connect-src')).toContain('https://api.example.com')
    const otra = directive(buildCsp({ VITE_API_BASE_URL: 'https://api.otro.com' }), 'connect-src')
    expect(otra).toContain('https://api.otro.com')
    expect(otra).not.toContain('https://api.example.com')
  })

  it('con la API en el mismo origen (base vacia) basta self', () => {
    expect(directive(buildCsp({ VITE_API_BASE_URL: '' }), 'connect-src')).toEqual(["'self'"])
    expect(directive(buildCsp(), 'connect-src')).toEqual(["'self'"])
  })

  it('reduce la URL de la API a su origen (sin ruta ni query)', () => {
    const connect = directive(buildCsp({ VITE_API_BASE_URL: 'https://api.example.com/v1?x=1' }), 'connect-src')
    expect(connect).toContain('https://api.example.com')
    expect(connect.join(' ')).not.toContain('/v1')
  })

  it('declara tambien el origen WebSocket de la API, no solo el http', () => {
    expect(directive(buildCsp(PROD), 'connect-src')).toContain('wss://api.example.com')
    const local = directive(buildCsp({ VITE_API_BASE_URL: 'http://localhost:5060' }), 'connect-src')
    expect(local).toContain('ws://localhost:5060')
    expect(local).not.toContain('wss://localhost:5060')
  })

  it('un proveedor de identidad externo se habilita en connect-src y frame-src', () => {
    const policy = buildCsp({ ...PROD, VITE_AUTH_ORIGIN: 'login.example.com' })
    expect(directive(policy, 'connect-src')).toContain('https://login.example.com')
    expect(directive(policy, 'frame-src')).toEqual(['https://login.example.com'])
  })

  it("sin proveedor externo no se permite ningun iframe: frame-src 'none'", () => {
    expect(directive(buildCsp(PROD), 'frame-src')).toEqual(["'none'"])
  })

  it("nunca habilita 'unsafe-inline' ni 'unsafe-eval' en script-src", () => {
    const script = directive(buildCsp(PROD, ["'sha256-abc='"]), 'script-src')
    expect(script).toEqual(["'self'", "'sha256-abc='"])
    expect(script).not.toContain("'unsafe-inline'")
    expect(script).not.toContain("'unsafe-eval'")
  })

  it('bloquea object-src y base-uri', () => {
    const policy = buildCsp(PROD)
    expect(directive(policy, 'object-src')).toEqual(["'none'"])
    expect(directive(policy, 'base-uri')).toEqual(["'self'"])
  })

  it('agrega upgrade-insecure-requests solo si todo el trafico externo ya es https', () => {
    expect(buildCsp(PROD)).toContain('upgrade-insecure-requests')
    expect(buildCsp({ VITE_API_BASE_URL: 'http://staging.local:5060' })).not.toContain('upgrade-insecure-requests')
    expect(buildCsp({})).not.toContain('upgrade-insecure-requests')
  })

  it('falla el build si un origen no se puede resolver', () => {
    expect(() => buildCsp({ VITE_API_BASE_URL: 'no es una url ::' })).toThrow(/VITE_API_BASE_URL/)
    expect(() => buildCsp({ VITE_AUTH_ORIGIN: 'http://[mal' })).toThrow(/VITE_AUTH_ORIGIN/)
  })
})

describe('inlineScriptHashes', () => {
  it('hashea el script inline con sha256 base64', () => {
    const [hash] = inlineScriptHashes('<html><head><script>console.log(1)</script></head></html>')
    expect(hash).toBe(`'sha256-${createHash('sha256').update('console.log(1)', 'utf8').digest('base64')}'`)
  })

  it('cambia si el script cambia aunque sea un espacio', () => {
    const [a] = inlineScriptHashes('<script>var x=1</script>')
    const [b] = inlineScriptHashes('<script>var x = 1</script>')
    expect(a).not.toBe(b)
  })

  it('normaliza CRLF a LF antes de hashear, como hace el parser de HTML del navegador', () => {
    // Regresion: con un checkout en CRLF (Windows + core.autocrlf) el hash no coincidia con el que
    // calcula el navegador y la CSP bloqueaba el script del tema en el build.
    const lf = inlineScriptHashes('<script>\n  var a = 1\n</script>')
    expect(inlineScriptHashes('<script>\r\n  var a = 1\r\n</script>')).toEqual(lf)
    expect(inlineScriptHashes('<script>\r  var a = 1\r</script>')).toEqual(lf)
  })

  it('ignora los <script src> y los vacios', () => {
    expect(inlineScriptHashes('<script type="module" src="/assets/index.js"></script><script>  </script>')).toEqual([])
  })

  it('encuentra el script anti-parpadeo del index.html real', () => {
    // Si alguien lo borra o lo convierte en externo, esta prueba lo dice antes de que la CSP del build
    // deje de cubrirlo.
    const html = readFileSync(resolve(import.meta.dirname, '../index.html'), 'utf8')
    expect(inlineScriptHashes(html)).toHaveLength(1)
  })
})
