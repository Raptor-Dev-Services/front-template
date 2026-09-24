import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen, act } from '@testing-library/react'

import { AppNotification } from './AppNotification.jsx'
import { I18nProvider } from '../i18n/I18nProvider.jsx'

function renderToast(props) {
  return render(
    <I18nProvider>
      <AppNotification {...props} />
    </I18nProvider>,
  )
}

describe('AppNotification', () => {
  afterEach(() => vi.useRealTimers())

  it('sin aviso no pinta nada', () => {
    const { container } = renderToast({ notification: null, onClose: () => {} })
    expect(container).toBeEmptyDOMElement()
  })

  it('un exito se anuncia como status y se oculta solo', () => {
    vi.useFakeTimers()
    const onClose = vi.fn()
    renderToast({ notification: { id: 1, type: 'success', message: 'Guardado' }, onClose, autoHideMs: 1000 })

    expect(screen.getByRole('status')).toHaveTextContent('Guardado')
    act(() => vi.advanceTimersByTime(1000))
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('un onClose nuevo en cada render NO reinicia el temporizador', () => {
    // El defecto de la primera version: con onClose en linea, cada render reprogramaba el timeout y un
    // componente que se repintaba seguido dejaba el aviso en pantalla para siempre.
    vi.useFakeTimers()
    const calls = []
    const notification = { id: 1, type: 'info', message: 'Hola' }
    const { rerender } = renderToast({ notification, onClose: () => calls.push(1), autoHideMs: 1000 })

    act(() => vi.advanceTimersByTime(600))
    rerender(
      <I18nProvider>
        <AppNotification notification={notification} onClose={() => calls.push(2)} autoHideMs={1000} />
      </I18nProvider>,
    )
    act(() => vi.advanceTimersByTime(400))

    expect(calls).toEqual([2])
  })

  it('un error interrumpe (role=alert) y se queda hasta que lo cierran', () => {
    vi.useFakeTimers()
    const onClose = vi.fn()
    renderToast({ notification: { id: 1, type: 'error', message: 'Fallo' }, onClose, autoHideMs: 1000 })

    expect(screen.getByRole('alert')).toHaveTextContent('Fallo')
    act(() => vi.advanceTimersByTime(10_000))
    expect(onClose).not.toHaveBeenCalled()

    act(() => screen.getByRole('button', { name: 'Cerrar aviso' }).click())
    expect(onClose).toHaveBeenCalledTimes(1)
  })
})
