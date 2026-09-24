import { describe, it, expect } from 'vitest'

import { buildCsvContent, buildCsvFileName } from './csv.js'

describe('buildCsvContent', () => {
  const columns = [
    { key: 'name', header: 'Nombre' },
    { key: 'amount', header: 'Monto', format: (cents) => (cents / 100).toFixed(2) },
  ]

  it('usa punto y coma para un locale es (la coma es el decimal)', () => {
    const content = buildCsvContent([{ name: 'Agua', amount: 1500 }], columns, { locale: 'es-MX' })
    expect(content).toContain('Nombre;Monto')
    expect(content).toContain('Agua;15.00')
  })

  it('usa coma para un locale no espanol', () => {
    const content = buildCsvContent([{ name: 'Agua', amount: 1500 }], columns, { locale: 'en-US' })
    expect(content).toContain('Nombre,Monto')
    expect(content).toContain('Agua,15.00')
  })

  it('empieza con el BOM UTF-8 para que Excel detecte los acentos', () => {
    expect(buildCsvContent([], columns, { locale: 'es' }).charCodeAt(0)).toBe(0xfeff)
  })

  it('escapa un valor con el separador, comillas o salto de linea', () => {
    const content = buildCsvContent([{ name: 'Agua; con gas', amount: 0 }], columns, { locale: 'es' })
    expect(content).toContain('"Agua; con gas"')
  })

  it('duplica las comillas internas', () => {
    const content = buildCsvContent([{ name: 'El "mejor"', amount: 0 }], columns, { locale: 'es' })
    expect(content).toContain('"El ""mejor"""')
  })

  it('trata null/undefined como celda vacia, nunca como el texto "null"', () => {
    const content = buildCsvContent([{ name: null, amount: undefined }], [{ key: 'name', header: 'N' }, { key: 'amount', header: 'M' }], {
      locale: 'es',
    })
    expect(content.split('\r\n')[1]).toBe(';')
  })
})

describe('buildCsvFileName', () => {
  it('agrega la fecha y hora local al nombre, con extension .csv', () => {
    expect(buildCsvFileName('usuarios', new Date(2026, 8, 24, 7, 5))).toBe('usuarios-20260924-0705.csv')
    expect(buildCsvFileName('users')).toMatch(/^users-\d{8}-\d{4}\.csv$/)
  })
})
