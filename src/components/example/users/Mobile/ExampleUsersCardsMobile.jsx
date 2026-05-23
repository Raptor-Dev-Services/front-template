import { ui } from '../../../../styles/designSystem'
import { StatusBadge, ActionMenu } from '../../../layout/Shared/MasterTableShared'

export default function ExampleUsersCardsMobile({
  rows, loading, busyRowId,
  onOpenEdit, onDeactivate, onReactivate,
  formatDate,
}) {
  if (loading)          return <p className={ui.feedback.loadingState}>Cargando…</p>
  if (rows.length === 0) return <p className={ui.feedback.emptyState}>Sin registros</p>

  return (
    <div className="space-y-3 px-1">
      {rows.map((row) => (
        <article key={row.publicId} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className={ui.typography.cardTitle}>{row.fullName}</p>
              <p className={ui.typography.body}>{row.publicId}</p>
            </div>
            <ActionMenu
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
              <dd className="mt-1"><StatusBadge isActive={row.isActive} /></dd>
            </div>
            <div>
              <dt className={ui.typography.eyebrow}>Creado</dt>
              <dd className={ui.typography.body}>{formatDate(row.createdAtUtc)}</dd>
            </div>
            <div className="col-span-2">
              <dt className={ui.typography.eyebrow}>Actualizado</dt>
              <dd className={ui.typography.body}>{formatDate(row.updatedAtUtc)}</dd>
            </div>
          </dl>
        </article>
      ))}
    </div>
  )
}
