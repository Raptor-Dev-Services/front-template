import { useEffect, useEffectEvent } from 'react'

/**
 * Llama a `callback` cuando la pestana vuelve a estar visible (regla browser-tab-lifecycle).
 *
 * Mientras la pestana esta oculta el navegador estrangula los temporizadores y cualquier canal en vivo
 * pudo caerse, asi que lo que se ve puede estar viejo sin ninguna senal. Volver a mirar la pestana es
 * la senal mas barata de que hay alguien delante otra vez: es el momento de recargar.
 *
 * `callback` puede cambiar en cada render sin reinstalar el listener (useEffectEvent). `enabled` en
 * false lo apaga, p. ej. mientras la vista esta en error y el usuario tiene su propio boton de reintentar.
 */
export function useOnVisible(callback, { enabled = true } = {}) {
  const onVisible = useEffectEvent(() => callback())

  useEffect(() => {
    if (!enabled) return undefined
    const handler = () => {
      if (document.visibilityState === 'visible') onVisible()
    }
    document.addEventListener('visibilitychange', handler)
    return () => document.removeEventListener('visibilitychange', handler)
  }, [enabled])
}

export default useOnVisible
