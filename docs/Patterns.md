# Patrones de código

Todo módulo nuevo sigue exactamente estos patrones. Los ejemplos son copy-paste funcionales — cambiar nombres y campos al dominio real.

---

## Patrón 1 — Servicio API

Un archivo por dominio en `src/api/`. Solo funciones async. Siempre `resolveApiEnvelope`.

```js
// src/api/myDomainService.js
import { apiClient, resolveApiEnvelope } from './clients'

export async function getMyEntities() {
  const res = await apiClient.get('/api/my-domain/entities')
  return resolveApiEnvelope(res.data) || []
}

export async function getMyEntityById(id) {
  const res = await apiClient.get(`/api/my-domain/entities/${id}`)
  return resolveApiEnvelope(res.data)
}

export async function createMyEntity(body) {
  const res = await apiClient.post('/api/my-domain/entities', body)
  return resolveApiEnvelope(res.data)
}

export async function updateMyEntity(id, body) {
  const res = await apiClient.put(`/api/my-domain/entities/${id}`, body)
  return resolveApiEnvelope(res.data)
}

export async function deleteMyEntity(id) {
  const res = await apiClient.delete(`/api/my-domain/entities/${id}`)
  return resolveApiEnvelope(res.data)
}
```

---

## Patrón 2 — Hook de módulo

Encapsula TODO el estado y lógica. La página solo consume el hook.

```js
// src/components/domain/module/useDomainModule.js
import { useCallback, useEffect, useMemo, useState } from 'react'
import { extractApiErrorMessage } from '../../../api/clients'
import { getMyEntities, createMyEntity, updateMyEntity } from '../../../api/myDomainService'
import { formatDate } from '../../../utils/dateTime'

const DEFAULT_FILTERS = { search: '', status: 'all' }

export default function useDomainModule() {
  // datos
  const [rows, setRows]         = useState([])
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState('')
  const [busyRowId, setBusyRowId] = useState(null)

  // notificación
  const [notification, setNotification] = useState(null)

  // formulario INSERT/UPDATE
  const [formOpen, setFormOpen]     = useState(false)
  const [editingRow, setEditingRow] = useState(null)
  const [form, setForm]             = useState({ name: '', isActive: true })
  const [saving, setSaving]         = useState(false)

  // confirmación de acción
  const [confirmModal, setConfirmModal] = useState({
    open: false, title: '', message: '', variant: 'info',
    confirmText: 'Confirmar', requireComment: false, action: null,
  })
  const [actionForm, setActionForm] = useState({ comments: '' })

  // filtros y paginación
  const [filters, setFilters]       = useState(DEFAULT_FILTERS)
  const [pageNumber, setPageNumber] = useState(1)
  const [pageSize]                  = useState(50)

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
    const q = filters.search.trim().toLowerCase()
    return rows.filter(row => {
      if (q && !String(row.name || '').toLowerCase().includes(q)) return false
      if (filters.status === 'active'   && !row.isActive) return false
      if (filters.status === 'inactive' &&  row.isActive) return false
      return true
    })
  }, [rows, filters])

  const totalPages = useMemo(
    () => Math.max(1, Math.ceil(filteredRows.length / pageSize)),
    [filteredRows.length, pageSize],
  )
  const pagedRows = useMemo(
    () => filteredRows.slice((pageNumber - 1) * pageSize, pageNumber * pageSize),
    [filteredRows, pageNumber, pageSize],
  )

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
      if (editingRow) {
        await updateMyEntity(editingRow.id, form)
        setNotification({ id: crypto.randomUUID(), type: 'success', message: 'Registro actualizado.' })
      } else {
        await createMyEntity(form)
        setNotification({ id: crypto.randomUUID(), type: 'success', message: 'Registro creado.' })
      }
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
          await updateMyEntity(row.id, { isActive: false, comments: formValues.comments })
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
          await updateMyEntity(row.id, { isActive: true })
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

## Patrón 3 — Registrar una nueva ruta

**Paso 1** — Crear la página en `src/pages/MyModule.jsx`:

```jsx
import { ui } from '../styles/designSystem'
import useMediaQuery from '../hooks/useMediaQuery'
import useMyModule from '../components/domain/module/useMyModule'
import AppNotification from '../components/layout/AppNotification'
import RecordEditModal from '../components/layout/RecordEditModal'
import MasterActionModal from '../components/layout/MasterActionModal'
import Pagination from '../components/primitives/Pagination'
import MyTableDesktop from '../components/domain/module/Desktop/MyTableDesktop'
import MyCardsMobile from '../components/domain/module/Mobile/MyCardsMobile'

export default function MyModule() {
  const isDesktop = useMediaQuery('(min-width: 640px)')
  const m = useMyModule()

  const tableProps = {
    rows: m.pagedRows, loading: m.loading, busyRowId: m.busyRowId,
    onOpenEdit: m.handleOpenEdit, onDeactivate: m.handleDeactivate,
    onReactivate: m.handleReactivate, formatDate: m.formatDate,
  }

  return (
    <section className={ui.layout.moduleShell}>
      {m.error && <div className={ui.feedback.errorBanner}>{m.error}</div>}

      <div className={ui.surface.toolbar}>
        <div className="flex flex-wrap items-center gap-3">
          <input
            type="search" placeholder="Buscar…" value={m.filters.search}
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
            <button onClick={m.handleOpenCreate} className={ui.controls.accentButton}>Nuevo</button>
          </div>
        </div>
      </div>

      {isDesktop ? <MyTableDesktop {...tableProps} /> : <MyCardsMobile {...tableProps} />}

      <Pagination page={m.pageNumber} totalPages={m.totalPages} onPageChange={m.setPageNumber} loading={m.loading} />

      <RecordEditModal
        open={m.formOpen} title={m.editingRow ? 'Editar' : 'Nuevo'}
        fields={[
          { name: 'name', label: 'Nombre', type: 'text', placeholder: 'Ej: Mi registro' },
          { name: 'isActive', label: 'Estado', type: 'checkbox', checkboxLabel: 'Activo' },
        ]}
        values={m.form}
        onChange={(name, value) => m.setForm(prev => ({ ...prev, [name]: value }))}
        onConfirm={m.handleSave} onCancel={() => m.setFormOpen(false)} loading={m.saving}
      />

      <MasterActionModal
        open={m.confirmModal.open} title={m.confirmModal.title} message={m.confirmModal.message}
        variant={m.confirmModal.variant} confirmText={m.confirmModal.confirmText}
        showComment={m.confirmModal.requireComment} commentRequired={m.confirmModal.requireComment}
        commentValue={m.actionForm.comments} onCommentChange={v => m.setActionForm({ comments: v })}
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

**Paso 2** — Agregar lazy import y `<Route>` en `src/routes/AppRoutes.jsx`:

```jsx
const MyModule = lazy(() => import('../pages/MyModule'))
// ...
<Route path="domain/module" element={renderLazy(<MyModule />)} />
```

**Paso 3** — Si la página necesita ancho completo, agregar en `src/routes/wideRoutes.js`:

```js
export const wideRoutes = [
  '/app/example/users',
  '/app/domain/module',   // ← agregar aquí
]
```

**Paso 4** — Agregar al navbar en `src/components/layout/AppNavbar.jsx`:

```js
const NAV_ITEMS = [
  { label: 'Inicio', to: '/app' },
  { label: 'Mi módulo', to: '/app/domain/module' },  // ← agregar aquí
]
```

---

## Patrón 4 — Filtros persistidos en URL

Usar cuando el usuario necesita poder volver al mismo estado o compartir links con filtros activos.

```js
import { useSearchParams } from 'react-router-dom'
import { useEffect, useState } from 'react'

// Dentro del hook:
const [searchParams, setSearchParams] = useSearchParams()

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

// Sincronizar estado → URL
useEffect(() => {
  const params = { page: String(pageNumber), pageSize: String(pageSize) }
  if (filters.search.trim()) params.search = filters.search.trim()
  if (filters.status !== 'all') params.status = filters.status
  setSearchParams(params, { replace: true })
}, [filters, pageNumber, pageSize, setSearchParams])

// Al cambiar un filtro, siempre resetear página a 1:
function handleFilterChange(key, value) {
  setFilters(prev => ({ ...prev, [key]: value }))
  setPageNumber(1)
}
```

---

## Patrón 5 — SignalR en el hook

Conectar al hub en `useEffect`, con cleanup al desmontar. Los handlers usan refs para evitar closures stale.

```js
import { useEffect, useRef } from 'react'
import * as signalR from '@microsoft/signalr'

// Dentro del hook — después de loadData:
const _refs = useRef({})
_refs.current.loadData        = loadData
_refs.current.setNotification = setNotification

useEffect(() => {
  let disposed   = false
  let connection = null

  async function connect() {
    try {
      connection = new signalR.HubConnectionBuilder()
        .withUrl('/my-hub')                        // o URL completa con el cliente de notificaciones
        .withAutomaticReconnect()
        .configureLogging(signalR.LogLevel.Warning)
        .build()

      connection.on('MyEntityChanged', async ({ entityId, updatedByUser } = {}) => {
        await _refs.current.loadData()
        // notificar solo si lo actualizó otro usuario
      })

      await connection.start()
      if (disposed) { await connection.stop().catch(() => {}); return }
    } catch (err) {
      console.warn('[MyModule] Hub connection failed, operating without real-time:', err?.message)
    }
  }

  connect()

  return () => {
    disposed = true
    if (connection) connection.stop().catch(() => {})
  }
}, [])
```

---

## Patrón 6 — Tabla Desktop

```jsx
// src/components/domain/module/Desktop/MyTableDesktop.jsx
import { ui } from '../../../../styles/designSystem'
import { StatusBadge, ActionMenu } from '../../../layout/Shared/MasterTableShared'

export default function MyTableDesktop({
  rows, loading, busyRowId,
  onOpenEdit, onDeactivate, onReactivate, formatDate,
}) {
  return (
    <div className={ui.table.wrapper}>
      <div className={ui.table.scroll}>
        <table className={ui.table.element}>
          <thead className={ui.table.head}>
            <tr>
              <th className={ui.table.th}>ID</th>
              <th className={ui.table.th}>Nombre</th>
              <th className={ui.table.th}>Estado</th>
              <th className={ui.table.th}>Actualizado</th>
              <th className={ui.table.th} />
            </tr>
          </thead>
          <tbody className={ui.table.row}>
            {loading && <tr><td colSpan={5} className={ui.feedback.loadingState}>Cargando…</td></tr>}
            {!loading && rows.length === 0 && <tr><td colSpan={5} className={ui.feedback.emptyState}>Sin registros</td></tr>}
            {!loading && rows.map(row => (
              <tr key={row.id} className="hover:bg-slate-50">
                <td className={ui.table.td}>{row.id}</td>
                <td className={ui.table.td}>{row.name}</td>
                <td className={ui.table.td}><StatusBadge isActive={row.isActive} /></td>
                <td className={ui.table.td}>{formatDate(row.updatedAt)}</td>
                <td className={ui.table.td}>
                  <ActionMenu row={row} busyRowId={busyRowId} onEdit={onOpenEdit} onDeactivate={onDeactivate} onReactivate={onReactivate} />
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

## Patrón 7 — Tarjetas Mobile

```jsx
// src/components/domain/module/Mobile/MyCardsMobile.jsx
import { ui } from '../../../../styles/designSystem'
import { StatusBadge, ActionMenu } from '../../../layout/Shared/MasterTableShared'

export default function MyCardsMobile({
  rows, loading, busyRowId,
  onOpenEdit, onDeactivate, onReactivate, formatDate,
}) {
  if (loading)          return <p className={ui.feedback.loadingState}>Cargando…</p>
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
            <ActionMenu row={row} busyRowId={busyRowId} onEdit={onOpenEdit} onDeactivate={onDeactivate} onReactivate={onReactivate} />
          </div>
          <dl className="mt-4 grid grid-cols-2 gap-3">
            <div>
              <dt className={ui.typography.eyebrow}>Estado</dt>
              <dd className="mt-1"><StatusBadge isActive={row.isActive} /></dd>
            </div>
            <div>
              <dt className={ui.typography.eyebrow}>Actualizado</dt>
              <dd className={ui.typography.body}>{formatDate(row.updatedAt)}</dd>
            </div>
          </dl>
        </article>
      ))}
    </div>
  )
}
```

---

## Variables de estado — nombres y formas exactas

```js
// Siempre usar estos nombres en el hook:
const [rows, setRows]               = useState([])
const [loading, setLoading]         = useState(false)
const [error, setError]             = useState('')
const [busyRowId, setBusyRowId]     = useState(null)
const [notification, setNotification] = useState(null)
const [formOpen, setFormOpen]       = useState(false)
const [editingRow, setEditingRow]   = useState(null)   // null = crear, objeto = editar
const [form, setForm]               = useState({})
const [saving, setSaving]           = useState(false)
const [filters, setFilters]         = useState(DEFAULT_FILTERS)
const [pageNumber, setPageNumber]   = useState(1)
const [pageSize]                    = useState(50)

// Alias del hook en la página: siempre 'm'
const m = useMyModule()
// → m.rows, m.loading, m.handleSave, m.setNotification...
```
