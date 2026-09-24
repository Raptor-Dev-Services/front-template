import { cx } from '../styles/designSystem.js'

// IconButton - accion sin texto visible (editar, cerrar, menu, toggles). `label` es OBLIGATORIO: al
// no haber texto, es el nombre accesible (aria-label) y el tooltip. Un boton-icono sin nombre se
// anuncia como "boton" a secas y el usuario de lector de pantalla no sabe que hace.

const VARIANT_CLASS = {
  default: '',
  danger: 'hover:text-error',
}

export function IconButton({ label, variant = 'default', type = 'button', title, className = '', children, ...rest }) {
  if (import.meta.env.DEV && !label) {
    console.warn('IconButton sin `label`: el boton no tiene nombre accesible.')
  }
  return (
    <button
      type={type}
      className={cx('ui-icon-btn', VARIANT_CLASS[variant], className)}
      aria-label={label}
      title={title ?? label}
      {...rest}
    >
      {children}
    </button>
  )
}

export default IconButton
