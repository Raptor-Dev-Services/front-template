// paging.js - recorrer un listado paginado hasta tenerlo COMPLETO.
//
// Existe por un defecto que se repite siempre igual: una pantalla consume un catalogo como si lo
// tuviera entero -alimenta un desplegable, o se filtra en el cliente- pero pide UNA pagina grande y
// descarta el `total`. Lo que no cabe desaparece sin error y sin aviso, y quien busca algo
// que si existe no puede distinguirlo de algo que no existe (regla server-side-data-boundaries: es un
// problema de CORRECTITUD, no de rendimiento).
//
// Filtrar en el cliente solo es legitimo sobre un conjunto que el cliente tiene COMPLETO; esta funcion es
// lo que hace cierta esa condicion.

/** Paginas maximas a recorrer. Tope de seguridad, no un limite de negocio: ver `truncated`. */
const MAX_PAGES = 20

/**
 * Trae todas las paginas de un listado.
 *
 * @param {(page: number, pageSize: number) => Promise<{ items: any[], total: number }>} fetchPage
 *   Pide UNA pagina. Debe devolver el envelope ya resuelto y normalizado a { items, total }.
 * @param {number} [pageSize] Tamano de pagina a pedir.
 * @returns {Promise<{ items: any[], total: number, truncated: boolean }>}
 *   `truncated` en true significa que se alcanzo el tope de paginas: quien lo reciba debe DECIRLO en
 *   pantalla en vez de callarlo, que es el defecto que esta funcion existe para cerrar.
 */
export async function fetchAllPages(fetchPage, pageSize = 100) {
  const items = []
  let total = 0

  for (let page = 1; page <= MAX_PAGES; page += 1) {
    const chunk = await fetchPage(page, pageSize)
    total = chunk.total
    items.push(...chunk.items)

    // Se corta tambien si la pagina vino incompleta: sin eso, un `total` inflado por el servidor
    // dispararia veinte peticiones que no traen nada.
    if (items.length >= total || chunk.items.length < pageSize) break
  }

  return { items, total, truncated: items.length < total }
}

export default fetchAllPages
