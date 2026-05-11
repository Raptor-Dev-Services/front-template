export function formatDate(isoString) {
  if (!isoString) return '—'
  try {
    const d = new Date(isoString)
    const pad = (n) => String(n).padStart(2, '0')
    return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}`
  } catch {
    return isoString
  }
}
