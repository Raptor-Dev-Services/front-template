import { useEffect } from 'react'
import {
  CheckCircleIcon,
  ExclamationCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline'

const VARIANT = {
  success: {
    icon: CheckCircleIcon,
    ring: 'ring-emerald-200',
    iconClass: 'text-emerald-500',
    titleClass: 'text-emerald-800',
    msgClass: 'text-emerald-700',
  },
  error: {
    icon: ExclamationCircleIcon,
    ring: 'ring-red-200',
    iconClass: 'text-red-500',
    titleClass: 'text-red-800',
    msgClass: 'text-red-700',
  },
  warning: {
    icon: ExclamationTriangleIcon,
    ring: 'ring-amber-200',
    iconClass: 'text-amber-500',
    titleClass: 'text-amber-800',
    msgClass: 'text-amber-700',
  },
  info: {
    icon: InformationCircleIcon,
    ring: 'ring-sky-200',
    iconClass: 'text-sky-500',
    titleClass: 'text-sky-800',
    msgClass: 'text-sky-700',
  },
}

export default function AppNotification({ notification, onClose, autoHideMs = 4500 }) {
  useEffect(() => {
    if (!notification) return
    const timer = setTimeout(onClose, autoHideMs)

    window.dispatchEvent(
      new CustomEvent('app-notification', { detail: notification })
    )

    return () => clearTimeout(timer)
  }, [notification, onClose, autoHideMs])

  if (!notification) return null

  const v = VARIANT[notification.type] ?? VARIANT.info
  const Icon = v.icon

  return (
    <div className="pointer-events-none fixed bottom-4 right-4 z-[70] w-full max-w-sm">
      <div className={`pointer-events-auto w-full rounded-lg bg-white shadow-lg ring-1 ${v.ring}`}>
        <div className="flex gap-3 p-4">
          <Icon className={`mt-0.5 size-5 shrink-0 ${v.iconClass}`} />
          <div className="min-w-0 flex-1">
            {notification.title && (
              <p className={`text-sm font-semibold ${v.titleClass}`}>{notification.title}</p>
            )}
            {notification.message && (
              <p className={`text-sm ${v.msgClass}`}>{notification.message}</p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="shrink-0 rounded p-0.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
          >
            <XMarkIcon className="size-4" />
          </button>
        </div>
      </div>
    </div>
  )
}
