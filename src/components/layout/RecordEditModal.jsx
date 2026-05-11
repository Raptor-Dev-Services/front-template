import { Modal, FormField } from '../primitives'
import { ui } from '../../styles/designSystem'

export default function RecordEditModal({
  open,
  title,
  description,
  fields = [],
  values = {},
  onChange,
  onConfirm,
  onCancel,
  loading,
  confirmText = 'Guardar cambios',
  cancelText = 'Cancelar',
}) {
  return (
    <Modal open={open} onClose={onCancel} title={title}>
      <div className="space-y-4">
        {description && <p className={ui.typography.body}>{description}</p>}

        {fields.map((f) => (
          <FormField key={f.name} label={f.label} required={f.required}>
            {f.type === 'checkbox' ? (
              <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  className={ui.controls.checkbox}
                  checked={!!values[f.name]}
                  onChange={(e) => onChange(f.name, e.target.checked)}
                  disabled={f.disabled}
                />
                {f.checkboxLabel ?? f.label}
              </label>
            ) : f.type === 'number' ? (
              <input
                type="number"
                className={f.disabled ? ui.controls.disabledInput : ui.controls.input}
                value={values[f.name] ?? ''}
                onChange={(e) => onChange(f.name, e.target.value)}
                placeholder={f.placeholder}
                min={f.min}
                max={f.max}
                step={f.step}
                disabled={f.disabled}
              />
            ) : (
              <input
                type="text"
                className={f.disabled ? ui.controls.disabledInput : ui.controls.input}
                value={values[f.name] ?? ''}
                onChange={(e) => onChange(f.name, e.target.value)}
                placeholder={f.placeholder}
                disabled={f.disabled}
              />
            )}
          </FormField>
        ))}

        <div className="flex justify-end gap-2 border-t border-slate-200 pt-3">
          <button type="button" onClick={onCancel} className={ui.controls.secondaryButton} disabled={loading}>
            {cancelText}
          </button>
          <button type="button" onClick={onConfirm} className={ui.controls.primaryButton} disabled={loading}>
            {loading ? 'Guardando…' : confirmText}
          </button>
        </div>
      </div>
    </Modal>
  )
}
