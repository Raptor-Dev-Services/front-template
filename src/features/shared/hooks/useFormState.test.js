import { describe, it, expect, vi } from 'vitest'
import { renderHook, act, waitFor } from '@testing-library/react'

import { useFormState } from './useFormState.js'

// Riesgo que cubre este archivo: `useFormState` es el esqueleto de todos los formularios.
// Sus cuatro garantias no se ven leyendo un componente que lo usa -son justo lo que se olvidaba al
// reescribir la maquina a mano en cada feature-, y una regresion aqui se manifiesta como un registro
// duplicado o un error que sobrevive a la correccion.

const REQUERIDO = 'requerido'

function renderForm(overrides = {}) {
  return renderHook((props) => useFormState(props), {
    initialProps: {
      initialValues: { nombre: '', monto: '' },
      validators: { nombre: (v) => (v.nombre.trim() ? null : REQUERIDO) },
      ...overrides,
    },
  })
}

describe('useFormState', () => {
  it('no envia y marca el error del campo cuando la validacion falla', async () => {
    const action = vi.fn()
    const { result } = renderForm()

    let devuelto
    await act(async () => {
      devuelto = await result.current.submit(action)
    })

    expect(action).not.toHaveBeenCalled()
    expect(devuelto).toEqual({ ok: false })
    expect(result.current.errors.nombre).toBe(REQUERIDO)
  })

  it('limpia el error del campo en cuanto se escribe', async () => {
    const { result } = renderForm()

    await act(async () => {
      await result.current.submit(vi.fn())
    })
    expect(result.current.errors.nombre).toBe(REQUERIDO)

    act(() => result.current.setField('nombre', 'Ana'))

    // Sin esto el usuario corrige y sigue viendo el error viejo hasta reenviar.
    expect(result.current.errors.nombre).toBeUndefined()
  })

  it('deja el message del servidor en submitError y lo limpia al tocar cualquier campo', async () => {
    const { result } = renderForm()
    act(() => result.current.setField('nombre', 'Ana'))

    await act(async () => {
      await result.current.submit(async () => ({ ok: false, message: 'Ya existe ese nombre' }))
    })
    expect(result.current.submitError).toBe('Ya existe ese nombre')

    act(() => result.current.setField('monto', '10'))

    // Un mensaje del servidor que sobrevive a la correccion parece que la correccion no sirvio.
    expect(result.current.submitError).toBeNull()
  })

  it('usa fallbackError solo cuando el backend no manda message', async () => {
    const { result } = renderForm()
    act(() => result.current.setField('nombre', 'Ana'))

    await act(async () => {
      await result.current.submit(async () => ({ ok: false }), { fallbackError: 'No se pudo guardar' })
    })

    expect(result.current.submitError).toBe('No se pudo guardar')
  })

  it('ignora un segundo envio mientras el primero sigue en vuelo', async () => {
    // La guarda de verdad no es el boton deshabilitado: un doble clic rapido llega al backend
    // antes de que React repinte, y sin esta guarda crea el registro dos veces.
    let resolver
    const action = vi.fn(() => new Promise((resolve) => { resolver = resolve }))
    const { result } = renderForm()
    act(() => result.current.setField('nombre', 'Ana'))

    let segundo
    await act(async () => {
      const primero = result.current.submit(action)
      segundo = await result.current.submit(action)
      resolver({ ok: true })
      await primero
    })

    expect(action).toHaveBeenCalledTimes(1)
    expect(segundo).toEqual({ ok: false })
    await waitFor(() => expect(result.current.submitting).toBe(false))
  })

  it('reinicia valores, errores y error de envio cuando cambia resetKey', async () => {
    const { result, rerender } = renderHook((props) => useFormState(props), {
      initialProps: {
        initialValues: { nombre: 'Ana' },
        validators: {},
        resetKey: 'registro-1',
      },
    })

    act(() => result.current.setField('nombre', 'editado a medias'))
    await act(async () => {
      await result.current.submit(async () => ({ ok: false, message: 'fallo' }))
    })
    expect(result.current.submitError).toBe('fallo')

    // Reabrir el modal para OTRO registro: sin reinicio el usuario veria los datos del anterior.
    rerender({ initialValues: { nombre: 'Luis' }, validators: {}, resetKey: 'registro-2' })

    expect(result.current.values).toEqual({ nombre: 'Luis' })
    expect(result.current.submitError).toBeNull()
    expect(result.current.submitting).toBe(false)
  })

  it('libera submitting aunque la accion lance', async () => {
    const { result } = renderForm()
    act(() => result.current.setField('nombre', 'Ana'))

    await act(async () => {
      await expect(
        result.current.submit(async () => {
          throw new Error('cayo la red')
        }),
      ).rejects.toThrow('cayo la red')
    })

    // Si `submitting` se quedara en true, el formulario quedaria inservible tras un fallo de red.
    expect(result.current.submitting).toBe(false)
  })
})
