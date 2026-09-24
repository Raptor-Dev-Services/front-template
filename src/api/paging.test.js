import { describe, it, expect, vi } from 'vitest'

import { fetchAllPages } from './paging.js'

// El helper que cierra un defecto recurrente: un catalogo consumido como si estuviera completo cuando
// solo se pidio una pagina. Lo que no cabia desaparecia sin error.

function page(items, total) {
  return { items, total }
}

const fila = (i) => ({ id: i })
const llena = (desde) => Array.from({ length: 100 }, (_, k) => fila(desde + k))

describe('fetchAllPages', () => {
  it('recorre hasta traer el catalogo completo', async () => {
    const fetchPage = vi
      .fn()
      .mockResolvedValueOnce(page(llena(1), 143))
      .mockResolvedValueOnce(page(llena(101).slice(0, 43), 143))

    const result = await fetchAllPages(fetchPage)

    expect(result.items).toHaveLength(143)
    expect(result.truncated).toBe(false)
    expect(fetchPage).toHaveBeenCalledTimes(2)
    expect(fetchPage.mock.calls[1][0]).toBe(2)
  })

  it('con una sola pagina no pide una segunda', async () => {
    const fetchPage = vi.fn().mockResolvedValue(page([fila(1)], 1))

    await fetchAllPages(fetchPage)

    expect(fetchPage).toHaveBeenCalledTimes(1)
  })

  it('para si el servidor manda un total inflado, en vez de girar en vano', async () => {
    const fetchPage = vi.fn().mockResolvedValue(page([fila(1)], 5000))

    const result = await fetchAllPages(fetchPage)

    expect(fetchPage).toHaveBeenCalledTimes(1)
    expect(result.truncated).toBe(true)
  })

  it('marca truncated al llegar al tope, en vez de callar lo que falta', async () => {
    const fetchPage = vi.fn().mockResolvedValue(page(llena(1), 99999))

    const result = await fetchAllPages(fetchPage)

    expect(fetchPage).toHaveBeenCalledTimes(20)
    expect(result.truncated).toBe(true)
  })

  it('respeta el tamano de pagina que se le pide', async () => {
    const fetchPage = vi.fn().mockResolvedValue(page([fila(1)], 1))

    await fetchAllPages(fetchPage, 25)

    expect(fetchPage).toHaveBeenCalledWith(1, 25)
  })
})
