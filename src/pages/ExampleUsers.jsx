import { ui } from '../styles/designSystem'
import useMediaQuery from '../hooks/useMediaQuery'
import useExampleUsers from '../components/example/users/useExampleUsers'
import AppNotification from '../components/layout/AppNotification'
import RecordEditModal from '../components/layout/RecordEditModal'
import MasterActionModal from '../components/layout/MasterActionModal'
import Pagination from '../components/primitives/Pagination'
import ExampleUsersTableDesktop from '../components/example/users/Desktop/ExampleUsersTableDesktop'
import ExampleUsersCardsMobile from '../components/example/users/Mobile/ExampleUsersCardsMobile'

const FORM_FIELDS = [
  { name: 'fullName',   label: 'Nombre completo', type: 'text',     placeholder: 'Ej: Juan Pérez', required: true },
  { name: 'email',      label: 'Email',            type: 'text',     placeholder: 'juan@ejemplo.com', required: true },
  { name: 'department', label: 'Departamento',     type: 'text',     placeholder: 'Ej: Ingeniería' },
  { name: 'notes',      label: 'Notas',            type: 'text',     placeholder: 'Notas opcionales' },
  { name: 'isActive',   label: 'Estado',           type: 'checkbox', checkboxLabel: 'Usuario activo' },
]

export default function ExampleUsers() {
  const isDesktop = useMediaQuery('(min-width: 640px)')
  const m = useExampleUsers()

  const tableProps = {
    rows: m.pagedRows,
    loading: m.loading,
    busyRowId: m.busyRowId,
    onOpenEdit: m.handleOpenEdit,
    onDeactivate: m.handleDeactivate,
    onReactivate: m.handleReactivate,
    onDelete: m.handleDelete,
    formatDate: m.formatDate,
  }

  return (
    <section className={ui.layout.moduleShell}>
      {m.error && <div className={ui.feedback.errorBanner}>{m.error}</div>}

      <div className={ui.surface.toolbar}>
        <div className="flex flex-wrap items-center gap-3">
          <input
            type="search"
            placeholder="Buscar por nombre, email o departamento…"
            value={m.filters.search}
            onChange={(e) => { m.setFilters((f) => ({ ...f, search: e.target.value })); m.setPageNumber(1) }}
            className={ui.controls.inputCompact}
          />
          <select
            value={m.filters.status}
            onChange={(e) => { m.setFilters((f) => ({ ...f, status: e.target.value })); m.setPageNumber(1) }}
            className={ui.controls.inputCompact}
          >
            <option value="all">Todos</option>
            <option value="active">Activos</option>
            <option value="inactive">Inactivos</option>
          </select>
          <span className={`${ui.typography.body} shrink-0`}>
            {m.filteredRows.length} registro{m.filteredRows.length !== 1 ? 's' : ''}
          </span>
          <div className="ml-auto flex items-center gap-2">
            <button
              type="button"
              onClick={m.loadData}
              disabled={m.loading}
              className={ui.controls.secondaryButton}
            >
              Actualizar
            </button>
            <button
              type="button"
              onClick={m.handleOpenCreate}
              className={ui.controls.accentButton}
            >
              Nuevo usuario
            </button>
          </div>
        </div>
      </div>

      {isDesktop
        ? <ExampleUsersTableDesktop {...tableProps} />
        : <ExampleUsersCardsMobile {...tableProps} />}

      <Pagination
        page={m.pageNumber}
        totalPages={m.totalPages}
        onPageChange={m.setPageNumber}
        loading={m.loading}
      />

      <RecordEditModal
        open={m.formOpen}
        title={m.editingRow ? 'Editar usuario' : 'Nuevo usuario'}
        fields={FORM_FIELDS}
        values={m.form}
        onChange={(name, value) => m.setForm((prev) => ({ ...prev, [name]: value }))}
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
        onCommentChange={(v) => m.setActionForm({ comments: v })}
        loading={m.saving}
        onConfirm={async () => {
          const action = m.confirmModal.action
          m.setConfirmModal((p) => ({ ...p, open: false }))
          if (typeof action === 'function') await action(m.actionForm)
        }}
        onCancel={() => m.setConfirmModal((p) => ({ ...p, open: false }))}
      />

      <AppNotification notification={m.notification} onClose={() => m.setNotification(null)} />
    </section>
  )
}
