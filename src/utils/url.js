// url.js - saneo de URLs que vienen de DATOS antes de renderizarlas en un href.
//
// Seguridad: solo pasa http/https. Bloquea `javascript:`, `data:`, `vbscript:` y compania, que alguien
// podria guardar en un campo de URL y que, al hacer clic un usuario con sesion, se ejecutarian en el
// ORIGEN de esta app -el mismo donde vive su token-. Devuelve la URL si es segura, o null para no
// renderizar el enlace.
export function safeExternalUrl(value) {
  if (typeof value !== 'string') return null
  const trimmed = value.trim()
  if (trimmed === '') return null

  let parsed
  try {
    // La base resuelve relativas sin lanzar; lo que decide es el protocolo final.
    parsed = new URL(trimmed, window.location.origin)
  } catch {
    return null
  }
  return parsed.protocol === 'http:' || parsed.protocol === 'https:' ? trimmed : null
}

export default safeExternalUrl
