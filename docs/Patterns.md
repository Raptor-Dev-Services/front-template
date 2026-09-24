# Patrones: como agregar un modulo

El modulo de ejemplo `src/features/users/` es la referencia viva. **Abrelo antes de escribir uno nuevo** y
copia su forma. Estos son los pasos y el porque de cada pieza.

---

## 1. Servicio (`src/api/<dominio>.js`)

Solo funciones `async`, siempre sobre el cliente central y `resolveApiEnvelope`. La normalizacion ocurre
DESPUES de resolver el envelope. Acepta `signal` en las lecturas.

```js
import { http, resolveApiEnvelope } from './client.js'

export async function listWidgets({ page = 1, pageSize = 20, signal } = {}) {
  const res = await http.get('/api/widgets', { params: { page, pageSize }, signal })
  const data = resolveApiEnvelope(res)
  return { items: data?.items ?? [], total: Number(data?.total ?? 0) }
}

export async function renameWidget(id, { name }) {
  const res = await http.put(`/api/widgets/${encodeURIComponent(id)}`, { name })
  return resolveApiEnvelope(res)
}
```

Nunca: `fetch`, otra instancia de axios, el token a mano, `tenant_id` en el cuerpo.

## 2. Hook de la feature (`src/features/<f>/hooks/use<F>.js`)

- Estado con `LOAD_STATUS` (`loading | success | error`) + `items` + `total`.
- `load(signal)` en un `useCallback` y `useAbortableLoad(load)`; en el `catch`, `if (isAbortError(err)) return`.
- Lo que el usuario querria compartir por enlace (pagina, filtros, pestana) va en la URL con
  `useSearchParams`, validado y sin escribir el default (regla `url-state`). Ver `parsePage` en `useUsers`.
- Paginacion y filtros en el SERVIDOR; `totalPages` sale del `total` del servidor.
- Acciones que devuelven `{ ok, message }` y nunca lanzan; recargan la lista si salen bien.
- `useOnVisible(() => load(), { enabled: status === LOAD_STATUS.success })` para recargar al volver a la
  pestana.
- `retry: () => load()` (envuelto: `onClick={load}` pasaria el evento donde va el AbortSignal).

## 3. Componentes (`src/features/<f>/components/`)

- `<F>States.jsx`: loading/error/empty sobre `RowsSkeleton`, `DataError`, `DataEmpty`, con las claves de
  la feature.
- La tabla: completa desde `md`, lista apilada con `StackedField` en movil, dentro del MISMO componente.
- Formularios en `AppModal` con `useFormState` y `resetKey` que incluye el id del registro.
- Confirmaciones con `ConfirmDialog`; resultados con `AppNotification` + `useNotification`.

## 4. Pagina (`src/features/<f>/<F>Page.jsx`) y adaptador (`src/pages/<F>.jsx`)

La pagina compone hook y componentes y pinta los cuatro estados. El adaptador es una linea:

```js
export { WidgetsPage as default } from '../features/widgets/WidgetsPage.jsx'
```

## 5. Permiso, ruta y menu

1. El nombre del permiso en `src/auth/permissions.js` (igual al del catalogo del backend).
2. La ruta en `src/routes/AppRoutes.jsx`, diferida con `lazyRoute` y protegida:
   ```jsx
   const Widgets = lazyRoute(() => import('../pages/Widgets.jsx'))
   <Route path="widgets" element={<RequirePermission permission={PERMISSIONS.widgetsRead}><Widgets /></RequirePermission>} />
   ```
3. El item en `src/layouts/navItems.js` con el MISMO `permission` que la ruta.

## 6. Textos

Claves en `src/i18n/messages.es.js` y `messages.en.js`, con el mismo juego en los dos (lo vigila
`paridadDeIdiomas.test.js`). Variables con `{llave}`: nunca concatenar. Fechas con `formatDate`, dinero
con `formatCurrency` (del `useI18n`).

## 7. Pruebas

Junto al codigo. Como minimo: el servicio (URL, params, envelope) y la pagina en sus estados (carga,
vacio, error con reintento, exito) y en sus acciones. Ver `features/users/UsersPage.test.jsx` y
`api/users.test.js`. Para una sesion de prueba, `fakeJwt` de `src/testUtils`.

## 8. Exportar a CSV

`useCsvExport({ fetchPage, columns, reportName, locale })` recorre TODAS las paginas con el mismo
filtro; nunca exporta solo la pagina visible. `columns` lleva encabezados traducidos y `format` por celda.

---

## Tiempo real (cuando haga falta)

La plantilla no trae cliente de tiempo real: no hay ningun canal que consumir todavia. Cuando lo haya,
instala el cliente que corresponda (p. ej. `@microsoft/signalr` para un hub de ASP.NET), crea el socket
en un hook con cleanup, pasale el token con `getAccessToken` y **combinalo con `useOnVisible`**: el canal
se cae con cada despliegue y cada suspension del equipo, y volver a la pestana es cuando hay que recargar.
Agrega el origen `ws(s)://` a la CSP (ya lo hace `vite/csp.js` para el origen de la API).
