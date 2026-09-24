import { FieldError, FieldHint, FieldLabel } from './FieldLabel.jsx'
import { describedByFor } from './fieldIds.js'

// Select - seleccion nativa accesible, hermana de TextField. Las opciones llegan por `options`
// ([{ value, label }], con el label ya traducido) o como <option> hijos.
export function Select({ id, label, options, error, hint, required = false, className = '', children, ...rest }) {
  const { hintId, errorId, describedBy } = describedByFor(id, { hint, error })

  return (
    <div className={className}>
      <FieldLabel htmlFor={id} required={required}>
        {label}
      </FieldLabel>
      <FieldHint id={hintId}>{hint}</FieldHint>
      <select
        id={id}
        required={required}
        aria-invalid={error ? 'true' : undefined}
        aria-describedby={describedBy}
        className="ui-input mt-1.5"
        {...rest}
      >
        {options
          ? options.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))
          : children}
      </select>
      <FieldError id={errorId}>{error}</FieldError>
    </div>
  )
}

export default Select
