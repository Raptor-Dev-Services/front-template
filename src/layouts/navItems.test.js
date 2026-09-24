import { describe, it, expect, vi } from 'vitest'

import { NAV_ITEMS, filterNavItems } from './navItems.js'
import { PERMISSIONS } from '../auth/permissions.js'
import { messages } from '../i18n/messages.js'

describe('filterNavItems', () => {
  const items = [
    { key: 'libre' },
    { key: 'con-permiso', permission: 'x.read' },
    { key: 'otro', permission: 'y.read' },
  ]

  it('un item sin permiso siempre se muestra', () => {
    expect(filterNavItems(items, () => false).map((i) => i.key)).toEqual(['libre'])
  })

  it('un item con permiso solo se muestra si la sesion lo tiene', () => {
    const can = vi.fn((p) => p === 'x.read')
    expect(filterNavItems(items, can).map((i) => i.key)).toEqual(['libre', 'con-permiso'])
    expect(can).toHaveBeenCalledWith('y.read')
  })
})

describe('NAV_ITEMS', () => {
  it('Usuarios exige el mismo permiso que su ruta', () => {
    expect(NAV_ITEMS.find((i) => i.key === 'users').permission).toBe(PERMISSIONS.usersRead)
  })

  it('cada item tiene su etiqueta en el diccionario', () => {
    for (const item of NAV_ITEMS) {
      const value = item.labelKey.split('.').reduce((n, p) => n?.[p], messages.es)
      expect(typeof value, item.labelKey).toBe('string')
    }
  })
})
