import { Outlet, useLocation } from 'react-router-dom'
import { ErrorBoundary } from '../ui/ErrorBoundary.jsx'
import { Container } from '../ui/Container.jsx'
import { LocaleSwitcher } from '../ui/LocaleSwitcher.jsx'
import { ThemeToggle } from '../ui/ThemeToggle.jsx'
import { useI18n } from '../i18n/useI18n.js'

/**
 * PublicLayout - lo que se ve SIN sesion: login y 404. Cabecera minima con el nombre de la app, idioma y
 * tema (quien no ha entrado tambien tiene que poder cambiarlos), enlace de salto y su propio limite de
 * error interior.
 */
export function PublicLayout() {
  const { t } = useI18n()
  const location = useLocation()

  return (
    <div className="flex min-h-screen flex-col bg-surface">
      <a href="#main-content" className="ui-skip-link">
        {t('app.skipToContent')}
      </a>
      <header className="border-b border-border">
        <Container className="flex h-16 items-center justify-between gap-4">
          <span className="flex items-center gap-2 text-sm font-bold tracking-tight text-content">
            <img src="/favicon.svg" alt="" aria-hidden="true" className="size-7" />
            {t('app.name')}
          </span>
          <div className="flex items-center gap-2">
            <LocaleSwitcher />
            <ThemeToggle />
          </div>
        </Container>
      </header>
      <main id="main-content" tabIndex={-1} className="flex-1 focus:outline-none">
        <ErrorBoundary key={location.pathname}>
          <Outlet />
        </ErrorBoundary>
      </main>
    </div>
  )
}

export default PublicLayout
