# Componentes compartidos

Todos los componentes de esta sección son **obligatorios** — antes de construir cualquier modal, tabla o notificación, verifica si existe aquí. Nunca reimplementar inline.

---

## Índice

| Componente | Ruta | Cuándo usar |
|---|---|---|
| `Modal` | `src/components/primitives/Modal.jsx` | Base modal con HeadlessUI |
| `FormField` | `src/components/primitives/FormField.jsx` | Wrapper de campo con label |
| `Pagination` | `src/components/primitives/Pagination.jsx` | Paginación de tablas |
| `AppNotification` | `src/components/layout/AppNotification.jsx` | Toast flotante de resultado |
| `RecordEditModal` | `src/components/layout/RecordEditModal.jsx` | Formulario INSERT/UPDATE |
| `MasterActionModal` | `src/components/layout/MasterActionModal.jsx` | Confirmación de acción |
| `AppNavbar` | `src/components/layout/AppNavbar.jsx` | Barra de navegación superior |
| `StatusBadge` | `src/components/layout/Shared/MasterTableShared.jsx` | Badge activo/inactivo |
| `ActionMenu` | `src/components/layout/Shared/MasterTableShared.jsx` | Menú contextual de fila |

---

## Modal

Base modal construida con HeadlessUI `Dialog`. Usar cuando `RecordEditModal` o `MasterActionModal` no alcanzan.

```jsx
import Modal from '../components/primitives/Modal'

<Modal
  open={open}          // boolean — controla visibilidad
  onClose={onClose}    // () => void — al cerrar (click fondo, botón X, Escape)
  title="Mi modal"     // string — opcional
  size="md"            // 'sm' | 'md' | 'lg' | 'xl' — default: 'md'
>
  <div className="space-y-4">
    {/* contenido */}
  </div>
</Modal>
```

**Tamaños:**

| size | max-width |
|---|---|
| `sm` | 24rem (384px) |
| `md` | 28rem (448px) |
| `lg` | 32rem (512px) |
| `xl` | 36rem (576px) |

**Comportamiento:**
- Fade + scale animation al abrir/cerrar
- Click en el fondo oscuro cierra el modal
- Tecla Escape cierra el modal
- Botón X en header siempre visible
- z-index: 60

---

## FormField

Wrapper de campo con label. Usar siempre que necesites un input con label dentro de un modal custom.

```jsx
import { FormField } from '../components/primitives'

<FormField
  label="Nombre del campo"   // string
  required={true}            // boolean — muestra asterisco rojo
  error="Campo requerido"    // string — mensaje de error debajo
>
  <input type="text" className={ui.controls.input} />
</FormField>
```

**Props:**

| Prop | Tipo | Default | Descripción |
|---|---|---|---|
| `label` | string | — | Texto del label |
| `required` | boolean | false | Muestra `*` rojo junto al label |
| `error` | string | — | Mensaje de error en rojo debajo del campo |
| `children` | ReactNode | — | El input, select, textarea, etc. |

---

## Pagination

Paginación con lista inteligente de páginas (genera `…` automáticamente).

```jsx
import Pagination from '../components/primitives/Pagination'

<Pagination
  page={pageNumber}           // number — página activa (1-based)
  totalPages={totalPages}     // number
  onPageChange={setPageNumber} // (page: number) => void
  loading={loading}           // boolean — deshabilita botones durante carga
/>
```

**Notas:**
- Se oculta automáticamente si `totalPages <= 1`
- Genera `…` cuando hay más de 7 páginas
- Siempre muestra primera, última y páginas adyacentes a la activa

---

## AppNotification

Toast flotante de resultado. Se auto-oculta después de `autoHideMs`. También dispara el evento `app-notification` en `window` para feeds de actividad externos.

```jsx
import AppNotification from '../components/layout/AppNotification'

// En la página:
<AppNotification
  notification={m.notification}
  onClose={() => m.setNotification(null)}
  autoHideMs={4500}   // opcional, default: 4500
/>
```

**Forma del objeto `notification`:**

```js
// Sin notificación activa
null

// Éxito
{ id: crypto.randomUUID(), type: 'success', message: 'Registro creado.' }

// Error
{ id: crypto.randomUUID(), type: 'error', message: extractApiErrorMessage(err) }

// Advertencia
{ id: crypto.randomUUID(), type: 'warning', message: 'Advertencia.' }

// Info con título
{ id: crypto.randomUUID(), type: 'info', title: 'Título', message: 'Mensaje.' }
```

**Variantes:**

| type | Color | Ícono |
|---|---|---|
| `success` | Emerald | CheckCircleIcon |
| `error` | Red | ExclamationCircleIcon |
| `warning` | Amber | ExclamationTriangleIcon |
| `info` | Sky | InformationCircleIcon |

**Posición:** fixed, bottom-right, z-70.

---

## RecordEditModal

Modal declarativo de INSERT/UPDATE. Genera el formulario a partir de un array `fields`. Usar para la mayoría de formularios CRUD.

```jsx
import RecordEditModal from '../components/layout/RecordEditModal'

<RecordEditModal
  open={m.formOpen}
  title={m.editingRow ? 'Editar registro' : 'Nuevo registro'}
  description="Descripción opcional"          // string — opcional
  fields={[
    { name: 'name',     label: 'Nombre',  type: 'text',     placeholder: 'Ej: ABC', required: true },
    { name: 'limit',    label: 'Límite',  type: 'number',   min: 0, step: 1 },
    { name: 'code',     label: 'Código',  type: 'text',     disabled: true },
    { name: 'isActive', label: 'Estado',  type: 'checkbox', checkboxLabel: 'Activo' },
  ]}
  values={m.form}
  onChange={(name, value) => m.setForm(prev => ({ ...prev, [name]: value }))}
  onConfirm={m.handleSave}
  onCancel={() => m.setFormOpen(false)}
  loading={m.saving}
  confirmText="Guardar cambios"   // default: 'Guardar cambios'
  cancelText="Cancelar"           // default: 'Cancelar'
/>
```

**Tipos de field:**

| type | Renderiza | Props adicionales |
|---|---|---|
| `text` | `<input type="text">` | `placeholder`, `disabled` |
| `number` | `<input type="number">` | `min`, `max`, `step`, `placeholder`, `disabled` |
| `checkbox` | `<input type="checkbox">` + label | `checkboxLabel`, `disabled` |

Para campos más complejos (select, textarea, multi-campo) usar `Modal` + `FormField` directo.

---

## MasterActionModal

Modal de confirmación antes de ejecutar una acción. Soporta tres variantes visuales y un campo de comentario opcional.

```jsx
import MasterActionModal from '../components/layout/MasterActionModal'

<MasterActionModal
  open={m.confirmModal.open}
  title={m.confirmModal.title}
  message={m.confirmModal.message}
  variant={m.confirmModal.variant}       // 'info' | 'danger' | 'success'
  confirmText={m.confirmModal.confirmText}
  cancelText="Cancelar"                  // omitir para modo solo-confirm
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
```

**Variantes:**

| variant | Ícono | Color | Botón confirm |
|---|---|---|---|
| `info` | InformationCircleIcon | Sky | primaryButton (slate-900) |
| `danger` | ExclamationTriangleIcon | Red | destructiveButton (red-600) |
| `success` | CheckCircleIcon | Emerald | primaryButton (slate-900) |

**Modo solo-confirm** (sin botón cancelar): omitir `onCancel` — solo aparece el botón de confirmar.

**Patrón de acción diferida** (guardar la función en el estado):

```js
// En el hook — al disparar la acción:
function handleDeactivate(row) {
  setActionForm({ comments: '' })
  setConfirmModal({
    open: true,
    title: 'Dar de baja',
    message: `¿Confirmas dar de baja "${row.name}"?`,
    confirmText: 'Dar de baja',
    variant: 'danger',
    requireComment: true,
    action: async (formValues) => {           // ← función almacenada en estado
      setBusyRowId(row.id)
      try {
        await updateEntity(row.id, { isActive: false, comments: formValues.comments })
        setNotification({ id: crypto.randomUUID(), type: 'success', message: 'Dado de baja.' })
        await loadData()
      } catch (err) {
        setNotification({ id: crypto.randomUUID(), type: 'error', message: extractApiErrorMessage(err) })
      } finally {
        setBusyRowId(null)
      }
    },
  })
}
```

---

## AppNavbar

Barra de navegación sticky con detección de ruta activa.

```jsx
// src/components/layout/AppNavbar.jsx
// Se monta automáticamente en AppShell (AppRoutes.jsx)
// Para agregar ítems, editar el array NAV_ITEMS en AppNavbar.jsx:

const NAV_ITEMS = [
  { label: 'Inicio', to: '/app' },
  { label: 'Mi módulo', to: '/app/domain/module' },
]
```

El ítem activo se detecta con `pathname.startsWith(item.to)` (excepto `/app` que usa igualdad exacta).

---

## StatusBadge

Badge de estado activo/inactivo. Importar desde `MasterTableShared`.

```jsx
import { StatusBadge } from '../layout/Shared/MasterTableShared'

<StatusBadge isActive={row.isActive} />
// Activo  → badge emerald (ui.badge.success)
// Inactivo → badge slate  (ui.badge.neutral)
```

---

## ActionMenu

Menú contextual de tres puntos por fila. Muestra "Editar", acciones extra, "Dar de baja" o "Reactivar" según el estado del registro.

```jsx
import { ActionMenu } from '../layout/Shared/MasterTableShared'

<ActionMenu
  row={row}                  // objeto con al menos { id, isActive }
  busyRowId={busyRowId}      // id | null — deshabilita menú si coincide
  onEdit={handleOpenEdit}    // (row) => void — opcional
  onDeactivate={handleDeactivate}  // (row) => void — se muestra si row.isActive
  onReactivate={handleReactivate}  // (row) => void — se muestra si !row.isActive
  extraActions={[            // acciones custom, opcionales
    { label: 'Eliminar', danger: true, onClick: handleDelete },
    { label: 'Ver detalle', onClick: handleOpenDetail },
  ]}
/>
```

**Lógica de visibilidad:**
- `onEdit` → siempre visible si se pasa
- `extraActions` → siempre visibles
- `onDeactivate` → visible solo cuando `row.isActive === true`
- `onReactivate` → visible solo cuando `row.isActive === false`

---

## Jerarquía de feedback — cuándo usar cada mecanismo

| Situación | Mecanismo |
|---|---|
| Error de carga que bloquea el módulo | `setError(msg)` + `<div className={ui.feedback.errorBanner}>` |
| Error de validación en formulario | `ui.feedback.errorBanner` inline dentro del modal |
| Resultado de operación API (éxito/error) | `<AppNotification />` |
| Confirmación antes de acción destructiva | `<MasterActionModal variant="danger" />` con acción diferida |
| Confirmación antes de acción informativa | `<MasterActionModal variant="info" />` con acción diferida |
| Estado vacío de tabla | `<td className={ui.feedback.emptyState}>Sin registros</td>` |
| Carga de tabla en curso | `<td className={ui.feedback.loadingState}>Cargando…</td>` |

**Regla de oro:** `AppNotification` es para después de hacer algo. `MasterActionModal` es para antes de hacer algo. Nunca ambos para el mismo evento.
