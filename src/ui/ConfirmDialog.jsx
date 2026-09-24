import { useState } from 'react'
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline'
import { AppModal } from './AppModal.jsx'
import { AppButton } from './AppButton.jsx'
import { useI18n } from '../i18n/useI18n.js'

/**
 * ConfirmDialog - confirmacion ANTES de una accion sensible (dar de baja, borrar). Sobre AppModal, asi
 * que hereda el contrato de foco y teclado.
 *
 * `onConfirm()` devuelve `{ ok, message }` y NUNCA lanza (lo garantiza el hook de la feature). Con
 * ok cierra; sin ok se queda abierto y muestra el mensaje del servidor en linea, SIN sustituirlo por
 * uno generico: "no puedes darte de baja a ti mismo" es mas util que "no se pudo".
 *
 * Mientras confirma, el dialogo no se cierra (busy) y el boton dice que esta trabajando.
 * Montalo con `key` del registro para que cada apertura empiece limpia.
 */
export function ConfirmDialog({ open, title, body, confirmLabel, tone = 'danger', onConfirm, onClose }) {
  const { t } = useI18n()
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState(null)

  const handleConfirm = async () => {
    setBusy(true)
    setError(null)
    const result = await onConfirm()
    setBusy(false)
    if (result?.ok) onClose()
    else setError(result?.message ?? t('common.errorOperationFailed'))
  }

  return (
    <AppModal
      open={open}
      onClose={onClose}
      title={title}
      size="sm"
      busy={busy}
      showClose={false}
      tone={tone}
      icon={tone === 'danger' ? <ExclamationTriangleIcon aria-hidden="true" className="size-6" /> : null}
      footer={
        <>
          <AppButton variant="secondary" onClick={onClose} disabled={busy}>
            {t('common.cancel')}
          </AppButton>
          <AppButton variant={tone === 'danger' ? 'danger' : 'primary'} onClick={handleConfirm} disabled={busy} aria-busy={busy}>
            {busy ? t('common.working') : confirmLabel}
          </AppButton>
        </>
      }
    >
      {body ? <p className="text-sm text-muted">{body}</p> : null}
      {error ? (
        <p role="alert" data-tone="danger" className="ui-alert mt-4">
          {error}
        </p>
      ) : null}
    </AppModal>
  )
}

export default ConfirmDialog
