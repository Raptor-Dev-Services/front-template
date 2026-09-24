import { ErrorScreen } from '../../ui/ErrorScreen.jsx'
import { AppButton } from '../../ui/AppButton.jsx'
import { useI18n } from '../../i18n/useI18n.js'

/**
 * NotFoundPage - 404. Misma pantalla que ErrorBoundary (regla `error-screens`): cambia el texto y que la
 * salida lleva al inicio en vez de recargar -recargar un 404 da el mismo 404-. Sin banner tecnico: una
 * ruta que no existe no es una excepcion que reportar.
 */
export function NotFoundPage() {
  const { t } = useI18n()

  return (
    <ErrorScreen
      eyebrow={t('notFound.eyebrow')}
      title={t('notFound.title')}
      body={t('notFound.body')}
      action={<AppButton to="/">{t('common.backHome')}</AppButton>}
    />
  )
}

export default NotFoundPage
