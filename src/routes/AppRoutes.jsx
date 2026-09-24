import { Suspense } from 'react'
import { Routes, Route, Outlet } from 'react-router-dom'
import { AppLayout } from '../layouts/AppLayout.jsx'
import { PublicLayout } from '../layouts/PublicLayout.jsx'
import { RequireAuth, RequirePermission } from './guards.jsx'
import { lazyRoute } from './lazyRoute.js'
import { RouteLoading } from '../ui/RouteLoading.jsx'
import { PERMISSIONS } from '../auth/permissions.js'

// En el bundle inicial va solo lo que necesita el primer render: layouts, guardas, login (a donde
// rebota toda ruta protegida sin sesion: diferirlo agregaria un viaje de red a la primera interaccion)
// y la 404 (destino del comodin, no arrastra nada propio).
import Login from '../pages/Login.jsx'
import NotFound from '../pages/NotFound.jsx'

// El resto se difiere por ruta: cada pantalla del panel viaja en su chunk. lazyRoute (y no lazy a
// secas) recarga una vez si el chunk ya no existe tras un despliegue.
const Home = lazyRoute(() => import('../pages/Home.jsx'))
const Users = lazyRoute(() => import('../pages/Users.jsx'))

// Limite de Suspense como ruta de layout sin path. Montado DENTRO del Outlet del layout, el fallback
// sustituye solo el contenido: el menu sigue en pantalla mientras baja el chunk.
function DeferredOutlet() {
  return (
    <Suspense fallback={<RouteLoading />}>
      <Outlet />
    </Suspense>
  )
}

// Mapa de rutas:
// - Con sesion (RequireAuth + AppLayout): el panel. Cada modulo declara su permiso con
//   RequirePermission, el mismo que filtra su item en layouts/navItems.js.
// - Sin sesion (PublicLayout): /login y la 404. La 404 va aqui y no dentro del panel para que una URL
//   mal escrita muestre "no existe" en vez de mandar al login.
export function AppRoutes() {
  return (
    <Routes>
      <Route
        element={
          <RequireAuth>
            <AppLayout />
          </RequireAuth>
        }
      >
        <Route element={<DeferredOutlet />}>
          <Route index element={<Home />} />
          <Route
            path="users"
            element={
              <RequirePermission permission={PERMISSIONS.usersRead}>
                <Users />
              </RequirePermission>
            }
          />
        </Route>
      </Route>

      <Route element={<PublicLayout />}>
        <Route path="login" element={<Login />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  )
}

export default AppRoutes
