// jwt.js - decodificacion del payload de un JWT (base64url) para que la UI lea claims.
//
// NO valida firma ni expiracion: la autoridad real de cada request es el backend; esto es solo para
// pintar el nombre del usuario y armar guardas/menus.
//
// La vuelta por decodeURIComponent NO es decorativa: `atob` devuelve una cadena BINARIA (un caracter
// por byte), asi que un claim con acentos o enes ("Jose Munoz" con tilde) sale como mojibake si se pasa
// directo a JSON.parse. Se reconstruyen los bytes como %XX y se decodifican como UTF-8.
export function decodeJwtPayload(token) {
  try {
    const payloadSegment = String(token).split('.')[1]
    if (!payloadSegment) return null
    const base64 = payloadSegment.replace(/-/g, '+').replace(/_/g, '/')
    const padded = base64 + '='.repeat((4 - (base64.length % 4)) % 4)
    const json = decodeURIComponent(
      atob(padded)
        .split('')
        .map((char) => `%${char.charCodeAt(0).toString(16).padStart(2, '0')}`)
        .join(''),
    )
    const payload = JSON.parse(json)
    return payload && typeof payload === 'object' ? payload : null
  } catch {
    return null
  }
}

export default decodeJwtPayload
