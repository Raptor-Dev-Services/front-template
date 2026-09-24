import { Dialog, DialogPanel, DialogTitle } from '@headlessui/react'
import { XMarkIcon } from '@heroicons/react/24/outline'
import { IconButton } from './IconButton.jsx'
import { useI18n } from '../i18n/useI18n.js'
import { cx } from '../styles/designSystem.js'

// AppModal - la UNICA primitiva de modal del proyecto. El contrato de accesibilidad (el foco entra al
// abrir, queda contenido, Esc cierra y el foco vuelve al disparador) lo cumple `Dialog` de Headless UI
// y se audita UNA vez, en AppModal.test.jsx, en vez de modal por modal.
//
// Lo que aporta encima: anchos, bloqueo de cierre durante un envio (`busy`), boton de cerrar y dos
// layouts, cuya diferencia es funcional (donde vive el scroll):
//   scroll="overlay" (por defecto) - dialogo compacto: el panel crece y scrollea el overlay.
//   scroll="body"                  - dialogo con marco: tope de 92vh, cabecera y pie fijos y el
//                                    cuerpo scrollea por dentro. Para formularios largos.

const PANEL_WIDTH = {
  sm: 'max-w-sm',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
}

const ICON_TONE = {
  default: 'bg-surface-muted text-muted',
  danger: 'bg-surface-muted text-error',
}

const noop = () => {}

export function AppModal({
  open,
  onClose,
  title,
  subtitle,
  icon,
  tone = 'default',
  children,
  footer,
  onSubmit,
  size = 'md',
  scroll = 'overlay',
  busy = false,
  showClose = true,
  stacked = false,
}) {
  const { t } = useI18n()
  const framed = scroll === 'body'

  // Durante un envio el modal no se cierra (ni Esc, ni clic fuera, ni la X): cerrar a media escritura
  // perderia el formulario y dejaria la mutacion sin destino.
  const handleClose = busy ? noop : onClose

  // `items-start` + `my-auto` en el panel, y NO `items-center`: con el scroll en el overlay, centrar
  // por alineacion deja FUERA del area desplazable lo que sobresale por arriba y los primeros campos
  // de un formulario alto quedan inalcanzables. Los margenes automaticos centran cuando cabe y se
  // colapsan a 0 cuando no.
  const overlayClass = cx('fixed inset-0 flex items-start justify-center p-4', !framed && 'overflow-y-auto')

  const panelClass = cx(
    'w-full rounded-2xl border border-border bg-surface-raised shadow-lg',
    PANEL_WIDTH[size] ?? PANEL_WIDTH.md,
    framed ? 'my-auto flex max-h-[92vh] flex-col overflow-hidden' : 'my-auto p-5 sm:p-6',
  )

  const header = (
    <div
      className={
        framed
          ? 'flex items-center justify-between gap-4 border-b border-border px-6 py-4'
          : 'flex items-start justify-between gap-4'
      }
    >
      <div className={icon ? 'flex min-w-0 flex-1 items-start gap-4' : 'min-w-0 flex-1'}>
        {icon ? (
          <span
            className={cx(
              'inline-flex size-11 shrink-0 items-center justify-center rounded-full',
              ICON_TONE[tone] ?? ICON_TONE.default,
            )}
          >
            {icon}
          </span>
        ) : null}
        <div className="min-w-0">
          <DialogTitle className="text-lg font-semibold text-content">{title}</DialogTitle>
          {subtitle ? <p className="mt-1 text-sm text-muted">{subtitle}</p> : null}
        </div>
      </div>
      {showClose ? (
        <IconButton label={t('common.close')} onClick={onClose} disabled={busy} className="shrink-0">
          <XMarkIcon aria-hidden="true" className="size-5" />
        </IconButton>
      ) : null}
    </div>
  )

  const body = <div className={framed ? 'min-h-0 flex-1 space-y-5 overflow-y-auto px-6 py-5' : 'mt-4'}>{children}</div>

  const foot = footer ? (
    <div
      className={
        framed
          ? 'flex flex-wrap items-center justify-end gap-3 border-t border-border px-6 py-4'
          : 'mt-6 flex flex-wrap items-center justify-end gap-3'
      }
    >
      {footer}
    </div>
  ) : null

  // Con `onSubmit` el cuerpo y el pie van dentro del form: el boton submit del pie envia sin `form=`
  // ni handlers duplicados, y Enter en un campo tambien envia.
  const content = onSubmit ? (
    <form onSubmit={onSubmit} className={framed ? 'flex min-h-0 flex-1 flex-col' : undefined} noValidate>
      {body}
      {foot}
    </form>
  ) : (
    <>
      {body}
      {foot}
    </>
  )

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      transition
      className={cx('relative transition duration-150 ease-out data-closed:opacity-0', stacked ? 'z-[60]' : 'z-50')}
    >
      <div className="fixed inset-0 bg-brand-950/40" aria-hidden="true" />
      <div className={overlayClass}>
        <DialogPanel className={panelClass}>
          {header}
          {content}
        </DialogPanel>
      </div>
    </Dialog>
  )
}

export default AppModal
