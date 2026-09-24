// csv.js - exportar datos a CSV para descargar en el navegador. Sin libreria: es texto plano, y el
// volumen de un panel (cientos o pocos miles de filas) no lo justifica. La plantilla usaba xlsx, que
// esta abandonado y con CVEs abiertas.
//
// El separador depende del locale: en `es-*` la coma es el separador DECIMAL, asi que Excel en espanol
// espera punto y coma entre campos; el resto usa coma.

function csvSeparator(locale) {
  return String(locale || '').toLowerCase().startsWith('es') ? ';' : ','
}

// Escapa una celda (RFC 4180): comillas si trae el separador, comillas o salto de linea; las comillas
// internas se duplican.
function escapeCell(value, separator) {
  const text = value === null || value === undefined ? '' : String(value)
  if (text.includes(separator) || text.includes('"') || text.includes('\n') || text.includes('\r')) {
    return `"${text.replace(/"/g, '""')}"`
  }
  return text
}

/**
 * Arma el contenido CSV (con BOM UTF-8, para que Excel no rompa los acentos) a partir de filas planas y
 * columnas `{ key, header, format? }`. `format(valorCrudo, fila)` devuelve el texto de la celda.
 */
export function buildCsvContent(rows, columns, { locale } = {}) {
  const separator = csvSeparator(locale)
  const header = columns.map((col) => escapeCell(col.header, separator)).join(separator)
  const lines = rows.map((row) =>
    columns
      .map((col) => escapeCell(col.format ? col.format(row[col.key], row) : row[col.key], separator))
      .join(separator),
  )
  const BOM = String.fromCharCode(0xfeff)
  return `${BOM}${[header, ...lines].join('\r\n')}`
}

/** Nombre de archivo `<reporte>-AAAAMMDD-HHmm.csv` con la fecha y hora LOCAL del navegador. */
export function buildCsvFileName(reportName, now = new Date()) {
  const pad = (value) => String(value).padStart(2, '0')
  const stamp = `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}-${pad(now.getHours())}${pad(now.getMinutes())}`
  return `${reportName}-${stamp}.csv`
}

/** Dispara la descarga (Blob + enlace temporal). */
export function downloadCsv(content, fileName) {
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = fileName
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}
