import {
  CheckCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
} from '@heroicons/react/24/outline'
import { Modal, FormField } from '../primitives'
import { ui, cx } from '../../styles/designSystem'

const VARIANT_CONFIG = {
  danger: {
    Icon: ExclamationTriangleIcon,
    iconClass: 'text-red-500',
    confirmClass: ui.controls.destructiveButton,
  },
  success: {
    Icon: CheckCircleIcon,
    iconClass: 'text-emerald-500',
    confirmClass: ui.controls.primaryButton,
  },
  info: {
    Icon: InformationCircleIcon,
    iconClass: 'text-sky-500',
    confirmClass: ui.controls.primaryButton,
  },
}

export default function MasterActionModal({
  open,
  title,
  message,
  variant = 'info',
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  onConfirm,
  onCancel,
  loading,
  showComment,
  commentRequired,
  commentValue = '',
  onCommentChange,
}) {
  const { Icon, iconClass, confirmClass } = VARIANT_CONFIG[variant] ?? VARIANT_CONFIG.info

  return (
    <Modal open={open} onClose={onCancel ?? onConfirm} title={title}>
      <div className="space-y-4">
        <div className="flex gap-3">
          <Icon className={cx('mt-0.5 size-5 shrink-0', iconClass)} />
          <p className={ui.typography.body}>{message}</p>
        </div>

        {showComment && (
          <FormField label="Comentario" required={commentRequired}>
            <textarea
              className={ui.controls.textarea}
              rows={3}
              value={commentValue}
              onChange={(e) => onCommentChange?.(e.target.value)}
              placeholder="Escribe un comentario…"
            />
          </FormField>
        )}

        <div className="flex justify-end gap-2 border-t border-slate-200 pt-3">
          {onCancel && (
            <button type="button" onClick={onCancel} className={ui.controls.secondaryButton} disabled={loading}>
              {cancelText}
            </button>
          )}
          <button type="button" onClick={onConfirm} className={confirmClass} disabled={loading}>
            {loading ? 'Procesando…' : confirmText}
          </button>
        </div>
      </div>
    </Modal>
  )
}
