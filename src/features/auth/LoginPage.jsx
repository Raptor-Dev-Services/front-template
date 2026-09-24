import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import { Container } from '../../ui/Container.jsx'
import { AppButton } from '../../ui/AppButton.jsx'
import { TextField } from '../../ui/TextField.jsx'
import { PasswordField } from '../../ui/PasswordField.jsx'
import { Checkbox } from '../../ui/Checkbox.jsx'
import { useI18n } from '../../i18n/useI18n.js'
import { isAuthenticated } from '../../auth/session.js'
import { useLogin } from './hooks/useLogin.js'

/** A donde volver tras entrar: la ruta protegida de la que vino, o el inicio. Nunca de vuelta a /login. */
function destinationFrom(location) {
  const from = location.state?.from
  if (!from?.pathname || from.pathname === '/login') return '/'
  return `${from.pathname}${from.search ?? ''}${from.hash ?? ''}`
}

// LoginPage - acceso al panel. Cada etiqueta esta atada a su campo (TextField/PasswordField/Checkbox),
// los errores por campo van unidos por aria-describedby y el error del servidor es un role="alert".
export function LoginPage() {
  const { t } = useI18n()
  const navigate = useNavigate()
  const location = useLocation()
  const { values, setField, errors, submitError, submitting, submit } = useLogin()

  if (isAuthenticated()) return <Navigate to={destinationFrom(location)} replace />

  const handleSubmit = async (event) => {
    event.preventDefault()
    const result = await submit()
    if (result.ok) navigate(destinationFrom(location), { replace: true })
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

            {submitError ? (
              <p role="alert" data-tone="danger" className="ui-alert">
                {submitError}
              </p>
            ) : null}

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
