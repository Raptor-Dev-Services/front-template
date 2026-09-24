import { cx } from '../styles/designSystem.js'

// ProgressBar - avance 0-100. Expone role="progressbar" con aria-valuenow/min/max y una etiqueta;
// quien la usa muestra tambien el dato en texto, porque el color no puede ser el unico portador.
// `tone` (success | warning | danger) porque "lleno" no siempre es bueno: un cupo agotado no lo es.
export function ProgressBar({ value, label, tone, className = '' }) {
  // Un avance desconocido se dibuja vacio, no al 100%.
  const pct = Number.isFinite(value) ? Math.min(100, Math.max(0, value)) : 0
  const rounded = Math.round(pct)

  return (
    <div
      role="progressbar"
      aria-label={label}
      aria-valuenow={rounded}
      aria-valuemin={0}
      aria-valuemax={100}
      className={cx('ui-meter', className)}
    >
      <span className="ui-meter-fill" data-tone={tone} style={{ width: `${pct}%` }} />
    </div>
  )
}

export default ProgressBar
