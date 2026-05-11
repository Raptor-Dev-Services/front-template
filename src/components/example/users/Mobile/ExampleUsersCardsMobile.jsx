import { ui } from '../../../../styles/designSystem'
import { StatusBadge, ActionMenu } from '../../../layout/Shared/MasterTableShared'

export default function ExampleUsersCardsMobile({
  rows, loading, busyRowId,
  onOpenEdit, onDeactivate, onReactivate, onDelete,
  formatDate,
}) {
  if (loading) return <p className={ui.feedback.loadingState}>Cargando…</p>
  if (rows.length === 0) return <p className={ui.feedback.emptyState}>Sin registros</p>

  return (
    <div className="space-y-3 px-1">
      {rows.map((row) => (
        <article key={row.userId} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className={ui.typography.cardTitle}>{row.fullName}</p>
              <p className={ui.typography.body}>{row.email}</p>
            </div>
            <ActionMenu
              row={row}
              busyRowId={busyRowId}
              onEdit={onOpenEdit}
              onDeactivate={onDeactivate}
              onReactivate={onReactivate}
              extraActions={[{ label: 'Eliminar', danger: true, onClick: onDelete }]}
            />
          </div>
          <dl className="mt-4 grid grid-cols-2 gap-3">
            <div>
              <dt className={ui.typography.eyebrow}>Departamento</dt>
              <dd className={ui.typography.body}>{row.department || '—'}</dd>
            </div>
            <div>
              <dt className={ui.typography.eyebrow}>Estado</dt>
              <dd className="mt-1"><StatusBadge isActive={row.isActive} /></dd>
            </div>
            <div>
              <dt className={ui.typography.eyebrow}>Creado</dt>
              <dd className={ui.typography.body}>{formatDate(row.createdAtUtc)}</dd>
            </div>
            <div>
              <dt className={ui.typography.eyebrow}>Actualizado</dt>
              <dd className={ui.typography.body}>{formatDate(row.updatedAtUtc)}</dd>
            </div>
            {row.notes && (
              <div className="col-span-2">
                <dt className={ui.typography.eyebrow}>Notas</dt>
                <dd className={ui.typography.body}>{row.notes}</dd>
              </div>
            )}
          </dl>
        </article>
      ))}
    </div>
  )
}
