import { PencilSquareIcon, UserMinusIcon } from '@heroicons/react/24/outline'
import { ActionMenu } from '../../../ui/ActionMenu.jsx'
import { StackedField } from '../../../ui/StackedField.jsx'
import { StatusBadge } from '../../../ui/StatusBadge.jsx'
import { useI18n } from '../../../i18n/useI18n.js'
import { initials } from '../utils/initials.js'

const DATE_TIME = { dateStyle: 'medium', timeStyle: 'short' }

function UserAvatar({ name }) {
  return (
    <span
      aria-hidden="true"
      className="inline-flex size-10 shrink-0 items-center justify-center rounded-full bg-brand-soft text-sm font-semibold text-brand-text"
    >
      {initials(name)}
    </span>
  )
}

function UserStatus({ active }) {
  const { t } = useI18n()
  return <StatusBadge tone={active ? 'success' : 'neutral'} label={active ? t('users.status.active') : t('users.status.inactive')} />
}

function UserIdentity({ user, isSelf }) {
  const { t } = useI18n()
  return (
    <div className="flex min-w-0 items-center gap-3">
      <UserAvatar name={user.fullName} />
      <span className="flex min-w-0 items-center gap-2">
        <span className="truncate font-medium text-content">{user.fullName}</span>
        {isSelf ? <span className="ui-pill px-2 py-0 text-xs">{t('users.you')}</span> : null}
      </span>
    </div>
  )
}

/** Acciones de fila. Sin permiso de escritura no hay menu; a uno mismo no se le ofrece darse de baja. */
function UserActions({ user, canManage, isSelf, onEdit, onDisable }) {
  const { t } = useI18n()
  return (
    <ActionMenu
      label={t('users.actions.menu', { name: user.fullName })}
      items={[
        { key: 'edit', label: t('users.actions.edit'), icon: PencilSquareIcon, onSelect: () => onEdit(user), hidden: !canManage },
        {
          key: 'disable',
          label: t('users.actions.disable'),
          icon: UserMinusIcon,
          tone: 'danger',
          onSelect: () => onDisable(user),
          // Darse de baja a si mismo deja la sesion sin cuenta a media operacion y sin quien lo revierta.
          hidden: !canManage || !user.isActive || isSelf,
        },
      ]}
    />
  )
}

/**
 * UsersTable - en movil cada fila se apila como lista con pares etiqueta:valor; desde `md` vuelve la
 * tabla completa. Es la misma lista con dos formas, no dos componentes que puedan divergir.
 */
export function UsersTable({ items, canManage, currentUserId, onEdit, onDisable }) {
  const { t, formatDate } = useI18n()
  const isSelfOf = (user) => currentUserId != null && String(user.publicId) === String(currentUserId)

  return (
    <div>
      {/* Movil: lista apilada, sin tarjetas (las filas las separa una linea). */}
      <ul className="divide-y divide-border md:hidden">
        {items.map((user) => {
          const isSelf = isSelfOf(user)
          return (
            <li key={user.publicId} className="py-4">
              <div className="flex items-start justify-between gap-3">
                <UserIdentity user={user} isSelf={isSelf} />
                <UserActions user={user} canManage={canManage} isSelf={isSelf} onEdit={onEdit} onDisable={onDisable} />
              </div>
              <dl className="mt-3 space-y-2">
                <StackedField label={t('users.col.status')}>
                  <UserStatus active={user.isActive} />
                </StackedField>
                <StackedField label={t('users.col.created')}>{formatDate(user.createdAtUtc, DATE_TIME)}</StackedField>
                <StackedField label={t('users.col.updated')}>{formatDate(user.updatedAtUtc, DATE_TIME)}</StackedField>
              </dl>
            </li>
          )
        })}
      </ul>

      {/* Escritorio: tabla completa. */}
      <div className="hidden overflow-x-auto md:block">
        <table className="w-full text-left text-sm">
          <caption className="sr-only">{t('users.tableCaption')}</caption>
          <thead className="border-b border-border text-xs uppercase tracking-wide text-muted">
            <tr>
              <th scope="col" className="px-4 py-3 font-medium">
                {t('users.col.name')}
              </th>
              <th scope="col" className="px-4 py-3 font-medium">
                {t('users.col.status')}
              </th>
              <th scope="col" className="px-4 py-3 font-medium">
                {t('users.col.created')}
              </th>
              <th scope="col" className="px-4 py-3 font-medium">
                {t('users.col.updated')}
              </th>
              <th scope="col" className="px-4 py-3 text-right font-medium">
                <span className="sr-only">{t('users.col.actions')}</span>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {items.map((user) => {
              const isSelf = isSelfOf(user)
              return (
                <tr key={user.publicId} className="transition-colors duration-150 hover:bg-surface-muted">
                  <td className="px-4 py-3">
                    <UserIdentity user={user} isSelf={isSelf} />
                  </td>
                  <td className="px-4 py-3">
                    <UserStatus active={user.isActive} />
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-muted">{formatDate(user.createdAtUtc, DATE_TIME)}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-muted">{formatDate(user.updatedAtUtc, DATE_TIME)}</td>
                  <td className="px-4 py-3 text-right">
                    <UserActions user={user} canManage={canManage} isSelf={isSelf} onEdit={onEdit} onDisable={onDisable} />
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default UsersTable
