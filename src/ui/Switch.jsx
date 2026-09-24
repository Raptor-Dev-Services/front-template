import { cx } from '../styles/designSystem.js'

// Interruptor de dos estados. Lo que garantiza en un solo sitio, y que se pierde al recopiarlo:
//  - `role="switch"` + `aria-checked`: el lector lo anuncia como interruptor y dice si esta activado.
//  - `type="button"`: dentro de un formulario, un boton sin tipo lo ENVIA al pulsarlo.
//  - Nombre accesible obligatorio, por `label` o por `labelledBy`.
//  - El estado no se comunica solo con color: quien lo usa pone su texto al lado.
export function Switch({ checked, onChange, label, labelledBy, id, disabled = false, className = '' }) {
  return (
    <button
      type="button"
      id={id}
      role="switch"
      aria-checked={checked}
      aria-label={labelledBy ? undefined : label}
      aria-labelledby={labelledBy}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={cx(
        'relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors duration-200',
        'disabled:cursor-not-allowed disabled:opacity-60',
        checked ? 'bg-primary' : 'bg-border-strong',
        className,
      )}
    >
      <span
        aria-hidden="true"
        className={cx(
          'inline-block size-5 rounded-full bg-surface shadow-sm transition-transform duration-200',
          checked ? 'translate-x-5' : 'translate-x-0.5',
        )}
      />
    </button>
  )
}

export default Switch
