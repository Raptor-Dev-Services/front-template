import { useCallback, useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { listUsers, updateUser, disableUser } from '../../../api/users.js'
import { extractApiErrorMessage, isAbortError } from '../../../api/client.js'
import { LOAD_STATUS } from '../../../utils/loadStatus.js'
import { useAbortableLoad } from '../../shared/hooks/useAbortableLoad.js'
import { useOnVisible } from '../../shared/hooks/useOnVisible.js'

export const USERS_PAGE_SIZE = 20

/**
 * La pagina vive en la URL (?page=3), no en useState (regla url-state): recargar o compartir el enlace
 * abre la misma pagina. La URL es entrada de usuario, asi que se valida con caida al default, y el
 * default no se escribe (la primera pagina es /users, no /users?page=1).
 */
export function parsePage(raw) {
  const page = Number.parseInt(raw ?? '', 10)
  return Number.isInteger(page) && page >= 1 ? page : 1
}

/**
 * Estado y acciones del listado de usuarios. La paginacion la resuelve el SERVIDOR (regla
 * server-side-data-boundaries): se manda page/pageSize y `totalPages` sale del `total` del servidor,
 * nunca del largo de la pagina.
 *
 * Las acciones (editar, dar de baja) devuelven `{ ok, message }` y NUNCA lanzan, para que la UI muestre
 * el mensaje del backend sin sustituirlo. Tras cada mutacion se recarga la lista.
 */
export function useUsers() {
  const [searchParams, setSearchParams] = useSearchParams()
  const page = parsePage(searchParams.get('page'))

  const [status, setStatus] = useState(LOAD_STATUS.loading)
  const [error, setError] = useState(null)
  const [items, setItems] = useState([])
  const [total, setTotal] = useState(0)

  const totalPages = Math.max(1, Math.ceil(total / USERS_PAGE_SIZE))

  const goToPage = useCallback(
    (next) => {
      setSearchParams(
        (params) => {
          const copy = new URLSearchParams(params)
          if (next <= 1) copy.delete('page')
          else copy.set('page', String(next))
          return copy
        },
        // Paginar apila en el historial: "atras" vuelve a la pagina anterior, no sale del modulo.
        { replace: false },
      )
    },
    [setSearchParams],
  )

  // Descarta respuestas viejas tambien en las recargas SIN senal (tras mutar, al volver a la pestana):
  // la cancelacion solo cubre las que dispara el efecto.
  const requestId = useRef(0)

  const load = useCallback(
    async (signal) => {
      const currentId = ++requestId.current
      setStatus(LOAD_STATUS.loading)
      setError(null)
      try {
        const result = await listUsers({ page, pageSize: USERS_PAGE_SIZE, signal })
        if (currentId !== requestId.current) return
        // Se pidio una pagina que ya no existe (se dio de baja al ultimo de la ultima pagina, o alguien
        // tecleo ?page=99): se salta a la ultima que si existe en vez de pintar un "no hay usuarios"
        // falso con el padron entero una pagina atras.
        const lastPage = Math.max(1, Math.ceil(result.total / USERS_PAGE_SIZE))
        if (result.items.length === 0 && page > lastPage) {
          setSearchParams(
            (params) => {
              const copy = new URLSearchParams(params)
              if (lastPage <= 1) copy.delete('page')
              else copy.set('page', String(lastPage))
              return copy
            },
            { replace: true },
          )
          return
        }
        setItems(result.items)
        setTotal(result.total)
        setStatus(LOAD_STATUS.success)
      } catch (err) {
        // Cancelada: no es un fallo, y el efecto que la reemplazo ya puso loading.
        if (isAbortError(err) || currentId !== requestId.current) return
        setError(extractApiErrorMessage(err))
        setStatus(LOAD_STATUS.error)
      }
    },
    [page, setSearchParams],
  )

  useAbortableLoad(load)
  // Al volver a la pestana se recarga: otra persona pudo editar o dar de baja mientras tanto. Solo con
  // la vista en exito; en error, el usuario ya tiene su boton de reintentar.
  useOnVisible(() => load(), { enabled: status === LOAD_STATUS.success })

  const runAction = useCallback(
    async (action) => {
      try {
        await action()
        await load()
        return { ok: true }
      } catch (err) {
        return { ok: false, message: extractApiErrorMessage(err) }
      }
    },
    [load],
  )

  const edit = useCallback((publicId, payload) => runAction(() => updateUser(publicId, payload)), [runAction])
  const disable = useCallback((publicId) => runAction(() => disableUser(publicId)), [runAction])

  return {
    status,
    error,
    items,
    total,
    page,
    totalPages,
    goToPage,
    // `onClick={retry}` pasaria el evento de clic donde va el AbortSignal: se envuelve para descartarlo.
    retry: () => load(),
    actions: { edit, disable },
  }
}

export default useUsers
