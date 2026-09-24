import { useCallback } from 'react'
import { login, TWO_FACTOR_REQUIRED } from '../../../api/auth.js'
import { extractApiErrorMessage } from '../../../api/client.js'
import { useI18n } from '../../../i18n/useI18n.js'
import { useFormState } from '../../shared/hooks/useFormState.js'

// Validacion de forma solo como UX; la autoridad es el backend.
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const INITIAL = { email: '', password: '', rememberMe: false }

/**
 * Estado y orquestacion del login. La pagina consume este hook y navega en el exito.
 * `submit()` devuelve `{ ok }`; si el backend rechaza (401 con "credenciales invalidas"), su mensaje
 * queda en `submitError` tal cual.
 */
export function useLogin() {
  const { t } = useI18n()

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

  const { submit: submitForm } = form
  const submit = useCallback(
    () =>
      submitForm(async (v) => {
        try {
          await login({ email: v.email.trim(), password: v.password, rememberMe: v.rememberMe })
          return { ok: true }
        } catch (err) {
          if (err?.code === TWO_FACTOR_REQUIRED) return { ok: false, message: t('auth.errors.twoFactorUnsupported') }
          return { ok: false, message: extractApiErrorMessage(err) }
        }
      }),
    [submitForm, t],
  )

  return { ...form, submit }
}

export default useLogin
