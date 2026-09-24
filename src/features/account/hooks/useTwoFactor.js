import { useCallback, useState } from 'react'
import { beginTwoFactorSetup, enableTwoFactor, disableTwoFactor } from '../../../api/account.js'
import { extractApiErrorMessage } from '../../../api/client.js'
import { useI18n } from '../../../i18n/useI18n.js'
import { useFormState } from '../../shared/hooks/useFormState.js'

export const TWO_FACTOR_STEP = Object.freeze({
  idle: 'idle', // lo que corresponda al estado de la cuenta: ofrecer activar, o el formulario para apagar
  setup: 'setup', // secreto pendiente en pantalla, esperando el primer codigo de la app
  codes: 'codes', // activado: los codigos de recuperacion, que se ven UNA sola vez
})

const INITIAL = { code: '' }

/**
 * La maquina del segundo factor en la pantalla de cuenta:
 *
 *   idle --start()--> setup --confirm()--> codes --finish()--> idle (ya activo)
 *   idle (activo) --disable()--> idle (inactivo)
 *
 * `onChanged` se llama cuando el 2FA cambia de verdad (al activarlo y al apagarlo), para que la pagina
 * recargue la cuenta. Los codigos de recuperacion NO se recargan de ningun lado: si se pierden de la
 * pantalla, no hay forma de volver a verlos, asi que `finish()` es explicito ("ya los guarde").
 */
export function useTwoFactor({ onChanged } = {}) {
  const { t } = useI18n()
  const [step, setStep] = useState(TWO_FACTOR_STEP.idle)
  const [setup, setSetup] = useState(null)
  const [recoveryCodes, setRecoveryCodes] = useState([])
  const [starting, setStarting] = useState(false)
  const [startError, setStartError] = useState(null)

  // Un formulario de codigo por paso; resetKey los vacia al cambiar de paso.
  const form = useFormState({
    initialValues: INITIAL,
    validators: { code: (v) => (v.code.trim() ? null : t('account.twoFactor.errors.codeRequired')) },
    resetKey: step,
  })

  const start = useCallback(async () => {
    setStarting(true)
    setStartError(null)
    try {
      setSetup(await beginTwoFactorSetup())
      setStep(TWO_FACTOR_STEP.setup)
    } catch (err) {
      setStartError(extractApiErrorMessage(err))
    } finally {
      setStarting(false)
    }
  }, [])

  const { submit } = form
  const confirm = useCallback(
    () =>
      submit(async (v) => {
        try {
          setRecoveryCodes(await enableTwoFactor(v.code.trim()))
          setSetup(null)
          setStep(TWO_FACTOR_STEP.codes)
          return { ok: true }
        } catch (err) {
          return { ok: false, message: extractApiErrorMessage(err) }
        }
      }),
    [submit],
  )

  const cancel = useCallback(() => {
    setSetup(null)
    setStep(TWO_FACTOR_STEP.idle)
  }, [])

  const finish = useCallback(() => {
    setRecoveryCodes([])
    setStep(TWO_FACTOR_STEP.idle)
    onChanged?.()
  }, [onChanged])

  const disable = useCallback(
    () =>
      submit(async (v) => {
        try {
          await disableTwoFactor(v.code.trim())
          onChanged?.()
          return { ok: true }
        } catch (err) {
          return { ok: false, message: extractApiErrorMessage(err) }
        }
      }),
    [submit, onChanged],
  )

  return { step, setup, recoveryCodes, starting, startError, form, start, confirm, cancel, finish, disable }
}

export default useTwoFactor
