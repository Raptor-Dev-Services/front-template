import { ArrowRightIcon } from '@heroicons/react/24/outline'
import { SectionHeading } from '../../ui/SectionHeading.jsx'
import { AppButton } from '../../ui/AppButton.jsx'
import { useI18n } from '../../i18n/useI18n.js'
import { getClaims, hasPermission } from '../../auth/session.js'
import { PERMISSIONS } from '../../auth/permissions.js'

// HomePage - pantalla de inicio de ejemplo. Sustituyela por la de tu producto. Muestra la forma de una
// pagina del panel: encabezado tipografico y zonas separadas por linea (.ui-section), sin tarjetas.
export function HomePage() {
  const { t } = useI18n()
  const name = getClaims()?.userName

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <SectionHeading
        title={name ? t('home.greeting', { name }) : t('home.title')}
        subtitle={t('home.subtitle')}
      />

      <div>
        {hasPermission(PERMISSIONS.usersRead) ? (
          <section className="ui-section" aria-labelledby="home-users">
            <h2 id="home-users" className="text-base font-semibold text-content">
              {t('home.usersTitle')}
            </h2>
            <p className="mt-1 max-w-prose text-sm text-muted">{t('home.usersBody')}</p>
            <AppButton to="/users" variant="secondary" size="sm" className="mt-4">
              {t('home.usersCta')}
              <ArrowRightIcon aria-hidden="true" className="size-4" />
            </AppButton>
          </section>
        ) : null}

        <section className="ui-section" aria-labelledby="home-chassis">
          <h2 id="home-chassis" className="text-base font-semibold text-content">
            {t('home.chassisTitle')}
          </h2>
          <p className="mt-1 max-w-prose text-sm text-muted">{t('home.chassisBody')}</p>
        </section>
      </div>
    </div>
  )
}

export default HomePage
