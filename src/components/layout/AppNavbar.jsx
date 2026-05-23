import { Link, useLocation, useNavigate } from 'react-router-dom'
import { ArrowRightOnRectangleIcon } from '@heroicons/react/24/outline'
import { cx, ui } from '../../styles/designSystem'
import { clearSession, getProfile } from '../../auth/session'

const NAV_ITEMS = [
  { label: 'Inicio',    to: '/app' },
  { label: 'Usuarios',  to: '/app/example/users' },
]

export default function AppNavbar() {
  const { pathname } = useLocation()
  const navigate     = useNavigate()
  const profile      = getProfile()

  function handleLogout() {
    clearSession()
    navigate('/login', { replace: true })
  }

  return (
    <header className={ui.layout.stickyTopBar}>
      <div className="mx-auto flex h-14 max-w-screen-xl items-center gap-6 px-4 sm:px-6">
        <Link to="/app" className="text-sm font-black tracking-tight text-slate-900">
          front-template
        </Link>

        <nav className="flex items-center gap-1">
          {NAV_ITEMS.map((item) => {
            const active =
              item.to === '/app'
                ? pathname === '/app' || pathname === '/app/'
                : pathname.startsWith(item.to)
            return (
              <Link
                key={item.to}
                to={item.to}
                className={cx(ui.controls.navItem, active ? ui.controls.navItemActive : ui.controls.navItemIdle)}
              >
                {item.label}
              </Link>
            )
          })}
        </nav>

        <div className="ml-auto flex items-center gap-3">
          {profile.email && (
            <div className="hidden flex-col items-end sm:flex">
              <span className={ui.typography.bodyStrong}>{profile.email}</span>
              {profile.role && (
                <span className={ui.badge.neutral}>{profile.role}</span>
              )}
            </div>
          )}
          <button
            type="button"
            onClick={handleLogout}
            title="Cerrar sesión"
            className={ui.controls.iconButton}
          >
            <ArrowRightOnRectangleIcon className="size-5" />
          </button>
        </div>
      </div>
    </header>
  )
}
