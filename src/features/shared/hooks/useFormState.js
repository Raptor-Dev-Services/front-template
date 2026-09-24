import { useCallback, useRef, useState } from 'react'

/**
 * La maquina que repite todo formulario: valores, errores por campo, error de envio y la guarda de
 * doble envio. Lo que resuelve, y que es justo lo que se olvida al reescribirla:
 *
 *  - **Un solo envio en vuelo.** `submitting` deshabilita el boton, pero la guarda de verdad esta en
 *    `submit`, que sale si ya hay uno corriendo: un doble clic rapido llega al backend antes de que
 *    React repinte. La guarda va en un ref y no en el estado: dos llamadas en el MISMO tick leerian
 *    ambas `submitting=false` del mismo render; el ref se actualiza al instante.
 *  - **El error del campo se limpia al escribirlo**, y el error de envio en cuanto se toca algo: un
 *    mensaje que sobrevive a la correccion parece que la correccion no sirvio.
 *  - **Reinicio al reabrir.** Un modal que se reusa entre registros conserva el estado del anterior si
 *    nadie lo limpia; cambiar `resetKey` (el id que se edita, o `open`) lo reinicia. Se hace durante el
 *    render comparando con la clave anterior (patron de React para "ajustar estado cuando cambia una
 *    prop"), no en un efecto: asi no hay un pintado intermedio con los datos del registro viejo.
 *
 * `validators` es `{ campo: (valores) => mensaje | null }`. La validacion del cliente es UX: la de
 * seguridad la impone el backend.
 */
export function useFormState({ initialValues, validators = {}, resetKey } = {}) {
  const [values, setValues] = useState(initialValues)
  const [errors, setErrors] = useState({})
  const [submitError, setSubmitError] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [trackedKey, setTrackedKey] = useState(resetKey)
  const inFlight = useRef(false)

  if (resetKey !== trackedKey) {
    setTrackedKey(resetKey)
    setValues(initialValues)
    setErrors({})
    setSubmitError(null)
  }

  const setField = useCallback((name, value) => {
    setValues((prev) => ({ ...prev, [name]: value }))
    setErrors((prev) => (prev[name] ? { ...prev, [name]: undefined } : prev))
    setSubmitError(null)
  }, [])

  /** Valida todos los campos con `validators`. Devuelve true si no hay errores. */
  const validate = useCallback(() => {
    const next = {}
    for (const [name, check] of Object.entries(validators)) {
      const message = check(values)
      if (message) next[name] = message
    }
    setErrors(next)
    return Object.keys(next).length === 0
  }, [validators, values])

  /**
   * Valida y ejecuta `action(values)`, que devuelve `{ ok, message }`. Deja el `message` del servidor
   * en `submitError` cuando el backend rechaza. Si `action` lanza, libera `submitting` y relanza.
   */
  const submit = useCallback(
    async (action, { fallbackError } = {}) => {
      if (inFlight.current) return { ok: false }
      if (!validate()) return { ok: false }
      inFlight.current = true
      setSubmitting(true)
      setSubmitError(null)
      try {
        const result = await action(values)
        if (!result?.ok) setSubmitError(result?.message ?? fallbackError ?? null)
        return result ?? { ok: false }
      } finally {
        inFlight.current = false
        setSubmitting(false)
      }
    },
    [validate, values],
  )

  return { values, setValues, setField, errors, setErrors, submitError, setSubmitError, submitting, validate, submit }
}

export default useFormState
