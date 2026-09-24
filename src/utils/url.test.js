import { describe, it, expect } from 'vitest'

import { safeExternalUrl } from './url.js'

// safeExternalUrl solo debe dejar pasar http/https (URLs que vienen de datos, no del codigo):
// cualquier otro esquema o entrada invalida devuelve null para no renderizar el enlace.
describe('safeExternalUrl', () => {
  it('safeExternalUrl_httpUrl_returnsUrl', () => {
    // Act
    const result = safeExternalUrl('http://example.com')

    // Assert
    expect(result).toBe('http://example.com')
  })

  it('safeExternalUrl_httpsUrl_returnsUrl', () => {
    // Act
    const result = safeExternalUrl('https://example.com/tienda')

    // Assert
    expect(result).toBe('https://example.com/tienda')
  })

  it('safeExternalUrl_surroundingWhitespace_returnsTrimmedUrl', () => {
    // Act
    const result = safeExternalUrl('   https://example.com/tienda   ')

    // Assert
    expect(result).toBe('https://example.com/tienda')
  })

  it('safeExternalUrl_javascriptScheme_returnsNull', () => {
    // Act + Assert: vector XSS clasico en un href.
    expect(safeExternalUrl('javascript:alert(1)')).toBeNull()
  })

  it.each([
    ['data:text/html,<script>alert(1)</script>'],
    ['vbscript:msgbox(1)'],
    ['ftp://files.example.com/archivo'],
    ['file:///etc/passwd'],
    ['mailto:staff@example.com'],
  ])('safeExternalUrl_nonHttpScheme_returnsNull (%s)', (value) => {
    // Act + Assert
    expect(safeExternalUrl(value)).toBeNull()
  })

  it.each([
    [null],
    [undefined],
    [123],
    [{}],
    [[]],
    [''],
    ['   '],
  ])('safeExternalUrl_invalidInput_returnsNull (%s)', (value) => {
    // Act + Assert
    expect(safeExternalUrl(value)).toBeNull()
  })
})
