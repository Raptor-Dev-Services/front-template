# Reglas del proyecto

Reglas explícitas y no negociables. Aplicar en todo código nuevo o modificado.

---

## Reglas de arquitectura

### R1 — React 19, functional components y hooks únicamente
No usar class components. No usar `React.Component`. No usar `componentDidMount`.

```jsx
// ✅ correcto
export default function MyComponent() {
  const [value, setValue] = useState('')
  return <input value={value} onChange={e => setValue(e.target.value)} />
}

// ❌ incorrecto
class MyComponent extends React.Component { ... }
```

---

### R2 — Todo HTTP pasa por `src/api/clients.js`
Prohibido usar `fetch` nativo. Prohibido crear instancias de axios fuera de `clients.js`.

```js
// ✅ correcto
import { apiClient } from '../api/clients'
const res = await apiClient.get('/api/domain/entities')

// ❌ incorrecto
const res = await fetch('/api/domain/entities')
const res = await axios.get('/api/domain/entities')
```

---

### R3 — Siempre usar `resolveApiEnvelope` y `extractApiErrorMessage`
Nunca parsear el envelope `{ isSuccess, data, message }` localmente por módulo.

```js
// ✅ correcto
const data = resolveApiEnvelope(res.data)

// ❌ incorrecto
if (res.data.isSuccess) return res.data.data
else throw new Error(res.data.message)
```

---

### R4 — Mostrar `message` de la API cuando `isSuccess = false`
Cuando el backend retorna `isSuccess: false`, mostrar el `message` del backend al usuario — no un texto genérico propio.

```js
// ✅ correcto — resolveApiEnvelope lanza con el mensaje del backend
try {
  await createEntity(form)
} catch (err) {
  setNotification({ type: 'error', message: extractApiErrorMessage(err) })
}

// ❌ incorrecto
} catch {
  setNotification({ type: 'error', message: 'Ocurrió un error inesperado' })
}
```

---

### R5 — Notificaciones solo con `AppNotification`
Prohibido usar `alert()`, `confirm()`, `window.alert()`, o divs inline con mensajes de resultado.

```jsx
// ✅ correcto
<AppNotification notification={m.notification} onClose={() => m.setNotification(null)} />

// ❌ incorrecto
alert('Registro creado')
<div style={{color:'green'}}>Registro creado</div>
```

---

### R6 — Patrón: api service → hook → page → components
El orden es siempre este. La lógica vive en el hook. La página no tiene estado propio.

```
src/api/myService.js          ← funciones async puras
src/components/domain/module/
  useMyModule.js              ← TODO el estado y la lógica
  Desktop/MyTableDesktop.jsx  ← solo presentación
  Mobile/MyCardsMobile.jsx    ← solo presentación
src/pages/MyModule.jsx        ← conecta hook + componentes + modales
```

---

### R7 — Versión mobile OBLIGATORIA en todo módulo nuevo o modificado
Todo listado de datos tiene variante `Desktop/` y `Mobile/`. La página detecta breakpoint con `useMediaQuery('(min-width: 640px)')`. Si se modifica el desktop, también se modifica el mobile.

```jsx
// ✅ correcto — en la página
const isDesktop = useMediaQuery('(min-width: 640px)')
return isDesktop ? <MyTableDesktop {...props} /> : <MyCardsMobile {...props} />
```

Mobile usa `<article>` con `<dl>/<dt>/<dd>`. Desktop usa `<table>`.

---

### R8 — Tokens de design system OBLIGATORIOS
Siempre importar `{ ui, cx }` de `src/styles/designSystem.js`. Nunca hardcodear clases Tailwind repetitivas.

```jsx
// ✅ correcto
import { ui, cx } from '../styles/designSystem'
<button className={ui.controls.accentButton}>Nuevo</button>
<div className={ui.surface.toolbar}>...</div>

// ❌ incorrecto
<button className="inline-flex min-h-11 items-center justify-center rounded-md bg-[#ff6100] ...">
```

Acceder siempre con la ruta anidada completa: `ui.controls.primaryButton` — no `ui.primaryButton`.

---

### R9 — Usar componentes compartidos antes de construir desde cero
Antes de implementar un modal, tabla o notificación, verificar si existe en `src/components/layout/` o `src/components/primitives/`.

| Necesidad | Componente a usar |
|---|---|
| Formulario INSERT/UPDATE | `RecordEditModal` |
| Confirmación de acción | `MasterActionModal` |
| Tabla de datos | `ui.table.*` + `ActionMenu` + `StatusBadge` |
| Paginación | `Pagination` |
| Notificación de resultado | `AppNotification` |
| Modal custom | `Modal` + `FormField` |

---

### R10 — Inspeccionar módulo similar antes de crear uno nuevo
Leer al menos un módulo existente del mismo tipo antes de implementar uno nuevo. Para tablas CRUD: ver `src/components/example/users/`.

---

### R11 — No instalar librerías nuevas sin consultar
El stack está definido. Si un paquete parece necesario, consultar primero.

---

### R12 — Las llamadas API pasan por el proxy de Vite en desarrollo
Nunca hardcodear IPs o puertos en el código. En dev, las peticiones a `/api/*` son proxiadas por Vite.

```js
// ✅ correcto
apiClient.get('/api/domain/entities')   // → proxy → VITE_DEV_API_PROXY_TARGET

// ❌ incorrecto
apiClient.get('http://172.30.11.28:8080/api/domain/entities')
```

---

### R13 — SignalR para tiempo real, nunca polling
Si los datos se actualizan desde otro cliente, usar SignalR. Nunca `setInterval` ni `setTimeout` para re-fetch periódico.

```js
// ✅ correcto — SignalR actualiza al recibir el evento
connection.on('EntityChanged', () => loadData())

// ❌ incorrecto
setInterval(() => loadData(), 5000)
```

---

### R14 — Todo módulo nuevo se registra en navbar y wideRoutes (si aplica)
Al crear una ruta, agregar el ítem de navegación en `AppNavbar.jsx` y, si la tabla es ancha, la ruta en `wideRoutes.js`.

---

### R15 — Filtros en URL cuando el usuario necesita persistencia
Si el módulo tiene filtros que conviene mantener al navegar o compartir, usar `useSearchParams` (Patrón 4 en `docs/Patterns.md`).

---

### R16 — Audit trail: toda escritura incluye `updatedByUser`
Obtener del perfil de sesión. Nunca hardcodear ni dejar vacío.

```js
// ✅ correcto — email viene del claim del JWT del back-template
import { getProfile } from '../auth/session'
const updatedByUser = getProfile().email || 'unknown'
await updateEntity(id, { ...form, updatedByUser })

// ❌ incorrecto
await updateEntity(id, { ...form, updatedByUser: 'admin' })
await updateEntity(id, { ...form })
```

---

## Anti-patrones a evitar

| Anti-patrón | Por qué evitarlo | Alternativa |
|---|---|---|
| `fetch()` nativo | Sin interceptores, sin manejo de errores consistente | `apiClient` de `clients.js` |
| Estado en la página | Dificulta testing y reutilización | Mover al hook del módulo |
| `alert()` / `confirm()` | No se puede estilizar, bloquea el hilo | `AppNotification` / `MasterActionModal` |
| Clases Tailwind hardcodeadas y repetidas | Difícil mantener consistencia | Tokens `ui.*` |
| `ui.primaryButton` (sin ruta anidada) | No existe, causa `undefined` | `ui.controls.primaryButton` |
| `console.log` en producción | Contamina logs | Eliminar antes de merge |
| `any` implícito en datos de API | Dificulta debugging | Validar con `Array.isArray` y `??` |
| Pollar con `setInterval` | Ineficiente, inconsistente | SignalR |
| Lógica en componentes de tabla | Dificulta reutilización | Mover al hook |
| Props drilling más de 2 niveles | Difícil de mantener | Pasar por el hook, o Context si es global |

---

## Convenciones de nombres — referencia rápida

### Funciones en el hook

| Propósito | Nombre |
|---|---|
| Cargar datos | `loadData` |
| Abrir formulario crear | `handleOpenCreate` |
| Abrir formulario editar | `handleOpenEdit(row)` |
| Guardar (insert o update) | `handleSave` |
| Dar de baja | `handleDeactivate(row)` |
| Reactivar | `handleReactivate(row)` |
| Eliminar | `handleDelete(row)` |
| Limpiar filtros | `handleClearFilters` |
| Ver detalle | `handleOpenDetail(row)` |

### Estado del confirmModal

```js
{
  open: false,
  title: '',
  message: '',
  variant: 'info',          // 'info' | 'danger' | 'success'
  confirmText: 'Confirmar',
  requireComment: false,
  action: null,             // función async — se llama en onConfirm
}
```

### Estado del notification

```js
null   // sin toast activo
{ id: crypto.randomUUID(), type: 'success' | 'error' | 'warning' | 'info', message: '...', title?: '...' }
```
