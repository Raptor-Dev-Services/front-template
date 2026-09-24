import { HomeIcon, UsersIcon } from '@heroicons/react/24/outline'
import { PERMISSIONS } from '../auth/permissions.js'

// Items del menu lateral. `labelKey` es la clave i18n; `permission`, si se define, oculta el item a
// quien no lo tiene. Es el MISMO permiso que exige su ruta en AppRoutes (RequirePermission): el menu no
// puede ofrecer un enlace que la ruta va a rebotar.
//
// Agregar un modulo: su ruta en routes/AppRoutes.jsx, su item aqui y sus claves en src/i18n.
export const NAV_ITEMS = [
  { key: 'home', to: '/', labelKey: 'nav.home', Icon: HomeIcon, end: true },
  { key: 'users', to: '/users', labelKey: 'nav.users', Icon: UsersIcon, permission: PERMISSIONS.usersRead },
]

/**
 * Items visibles para una sesion. PURA y exportada para probarla sin montar el layout entero (router,
 * sesion, i18n): esta decision cabe en una linea y es la que no puede equivocarse.
 */
export function filterNavItems(items, can) {
  return items.filter((item) => !item.permission || can(item.permission))
}
