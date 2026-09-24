import { AppButton } from '../../../ui/AppButton.jsx'
import { TextField } from '../../../ui/TextField.jsx'
import { StatusBadge } from '../../../ui/StatusBadge.jsx'
import { useI18n } from '../../../i18n/useI18n.js'
import { TWO_FACTOR_STEP, useTwoFactor } from '../hooks/useTwoFactor.js'
import { RecoveryCodes } from './RecoveryCodes.jsx'
import { groupSecret } from '../utils/groupSecret.js'

function SubmitError({ message }) {
  if (!message) return null
  return (
    <p role="alert" data-tone="danger" className="ui-alert">
      {message}
    </p>
  )
}

function CodeForm({ id, form, label, hint, submitLabel, submittingLabel, variant = 'primary', onSubmit, onCancel }) {
  const { t } = useI18n()
  const handleSubmit = (event) => {
    event.preventDefault()
    onSubmit()
  }
  return (
    <form className="max-w-sm space-y-4" onSubmit={handleSubmit} noValidate>
      <TextField
        id={id}
        label={label}
        hint={hint}
        value={form.values.code}
        onChange={(event) => form.setField('code', event.target.value)}
        error={form.errors.code}
        required
        autoComplete="one-time-code"
        autoCapitalize="characters"
        spellCheck={false}
      />
      <SubmitError message={form.submitError} />
      <div className="flex flex-wrap gap-3">
        <AppButton type="submit" variant={variant} disabled={form.submitting} aria-busy={form.submitting}>
          {form.submitting ? submittingLabel : submitLabel}
        </AppButton>
        {onCancel ? (
          <AppButton variant="ghost" onClick={onCancel}>
            {t('common.cancel')}
          </AppButton>
        ) : null}
      </div>
    </form>
  )
}

// TwoFactorSection - el segundo factor de la cuenta. Activarlo son dos pasos (el backend genera un secreto
// pendiente y solo lo activa con un primer codigo valido) y termina mostrando los codigos de
// recuperacion una vez. Apagarlo pide un codigo vigente: la sesion abierta sola no basta.
export function TwoFactorSection({ enabled, onChanged }) {
  const { t } = useI18n()
  const tf = useTwoFactor({ onChanged })

  let body
  if (tf.step === TWO_FACTOR_STEP.codes) {
    body = <RecoveryCodes codes={tf.recoveryCodes} onDone={tf.finish} />
  } else if (tf.step === TWO_FACTOR_STEP.setup) {
    const uri = tf.setup?.otpauthUri
    body = (
      <div className="space-y-5">
        <ol className="list-decimal space-y-2 pl-5 text-sm text-content">
          <li>{t('account.twoFactor.setupStep1')}</li>
          <li>{t('account.twoFactor.setupStep2')}</li>
        </ol>
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-muted">{t('account.twoFactor.secretLabel')}</p>
          <p className="mt-1 select-all break-all font-mono text-base text-content">{groupSecret(tf.setup?.secret)}</p>
          {/* Solo un esquema otpauth: la URI viene del backend, pero un href se valida igual. */}
          {uri?.startsWith('otpauth://') ? (
            <a href={uri} className="mt-2 inline-block text-sm font-medium text-primary underline-offset-4 hover:underline">
              {t('account.twoFactor.openApp')}
            </a>
          ) : null}
        </div>
        <CodeForm
          id="twofactor-confirm"
          form={tf.form}
          label={t('account.twoFactor.code')}
          hint={t('account.twoFactor.confirmHint')}
          submitLabel={t('account.twoFactor.confirm')}
          submittingLabel={t('common.working')}
          onSubmit={tf.confirm}
          onCancel={tf.cancel}
        />
      </div>
    )
  } else if (enabled) {
    body = (
      <div className="space-y-4">
        <p className="text-sm text-muted">{t('account.twoFactor.disableIntro')}</p>
        <CodeForm
          id="twofactor-disable"
          form={tf.form}
          label={t('account.twoFactor.code')}
          hint={t('account.twoFactor.disableHint')}
          submitLabel={t('account.twoFactor.disable')}
          submittingLabel={t('common.working')}
          variant="danger"
          onSubmit={tf.disable}
        />
      </div>
    )
  } else {
    body = (
      <div className="space-y-4">
        <p className="text-sm text-muted">{t('account.twoFactor.enableIntro')}</p>
        <SubmitError message={tf.startError} />
        <AppButton onClick={tf.start} disabled={tf.starting} aria-busy={tf.starting}>
          {tf.starting ? t('common.working') : t('account.twoFactor.enable')}
        </AppButton>
      </div>
    )
  }

  return (
    <section aria-labelledby="twofactor-title" className="border-t border-border pt-6">
      <div className="flex flex-wrap items-center gap-3">
        <h2 id="twofactor-title" className="text-lg font-semibold text-content">
          {t('account.twoFactor.title')}
        </h2>
        <StatusBadge
          tone={enabled || tf.step === TWO_FACTOR_STEP.codes ? 'success' : 'neutral'}
          label={enabled || tf.step === TWO_FACTOR_STEP.codes ? t('account.twoFactor.on') : t('account.twoFactor.off')}
        />
      </div>
      <div className="mt-4">{body}</div>
    </section>
  )
}

export default TwoFactorSection
