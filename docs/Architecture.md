# Arquitectura

Cliente web React 19 + Vite 8 + Tailwind CSS 4, en JavaScript. Companero del `back-template`: habla con
su API REST (envelope unico, JWT con claims `permission` y `tenant_id`).

---

## Estructura

```
src/
  main.jsx            arranque: manejador de chunks viejos + carga del idioma, y luego monta <App/>
  App.jsx             composition root: ErrorBoundary > ThemeProvider > I18nProvider > BrowserRouter
  index.css           tokens (@theme), tema oscuro, capa .ui-*, foco global, reduced-motion
  routes/
    AppRoutes.jsx     mapa de rutas
    guards.jsx        RequireAuth, RequirePermission
    lazyRoute.js      React.lazy con recarga unica ante un chunk que ya no existe
  layouts/
    AppLayout.jsx     panel con sesion: sidebar / drawer movil, topbar, limite de error interior
    PublicLayout.jsx  sin sesion: login y 404
    navItems.js       items del menu + filterNavItems (puro, probado)
  pages/              adaptadores de ruta de UNA linea (re-export de la feature)
  features/
    <feature>/
      <Name>Page.jsx  la pantalla
      hooks/          estado y orquestacion (useX.js)
      components/     piezas de ESTA feature
      utils/          funciones puras de ESTA feature
    shared/hooks/     hooks reutilizables (useFormState, useAbortableLoad, useDebouncedValue,
                      useOnVisible, useCsvExport)
  api/
    client.js         instancia UNICA de axios + envelope + refresh + clasificacion de errores
    paging.js         fetchAllPages
    auth.js, users.js servicios por dominio
  auth/
    session.js        tokens (recordarme) y claims del JWT
    jwt.js            decodificador UTF-8 del payload
    permissions.js    nombres de permisos que consulta el front
  i18n/               I18nProvider, useI18n, translate (pura), diccionarios es/en
  ui/                 primitivas accesibles (ver Components.md) y theme/
  styles/             tokens.js (espejo JS), designSystem.js (cx), pruebas de tokens
  utils/              csv, url, loadStatus, chunkRecovery
  config/env.js       UNICO lector de import.meta.env
  testUtils/          ayudas para pruebas (fakeJwt); no las importa la app
vite/csp.js           plugin de build que inyecta la Content-Security-Policy
```

Las pruebas viven junto al codigo: `algo.test.js(x)` al lado de `algo.js(x)`.

---

## Flujo de una lectura

```
UsersPage
  -> useUsers()                    estado: status / items / total / page (de la URL)
    -> useAbortableLoad(load)      corre load(signal) y aborta al cambiar de pagina o desmontar
      -> listUsers({ page, signal })   src/api/users.js
        -> http.get('/api/v1/users')      src/api/client.js (Bearer por interceptor)
        <- resolveApiEnvelope(res)     data o Error con el message del servidor
        <- normalizePage(data)         { items, total } venga como items o profiles
  <- LOAD_STATUS.loading | success | error  ->  RowsSkeleton | tabla o DataEmpty | DataError
```

## Flujo de una escritura

```
UsersPage -> useUsers().actions.edit(id, payload)
  -> runAction: updateUser() y, si sale bien, recarga la lista
  <- { ok: true } | { ok: false, message }     NUNCA lanza
UsersPage -> si ok: AppNotification de exito; si no: el modal muestra message en linea
```

---

## Cliente HTTP y envelope

- **Una sola instancia** (`http` en `src/api/client.js`), timeout de 20 s, `baseURL = env.apiBaseUrl`.
- **Envelope**: `{ isSuccess | success, data, message, errors, utcTimeStamp }`, camelCase o PascalCase.
  `resolveApiEnvelope(respuestaAxios | cuerpo)` devuelve `data` o lanza con el mensaje del servidor
  (`message`, o la lista `errors`), con el envelope en `error.envelope`.
- **Errores**: `extractApiErrorKey(err)` devuelve el mensaje del backend tal cual o una clave de
  `API_ERROR_KEYS` (`forbidden`, `timeout`, `network`, `unexpected`...). Nunca el texto ingles de axios
  ni una pagina HTML. `extractApiErrorMessage(err)` lo traduce. `isAbortError(err)` distingue una
  cancelacion de un fallo.
- **Refresh**: ante un 401 fuera de `/api/v1/auth/*`, `handleResponseError` renueva el par de tokens UNA vez
  (un solo refresh en vuelo compartido) y reintenta. Si falla, limpia la sesion y manda a `/login`
  (salvo que ya se este ahi).

## Sesion

- `setTokens({ accessToken, refreshToken, rememberMe })`: con "recordarme" en `localStorage`, sin el en
  `sessionStorage`. El refresh reescribe en el mismo lugar. Todo acceso a storage va en `try/catch`.
- `getClaims()` -> `{ sub, userName, email, tenantId, roles[], permissions[], expiresAt }`.
- `isAuthenticated()`: access vigente, o vencido con refresh token (la primera peticion lo renueva).
- `hasPermission(p)`, `hasAnyRole(roles)`. El claim de permisos es `permission` (string o arreglo).
- El front **no valida la firma** y **no envia `tenant_id`**: la autoridad es el backend.

## Rutas y guardas

| Ruta | Guarda | Layout |
|---|---|---|
| `/` | `RequireAuth` | AppLayout |
| `/users` | `RequireAuth` + `RequirePermission(users.read)` | AppLayout |
| `/login` | ninguna (si ya hay sesion, redirige) | PublicLayout |
| `*` (404) | ninguna | PublicLayout |

`RequireAuth` guarda el origen en `state.from` y el login vuelve ahi. Las rutas del panel son diferidas
(`lazyRoute`) y su `Suspense` vive dentro del layout: el menu no parpadea al navegar.

## Limites de error

Dos niveles (regla `error-screens`): el **exterior** en `App.jsx` envuelve tambien a los providers; el
**interior** en cada layout envuelve el `<Outlet />` con `key={pathname}`. `ErrorBoundary` no depende de
ningun contexto: traduce con la funcion pura. El 404 usa la misma `ErrorScreen`.

## Despliegues y chunks viejos

Tras un despliegue, una pestana abierta pide chunks que ya no existen. `lazyRoute` y el manejador de
`vite:preloadError` recargan **una vez** (marca en `sessionStorage`, puesta antes de recargar y limpiada
al primer acierto). `index.html` se sirve con `no-cache` y `/assets` con cache inmutable (`nginx.conf`).

## Responsive

Mobile-first. El panel usa sidebar fija desde `lg` y un drawer (`Dialog` de Headless UI) por debajo. Las
tablas se muestran completas desde `md` y como lista apilada con `StackedField` en movil: es la misma
lista con dos formas dentro del mismo componente, no dos componentes que puedan divergir.
