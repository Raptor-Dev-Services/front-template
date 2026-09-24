import { useCallback, useRef, useState } from 'react'
import { getMyAccount } from '../../../api/account.js'
import { extractApiErrorMessage, isAbortError } from '../../../api/client.js'
import { LOAD_STATUS } from '../../../utils/loadStatus.js'
import { useAbortableLoad } from '../../shared/hooks/useAbortableLoad.js'

/**
 * La cuenta de la sesion, con sus cuatro estados. `reload()` (sin senal) es para despues de cambiar algo
 * de la cuenta: activar o apagar el 2FA cambia lo que la pantalla debe ofrecer.
 */
export function useAccount() {
  const [status, setStatus] = useState(LOAD_STATUS.loading)
  const [error, setError] = useState(null)
  const [account, setAccount] = useState(null)
  const requestId = useRef(0)

  const load = useCallback(async (signal) => {
    const currentId = ++requestId.current
    setStatus(LOAD_STATUS.loading)
    setError(null)
    try {
      const result = await getMyAccount({ signal })
      if (currentId !== requestId.current) return
      setAccount(result)
      setStatus(LOAD_STATUS.success)
    } catch (err) {
      if (isAbortError(err) || currentId !== requestId.current) return
      setError(extractApiErrorMessage(err))
      setStatus(LOAD_STATUS.error)
    }
  }, [])

  useAbortableLoad(load)

  const reload = useCallback(() => load(), [load])

  return { status, error, account, reload }
}

export default useAccount
