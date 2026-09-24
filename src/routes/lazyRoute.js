import { lazy } from 'react'
import { markChunkLoaded, recoverFromStaleChunk } from '../utils/chunkRecovery.js'

const NEVER = () => new Promise(() => {})

/**
 * `React.lazy` con recuperacion de chunks viejos tras un despliegue (ver utils/chunkRecovery.js).
 * Usalo para toda ruta diferida en lugar de `lazy` a secas.
 *
 * - Carga bien -> rearma el seguro y devuelve el modulo.
 * - Falla -> recarga una vez; mientras la pagina se va, la promesa NO se resuelve ni rechaza (resolverla
 *   alcanzaria a pintar algo que desaparece en un parpadeo). Si ya se recargo, el error se propaga al
 *   ErrorBoundary, que lo muestra con su mensaje tecnico.
 * - Modulo vacio -> es el caso en que el handler de `vite:preloadError` ya disparo la recarga y cancelo
 *   el error: se espera igual.
 */
export function lazyRoute(importer) {
  return lazy(() =>
    importer().then(
      (module) => {
        if (!module) return NEVER()
        markChunkLoaded()
        return module
      },
      (error) => {
        if (recoverFromStaleChunk()) return NEVER()
        throw error
      },
    ),
  )
}

export default lazyRoute
