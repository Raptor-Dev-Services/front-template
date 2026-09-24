import { useCallback, useState } from 'react'
import { login, completeTwoFactorLogin } from '../../../api/auth.js'
import { extractApiErrorMessage } from '../../../api/client.js'
import { useI18n } from '../../../i18n/useI18n.js'
import { useFormState } from '../../shared/hooks/useFormState.js'

// Validacion de forma solo como UX; la autoridad es el backend.
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const INITIAL = { email: '', password: '', rememberMe: false }
const INITIAL_CODE = { code: '' }

export const LOGIN_STEP = Object.freeze({ credentials: 'credentials', code: 'code' })

/**
 * Estado y orquestacion del login, en uno o dos pasos. La pagina consume este hook y navega en el exito.
 *
 *  - `submit()` manda correo y contrasena. Sin 2FA devuelve `{ ok: true }` y la sesion ya esta guardada.
 *    Con 2FA devuelve `{ ok: false }`, pasa al paso `code` y guarda el reto: todavia no hay sesion.
 *  - `submitCode()` canjea el reto y el codigo. `restart()` vuelve al primer paso (otra cuenta, o el
 *    reto vencio: el backend lo dice en su mensaje y el reto no se puede renovar sin la contrasena).
 *
 * Cada rechazo del backend deja SU mensaje en `submitError` de su formulario, tal cual.
 */
export function useLogin() {
  const { t } = useI18n()
  const [step, setStep] = useState(LOGIN_STEP.credentials)
  const [challenge, setChallenge] = useState(null)

  const form = useFormState({
    initialValues: INITIAL,
    validators: {
      email: (v) => {
        if (!v.email.trim()) return t('auth.errors.emailRequired')
        return EMAIL_RE.test(v.email.trim()) ? null : t('auth.errors.emailInvalid')
      },
      password: (v) => (v.password ? null : t('auth.errors.passwordRequired')),
    },
  })

  // resetKey = el reto: un reto nuevo (volver a entrar) empieza con el campo vacio.
  const codeForm = useFormState({
    initialValues: INITIAL_CODE,
    validators: { code: (v) => (v.code.trim() ? null : t('auth.twoFactor.errors.codeRequired')) },
    resetKey: challenge,
  })

  const { submit: submitForm, setField } = form
  const submit = useCallback(
    () =>
      submitForm(async (v) => {
        try {
          const result = await login({ email: v.email.trim(), password: v.password, rememberMe: v.rememberMe })
          if (!result.twoFactorRequired) return { ok: true }
          setChallenge(result.challengeToken)
          setStep(LOGIN_STEP.code)
          // Ni error ni exito: el formulario del primer paso termino y empieza el segundo.
          return { ok: false }
        } catch (err) {
          return { ok: false, message: extractApiErrorMessage(err) }
        }
      }),
    [submitForm],
  )

  const { submit: submitCodeForm } = codeForm
  const submitCode = useCallback(
    () =>
      submitCodeForm(async (v) => {
        try {
          await completeTwoFactorLogin({ challengeToken: challenge, code: v.code.trim(), rememberMe: form.values.rememberMe })
          return { ok: true }
        } catch (err) {
          return { ok: false, message: extractApiErrorMessage(err) }
        }
      }),
    [submitCodeForm, challenge, form.values.rememberMe],
  )

  const restart = useCallback(() => {
    setChallenge(null)
    setStep(LOGIN_STEP.credentials)
    // La contrasena no se conserva entre intentos; el correo si, para no hacerlo teclear de nuevo.
    setField('password', '')
  }, [setField])

  return { ...form, submit, step, codeForm, submitCode, restart }
}

export default useLogin
