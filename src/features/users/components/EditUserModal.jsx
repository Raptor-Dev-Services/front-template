import { AppModal } from '../../../ui/AppModal.jsx'
import { AppButton } from '../../../ui/AppButton.jsx'
import { TextField } from '../../../ui/TextField.jsx'
import { useI18n } from '../../../i18n/useI18n.js'
import { useFormState } from '../../shared/hooks/useFormState.js'

/**
 * EditUserModal - corrige el nombre de un usuario (PUT /api/v1/users/{id} solo acepta fullName).
 *
 * `onSubmit(payload)` devuelve `{ ok, message }`; el error del servidor se muestra en linea sin
 * sustituir su texto. `resetKey` incluye el id: reabrir el modal para OTRA cuenta no hereda lo que se
 * escribio para la anterior.
 */
export function EditUserModal({ user, onClose, onSubmit }) {
  const { t } = useI18n()
  const open = Boolean(user)

  const form = useFormState({
    initialValues: { fullName: user?.fullName ?? '' },
    validators: {
      fullName: (v) => (v.fullName.trim() ? null : t('users.edit.fullNameRequired')),
    },
    resetKey: `${open}:${user?.publicId ?? ''}`,
  })
  const { values, setField, errors, submitError, submitting } = form

  const handleSubmit = async (event) => {
    event.preventDefault()
    const result = await form.submit((v) => onSubmit({ fullName: v.fullName.trim() }))
    if (result?.ok) onClose()
  }

  return (
    <AppModal
      open={open}
      onClose={onClose}
      title={t('users.edit.title')}
      subtitle={t('users.edit.hint')}
      busy={submitting}
      onSubmit={handleSubmit}
      footer={
        <>
          <AppButton variant="secondary" onClick={onClose} disabled={submitting}>
            {t('common.cancel')}
          </AppButton>
          <AppButton type="submit" disabled={submitting} aria-busy={submitting}>
            {submitting ? t('common.working') : t('users.edit.submit')}
          </AppButton>
        </>
      }
    >
      <TextField
        id="user-full-name"
        label={t('users.edit.fullName')}
        value={values.fullName}
        onChange={(event) => setField('fullName', event.target.value)}
        error={errors.fullName}
        required
        autoComplete="name"
      />
      {submitError ? (
        <p role="alert" data-tone="danger" className="ui-alert mt-4">
          {submitError}
        </p>
      ) : null}
    </AppModal>
  )
}

export default EditUserModal
