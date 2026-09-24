import { describe, it, expect, afterEach } from 'vitest'

import { translateMessage } from './translate.js'
import { readStoredLocale, persistLocale, LOCALE_STORAGE_KEY } from './locale.js'

describe('translateMessage', () => {
  afterEach(() => localStorage.clear())

  it('traduce una clave en el idioma pedido', () => {
    expect(translateMessage('common.retry', undefined, 'es')).toBe('Reintentar')
    expect(translateMessage('common.retry', undefined, 'en')).toBe('Try again')
  })

  it('interpola variables con {llave}', () => {
    expect(translateMessage('users.edit.done', { name: 'Ana' }, 'es')).toBe('Se actualizo a Ana.')
  })

  it('devuelve TAL CUAL un texto que no es clave, para dejar pasar el mensaje del backend', () => {
    expect(translateMessage('El correo ya esta registrado', undefined, 'en')).toBe('El correo ya esta registrado')
  })

  it('una clave que apunta a un nodo (no a un texto) no se pinta como [object Object]', () => {
    expect(translateMessage('common', undefined, 'es')).toBe('common')
  })

  it('sin idioma explicito usa el persistido', () => {
    persistLocale('en')
    expect(translateMessage('common.cancel')).toBe('Cancel')
  })
})

describe('readStoredLocale', () => {
  afterEach(() => localStorage.clear())

  it('ignora un idioma guardado que no esta soportado', () => {
    localStorage.setItem(LOCALE_STORAGE_KEY, 'klingon')
    expect(['es', 'en']).toContain(readStoredLocale())
    expect(readStoredLocale()).not.toBe('klingon')
  })

  it('persistLocale no guarda un idioma no soportado', () => {
    persistLocale('xx')
    expect(localStorage.getItem(LOCALE_STORAGE_KEY)).toBeNull()
  })
})
