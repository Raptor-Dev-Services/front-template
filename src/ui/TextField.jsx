import { FieldError, FieldHint, FieldLabel } from './FieldLabel.jsx'
import { describedByFor } from './fieldIds.js'

// TextField - campo de texto accesible: <label for> asociado al input por `id`, hint y error unidos por
// aria-describedby, error activado por aria-invalid (que tambien pinta el borde, ver .ui-input) y
// area tactil >= 44px. `id` es obligatorio: es lo que ata la etiqueta al control.
export function TextField({ id, label, error, hint, type = 'text', required = false, className = '', ...rest }) {
  const { hintId, errorId, describedBy } = describedByFor(id, { hint, error })

  return (
    <div className={className}>
      <FieldLabel htmlFor={id} required={required}>
        {label}
      </FieldLabel>
      <FieldHint id={hintId}>{hint}</FieldHint>
      <input
        id={id}
        type={type}
        required={required}
        aria-invalid={error ? 'true' : undefined}
        aria-describedby={describedBy}
        className="ui-input mt-1.5"
        {...rest}
      />
      <FieldError id={errorId}>{error}</FieldError>
    </div>
  )
}

export default TextField
