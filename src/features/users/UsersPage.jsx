import { useMemo, useState } from 'react'
import { ArrowDownTrayIcon } from '@heroicons/react/24/outline'
import { SectionHeading } from '../../ui/SectionHeading.jsx'
import { AppButton } from '../../ui/AppButton.jsx'
import { Pagination } from '../../ui/Pagination.jsx'
import { ConfirmDialog } from '../../ui/ConfirmDialog.jsx'
import { AppNotification } from '../../ui/AppNotification.jsx'
import { useNotification } from '../../ui/useNotification.js'
import { useI18n } from '../../i18n/useI18n.js'
import { getClaims, hasPermission } from '../../auth/session.js'
import { PERMISSIONS } from '../../auth/permissions.js'
import { listUsers } from '../../api/users.js'
import { LOAD_STATUS } from '../../utils/loadStatus.js'
import { useCsvExport } from '../shared/hooks/useCsvExport.js'
import { useUsers } from './hooks/useUsers.js'
import { UsersTable } from './components/UsersTable.jsx'
import { UsersEmpty, UsersError, UsersLoading } from './components/UsersStates.jsx'
import { EditUserModal } from './components/EditUserModal.jsx'

const EXPORT_DATE = { dateStyle: 'short', timeStyle: 'short' }

// UsersPage - modulo de ejemplo: listado paginado en servidor con sus cuatro estados (carga, error,
// vacio, exito), edicion en modal, baja con confirmacion y exportacion del listado COMPLETO a CSV.
// La ruta exige users.read; editar y dar de baja exigen users.manage (y el backend lo vuelve a exigir).
export function UsersPage() {
  const { t, locale, formatDate } = useI18n()
  const canManage = hasPermission(PERMISSIONS.usersManage)
  const currentUserId = getClaims()?.sub ?? null
  const users = useUsers()
  const { notification, notify, dismiss } = useNotification()

  const [editFor, setEditFor] = useState(null)
  const [disableFor, setDisableFor] = useState(null)

  const exportColumns = useMemo(
    () => [
      { key: 'fullName', header: t('users.col.name') },
      { key: 'isActive', header: t('users.col.status'), format: (v) => (v ? t('users.status.active') : t('users.status.inactive')) },
      { key: 'createdAtUtc', header: t('users.col.created'), format: (v) => formatDate(v, EXPORT_DATE) },
      { key: 'updatedAtUtc', header: t('users.col.updated'), format: (v) => formatDate(v, EXPORT_DATE) },
    ],
    [t, formatDate],
  )
  const csv = useCsvExport({
    fetchPage: (page, pageSize) => listUsers({ page, pageSize }),
    columns: exportColumns,
    reportName: t('users.export.fileName'),
    locale,
  })

  const handleExport = async () => {
    await csv.exportAll()
  }

  const handleEdit = async (payload) => {
    const result = await users.actions.edit(editFor.publicId, payload)
    if (result.ok) notify('success', t('users.edit.done', { name: payload.fullName }))
    return result
  }

  const handleDisable = async () => {
    const name = disableFor.fullName
    const result = await users.actions.disable(disableFor.publicId)
    if (result.ok) notify('success', t('users.disable.done', { name }))
    return result
  }

  const showList = users.status === LOAD_STATUS.success && users.items.length > 0

  return (
    <div className="mx-auto max-w-5xl">
      <SectionHeading
        title={t('users.title')}
        subtitle={t('users.subtitle')}
        actions={
          <AppButton
            variant="secondary"
            onClick={handleExport}
            disabled={csv.exporting || users.total === 0}
            aria-busy={csv.exporting}
          >
            <ArrowDownTrayIcon aria-hidden="true" className="size-5" />
            {csv.exporting ? t('users.export.exporting') : t('users.export.button')}
          </AppButton>
        }
      />

      {csv.error ? (
        <p role="alert" data-tone="danger" className="ui-alert mt-4">
          {t('users.export.error', { message: csv.error })}
        </p>
      ) : null}

      <div className="mt-6">
        {users.status === LOAD_STATUS.loading ? <UsersLoading /> : null}
        {users.status === LOAD_STATUS.error ? <UsersError message={users.error} onRetry={users.retry} /> : null}
        {users.status === LOAD_STATUS.success && users.items.length === 0 ? <UsersEmpty /> : null}
        {showList ? (
          <UsersTable
            items={users.items}
            canManage={canManage}
            currentUserId={currentUserId}
            onEdit={setEditFor}
            onDisable={setDisableFor}
          />
        ) : null}

        {/* Fuera del bloque de exito a proposito: paginar pasa por `loading`, y dentro el <nav> se
            desmontaria en cada cambio de pagina, perdiendo el foco del boton recien pulsado y el
            aria-live que anuncia la pagina nueva. */}
        {users.status !== LOAD_STATUS.error ? (
          <Pagination
            page={users.page}
            pageCount={users.totalPages}
            label={t('users.pagination.label')}
            info={t('users.pagination.info', { page: users.page, pageCount: users.totalPages, total: users.total })}
            prevLabel={t('users.pagination.prev')}
            nextLabel={t('users.pagination.next')}
            onPrev={() => users.goToPage(users.page - 1)}
            onNext={() => users.goToPage(users.page + 1)}
            disabled={users.status === LOAD_STATUS.loading}
          />
        ) : null}
      </div>

      <EditUserModal user={editFor} onClose={() => setEditFor(null)} onSubmit={handleEdit} />

      {disableFor ? (
        <ConfirmDialog
          key={disableFor.publicId}
          open
          title={t('users.disable.title', { name: disableFor.fullName })}
          body={t('users.disable.body')}
          confirmLabel={t('users.disable.confirm')}
          onConfirm={handleDisable}
          onClose={() => setDisableFor(null)}
        />
      ) : null}

      <AppNotification notification={notification} onClose={dismiss} />
    </div>
  )
}

export default UsersPage
