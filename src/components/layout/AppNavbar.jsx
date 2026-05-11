import { Link, useLocation } from 'react-router-dom'
import { cx, ui } from '../../styles/designSystem'

const NAV_ITEMS = [
  { label: 'Inicio', to: '/app' },
  { label: 'Usuarios (ejemplo)', to: '/app/example/users' },
]

export default function AppNavbar() {
  const { pathname } = useLocation()

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
      </div>
    </header>
  )
}
