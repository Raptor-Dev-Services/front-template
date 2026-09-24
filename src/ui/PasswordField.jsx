import { useState } from 'react'
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline'
import { FieldError, FieldHint, FieldLabel } from './FieldLabel.jsx'
import { describedByFor } from './fieldIds.js'
import { useI18n } from '../i18n/useI18n.js'
import { cx } from '../styles/designSystem.js'

// PasswordField - contrasena con boton de mostrar/ocultar, hermana de TextField. El boton expone su
// estado con aria-pressed y un nombre accesible que dice lo que VA a hacer.
export function PasswordField({
  id,
  label,
  error,
  hint,
  required = false,
  autoComplete = 'current-password',
  className = '',
  ...rest
}) {
  const { t } = useI18n()
  const [visible, setVisible] = useState(false)
  const { hintId, errorId, describedBy } = describedByFor(id, { hint, error })

  return (
    <div className={className}>
      <FieldLabel htmlFor={id} required={required}>
        {label}
      </FieldLabel>
      <FieldHint id={hintId}>{hint}</FieldHint>
      <div className="relative mt-1.5">
        <input
          id={id}
          type={visible ? 'text' : 'password'}
          required={required}
          autoComplete={autoComplete}
          aria-invalid={error ? 'true' : undefined}
          aria-describedby={describedBy}
          className="ui-input pr-12"
          {...rest}
        />
        <button
          type="button"
          onClick={() => setVisible((prev) => !prev)}
          aria-pressed={visible}
          aria-label={visible ? t('common.hidePassword') : t('common.showPassword')}
          className={cx(
            'absolute inset-y-0 right-0 inline-flex w-11 items-center justify-center rounded-r-lg text-muted',
            'transition-colors duration-150 hover:text-content',
          )}
        >
          {visible ? (
            <EyeSlashIcon aria-hidden="true" className="size-5" />
          ) : (
            <EyeIcon aria-hidden="true" className="size-5" />
          )}
        </button>
      </div>
      <FieldError id={errorId}>{error}</FieldError>
    </div>
  )
}

export default PasswordField
