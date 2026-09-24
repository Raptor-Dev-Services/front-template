import { useEffect, useEffectEvent } from 'react'
import {
  CheckCircleIcon,
  ExclamationCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline'
import { useI18n } from '../i18n/useI18n.js'
import { cx } from '../styles/designSystem.js'

// AppNotification - aviso flotante (toast) con el RESULTADO de una operacion: "se guardo", "no se pudo".
// No sustituye a los estados de una vista (DataError) ni al error de un formulario (en linea): es para
// lo que pasa DESPUES de que el usuario hizo algo.
//
//  - Tipo success/info: role="status" (el lector lo anuncia sin interrumpir).
//  - Tipo error/warning: role="alert" (interrumpe: algo no salio como el usuario esperaba).
//  - El icono acompana al color: el tipo nunca se comunica solo con color.
//  - Se auto-oculta a los `autoHideMs`; un error se queda hasta que lo cierran (no se lee en 4 segundos
//    y no se puede recuperar).
//
// `notification` = { id, type: 'success' | 'error' | 'warning' | 'info', title?, message }. Cambiar el
// `id` reinicia el temporizador aunque el texto sea el mismo.

const VARIANT = {
  success: { Icon: CheckCircleIcon, iconClass: 'text-success', role: 'status' },
  info: { Icon: InformationCircleIcon, iconClass: 'text-info', role: 'status' },
  warning: { Icon: ExclamationTriangleIcon, iconClass: 'text-warning', role: 'alert' },
  error: { Icon: ExclamationCircleIcon, iconClass: 'text-error', role: 'alert' },
}

export function AppNotification({ notification, onClose, autoHideMs = 4500 }) {
  const { t } = useI18n()
  const variant = VARIANT[notification?.type] ?? VARIANT.info
  const sticky = notification?.type === 'error'

  // useEffectEvent: el temporizador llama al onClose MAS reciente sin que un onClose nuevo por render
  // (una flecha en linea) lo reinicie en cada pintado, que era el defecto de la primera version.
  const close = useEffectEvent(() => onClose?.())

  useEffect(() => {
    if (!notification || sticky) return undefined
    const timer = setTimeout(close, autoHideMs)
    return () => clearTimeout(timer)
  }, [notification, sticky, autoHideMs])

  if (!notification) return null
  const { Icon } = variant

  return (
    <div
      aria-label={t('notification.region')}
      className="pointer-events-none fixed inset-x-4 bottom-4 z-[70] flex justify-end sm:inset-x-auto sm:right-4"
    >
      <div
        role={variant.role}
        className="pointer-events-auto w-full max-w-sm rounded-xl border border-border bg-surface-raised shadow-lg"
      >
        <div className="flex gap-3 p-4">
          <Icon aria-hidden="true" className={cx('mt-0.5 size-5 shrink-0', variant.iconClass)} />
          <div className="min-w-0 flex-1 text-sm">
            {notification.title ? <p className="font-semibold text-content">{notification.title}</p> : null}
            {notification.message ? <p className="text-muted">{notification.message}</p> : null}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label={t('notification.close')}
            className="-m-1 inline-flex size-8 shrink-0 items-center justify-center rounded-md text-muted transition-colors duration-150 hover:bg-surface-muted hover:text-content"
          >
            <XMarkIcon aria-hidden="true" className="size-4" />
          </button>
        </div>
      </div>
    </div>
  )
}

export default AppNotification
