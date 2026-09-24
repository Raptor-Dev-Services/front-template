import { UserGroupIcon } from '@heroicons/react/24/outline'
import { DataEmpty, DataError, RowsSkeleton } from '../../../ui/DataStates.jsx'
import { useI18n } from '../../../i18n/useI18n.js'

// Los estados de la pantalla de usuarios: la capa que traduce las claves de ESTA feature sobre las
// primitivas de src/ui/DataStates. El estado de exito lo pinta UsersTable.

export function UsersLoading() {
  const { t } = useI18n()
  return <RowsSkeleton rows={6} label={t('users.loading')} trailing />
}

export function UsersError({ message, onRetry }) {
  const { t } = useI18n()
  return <DataError title={t('users.loadError')} message={message} onRetry={onRetry} retryLabel={t('common.retry')} />
}

export function UsersEmpty() {
  const { t } = useI18n()
  return <DataEmpty icon={UserGroupIcon} title={t('users.emptyTitle')} body={t('users.emptyHint')} />
}
