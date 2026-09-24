/** Iniciales para el avatar de respaldo: hasta dos palabras, en mayuscula; '?' si no hay nombre. */
export function initials(name = '') {
  return (
    String(name ?? '')
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part[0]?.toLocaleUpperCase() ?? '')
      .join('') || '?'
  )
}

export default initials
