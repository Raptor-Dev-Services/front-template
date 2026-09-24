import { useEffect, useRef } from 'react'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import { Container } from '../../ui/Container.jsx'
import { AppButton } from '../../ui/AppButton.jsx'
import { TextField } from '../../ui/TextField.jsx'
import { PasswordField } from '../../ui/PasswordField.jsx'
import { Checkbox } from '../../ui/Checkbox.jsx'
import { useI18n } from '../../i18n/useI18n.js'
import { isAuthenticated } from '../../auth/session.js'
import { LOGIN_STEP, useLogin } from './hooks/useLogin.js'

/** A donde volver tras entrar: la ruta protegida de la que vino, o el inicio. Nunca de vuelta a /login. */
function destinationFrom(location) {
  const from = location.state?.from
  if (!from?.pathname || from.pathname === '/login') return '/'
  return `${from.pathname}${from.search ?? ''}${from.hash ?? ''}`
}

function SubmitError({ message }) {
  if (!message) return null
  return (
    <p role="alert" data-tone="danger" className="ui-alert">
      {message}
    </p>
  )
}

// LoginPage - acceso al panel, en uno o dos pasos. Cada etiqueta esta atada a su campo
// (TextField/PasswordField/Checkbox), los errores por campo van unidos por aria-describedby y el error
// del servidor es un role="alert". Con 2FA, el segundo paso pide el codigo sin salir de /login: el
// reto vive en memoria y recargar vuelve al primer paso, que es lo seguro.
export function LoginPage() {
  const { t } = useI18n()
  const navigate = useNavigate()
  const location = useLocation()
  const { values, setField, errors, submitError, submitting, submit, step, codeForm, submitCode, restart } = useLogin()
  const codeInput = useRef(null)

  // Al pasar al segundo paso el foco va al campo del codigo: el formulario anterior desaparece y, sin
  // esto, el foco queda en el body y el lector de pantalla no anuncia que hay algo nuevo que llenar.
  useEffect(() => {
    if (step === LOGIN_STEP.code) codeInput.current?.focus()
  }, [step])

  if (isAuthenticated()) return <Navigate to={destinationFrom(location)} replace />

  const handleSubmit = async (event) => {
    event.preventDefault()
    const result = await submit()
    if (result.ok) navigate(destinationFrom(location), { replace: true })
  }

  const handleCode = async (event) => {
    event.preventDefault()
    const result = await submitCode()
    if (result.ok) navigate(destinationFrom(location), { replace: true })
  }

  if (step === LOGIN_STEP.code) {
    return (
      <section className="py-16 sm:py-24">
        <Container>
          <div className="mx-auto max-w-sm">
            <h1 className="text-2xl font-bold tracking-tight text-content">{t('auth.twoFactor.title')}</h1>
            <p className="mt-2 text-sm text-muted">{t('auth.twoFactor.subtitle')}</p>

            <form className="mt-8 space-y-5" onSubmit={handleCode} noValidate>
              <TextField
                ref={codeInput}
                id="login-code"
                label={t('auth.twoFactor.code')}
                hint={t('auth.twoFactor.codeHint')}
                value={codeForm.values.code}
                onChange={(event) => codeForm.setField('code', event.target.value)}
                error={codeForm.errors.code}
                required
                autoComplete="one-time-code"
                autoCapitalize="characters"
                spellCheck={false}
              />

              <SubmitError message={codeForm.submitError} />

              <AppButton type="submit" fullWidth disabled={codeForm.submitting} aria-busy={codeForm.submitting}>
                {codeForm.submitting ? t('auth.twoFactor.submitting') : t('auth.twoFactor.submit')}
              </AppButton>
              <AppButton variant="ghost" fullWidth onClick={restart}>
                {t('auth.twoFactor.back')}
              </AppButton>
            </form>
          </div>
        </Container>
      </section>
    )
  }

  return (
    <section className="py-16 sm:py-24">
      <Container>
        <div className="mx-auto max-w-sm">
          <h1 className="text-2xl font-bold tracking-tight text-content">{t('auth.title')}</h1>
          <p className="mt-2 text-sm text-muted">{t('auth.subtitle')}</p>

          <form className="mt-8 space-y-5" onSubmit={handleSubmit} noValidate>
            <TextField
              id="login-email"
              label={t('auth.email')}
              type="email"
              value={values.email}
              onChange={(event) => setField('email', event.target.value)}
              error={errors.email}
              required
              autoComplete="email"
              inputMode="email"
              placeholder={t('auth.emailPlaceholder')}
            />

            <PasswordField
              id="login-password"
              label={t('auth.password')}
              value={values.password}
              onChange={(event) => setField('password', event.target.value)}
              error={errors.password}
              required
              autoComplete="current-password"
            />

            <Checkbox
              id="login-remember"
              label={t('auth.rememberMe')}
              checked={values.rememberMe}
              onChange={(event) => setField('rememberMe', event.target.checked)}
            />

            <SubmitError message={submitError} />

            <AppButton type="submit" fullWidth disabled={submitting} aria-busy={submitting}>
              {submitting ? t('auth.submitting') : t('auth.submit')}
            </AppButton>
          </form>
        </div>
      </Container>
    </section>
  )
}

export default LoginPage
