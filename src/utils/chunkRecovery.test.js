import { describe, it, expect, vi } from 'vitest'

import { STALE_CHUNK_FLAG, recoverFromStaleChunk, markChunkLoaded, installPreloadErrorHandler } from './chunkRecovery.js'

function memoryStorage() {
  const data = new Map()
  return {
    getItem: (k) => (data.has(k) ? data.get(k) : null),
    setItem: (k, v) => data.set(k, String(v)),
    removeItem: (k) => data.delete(k),
  }
}

describe('recoverFromStaleChunk', () => {
  it('la primera vez marca ANTES de recargar y recarga', () => {
    const storage = memoryStorage()
    const reload = vi.fn(() => {
      // Si la marca se pusiera despues, aqui todavia no estaria y el bucle seria infinito.
      expect(storage.getItem(STALE_CHUNK_FLAG)).not.toBeNull()
    })
    expect(recoverFromStaleChunk({ storage, reload })).toBe(true)
    expect(reload).toHaveBeenCalledTimes(1)
  })

  it('la segunda vez en la misma pestana NO recarga: es una falla real', () => {
    const storage = memoryStorage()
    const reload = vi.fn()
    recoverFromStaleChunk({ storage, reload })
    expect(recoverFromStaleChunk({ storage, reload })).toBe(false)
    expect(reload).toHaveBeenCalledTimes(1)
  })

  it('tras un chunk bueno el seguro se rearma para el siguiente despliegue', () => {
    const storage = memoryStorage()
    const reload = vi.fn()
    recoverFromStaleChunk({ storage, reload })
    markChunkLoaded({ storage })
    expect(recoverFromStaleChunk({ storage, reload })).toBe(true)
    expect(reload).toHaveBeenCalledTimes(2)
  })

  it('sin almacenamiento no recarga: sin marca no hay seguro contra el bucle', () => {
    const reload = vi.fn()
    expect(recoverFromStaleChunk({ storage: null, reload })).toBe(false)
    const rota = { getItem: () => null, setItem: () => { throw new Error('QuotaExceeded') } }
    expect(recoverFromStaleChunk({ storage: rota, reload })).toBe(false)
    expect(reload).not.toHaveBeenCalled()
  })
})

describe('installPreloadErrorHandler', () => {
  it('ante vite:preloadError recarga una vez y cancela el evento', () => {
    const target = new EventTarget()
    const storage = memoryStorage()
    const reload = vi.fn()
    const uninstall = installPreloadErrorHandler(target, { storage, reload })

    const first = new Event('vite:preloadError', { cancelable: true })
    target.dispatchEvent(first)
    const second = new Event('vite:preloadError', { cancelable: true })
    target.dispatchEvent(second)

    expect(reload).toHaveBeenCalledTimes(1)
    expect(first.defaultPrevented).toBe(true)
    // La segunda NO se cancela: el error tiene que llegar al ErrorBoundary y verse.
    expect(second.defaultPrevented).toBe(false)
    uninstall()
  })
})
