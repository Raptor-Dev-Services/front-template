// FieldLabel / FieldHint / FieldError - las tres piezas que repiten todos los campos. Viven juntas para
// que TextField, PasswordField y Select las compartan en vez de copiar el marcado.
//
// La etiqueta va ARRIBA del control y es `block`: una <label> es inline por defecto y sin eso se sienta
// al lado del input y aplasta la pantalla.

export function FieldLabel({ htmlFor, required, children }) {
  return (
    <label htmlFor={htmlFor} className="block text-sm font-medium text-content">
      {children}
      {required ? (
        <span className="text-error" aria-hidden="true">
          {' '}
          *
        </span>
      ) : null}
    </label>
  )
}

export function FieldHint({ id, children }) {
  if (!children) return null
  return (
    <p id={id} className="mt-1 text-xs text-muted">
      {children}
    </p>
  )
}

export function FieldError({ id, children }) {
  if (!children) return null
  return (
    <p id={id} role="alert" className="mt-1.5 text-xs text-error">
      {children}
    </p>
  )
}
