import { cx } from '../styles/designSystem.js'

// StatusBadge - pildora de estado. Consume .ui-badge[data-tone] (tokens), nunca colores sueltos. El
// estado SIEMPRE viaja como texto traducido y, opcionalmente, con un icono: el tono solo refuerza,
// nunca es el unico portador del dato (WCAG 1.4.1).
// Tonos: neutral | success | warning | danger | info.
export function StatusBadge({ label, tone = 'neutral', icon: Icon = null, className = '' }) {
  return (
    <span data-tone={tone} className={cx('ui-badge', className)}>
      {Icon ? <Icon aria-hidden="true" className="ui-badge-icon" /> : null}
      {label}
    </span>
  )
}

export default StatusBadge
