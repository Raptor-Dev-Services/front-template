import { Link } from 'react-router-dom'
import { cx } from '../styles/designSystem.js'

// AppButton - primitiva de accion. Consume las clases .ui-btn* (tokens del design system), nunca
// colores sueltos. Renderiza <button>, <a> o <Link> segun props para mantener la semantica correcta:
// una accion es un boton; una navegacion es un enlace, aunque se vea igual.

const VARIANT_CLASS = {
  primary: 'ui-btn-primary',
  secondary: 'ui-btn-secondary',
  // Solo para acciones destructivas. Una variante desconocida cae en primary sin avisar, asi que un
  // boton de borrar mal escrito se veria como uno normal: por eso vive aqui y no suelta en la pantalla.
  danger: 'ui-btn-danger',
  ghost: 'ui-btn-ghost',
}

export function AppButton({
  to,
  href,
  type = 'button',
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  className = '',
  children,
  ...rest
}) {
  const classes = cx(
    'ui-btn',
    VARIANT_CLASS[variant] ?? VARIANT_CLASS.primary,
    size === 'sm' && 'ui-btn-sm',
    fullWidth && 'w-full',
    className,
  )

  if (to) {
    return (
      <Link to={to} className={classes} {...rest}>
        {children}
      </Link>
    )
  }

  if (href) {
    return (
      <a href={href} className={classes} {...rest}>
        {children}
      </a>
    )
  }

  return (
    <button type={type} className={classes} {...rest}>
      {children}
    </button>
  )
}

export default AppButton
