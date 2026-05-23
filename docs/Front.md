# Frontend

---

## Stack

| Componente | Tecnología |
|---|---|
| Framework | React 19.2.0 |
| Router | React Router DOM 7.13.0 |
| Build | Vite 7.2.4 + `@vitejs/plugin-react-swc` 4.2.2 |
| Estilos | Tailwind CSS 4.1.18 (plugin `@tailwindcss/vite`) |
| HTTP | Axios 1.13.4 |
| Real-time | Microsoft SignalR 10.0.0 |
| Iconos | Heroicons/React 2.2.0 |
| UI headless | HeadlessUI/React 2.2.9 |
| Drag & Drop | dnd-kit (core 6.3.1, sortable 10.0.0) |
| Excel | xlsx 0.18.5 + xlsx-populate 1.21.0 |
| CSS-in-JS | styled-components 6.4.0 |

---

## Estructura de carpetas

```
src/
  api/              → Servicios HTTP por dominio + clientes Axios centrales
  auth/             → Gestión de sesión y token (session.js)
  components/       → Componentes por dominio
    example/        → Módulo de ejemplo (users CRUD)
    layout/         → Componentes globales de UI reutilizables
      Shared/       → Compartidos entre variantes del layout global
    primitives/     → Átomos: Modal, FormField, Pagination
  config/           → Variables de entorno (env.js)
  hooks/            → Hooks globales: useMediaQuery.js
  pages/            → Un archivo por ruta
  routes/           → AppRoutes.jsx + wideRoutes.js
  styles/           → designSystem.js
  utils/            → dateTime.js, csv.js, index.js (barrel)
  App.jsx
  main.jsx          → Entry point con BrowserRouter
  index.css         → @import "tailwindcss"
```

### Patrón de carpetas por módulo de dominio

Cada módulo de dominio sigue esta estructura interna bajo `src/components/<dominio>/<modulo>/`:

```
src/components/example/users/
  useExampleUsers.js          → Hook principal (estado, lógica)
  Desktop/
    ExampleUsersTableDesktop.jsx  → Tabla desktop
  Mobile/
    ExampleUsersCardsMobile.jsx   → Tarjetas mobile
```

El hook del módulo vive junto a sus componentes, no en `src/hooks/`. La página (`src/pages/`) solo importa el hook y los componentes compartidos.

---

## Alias de rutas (vite.config.js)

| Alias | Resuelve a |
|---|---|
| `@styles` | `./src/styles` |
| `@api` | `./src/api` |
| `@utils` | `./src/utils` |
| `@components` | `./src/components` |
| `@pages` | `./src/pages` |
| `@routes` | `./src/routes` |

---

## Proxy de desarrollo (vite.config.js)

| Path proxy | Target (dev) | Variable de entorno |
|---|---|---|
| `/api` | `http://localhost:5080` | `VITE_DEV_API_PROXY_TARGET` |

Toda la comunicación (autenticación + datos) pasa por un único proxy apuntando al back-template.

---

## Variables de entorno (src/config/env.js)

| Constante exportada | Variable VITE | Uso |
|---|---|---|
| `APP_TITLE` | `VITE_APP_TITLE` | Título en la pestaña del navegador |
| `API_BASE_URL` | `VITE_API_BASE_URL` | Base URL del API (vacío en dev — usa proxy) |

---

## Clientes HTTP (src/api/clients.js)

Un único cliente Axios con interceptores centrales (`apiClient`).

**Interceptores:**
- **Request**: adjunta Bearer token desde `src/auth/session.js`.
- **Response (éxito)**: pasa la respuesta tal cual.
- **Response (error)**: normaliza errores — un error rechazado siempre llega como `Error` con `.message` ya extraído.
- **401 con refresh**: si el servidor devuelve 401, el interceptor intenta renovar el access token llamando `POST /api/auth/refresh` con el refresh token almacenado. Si tiene éxito, reintenta la petición original. Si falla (refresh expirado), limpia la sesión y redirige a `/login`.

**Helpers obligatorios — importar desde `src/api/clients.js`:**

```js
import { resolveApiEnvelope, extractApiErrorMessage, apiClient } from '../api/clients'

// resolveApiEnvelope(response.data)
//   Si la respuesta tiene envelope { isSuccess, data, message }: extrae data o lanza Error(message)
//   Si isSuccess === false: lanza Error con el message de la API
//   Si la respuesta ya es un array o dato plano: lo devuelve tal cual

// extractApiErrorMessage(error, fallback?)
//   Extrae el mensaje legible de un error rechazado (después del interceptor, err.message ya es suficiente)
```

---

## Autenticación (src/api/authService.js)

Funciones de autenticación. Usan un cliente Axios sin interceptores para evitar loops con el handler de 401.

```js
import { login, register, refreshToken } from '../api/authService'

// POST /api/auth/login → { accessToken, refreshToken, expiresAtUtc }
await login(email, password)

// POST /api/auth/register → { publicId, ... }
await register({ email, password, role })

// POST /api/auth/refresh → { accessToken, refreshToken, expiresAtUtc }
await refreshToken(token)
```

**Flujo de login en la página `Login.jsx`:**
```js
const result = await login(email, password)
setSession({ token: result.accessToken, refreshToken: result.refreshToken, rememberMe })
navigate('/app', { replace: true })
```

---

## Sesión y perfil (src/auth/session.js)

Helpers para leer el token y el perfil del usuario autenticado. Usarlos dentro de hooks.

El perfil se decodifica directamente del JWT en cada llamada — no se almacena por separado. Los claims vienen del back-template: `sub` (PublicId GUID), `email`, `role`, `tenant_id`.

```js
import {
  getToken, getRefreshToken,
  setSession, clearSession,
  getProfile, isTokenValid,
  getUserRole, hasRole, getCurrentTenantId,
  getRememberPreference,
} from '../auth/session'

getToken()               // → string JWT o ''
getRefreshToken()        // → string refresh token o ''
getProfile()             // → { sub, email, role, tenantId }
isTokenValid()           // → boolean (verifica exp del JWT)
getUserRole()            // → string: 'Admin' | 'Manager' | 'User' | ''
hasRole('Admin')         // → boolean
getCurrentTenantId()     // → number | null
clearSession()           // → limpia token + refresh token de localStorage/sessionStorage

setSession({ token, refreshToken, rememberMe })
// Almacena en localStorage (rememberMe=true) o sessionStorage (rememberMe=false)
```

**Para obtener el usuario actual en operaciones de auditoría** (como `updatedByUser`):

```js
import { getProfile } from '../auth/session'
const updatedByUser = getProfile().email || 'unknown'
```

---

## Utilidades globales (src/utils/)

```js
import { formatDate } from '../utils/dateTime'
// formatDate(isoString) → 'DD/MM/YYYY HH:mm' en zona local

import { exportToCsv } from '../utils/csv'
// exportToCsv(filename, headers[], rows[][]) → descarga archivo .csv con BOM UTF-8
```

---

## Design System (src/styles/designSystem.js)

Clases Tailwind centralizadas como tokens. **PROHIBIDO hardcodear clases Tailwind repetitivas — siempre usar los tokens del design system.**

```js
import { ui, cx } from '../styles/designSystem'
```

`cx(...classes)` — helper de clases condicionales (equivalente a `clsx`):
```js
cx(ui.controls.primaryButton, isActive && 'ring-2 ring-offset-1')
```

El objeto `ui` tiene estructura **ANIDADA**. Acceder siempre con la ruta completa.

---

### ui.layout

| Token | Uso |
|---|---|
| `ui.layout.appSection` | Shell exterior de página estándar (sin borde, solo gap y altura mínima) |
| `ui.layout.moduleShell` | Shell de módulo con borde, fondo slate-50 y padding — el wrapper principal de casi toda página |
| `ui.layout.stickyTopBar` | Barra superior fija con blur (navbar) |

---

### ui.surface

| Token | Uso |
|---|---|
| `ui.surface.panel` | Tarjeta blanca con borde y sombra |
| `ui.surface.panelSoft` | Tarjeta slate-50 con borde y sombra |
| `ui.surface.toolbar` | Panel de filtros/acciones redondeado (border, padding, shadow) |
| `ui.surface.tablePanel` | Wrapper de tabla con overflow hidden |
| `ui.surface.modal` | Contenedor de modal (max-w-md, rounded-xl, bg-white, shadow-xl) |
| `ui.surface.notification` | Toast de notificación flotante |
| `ui.surface.drawer` | Panel lateral deslizante (fondo blanco) |
| `ui.surface.drawerGlass` | Panel lateral con efecto glass (backdrop-blur, bg-white/90) |

---

### ui.typography

| Token | Uso |
|---|---|
| `ui.typography.heroTitle` | Título hero de pantalla de inicio (2xl–4xl, font-black) |
| `ui.typography.pageTitle` | Título de página (lg/xl, semibold) |
| `ui.typography.sectionTitle` | Título de sección (xl, semibold) |
| `ui.typography.cardTitle` | Título de tarjeta (sm/base, semibold) |
| `ui.typography.body` | Texto de cuerpo (sm, slate-600) |
| `ui.typography.bodyStrong` | Texto de cuerpo resaltado (sm, medium, slate-700) |
| `ui.typography.eyebrow` | Etiqueta superior (xs, uppercase, tracking-wide) |
| `ui.typography.tableHead` | Encabezado de tabla (xs, uppercase, slate-600) |

---

### ui.controls

| Token | Uso |
|---|---|
| `ui.controls.input` | Input estándar (min-h-11, focus ring naranja) |
| `ui.controls.inputCompact` | Input compacto para filtros en toolbars |
| `ui.controls.textarea` | Textarea (w-full) |
| `ui.controls.disabledInput` | Input deshabilitado (slate-100, cursor-not-allowed) |
| `ui.controls.checkbox` | Checkbox estándar (size-4) |
| `ui.controls.primaryButton` | Acción principal (fondo slate-900, texto blanco) |
| `ui.controls.accentButton` | Acción destacada (fondo #ff6100 naranja) |
| `ui.controls.secondaryButton` | Acción secundaria (borde gris, fondo blanco) |
| `ui.controls.infoSoftButton` | Acción informativa suave (borde sky-300, fondo sky-50, texto sky-700) |
| `ui.controls.destructiveButton` | Acción destructiva (fondo red-600, texto blanco) |
| `ui.controls.destructiveSoftButton` | Acción destructiva suave (borde red-300, fondo red-50, texto red-700) |
| `ui.controls.subtleButton` | Acción sutil (fondo gris translúcido, dark mode compatible) |
| `ui.controls.iconButton` | Botón circular de ícono (size-10, redondeado) |
| `ui.controls.menuButton` | Botón de menú compacto (xs, borde, sin min-height) |
| `ui.controls.compactDestructiveButton` | Botón destructivo compacto (xs, borde rose-300, sin min-height) |
| `ui.controls.navItem` | Base de ítem de navegación (whitespace-nowrap, rounded-md) |
| `ui.controls.navItemActive` | Estado activo de nav (bg-slate-900, text-white) — combinar con `navItem` |
| `ui.controls.navItemIdle` | Estado inactivo de nav (text-slate-700, hover) — combinar con `navItem` |

Ejemplo combinando navItem:
```jsx
<button className={cx(ui.controls.navItem, isActive ? ui.controls.navItemActive : ui.controls.navItemIdle)}>
  Mi módulo
</button>
```

---

### ui.feedback

| Token | Uso |
|---|---|
| `ui.feedback.errorBanner` | Banner de error inline en formularios (borde red-200, fondo red-50, texto red-700) |
| `ui.feedback.emptyState` | Estado vacío centrado en tabla (py-6, text-center, slate-500) |
| `ui.feedback.loadingState` | Estado de carga centrado en tabla (igual que emptyState) |

---

### ui.table

| Token | Uso |
|---|---|
| `ui.table.wrapper` | Wrapper flex de tabla con overflow hidden y borde (equivale a `ui.surface.tablePanel` + flex) |
| `ui.table.scroll` | Div con overflow-x-auto para scroll horizontal |
| `ui.table.element` | Elemento `<table>` con divide-y y min-width responsivo |
| `ui.table.head` | `<thead>` sticky con bg-slate-100 |
| `ui.table.th` | `<th>` con whitespace-nowrap, padding, font-semibold |
| `ui.table.td` | `<td>` con whitespace-nowrap, padding, align-top |
| `ui.table.row` | `<tbody>` con divide-y divide-slate-100 |
| `ui.table.mobileHint` | Hint visible solo en mobile antes de la tabla (xs, uppercase, oculto en sm+) |

Ejemplo de tabla completa:
```jsx
<div className={ui.table.wrapper}>
  <div className={ui.table.scroll}>
    <table className={ui.table.element}>
      <thead className={ui.table.head}>
        <tr>
          <th className={ui.table.th}>ID</th>
          <th className={ui.table.th}>Nombre</th>
        </tr>
      </thead>
      <tbody className={ui.table.row}>
        {rows.map(row => (
          <tr key={row.id}>
            <td className={ui.table.td}>{row.id}</td>
            <td className={ui.table.td}>{row.name}</td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
</div>
```

---

### ui.drawer

Para paneles laterales tipo Drawer/Sidebar implementados con HeadlessUI Dialog:

| Token | Uso |
|---|---|
| `ui.drawer.overlay` | Fondo oscuro semi-transparente (fixed inset-0, bg-black/25) |
| `ui.drawer.shell` | Contenedor externo del drawer (fixed, inset-y-0, right-0) |
| `ui.drawer.panel` | Panel del drawer con transición slide (max-w-md en sm+) |
| `ui.drawer.header` | Header sticky del panel (flex, justify-end, botón de cierre) |
| `ui.drawer.body` | Cuerpo con padding del drawer |
| `ui.drawer.inner` | Contenido centrado dentro del body (max-w-sm, space-y) |

---

### ui.modal

Para modales custom (cuando `RecordEditModal` / `MasterActionModal` no alcanzan):

| Token | Uso |
|---|---|
| `ui.modal.overlay` | Fondo del modal (fixed inset-0, z-[60], flex center, bg-black/45) |
| `ui.modal.header` | Header del modal con borde inferior |
| `ui.modal.body` | Cuerpo del modal con padding y espaciado |
| `ui.modal.footer` | Footer con botones alineados a la derecha |

---

### ui.badge

| Token | Uso |
|---|---|
| `ui.badge.success` | Insignia verde (emerald) |
| `ui.badge.warning` | Insignia amarilla (amber) |
| `ui.badge.blocked` | Insignia roja (rose) |
| `ui.badge.info` | Insignia azul (sky) |
| `ui.badge.neutral` | Insignia gris (slate-200) |

---

**Color accent:** `#ff6100` (naranja). **Color primario:** `slate-900`.

---

## Componentes reutilizables compartidos

Todos viven en `src/components/layout/` y `src/components/primitives/`. **OBLIGATORIO usarlos — PROHIBIDO reimplementar su funcionalidad inline.**

---

### AppNotification (`src/components/layout/AppNotification.jsx`)

Toast de notificación flotante. Se auto-oculta y despacha evento `notification` para alimentar la campanita del navbar.

```jsx
<AppNotification
  notification={{ id, type, message, title }}  // type: 'success' | 'error' | 'warning' | 'info'
  onClose={() => setNotification(null)}
  autoHideMs={4500}  // opcional
/>
```

**Uso en hooks:** mantener estado `notification` en el hook del módulo. Al recibir respuesta de API, setearlo con `{ id: crypto.randomUUID(), type: 'success'|'error', message: '...' }`. Al dismissar, setearlo a `null`.

---

### RecordEditModal (`src/components/layout/RecordEditModal.jsx`)

Modal de edición de registros con campos declarativos. **Usar para INSERT y UPDATE de registros simples.**

```jsx
<RecordEditModal
  open={formOpen}
  title="Nuevo registro"
  description="Descripción opcional del formulario"
  fields={[
    { name: 'code', label: 'Código', type: 'text', placeholder: 'Ej: SF001' },
    { name: 'limit', label: 'Límite', type: 'number', min: 0, step: 1 },
    { name: 'isActive', label: 'Activo', type: 'checkbox', checkboxLabel: 'Marcar como activo' },
    { name: 'code', label: 'Código', type: 'text', disabled: true },  // campo solo lectura
  ]}
  values={form}
  onChange={(name, value) => setForm(prev => ({ ...prev, [name]: value }))}
  onConfirm={handleSave}
  onCancel={handleClose}
  loading={saving}
  confirmText="Guardar cambios"  // opcional, default: 'Guardar cambios'
  cancelText="Cancelar"          // opcional, default: 'Cancelar'
/>
```

**Tipos de field soportados:** `'text'` | `'number'` | `'checkbox'`. Para campos más complejos (select, textarea, multi-field custom) usar `Modal` + `FormField` directo.

---

### MasterActionModal (`src/components/layout/MasterActionModal.jsx`)

Modal de confirmación de acciones (activar, desactivar, bloquear, etc.). Soporta campo de comentario opcional.

```jsx
<MasterActionModal
  open={actionOpen}
  title="Confirmar acción"
  message="¿Estás seguro de continuar?"
  variant="danger"       // 'info' | 'danger' | 'success'
  confirmText="Sí, continuar"
  cancelText="Cancelar"  // opcional, omitir para modo solo-confirm
  onConfirm={handleConfirm}
  onCancel={() => setActionOpen(false)}
  loading={saving}
  showComment={true}           // opcional
  commentRequired={true}       // opcional
  commentValue={comment}       // opcional
  onCommentChange={setComment} // opcional
/>
```

**Patrón con acción diferida** (el hook guarda la función como estado):
```js
setConfirmModal({
  open: true,
  title: 'Dar de baja',
  message: `¿Confirmas dar de baja el registro ${row.id}?`,
  confirmText: 'Dar de baja',
  variant: 'danger',
  requireComment: true,
  action: async (formValues) => {
    await myService.deactivate(row.id, { comments: formValues.comments, updatedByUser })
    await loadData()
  },
})

// En onConfirm del modal:
onConfirm={async () => {
  const action = confirmModal.action
  setConfirmModal(prev => ({ ...prev, open: false }))
  if (typeof action === 'function') await action(actionForm)
}}
```

---

### MasterDetailModal (`src/components/layout/MasterDetailModal.jsx`)

Modal de detalle de registro. Internamente detecta breakpoint con `useMediaQuery` y renderiza las variantes Desktop/Mobile de las sub-tablas. Usar para ver detalles y ejecutar acciones sobre un registro seleccionado.

---

### MasterTable (`src/components/layout/MasterTable.jsx`)

Tabla responsive (Desktop/Mobile) para listados de datos con menú de acciones por fila.

```jsx
<MasterTable
  loading={loading}
  rows={pagedRows}
  busyRowId={busyRowId}
  onOpenDetail={handleOpenDetail}
  onDeactivate={handleDeactivate}
  onReactivate={handleReactivate}
  onToggleBlocked={handleToggleBlocked}
  formatDate={formatDate}
/>
```

---

### Pagination (`src/components/primitives/Pagination.jsx`)

```jsx
<Pagination page={pageNumber} totalPages={totalPages} onPageChange={setPageNumber} loading={loading} />
```

---

### Modal (`src/components/primitives/Modal.jsx`)

Base modal con HeadlessUI. Usar solo cuando `RecordEditModal` o `MasterActionModal` no sean suficientes.

```jsx
<Modal open={open} onClose={onClose} title="Mi modal" size="md">  {/* size: 'sm'|'md'|'lg'|'xl' */}
  <div className="space-y-4">
    {/* contenido */}
  </div>
</Modal>
```

---

### FormField (`src/components/primitives/FormField.jsx`)

Wrapper de campo con label. Usar dentro de modales custom.

```jsx
<FormField label="Nombre del campo">
  <input type="text" className={ui.controls.input} />
</FormField>
```

---

## Patrones de código

### Patrón 1 — API Service

Un archivo por dominio en `src/api/`. Solo funciones async. Siempre usar `resolveApiEnvelope`.

```js
// src/api/myDomainService.js
import { resolveApiEnvelope, apiClient } from './clients'

export async function getMyEntities() {
  const response = await apiClient.get('/api/my-domain/entities')
  return resolveApiEnvelope(response.data) || []
}

export async function getMyEntityById(id) {
  const response = await apiClient.get(`/api/my-domain/entities/${id}`)
  return resolveApiEnvelope(response.data)
}

export async function createMyEntity(body) {
  const response = await apiClient.post('/api/my-domain/entities', body)
  return resolveApiEnvelope(response.data)
}

export async function updateMyEntity(id, body) {
  const response = await apiClient.put(`/api/my-domain/entities/${id}`, body)
  return resolveApiEnvelope(response.data)
}

export async function deleteMyEntity(id) {
  const response = await apiClient.delete(`/api/my-domain/entities/${id}`)
  return resolveApiEnvelope(response.data)
}
```

---

### Patrón 2 — Hook de módulo

El hook encapsula TODO el estado y lógica del módulo. La página solo lo consume.

```js
// src/components/domain/subDomain/useDomainModule.js
import { useCallback, useEffect, useMemo, useState } from 'react'
import { extractApiErrorMessage } from '../../../api/clients'
import { getMyEntities, createMyEntity, updateMyEntity } from '../../../api/myDomainService'
import { getProfile } from '../../../auth/session'
import { formatDate } from '../../../utils/dateTime'

const DEFAULT_FILTERS = { search: '', status: 'all' }

export default function useDomainModule() {
  // --- datos ---
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // --- acciones por fila ---
  const [busyRowId, setBusyRowId] = useState(null)

  // --- notificación ---
  const [notification, setNotification] = useState(null)

  // --- formulario INSERT/UPDATE ---
  const [formOpen, setFormOpen] = useState(false)
  const [editingRow, setEditingRow] = useState(null)  // null = crear, objeto = editar
  const [form, setForm] = useState({ name: '', isActive: true })
  const [saving, setSaving] = useState(false)

  // --- confirmación de acción ---
  const [confirmModal, setConfirmModal] = useState({
    open: false, title: '', message: '', variant: 'info',
    confirmText: 'Confirmar', requireComment: false, action: null,
  })
  const [actionForm, setActionForm] = useState({ comments: '' })

  // --- filtros y paginación ---
  const [filters, setFilters] = useState(DEFAULT_FILTERS)
  const [pageNumber, setPageNumber] = useState(1)
  const [pageSize] = useState(50)

  const loadData = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const data = await getMyEntities()
      setRows(Array.isArray(data) ? data : [])
    } catch (err) {
      setRows([])
      setError(extractApiErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { loadData() }, [loadData])

  const filteredRows = useMemo(() => {
    const search = filters.search.trim().toLowerCase()
    return rows.filter(row => {
      if (search && !String(row.name || '').toLowerCase().includes(search)) return false
      if (filters.status !== 'all' && (filters.status === 'active' ? !row.isActive : row.isActive)) return false
      return true
    })
  }, [rows, filters])

  const totalPages = useMemo(() => Math.max(1, Math.ceil(filteredRows.length / pageSize)), [filteredRows.length, pageSize])
  const pagedRows = useMemo(() => filteredRows.slice((pageNumber - 1) * pageSize, pageNumber * pageSize), [filteredRows, pageNumber, pageSize])

  function handleOpenCreate() {
    setEditingRow(null)
    setForm({ name: '', isActive: true })
    setFormOpen(true)
  }

  function handleOpenEdit(row) {
    setEditingRow(row)
    setForm({ name: row.name, isActive: row.isActive })
    setFormOpen(true)
  }

  async function handleSave() {
    setSaving(true)
    try {
      const updatedByUser = getProfile().email || 'unknown'
      if (editingRow) {
        await updateMyEntity(editingRow.id, { ...form, updatedByUser })
      } else {
        await createMyEntity({ ...form, updatedByUser })
      }
      setNotification({ id: crypto.randomUUID(), type: 'success', message: editingRow ? 'Registro actualizado.' : 'Registro creado.' })
      setFormOpen(false)
      await loadData()
    } catch (err) {
      setNotification({ id: crypto.randomUUID(), type: 'error', message: extractApiErrorMessage(err) })
    } finally {
      setSaving(false)
    }
  }

  function handleDeactivate(row) {
    setActionForm({ comments: '' })
    setConfirmModal({
      open: true,
      title: 'Dar de baja',
      message: `¿Confirmas dar de baja "${row.name}"?`,
      confirmText: 'Dar de baja',
      variant: 'danger',
      requireComment: true,
      action: async (formValues) => {
        setBusyRowId(row.id)
        try {
          const updatedByUser = getProfile().email || 'unknown'
          await updateMyEntity(row.id, { isActive: false, updatedByUser, comments: formValues.comments })
          setNotification({ id: crypto.randomUUID(), type: 'success', message: `"${row.name}" dado de baja.` })
          await loadData()
        } catch (err) {
          setNotification({ id: crypto.randomUUID(), type: 'error', message: extractApiErrorMessage(err) })
        } finally {
          setBusyRowId(null)
        }
      },
    })
  }

  function handleClearFilters() {
    setFilters(DEFAULT_FILTERS)
    setPageNumber(1)
  }

  return {
    // datos
    rows, loading, error,
    filteredRows, pagedRows, totalPages,
    // paginación
    pageNumber, setPageNumber, pageSize,
    // filtros
    filters, setFilters, handleClearFilters,
    // fila ocupada
    busyRowId,
    // notificación
    notification, setNotification,
    // formulario
    formOpen, setFormOpen, form, setForm, saving,
    handleOpenCreate, handleOpenEdit, handleSave,
    // confirmación
    confirmModal, setConfirmModal, actionForm, setActionForm,
    handleDeactivate,
    // misc
    loadData, formatDate,
  }
}
```

---

### Patrón 3 — Registrar una nueva ruta

Tres pasos obligatorios en orden:

**1. Crear la página** en `src/pages/MyDomainModule.jsx`:
```jsx
import { ui } from '../styles/designSystem'
import useDomainModule from '../components/domain/subDomain/useDomainModule'
import AppNotification from '../components/layout/AppNotification'

export default function MyDomainModule() {
  const m = useDomainModule()
  return (
    <section className={ui.layout.moduleShell}>
      {/* toolbar, tabla, modales */}
      <AppNotification notification={m.notification} onClose={() => m.setNotification(null)} />
    </section>
  )
}
```

**2. Registrar la ruta** en `src/routes/AppRoutes.jsx`:
```jsx
// a) Agregar lazy import al inicio del archivo
const MyDomainModule = lazy(() => import('../pages/MyDomainModule.jsx'))

// b) Agregar Route dentro del bloque /app (con RequireAuth heredado)
<Route path="domain/sub-domain/my-module" element={renderLazy(<MyDomainModule />)} />
```

**3a. Si la página necesita ancho completo** (tablas grandes, dashboards), agregar en `src/routes/wideRoutes.js`:
```js
'/app/domain/sub-domain/my-module',
```

**3b. Registrar en la navegación** en `src/components/layout/AppNavbar.jsx` (array `NAV_ITEMS`). Si no está claro en qué grupo colocarlo, **preguntar antes de decidir la ubicación**.

---

### Patrón 4 — Filtros persistidos en la URL (useSearchParams)

Permite compartir links con filtros y página activos. Usar en módulos donde el usuario necesita volver al mismo estado.

```js
import { useSearchParams } from 'react-router-dom'
import { useEffect, useState } from 'react'

// Dentro del hook:
const [searchParams, setSearchParams] = useSearchParams()

// Inicializar estado desde URL:
const [filters, setFilters] = useState({
  search: searchParams.get('search') || '',
  status: searchParams.get('status') || 'all',
})
const [pageNumber, setPageNumber] = useState(
  Math.max(1, Number(searchParams.get('page') || '1'))
)
const [pageSize] = useState(
  [25, 50, 100].includes(Number(searchParams.get('pageSize') || '50'))
    ? Number(searchParams.get('pageSize'))
    : 50
)

// Sincronizar a URL cada vez que cambien filtros o página:
useEffect(() => {
  const params = {
    page: String(pageNumber),
    pageSize: String(pageSize),
  }
  if (filters.search.trim()) params.search = filters.search.trim()
  if (filters.status !== 'all') params.status = filters.status
  setSearchParams(params, { replace: true })
}, [filters, pageNumber, pageSize, setSearchParams])
```

Cuando el usuario cambia un filtro, siempre resetear página a 1:
```js
onChangeFilter={(key, value) => {
  setFilters(prev => ({ ...prev, [key]: value }))
  setPageNumber(1)
}}
```

---

### Patrón 5 — SignalR en el hook

SignalR se conecta en un `useEffect` dentro del hook, con cleanup al desmontar. Los handlers actualizan estado via refs para evitar closures stale.

```js
import { useEffect, useRef } from 'react'
import { startMyDomainEventsConnection } from '../../../api/myDomainEventsService'

// Dentro del hook:
const _refs = useRef({})
_refs.current.loadData = loadData
_refs.current.setNotification = setNotification

useEffect(() => {
  let disposed = false
  let connectionRef = null

  async function connect() {
    try {
      const { connection } = await startMyDomainEventsConnection([
        {
          eventName: 'MyEntityChanged',
          handler: async ({ entityId, changeType, updatedByUser } = {}) => {
            await _refs.current.loadData()
            const currentUser = getProfile().email || ''
            if (updatedByUser && updatedByUser !== currentUser) {
              _refs.current.setNotification({
                id: crypto.randomUUID(),
                type: 'info',
                title: 'Registro actualizado',
                message: `Registro ${entityId} fue modificado por ${updatedByUser}.`,
              })
            }
          },
        },
      ])
      if (disposed) { await connection.stop().catch(() => {}); return }
      connectionRef = connection
    } catch (err) {
      console.warn('[MyModule] Hub connection failed, operating without real-time:', err?.message)
    }
  }

  connect()
  return () => {
    disposed = true
    if (connectionRef) connectionRef.stop().catch(() => {})
  }
}, [])
```

---

## Scripts npm

```bash
dev          → servidor Vite dev con proxy
dev2         → dev con --host (acceso en red local)
build        → build de producción
build:prod   → build --mode production
build:azure  → build con variables de entorno inyectadas para Azure
lint         → ESLint
preview      → previsualizar build estático
```

---

## Reglas para este cliente

1. **React 19** con functional components y hooks. No usar class components.
2. Toda llamada HTTP a APIs internas pasa por los clientes de `src/api/clients.js`. Prohibido usar `fetch` nativo.
3. El envelope de respuesta siempre tiene `{ data, isSuccess, message, utcTimeStamp }` — usar `resolveApiEnvelope` y `extractApiErrorMessage`, nunca parsear el envelope localmente por módulo.
4. Cuando `isSuccess = false`, mostrar `message` de la respuesta al usuario — no un texto genérico.
5. Todos los mensajes de operaciones de API se muestran con `<AppNotification />` — PROHIBIDO usar `alert`, divs inline de notificación, o cualquier otro mecanismo. `AppNotification` también alimenta automáticamente la campanita del navbar via `notification`.
6. Nuevos módulos siguen el patrón: `api service` → `hook` → `page` → `components`. Ver sección "Patrones de código".
7. **Versión mobile OBLIGATORIA en todo módulo nuevo o modificado.** Todo componente de listado/tabla debe tener su variante en `Desktop/` y en `Mobile/`. En mobile se usan tarjetas (`<article>`) en lugar de tablas. La página detecta el breakpoint con `useMediaQuery('(min-width: 640px)')` y renderiza la variante correspondiente. Los modales y formularios son compartidos (no necesitan variante). Si se modifica el desktop, también se modifica el mobile.
8. **Tokens de design system OBLIGATORIO:** siempre importar `{ ui }` de `src/styles/designSystem.js` y usar la ruta anidada completa: `ui.layout.moduleShell`, `ui.typography.sectionTitle`, `ui.controls.primaryButton`, `ui.surface.tablePanel`, `ui.feedback.errorBanner`, etc. NUNCA usar los nombres de token en plano (`ui.primaryButton`, `ui.moduleShell` — eso no existe y es un error). Para clases condicionales usar `cx()` del mismo archivo.
9. **Componentes reutilizables OBLIGATORIO:** antes de construir cualquier modal, tabla o notificación, revisar si existe un componente compartido. Casos concretos:
   - Formularios de INSERT/UPDATE → `RecordEditModal`
   - Confirmaciones de acción (baja, bloqueo, etc.) → `MasterActionModal` con acción diferida
   - Detalle de registro → `MasterDetailModal`
   - Tablas de datos → `MasterTable` o construir sobre `ui.table.*` si la tabla tiene columnas muy específicas
   - Paginación → `Pagination`
   - Notificaciones → `AppNotification`
   - Modal custom → `Modal` + `FormField`
10. **Inspeccionar módulo similar antes de crear uno nuevo.** Antes de implementar un módulo nuevo, leer al menos una página existente del mismo tipo (ej: `QualityMaster.jsx` + `useQualityMaster.js` para módulos de tabla+CRUD) para entender el patrón de composición, naming de estados, y qué componentes compartidos usa. No inventar la estructura desde cero.
11. No instalar librerías nuevas sin consultarlo primero.
12. Las llamadas a API siempre pasan por el proxy de Vite en desarrollo — nunca hardcodear IPs en código.
13. SignalR para datos en tiempo real — no hacer polling. Ver Patrón 5 en "Patrones de código".
14. Todo módulo nuevo debe registrarse en `AppRoutes.jsx` (ruta lazy), en `AppNavbar.jsx` (array `NAV_ITEMS`) y, si la tabla es ancha, en `wideRoutes.js`. Si no está claro la ubicación en el menú, preguntar antes de decidir.
15. **Filtros en URL:** si el módulo tiene filtros que el usuario necesita mantener al navegar o compartir, usar `useSearchParams` para persistirlos. Ver Patrón 4 en "Patrones de código".
16. **Audit trail:** toda operación de escritura debe incluir `updatedByUser` obtenido de `getProfile()` — nunca hardcodearlo ni dejarlo vacío.

---

## Convenciones de nombres

### Archivos

| Tipo | Patrón | Ejemplo |
|---|---|---|
| Servicio API | `<domain>Service.js` | `qualityMasterService.js` |
| Hook de módulo | `use<Domain><Module>.js` | `useQualityMaster.js` |
| Página | `<Domain><Module>.jsx` | `QualityMaster.jsx` |
| Tabla desktop | `<Domain>TableDesktop.jsx` | `MasterTableDesktop.jsx` |
| Tarjetas mobile | `<Domain>CardsMobile.jsx` | `MasterCardsMobile.jsx` |
| Compartidos | `<Domain>TableShared.jsx` | `MasterTableShared.jsx` |
| Utils del módulo | `<domain>Utils.js` | `qualityMasterUtils.js` |

### Funciones en el hook

| Propósito | Patrón | Ejemplo |
|---|---|---|
| Cargar datos | `loadData` | `loadData()` |
| Abrir formulario de creación | `handleOpenCreate` | `handleOpenCreate()` |
| Abrir formulario de edición | `handleOpenEdit(row)` | `handleOpenEdit(row)` |
| Guardar (insert o update) | `handleSave` | `handleSave()` |
| Acción destructiva | `handle<Action>(row)` | `handleDeactivate(row)` |
| Acción de reactivación | `handle<Action>(row)` | `handleReactivate(row)` |
| Limpiar filtros | `handleClearFilters` | `handleClearFilters()` |
| Detalle de registro | `handleOpenDetail(row)` | `handleOpenDetail(row)` |

### Variables de estado

| Variable | Tipo | Propósito |
|---|---|---|
| `rows` | `[]` | Lista raw de la API |
| `loading` | `bool` | Carga inicial de datos |
| `error` | `string` | Error de carga que bloquea el módulo |
| `filteredRows` | `[]` | Resultado de aplicar filtros (useMemo) |
| `pagedRows` | `[]` | Página actual de filteredRows (useMemo) |
| `totalPages` | `number` | Total de páginas (useMemo) |
| `pageNumber` | `number` | Página activa |
| `pageSize` | `number` | Tamaño de página (constante, default 50) |
| `busyRowId` | `id \| null` | ID de la fila con acción en curso |
| `notification` | `object \| null` | Toast activo |
| `formOpen` | `bool` | Modal INSERT/UPDATE abierto |
| `editingRow` | `object \| null` | `null` = crear, objeto = editar |
| `form` | `object` | Valores del formulario activo |
| `saving` | `bool` | Loading del submit del formulario |
| `confirmModal` | `object` | Estado completo del modal de confirmación |
| `actionForm` | `object` | Valores del formulario del modal de confirmación (ej: comentario) |
| `filters` | `object` | Filtros activos (ver DEFAULT_FILTERS) |

### Alias del hook en la página

En la página, consumir el hook con el alias `m`:
```js
const m = useDomainModule()
// Luego usar m.rows, m.loading, m.handleSave, etc.
```

---

## Diccionario de estado

Formas exactas de los objetos de estado más comunes:

```js
// DEFAULT_FILTERS — estado inicial de filtros (resetear con handleClearFilters)
const DEFAULT_FILTERS = { search: '', status: 'all' }

// notification — null cuando no hay toast activo
null
{ id: crypto.randomUUID(), type: 'success', message: 'Registro creado.' }
{ id: crypto.randomUUID(), type: 'error',   message: extractApiErrorMessage(err) }
{ id: crypto.randomUUID(), type: 'warning', message: 'Advertencia.' }
{ id: crypto.randomUUID(), type: 'info',    title: 'Actualizado por otro usuario', message: '...' }

// editingRow — null al crear, objeto al editar
null                          // → modal en modo INSERT
{ id, name, isActive, ... }  // → modal en modo UPDATE

// form — refleja los campos de RecordEditModal
{ name: '', isActive: true }  // ajustar según el módulo

// confirmModal — estado completo del modal de confirmación
{
  open: false,
  title: '',
  message: '',
  variant: 'info',       // 'info' | 'danger' | 'success'
  confirmText: 'Confirmar',
  requireComment: false,
  action: null,          // función async almacenada como estado — se llama en onConfirm
}

// actionForm — formulario del modal de confirmación (cuando requireComment: true)
{ comments: '' }
```

---

## Jerarquía de feedback

Cuándo usar cada mecanismo — seguir este orden de prioridad:

| Situación | Mecanismo |
|---|---|
| Error de carga que bloquea todo el módulo | `setError(msg)` + `<div className={ui.feedback.errorBanner}>` en el body de la página |
| Error de validación dentro de un formulario | `<div className={ui.feedback.errorBanner}>` inline dentro del modal |
| Resultado de operación API (éxito o error) | `<AppNotification />` (toast flotante, se auto-oculta) |
| Confirmación antes de acción irreversible | `<MasterActionModal variant="danger" />` con acción diferida |
| Confirmación antes de acción informativa | `<MasterActionModal variant="info" />` con acción diferida |
| Mensaje de resultado sin opción de cancelar | `<MasterActionModal />` sin `onCancel` (modo solo-confirm, muestra solo "Aceptar") |
| Estado vacío de tabla sin error | `<td className={ui.feedback.emptyState}>Sin registros</td>` |
| Carga de tabla en curso | `<td className={ui.feedback.loadingState}>Cargando…</td>` |

**Regla de oro:** `AppNotification` es para resultados (después de hacer algo). `MasterActionModal` es para antes de hacer algo destructivo o importante. Nunca usar ambos para el mismo evento.

---

## Catálogo de módulos existentes

Módulos registrados en `src/routes/AppRoutes.jsx` y enlazados en `src/components/layout/AppNavbar.jsx`:

| Dominio | Label | Ruta |
|---|---|---|
| Ejemplo | Inicio | `/app` |
| Ejemplo | Usuarios | `/app/example/users` |

Al agregar un módulo nuevo: crear la ruta en `AppRoutes.jsx`, agregar el enlace en el array `NAV_ITEMS` de `AppNavbar.jsx`, y si la tabla requiere ancho completo, agregar la ruta en `wideRoutes.js`.

---

## Blueprint completo de módulo CRUD

Cinco archivos completos para un módulo de tabla + CRUD estándar. Adaptar nombres y campos al dominio real.

### Archivo 1 — Servicio (`src/api/domainService.js`)

```js
import { resolveApiEnvelope, apiClient } from './clients'

export async function getDomainEntities() {
  const res = await apiClient.get('/api/domain/entities')
  return resolveApiEnvelope(res.data) || []
}

export async function createDomainEntity(body) {
  const res = await apiClient.post('/api/domain/entities', body)
  return resolveApiEnvelope(res.data)
}

export async function updateDomainEntity(id, body) {
  const res = await apiClient.put(`/api/domain/entities/${id}`, body)
  return resolveApiEnvelope(res.data)
}
```

---

### Archivo 2 — Hook (`src/components/domain/module/useDomainModule.js`)

```js
import { useCallback, useEffect, useMemo, useState } from 'react'
import { extractApiErrorMessage } from '../../../api/clients'
import { getDomainEntities, createDomainEntity, updateDomainEntity } from '../../../api/domainService'
import { getProfile } from '../../../auth/session'
import { formatDate } from '../../../utils/dateTime'

const DEFAULT_FILTERS = { search: '', status: 'all' }

export default function useDomainModule() {
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [busyRowId, setBusyRowId] = useState(null)
  const [notification, setNotification] = useState(null)
  const [formOpen, setFormOpen] = useState(false)
  const [editingRow, setEditingRow] = useState(null)
  const [form, setForm] = useState({ name: '', isActive: true })
  const [saving, setSaving] = useState(false)
  const [confirmModal, setConfirmModal] = useState({
    open: false, title: '', message: '', variant: 'info',
    confirmText: 'Confirmar', requireComment: false, action: null,
  })
  const [actionForm, setActionForm] = useState({ comments: '' })
  const [filters, setFilters] = useState(DEFAULT_FILTERS)
  const [pageNumber, setPageNumber] = useState(1)
  const [pageSize] = useState(50)

  const loadData = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const data = await getDomainEntities()
      setRows(Array.isArray(data) ? data : [])
    } catch (err) {
      setRows([])
      setError(extractApiErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { loadData() }, [loadData])

  const filteredRows = useMemo(() => {
    const q = filters.search.trim().toLowerCase()
    return rows.filter(row => {
      if (q && !String(row.name || '').toLowerCase().includes(q)) return false
      if (filters.status === 'active' && !row.isActive) return false
      if (filters.status === 'inactive' && row.isActive) return false
      return true
    })
  }, [rows, filters])

  const totalPages = useMemo(() => Math.max(1, Math.ceil(filteredRows.length / pageSize)), [filteredRows.length, pageSize])
  const pagedRows = useMemo(() => filteredRows.slice((pageNumber - 1) * pageSize, pageNumber * pageSize), [filteredRows, pageNumber, pageSize])

  function handleOpenCreate() {
    setEditingRow(null)
    setForm({ name: '', isActive: true })
    setFormOpen(true)
  }

  function handleOpenEdit(row) {
    setEditingRow(row)
    setForm({ name: row.name, isActive: row.isActive })
    setFormOpen(true)
  }

  async function handleSave() {
    setSaving(true)
    try {
      const updatedByUser = getProfile().email || 'unknown'
      if (editingRow) {
        await updateDomainEntity(editingRow.id, { ...form, updatedByUser })
      } else {
        await createDomainEntity({ ...form, updatedByUser })
      }
      setNotification({ id: crypto.randomUUID(), type: 'success', message: editingRow ? 'Registro actualizado.' : 'Registro creado.' })
      setFormOpen(false)
      await loadData()
    } catch (err) {
      setNotification({ id: crypto.randomUUID(), type: 'error', message: extractApiErrorMessage(err) })
    } finally {
      setSaving(false)
    }
  }

  function handleDeactivate(row) {
    setActionForm({ comments: '' })
    setConfirmModal({
      open: true,
      title: 'Dar de baja',
      message: `¿Confirmas dar de baja "${row.name}"?`,
      confirmText: 'Dar de baja',
      variant: 'danger',
      requireComment: true,
      action: async (formValues) => {
        setBusyRowId(row.id)
        try {
          const updatedByUser = getProfile().email || 'unknown'
          await updateDomainEntity(row.id, { isActive: false, updatedByUser, comments: formValues.comments })
          setNotification({ id: crypto.randomUUID(), type: 'success', message: `"${row.name}" dado de baja.` })
          await loadData()
        } catch (err) {
          setNotification({ id: crypto.randomUUID(), type: 'error', message: extractApiErrorMessage(err) })
        } finally {
          setBusyRowId(null)
        }
      },
    })
  }

  function handleReactivate(row) {
    setConfirmModal({
      open: true,
      title: 'Reactivar',
      message: `¿Confirmas reactivar "${row.name}"?`,
      confirmText: 'Reactivar',
      variant: 'success',
      requireComment: false,
      action: async () => {
        setBusyRowId(row.id)
        try {
          const updatedByUser = getProfile().email || 'unknown'
          await updateDomainEntity(row.id, { isActive: true, updatedByUser })
          setNotification({ id: crypto.randomUUID(), type: 'success', message: `"${row.name}" reactivado.` })
          await loadData()
        } catch (err) {
          setNotification({ id: crypto.randomUUID(), type: 'error', message: extractApiErrorMessage(err) })
        } finally {
          setBusyRowId(null)
        }
      },
    })
  }

  function handleClearFilters() {
    setFilters(DEFAULT_FILTERS)
    setPageNumber(1)
  }

  return {
    rows, loading, error,
    filteredRows, pagedRows, totalPages,
    pageNumber, setPageNumber, pageSize,
    filters, setFilters, handleClearFilters,
    busyRowId,
    notification, setNotification,
    formOpen, setFormOpen, form, setForm, saving,
    handleOpenCreate, handleOpenEdit, handleSave,
    confirmModal, setConfirmModal, actionForm, setActionForm,
    handleDeactivate, handleReactivate,
    loadData, formatDate,
  }
}
```

---

### Archivo 3 — Página (`src/pages/DomainModule.jsx`)

```jsx
import { ui } from '../styles/designSystem'
import useMediaQuery from '../hooks/useMediaQuery'
import useDomainModule from '../components/domain/module/useDomainModule'
import AppNotification from '../components/layout/AppNotification'
import RecordEditModal from '../components/layout/RecordEditModal'
import MasterActionModal from '../components/layout/MasterActionModal'
import Pagination from '../components/primitives/Pagination'
import DomainTableDesktop from '../components/domain/module/Desktop/DomainTableDesktop'
import DomainCardsMobile from '../components/domain/module/Mobile/DomainCardsMobile'

export default function DomainModule() {
  const isDesktop = useMediaQuery('(min-width: 640px)')
  const m = useDomainModule()

  const tableProps = {
    rows: m.pagedRows,
    loading: m.loading,
    busyRowId: m.busyRowId,
    onOpenEdit: m.handleOpenEdit,
    onDeactivate: m.handleDeactivate,
    onReactivate: m.handleReactivate,
    formatDate: m.formatDate,
  }

  return (
    <section className={ui.layout.moduleShell}>
      {m.error && <div className={ui.feedback.errorBanner}>{m.error}</div>}

      <div className={ui.surface.toolbar}>
        <div className="flex flex-wrap items-center gap-3">
          <input
            type="search"
            placeholder="Buscar…"
            value={m.filters.search}
            onChange={e => { m.setFilters(f => ({ ...f, search: e.target.value })); m.setPageNumber(1) }}
            className={ui.controls.inputCompact}
          />
          <select
            value={m.filters.status}
            onChange={e => { m.setFilters(f => ({ ...f, status: e.target.value })); m.setPageNumber(1) }}
            className={ui.controls.inputCompact}
          >
            <option value="all">Todos</option>
            <option value="active">Activos</option>
            <option value="inactive">Inactivos</option>
          </select>
          <div className="ml-auto">
            <button onClick={m.handleOpenCreate} className={ui.controls.accentButton}>
              Nuevo
            </button>
          </div>
        </div>
      </div>

      {isDesktop ? <DomainTableDesktop {...tableProps} /> : <DomainCardsMobile {...tableProps} />}

      <Pagination page={m.pageNumber} totalPages={m.totalPages} onPageChange={m.setPageNumber} loading={m.loading} />

      <RecordEditModal
        open={m.formOpen}
        title={m.editingRow ? 'Editar registro' : 'Nuevo registro'}
        fields={[
          { name: 'name', label: 'Nombre', type: 'text', placeholder: 'Ej: Mi registro' },
          { name: 'isActive', label: 'Estado', type: 'checkbox', checkboxLabel: 'Activo' },
        ]}
        values={m.form}
        onChange={(name, value) => m.setForm(prev => ({ ...prev, [name]: value }))}
        onConfirm={m.handleSave}
        onCancel={() => m.setFormOpen(false)}
        loading={m.saving}
      />

      <MasterActionModal
        open={m.confirmModal.open}
        title={m.confirmModal.title}
        message={m.confirmModal.message}
        variant={m.confirmModal.variant}
        confirmText={m.confirmModal.confirmText}
        showComment={m.confirmModal.requireComment}
        commentRequired={m.confirmModal.requireComment}
        commentValue={m.actionForm.comments}
        onCommentChange={v => m.setActionForm({ comments: v })}
        loading={m.saving}
        onConfirm={async () => {
          const action = m.confirmModal.action
          m.setConfirmModal(p => ({ ...p, open: false }))
          if (typeof action === 'function') await action(m.actionForm)
        }}
        onCancel={() => m.setConfirmModal(p => ({ ...p, open: false }))}
      />

      <AppNotification notification={m.notification} onClose={() => m.setNotification(null)} />
    </section>
  )
}
```

---

### Archivo 4 — Tabla Desktop (`src/components/domain/module/Desktop/DomainTableDesktop.jsx`)

```jsx
import { ui } from '../../../../styles/designSystem'
import { MasterStatusBadge, MasterActionMenu } from '../../../layout/Shared/MasterTableShared'

export default function DomainTableDesktop({ rows, loading, busyRowId, onOpenEdit, onDeactivate, onReactivate, formatDate }) {
  return (
    <div className={ui.table.wrapper}>
      <div className={ui.table.scroll}>
        <table className={ui.table.element}>
          <thead className={ui.table.head}>
            <tr>
              <th className={ui.table.th}>ID</th>
              <th className={ui.table.th}>Nombre</th>
              <th className={ui.table.th}>Estado</th>
              <th className={ui.table.th}>Última actualización</th>
              <th className={ui.table.th} />
            </tr>
          </thead>
          <tbody className={ui.table.row}>
            {loading && (
              <tr><td colSpan={5} className={ui.feedback.loadingState}>Cargando…</td></tr>
            )}
            {!loading && rows.length === 0 && (
              <tr><td colSpan={5} className={ui.feedback.emptyState}>Sin registros</td></tr>
            )}
            {!loading && rows.map(row => (
              <tr key={row.id} className="hover:bg-slate-50">
                <td className={ui.table.td}>{row.id}</td>
                <td className={ui.table.td}>{row.name}</td>
                <td className={ui.table.td}><MasterStatusBadge row={row} /></td>
                <td className={ui.table.td}>{formatDate(row.updatedAt)}</td>
                <td className={ui.table.td}>
                  <MasterActionMenu
                    row={row}
                    busyRowId={busyRowId}
                    onEdit={onOpenEdit}
                    onDeactivate={onDeactivate}
                    onReactivate={onReactivate}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
```

---

### Archivo 5 — Tarjetas Mobile (`src/components/domain/module/Mobile/DomainCardsMobile.jsx`)

```jsx
import { ui } from '../../../../styles/designSystem'
import { MasterStatusBadge, MasterActionMenu } from '../../../layout/Shared/MasterTableShared'

export default function DomainCardsMobile({ rows, loading, busyRowId, onOpenEdit, onDeactivate, onReactivate, formatDate }) {
  if (loading) return <p className={ui.feedback.loadingState}>Cargando…</p>
  if (rows.length === 0) return <p className={ui.feedback.emptyState}>Sin registros</p>

  return (
    <div className="space-y-3 px-1">
      {rows.map(row => (
        <article key={row.id} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className={ui.typography.cardTitle}>{row.name}</p>
              <p className={ui.typography.body}>#{row.id}</p>
            </div>
            <MasterActionMenu
              row={row}
              busyRowId={busyRowId}
              onEdit={onOpenEdit}
              onDeactivate={onDeactivate}
              onReactivate={onReactivate}
            />
          </div>
          <dl className="mt-4 grid grid-cols-2 gap-3">
            <div>
              <dt className={ui.typography.eyebrow}>Estado</dt>
              <dd className="mt-1"><MasterStatusBadge row={row} /></dd>
            </div>
            <div>
              <dt className={ui.typography.eyebrow}>Última actualización</dt>
              <dd className={ui.typography.body}>{formatDate(row.updatedAt)}</dd>
            </div>
          </dl>
        </article>
      ))}
    </div>
  )
}
```
