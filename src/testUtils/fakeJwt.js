// fakeJwt - arma un JWT de prueba (sin firma valida: el front nunca la verifica). Codifica el payload
// como UTF-8 real, igual que el backend, para que las pruebas cubran claims con acentos y enes.
// Solo para pruebas: ningun modulo de la app lo importa.

function base64url(text) {
  const bytes = new TextEncoder().encode(text)
  let binary = ''
  for (const byte of bytes) binary += String.fromCharCode(byte)
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

export function fakeJwt(payload) {
  return `${base64url(JSON.stringify({ alg: 'none', typ: 'JWT' }))}.${base64url(JSON.stringify(payload))}.sinfirma`
}

/** exp (en segundos) a `minutes` minutos de ahora; negativo para un token ya vencido. */
export function expIn(minutes) {
  return Math.floor(Date.now() / 1000) + Math.round(minutes * 60)
}
