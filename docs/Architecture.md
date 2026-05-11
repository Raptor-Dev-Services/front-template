# Arquitectura

---

## Capas del sistema

```
┌─────────────────────────────────────────────┐
│                   Pages                      │  src/pages/
│   Una página por ruta. Solo consume el hook  │
├─────────────────────────────────────────────┤
│               Components                     │  src/components/<dominio>/
│   Desktop/ + Mobile/ + Shared/               │
├──────────────────────┬──────────────────────┤
│      Module Hook     │   Layout / Primitives │  src/components/<dominio>/use*.js
│  Estado + lógica +   │   Modal, FormField,   │  src/components/layout/
│  filtros + acciones  │   AppNotification…    │  src/components/primitives/
├──────────────────────┴──────────────────────┤
│                  API Services                │  src/api/<domain>Service.js
│   Funciones async puras. resolveApiEnvelope  │
├─────────────────────────────────────────────┤
│              Axios Client + Interceptors     │  src/api/clients.js
│   Bearer token, error normalizado            │
├─────────────────────────────────────────────┤
│                 Auth / Session               │  src/auth/session.js
│   JWT en localStorage, getProfile()         │
└─────────────────────────────────────────────┘
```

---

## Flujo de datos — lectura

```
Page mount
  └─ useEffect → loadData()               (hook)
        └─ getDomainEntities()            (api service)
              └─ prodApi.get(url)         (axios client)
                    └─ resolveApiEnvelope (clients.js)
                          └─ setRows([])  (hook state)
                                └─ pagedRows (useMemo)
                                      └─ <TableDesktop rows={pagedRows} />
```

## Flujo de datos — escritura

```
User click "Guardar"
  └─ handleSave()                         (hook)
        └─ createDomainEntity(form)       (api service)
              └─ prodApi.post(url, body)  (axios client)
                    └─ resolveApiEnvelope
                          ├─ setNotification({ type:'success' })
                          ├─ setFormOpen(false)
                          └─ loadData()   (reload)
```

---

## Anatomía de un módulo

Cada módulo de dominio vive en `src/components/<dominio>/<modulo>/`:

```
src/components/example/users/
  useExampleUsers.js          ← Hook: TODO el estado y la lógica
  Desktop/
    ExampleUsersTableDesktop.jsx   ← Tabla para sm+
  Mobile/
    ExampleUsersCardsMobile.jsx    ← Tarjetas para mobile
```

La página en `src/pages/ExampleUsers.jsx` solo:
1. Llama al hook (`const m = useExampleUsers()`)
2. Detecta breakpoint (`useMediaQuery`)
3. Renderiza Desktop o Mobile según breakpoint
4. Monta modales y notificación

**Regla:** La página no tiene estado propio ni lógica de negocio.

---

## Patrón de nombres de archivos

| Tipo | Patrón | Ejemplo |
|---|---|---|
| Servicio API | `<domain>Service.js` | `exampleUsersService.js` |
| Hook de módulo | `use<Domain><Module>.js` | `useExampleUsers.js` |
| Página | `<Domain><Module>.jsx` | `ExampleUsers.jsx` |
| Tabla desktop | `<Domain>TableDesktop.jsx` | `ExampleUsersTableDesktop.jsx` |
| Tarjetas mobile | `<Domain>CardsMobile.jsx` | `ExampleUsersCardsMobile.jsx` |
| Utils del módulo | `<domain><Module>Utils.js` | `exampleUsersUtils.js` |

---

## Alias de rutas (vite.config.js)

| Alias | Ruta |
|---|---|
| `@styles` | `src/styles/` |
| `@api` | `src/api/` |
| `@utils` | `src/utils/` |
| `@components` | `src/components/` |
| `@pages` | `src/pages/` |
| `@routes` | `src/routes/` |

---

## Proxy de desarrollo

El proxy de Vite reescribe `/api/*` → `VITE_DEV_API_PROXY_TARGET`. Esto evita CORS en desarrollo y permite apuntar a distintos backends sin cambiar el código fuente.

```
Browser → /api/example/users
  → Vite dev server proxy
    → http://localhost:5080/api/example/users
```

En producción `VITE_API_BASE_URL` es la URL completa del API y no hay proxy.

---

## API Envelope

Todas las respuestas del backend siguen la forma:

```json
{
  "isSuccess": true,
  "data": [ ... ],
  "message": "OK",
  "utcTimeStamp": "2025-01-01T00:00:00Z"
}
```

`resolveApiEnvelope(response.data)` maneja tres casos:

| Payload | Resultado |
|---|---|
| `{ isSuccess: true, data: [...] }` | Retorna `data` |
| `{ isSuccess: false, message: "Error X" }` | Lanza `Error("Error X")` |
| Array plano o dato sin envelope | Lo retorna tal cual |

`extractApiErrorMessage(error)` extrae el mensaje legible de cualquier error rechazado por el interceptor.

---

## Auth / Sesión

El token JWT se almacena en `localStorage` bajo la clave `appToken`. El perfil decodificado bajo `appProfile`.

```
Login externo
  → setSession(token, profile)   → localStorage
  → Axios interceptor             → Authorization: Bearer <token>
  → getProfile()                  → { name, employee, ... }
  → isTokenValid()                → verifica exp del JWT
  → clearSession()                → logout
```

---

## Rutas y layout

`AppRoutes.jsx` define dos tipos de layout:

- **Constrained**: `max-w-screen-xl mx-auto` — para módulos con formularios y tablas normales
- **Wide**: sin max-width — para tablas muy anchas o dashboards

Una ruta se agrega al layout wide registrándola en `src/routes/wideRoutes.js`.

---

## Responsive

Todos los módulos tienen variante desktop y mobile. La decisión se toma en la página con:

```js
const isDesktop = useMediaQuery('(min-width: 640px)')
// sm breakpoint de Tailwind = 640px
```

- Desktop (`isDesktop === true`): tabla `<table>` con columnas
- Mobile (`isDesktop === false`): tarjetas `<article>` con `<dl>`

Los modales son compartidos — no tienen variante.
