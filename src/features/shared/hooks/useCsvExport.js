import { useCallback, useState } from 'react'
import { extractApiErrorMessage } from '../../../api/client.js'
import { buildCsvContent, buildCsvFileName, downloadCsv } from '../../../utils/csv.js'

const EXPORT_PAGE_SIZE = 200

/**
 * Exporta TODAS las filas de un listado paginado a CSV, repitiendo la misma consulta con el mismo
 * filtro pagina por pagina hasta agotarlas (regla server-side-data-boundaries: el filtro y el orden
 * viven en el servidor, exportar no puede ser distinto). Nunca exporta solo la pagina en pantalla.
 *
 * `fetchPage(page, pageSize)` devuelve `{ items, total }` aplicando el MISMO filtro que la pantalla.
 * `columns` es `[{ key, header, format? }]` con los encabezados ya traducidos (ver utils/csv.js).
 */
export function useCsvExport({ fetchPage, columns, reportName, locale }) {
  const [exporting, setExporting] = useState(false)
  const [error, setError] = useState(null)

  const exportAll = useCallback(async () => {
    setExporting(true)
    setError(null)
    try {
      const rows = []
      let page = 1
      let total = Infinity
      while (rows.length < total) {
        const { items, total: pageTotal } = await fetchPage(page, EXPORT_PAGE_SIZE)
        if (!items || items.length === 0) break // pagina vacia: no sigas pidiendo de mas
        rows.push(...items)
        total = Number.isFinite(pageTotal) ? pageTotal : rows.length
        page += 1
      }
      const content = buildCsvContent(rows, columns, { locale })
      downloadCsv(content, buildCsvFileName(reportName))
    } catch (err) {
      setError(extractApiErrorMessage(err))
    } finally {
      setExporting(false)
    }
  }, [fetchPage, columns, reportName, locale])

  return { exportAll, exporting, error }
}

export default useCsvExport
