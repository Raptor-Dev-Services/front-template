import { useI18n } from '../i18n/useI18n.js'

// Espera de navegacion: el fallback de Suspense mientras baja el chunk de una ruta diferida. Es texto
// y no un spinner propio; las pantallas con carga larga usan su propio esqueleto de contenido.
// `role="status"` lo anuncia al lector de pantalla.
export function RouteLoading() {
  const { t } = useI18n()

  return (
    <p role="status" className="text-sm text-muted">
      {t('common.loading')}
    </p>
  )
}

export default RouteLoading
