import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen } from '@testing-library/react'

import { ErrorBoundary } from './ErrorBoundary.jsx'
import { LOCALE_STORAGE_KEY } from '../i18n/locale.js'

// Lo que la regla `error-screens` exige, una garantia por prueba: un error de render no deja pantalla
// en blanco, muestra el mensaje tecnico real y siempre da una salida.

function Bomba() {
  throw new Error('boom de prueba')
}

describe('ErrorBoundary', () => {
  afterEach(() => {
    vi.restoreAllMocks()
    localStorage.clear()
  })

  it('sin error, pinta a los hijos tal cual', () => {
    render(
      <ErrorBoundary>
        <p>contenido normal</p>
      </ErrorBoundary>,
    )
    expect(screen.getByText('contenido normal')).toBeInTheDocument()
  })

  it('con un error de render, muestra el mensaje TECNICO real, no uno generico', () => {
    vi.spyOn(console, 'error').mockImplementation(() => {})
    render(
      <ErrorBoundary>
        <Bomba />
      </ErrorBoundary>,
    )
    expect(screen.getByRole('alert')).toHaveTextContent('boom de prueba')
  })

  it('siempre hay una salida: un boton', () => {
    vi.spyOn(console, 'error').mockImplementation(() => {})
    render(
      <ErrorBoundary>
        <Bomba />
      </ErrorBoundary>,
    )
    expect(screen.getByRole('button', { name: 'Recargar pagina' })).toBeInTheDocument()
  })

  it('funciona SIN I18nProvider: es la red para cuando el propio provider falla', () => {
    // Montado a pelo, sin ningun provider: si dependiera de useI18n, este render lanzaria.
    vi.spyOn(console, 'error').mockImplementation(() => {})
    localStorage.setItem(LOCALE_STORAGE_KEY, 'en')
    render(
      <ErrorBoundary>
        <Bomba />
      </ErrorBoundary>,
    )
    expect(screen.getByRole('button', { name: 'Reload page' })).toBeInTheDocument()
  })

  it('avisa hacia arriba con el error, para poder loguearlo', () => {
    vi.spyOn(console, 'error').mockImplementation(() => {})
    const onError = vi.fn()
    render(
      <ErrorBoundary onError={onError}>
        <Bomba />
      </ErrorBoundary>,
    )
    expect(onError).toHaveBeenCalledTimes(1)
    expect(onError.mock.calls[0][0].message).toBe('boom de prueba')
  })

  it('una excepcion que no es Error cae al texto por defecto', () => {
    vi.spyOn(console, 'error').mockImplementation(() => {})
    function LanzaTexto() {
      throw 'no es un Error'
    }
    render(
      <ErrorBoundary>
        <LanzaTexto />
      </ErrorBoundary>,
    )
    expect(screen.getByRole('alert')).toHaveTextContent('Error sin detalle disponible.')
  })
})
