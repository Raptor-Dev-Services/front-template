import { describe, it, expect, vi, afterEach } from 'vitest'
import { renderHook } from '@testing-library/react'

import { useOnVisible } from './useOnVisible.js'

function setVisibility(state) {
  Object.defineProperty(document, 'visibilityState', { configurable: true, get: () => state })
  document.dispatchEvent(new Event('visibilitychange'))
}

afterEach(() => setVisibility('visible'))

describe('useOnVisible', () => {
  it('llama al volver a la pestana, no al ocultarla', () => {
    const callback = vi.fn()
    renderHook(() => useOnVisible(callback))

    setVisibility('hidden')
    expect(callback).not.toHaveBeenCalled()
    setVisibility('visible')
    expect(callback).toHaveBeenCalledTimes(1)
  })

  it('usa el callback MAS reciente sin reinstalar el listener', () => {
    const first = vi.fn()
    const second = vi.fn()
    const { rerender } = renderHook(({ cb }) => useOnVisible(cb), { initialProps: { cb: first } })
    rerender({ cb: second })

    setVisibility('visible')

    expect(first).not.toHaveBeenCalled()
    expect(second).toHaveBeenCalledTimes(1)
  })

  it('con enabled=false no escucha, y al desmontar deja de escuchar', () => {
    const callback = vi.fn()
    const { rerender, unmount } = renderHook(({ enabled }) => useOnVisible(callback, { enabled }), {
      initialProps: { enabled: false },
    })
    setVisibility('visible')
    expect(callback).not.toHaveBeenCalled()

    rerender({ enabled: true })
    unmount()
    setVisibility('visible')
    expect(callback).not.toHaveBeenCalled()
  })
})
