import { useEffect, useState } from 'react'

/**
 * Devuelve `value` con retardo: solo se propaga cuando pasan `delayMs` sin que vuelva a cambiar. Sirve
 * para no disparar una peticion por tecla en un buscador.
 *
 * OJO con lo que NO hace: bajar la frecuencia de las peticiones no ORDENA sus respuestas. Dos busquedas
 * pueden seguir en vuelo y resolver al reves; eso lo resuelve la cancelacion (`useAbortableLoad`). Los
 * dos se usan juntos.
 */
export function useDebouncedValue(value, delayMs) {
  const [debounced, setDebounced] = useState(value)

  useEffect(() => {
    const handle = setTimeout(() => setDebounced(value), delayMs)
    return () => clearTimeout(handle)
  }, [value, delayMs])

  return debounced
}

export default useDebouncedValue
