import { useState } from 'react'
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { Dialog, DialogPanel } from '@headlessui/react'
import { ArrowRightStartOnRectangleIcon, Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline'
import { ErrorBoundary } from '../ui/ErrorBoundary.jsx'
import { IconButton } from '../ui/IconButton.jsx'
import { LocaleSwitcher } from '../ui/LocaleSwitcher.jsx'
import { ThemeToggle } from '../ui/ThemeToggle.jsx'
import { useI18n } from '../i18n/useI18n.js'
import { getClaims, hasPermission } from '../auth/session.js'
import { logout } from '../api/auth.js'
import { env } from '../config/env.js'
import { cx } from '../styles/designSystem.js'
import { NAV_ITEMS, filterNavItems } from './navItems.js'

function AppMark() {
  const { t } = useI18n()
  return (
    <span className="flex items-center gap-2 text-sm font-bold tracking-tight text-content">
      <img src="/favicon.svg" alt="" aria-hidden="true" className="size-7" />
      {t('app.name')}
    </span>
  )
}

function SidebarNav({ onNavigate }) {
  const { t } = useI18n()
  const items = filterNavItems(NAV_ITEMS, hasPermission)

  return (
    <nav aria-label={t('nav.label')} className="flex flex-col gap-1 p-3">
      {items.map(({ key, to, labelKey, Icon, end }) => (
        <NavLink
          key={key}
          to={to}
          end={end}
          onClick={onNavigate}
          className={({ isActive }) =>
            cx(
              'flex min-h-11 items-center gap-3 rounded-lg px-3 text-sm font-medium transition-colors duration-150',
              isActive ? 'bg-brand-soft font-semibold text-brand-text' : 'text-muted hover:bg-surface-muted hover:text-content',
            )
          }
        >
          <Icon aria-hidden="true" className="size-5" />
          {t(labelKey)}
        </NavLink>
      ))}
    </nav>
  )
}

/**
 * AppLayout - armazon del panel: sidebar fija en escritorio y drawer (Dialog) en movil, topbar con la
 * identidad de la sesion, idioma, tema y cerrar sesion. Las rutas se pintan en su <Outlet />.
 *
 * Regla ui-layout-first: la pantalla no flota y adentro no hay cajas. El contenido se apoya sobre el
 * fondo de la app; el padding lateral lo pone <main>, no una tarjeta.
 */
export function AppLayout() {
  const { t } = useI18n()
  const navigate = useNavigate()
  const location = useLocation()
  const [mobileOpen, setMobileOpen] = useState(false)
  const claims = getClaims() ?? {}

  const handleLogout = async () => {
    await logout()
    navigate('/login', { replace: true })
  }

  return (
    <div className="min-h-screen bg-surface lg:flex">
      <a href="#main-content" className="ui-skip-link">
        {t('app.skipToContent')}
      </a>

      {/* Sidebar de escritorio */}
      <aside className="hidden w-64 shrink-0 border-r border-border bg-surface-muted lg:flex lg:flex-col">
        <div className="flex h-16 items-center border-b border-border px-5">
          <AppMark />
        </div>
        <SidebarNav />
        <p className="mt-auto px-5 py-4 text-xs text-muted">{t('app.version', { version: env.softwareVersion })}</p>
      </aside>

      {/* Sidebar movil: Dialog de Headless UI, asi el foco queda atrapado y Esc cierra. */}
      <Dialog open={mobileOpen} onClose={setMobileOpen} className="lg:hidden">
        <div className="fixed inset-0 z-30 bg-brand-950/40" aria-hidden="true" />
        <DialogPanel className="fixed inset-y-0 left-0 z-40 flex w-72 max-w-[85%] flex-col border-r border-border bg-surface">
          <div className="flex h-16 items-center justify-between border-b border-border px-5">
            <AppMark />
            <IconButton label={t('nav.closeMenu')} onClick={() => setMobileOpen(false)}>
              <XMarkIcon aria-hidden="true" className="size-5" />
            </IconButton>
          </div>
          <SidebarNav onNavigate={() => setMobileOpen(false)} />
        </DialogPanel>
      </Dialog>

      {/* `min-w-0`: un hijo flex trae `min-width: auto`, y sin esto una tabla ancha empuja la columna
          entera y aparece scroll horizontal en toda la pagina. */}
      <div className="flex min-h-screen min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b border-border bg-surface px-4 sm:px-6">
          <IconButton label={t('nav.openMenu')} onClick={() => setMobileOpen(true)} className="lg:hidden">
            <Bars3Icon aria-hidden="true" className="size-5" />
          </IconButton>

          <p className="min-w-0 flex-1 truncate text-sm font-semibold text-content">{claims.userName ?? t('app.name')}</p>

          <div className="flex items-center gap-2">
            <LocaleSwitcher />
            <ThemeToggle />
            <button
              type="button"
              onClick={handleLogout}
              className="inline-flex h-10 items-center gap-2 rounded-lg border border-border px-3 text-sm font-medium text-muted transition-colors duration-150 hover:bg-surface-muted hover:text-content"
            >
              <ArrowRightStartOnRectangleIcon aria-hidden="true" className="size-5" />
              <span className="hidden sm:inline">{t('nav.logout')}</span>
              <span className="sr-only sm:hidden">{t('nav.logout')}</span>
            </button>
          </div>
        </header>

        <main id="main-content" tabIndex={-1} className="flex-1 px-4 py-6 focus:outline-none sm:px-6 lg:px-8 lg:py-8">
          {/* Limite INTERIOR: una vista rota no se lleva el menu. `key` lo remonta al cambiar de ruta;
              sin ella, tras un error, todas las paginas siguientes mostrarian el mismo error viejo. */}
          <ErrorBoundary key={location.pathname}>
            <Outlet />
          </ErrorBoundary>
        </main>
      </div>
    </div>
  )
}

export default AppLayout
