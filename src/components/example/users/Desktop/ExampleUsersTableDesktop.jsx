import { ui } from '../../../../styles/designSystem'
import { StatusBadge, ActionMenu } from '../../../layout/Shared/MasterTableShared'

export default function ExampleUsersTableDesktop({
  rows, loading, busyRowId,
  onOpenEdit, onDeactivate, onReactivate, onDelete,
  formatDate,
}) {
  return (
    <div className={ui.table.wrapper}>
      <div className={ui.table.scroll}>
        <table className={ui.table.element}>
          <thead className={ui.table.head}>
            <tr>
              <th className={ui.table.th}>Nombre</th>
              <th className={ui.table.th}>Email</th>
              <th className={ui.table.th}>Departamento</th>
              <th className={ui.table.th}>Estado</th>
              <th className={ui.table.th}>Creado</th>
              <th className={ui.table.th}>Actualizado</th>
              <th className={ui.table.th} />
            </tr>
          </thead>
          <tbody className={ui.table.row}>
            {loading && (
              <tr>
                <td colSpan={7} className={ui.feedback.loadingState}>Cargando…</td>
              </tr>
            )}
            {!loading && rows.length === 0 && (
              <tr>
                <td colSpan={7} className={ui.feedback.emptyState}>Sin registros</td>
              </tr>
            )}
            {!loading && rows.map((row) => (
              <tr key={row.userId} className="hover:bg-slate-50">
                <td className={ui.table.td}>{row.fullName}</td>
                <td className={ui.table.td}>{row.email}</td>
                <td className={ui.table.td}>{row.department || '—'}</td>
                <td className={ui.table.td}><StatusBadge isActive={row.isActive} /></td>
                <td className={ui.table.td}>{formatDate(row.createdAtUtc)}</td>
                <td className={ui.table.td}>{formatDate(row.updatedAtUtc)}</td>
                <td className={ui.table.td}>
                  <ActionMenu
                    row={row}
                    busyRowId={busyRowId}
                    onEdit={onOpenEdit}
                    onDeactivate={onDeactivate}
                    onReactivate={onReactivate}
                    extraActions={[{ label: 'Eliminar', danger: true, onClick: onDelete }]}
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
