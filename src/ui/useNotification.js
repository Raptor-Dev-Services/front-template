import { useCallback, useState } from 'react'

let sequence = 0

/**
 * Estado de un AppNotification: `notify(type, message, title?)` y `dismiss()`. Cada aviso lleva un id
 * nuevo, asi que repetir el mismo texto (dos guardados seguidos) reinicia el temporizador en vez de
 * quedarse "pegado".
 *
 *   const { notification, notify, dismiss } = useNotification()
 *   notify('success', t('users.edit.done', { name }))
 *   <AppNotification notification={notification} onClose={dismiss} />
 */
export function useNotification() {
  const [notification, setNotification] = useState(null)

  const notify = useCallback((type, message, title) => {
    sequence += 1
    setNotification({ id: sequence, type, message, title })
  }, [])

  const dismiss = useCallback(() => setNotification(null), [])

  return { notification, notify, dismiss }
}

export default useNotification
