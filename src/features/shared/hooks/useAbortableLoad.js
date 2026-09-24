import { useEffect } from 'react'

/**
 * Corre `load(signal)` en un efecto y ABORTA la peticion en vuelo cuando el efecto se vuelve a ejecutar
 * (cambio de pagina o de filtro) o cuando el componente se desmonta.
 *
 * Por que un flag booleano no basta: sin cancelar, dos peticiones de la misma lista pueden estar en
 * vuelo a la vez y resolver fuera de orden; la vieja llega al final, sobrescribe el estado y la vista
 * muestra el resultado de una consulta que el usuario ya reemplazo. `AbortController` corta de verdad.
 *
 * El `load` debe venir de un `useCallback` con sus dependencias: su identidad es el disparador. Y su
 * `catch` debe ignorar la cancelacion con `isAbortError` (src/api/client.js), o abortar deja la vista
 * en error. Las recargas explicitas (tras mutar, el boton de reintento) llaman a `load()` sin senal.
 */
export function useAbortableLoad(load) {
  useEffect(() => {
    const controller = new AbortController()
    load(controller.signal)
    return () => controller.abort()
  }, [load])
}

export default useAbortableLoad
