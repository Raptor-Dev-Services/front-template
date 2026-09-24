// chunkRecovery.js - recuperarse de un chunk que ya no existe tras un despliegue (regla
// client-version-skew del catalogo).
//
// Un build parte la app en archivos con hash y los sirve como `immutable`; al desplegar, los de la
// version anterior DESAPARECEN. Quien ya tenia la app abierta sigue con el index.html viejo, y en
// cuanto navega a una ruta diferida que aun no habia cargado pide un archivo que ya no esta. No da
// error en el servidor: el usuario ve "se queda cargando".
//
// La salida es recargar UNA vez: la recarga trae el index.html nuevo con los nombres nuevos.
//  - La marca se pone ANTES de recargar, o el bucle es infinito.
//  - Se limpia al primer chunk que carga bien, o el siguiente despliegue ya no se podria recuperar.
//  - Vive en sessionStorage (por pestana): una pestana que ya recargo no le gasta el intento a otras.
//  - Si tras recargar vuelve a fallar ya no es un archivo viejo: es una falla real y se propaga.

export const STALE_CHUNK_FLAG = 'app_stale_chunk_reload'

function tabStorage() {
  try {
    return window.sessionStorage
  } catch {
    return null
  }
}

/**
 * Intenta recuperarse recargando. Devuelve true si disparo la recarga (el llamador NO debe resolver
 * nada: la pagina se esta yendo) y false si ya lo intento en esta pestana o no puede guardar la marca
 * (sin marca no hay seguro contra el bucle, asi que no se recarga).
 */
export function recoverFromStaleChunk({ storage = tabStorage(), reload = () => window.location.reload() } = {}) {
  if (!storage) return false
  try {
    if (storage.getItem(STALE_CHUNK_FLAG)) return false
    storage.setItem(STALE_CHUNK_FLAG, String(Date.now()))
  } catch {
    return false
  }
  reload()
  return true
}

/** Un chunk cargo bien: se rearma el seguro para el proximo despliegue. */
export function markChunkLoaded({ storage = tabStorage() } = {}) {
  try {
    storage?.removeItem(STALE_CHUNK_FLAG)
  } catch {
    // no-op
  }
}

/**
 * Vite dispara `vite:preloadError` cuando falla la precarga de un chunk diferido en el build. Si se
 * dispara la recarga se cancela el evento para que el error no se propague a medio irse la pagina.
 */
export function installPreloadErrorHandler(target = window, options) {
  const handler = (event) => {
    if (recoverFromStaleChunk(options)) event.preventDefault()
  }
  target.addEventListener('vite:preloadError', handler)
  return () => target.removeEventListener('vite:preloadError', handler)
}
