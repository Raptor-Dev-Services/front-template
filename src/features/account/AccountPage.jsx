import { useCallback } from 'react'
import { SectionHeading } from '../../ui/SectionHeading.jsx'
import { StackedField } from '../../ui/StackedField.jsx'
import { DataError, RowsSkeleton } from '../../ui/DataStates.jsx'
import { AppNotification } from '../../ui/AppNotification.jsx'
import { useNotification } from '../../ui/useNotification.js'
import { useI18n } from '../../i18n/useI18n.js'
import { LOAD_STATUS } from '../../utils/loadStatus.js'
import { useAccount } from './hooks/useAccount.js'
import { TwoFactorSection } from './components/TwoFactorSection.jsx'

const LAST_LOGIN = { dateStyle: 'medium', timeStyle: 'short' }

// AccountPage - "mi cuenta": lo que el usuario de la sesion puede ver y cambiar de si mismo. No pide
// permiso (es lo suyo, y el backend lo resuelve desde el token), solo sesion.
export function AccountPage() {
  const { t, formatDate } = useI18n()
  const { status, error, account, reload } = useAccount()
  const { notification, notify, dismiss } = useNotification()

  const handleTwoFactorChanged = useCallback(() => {
    notify('success', account?.twoFactorEnabled ? t('account.twoFactor.disabledDone') : t('account.twoFactor.enabledDone'))
    reload()
  }, [account?.twoFactorEnabled, notify, reload, t])

  let content
  if (status === LOAD_STATUS.loading && !account) {
    content = <RowsSkeleton rows={3} label={t('account.loading')} avatar={false} />
  } else if (status === LOAD_STATUS.error) {
    content = <DataError title={t('account.loadError')} message={error} onRetry={reload} retryLabel={t('common.retry')} />
  } else {
    content = (
      <div className="space-y-8">
        <dl className="max-w-md space-y-3">
          <StackedField label={t('account.email')}>{account.email}</StackedField>
          <StackedField label={t('account.lastLogin')}>
            {account.lastLoginAtUtc ? formatDate(account.lastLoginAtUtc, LAST_LOGIN) : t('account.never')}
          </StackedField>
        </dl>
        <TwoFactorSection enabled={account.twoFactorEnabled} onChanged={handleTwoFactorChanged} />
      </div>
    )
  }

  return (
    <section className="space-y-6">
      <SectionHeading title={t('account.title')} subtitle={t('account.subtitle')} />
      {content}
      <AppNotification notification={notification} onClose={dismiss} />
    </section>
  )
}

export default AccountPage
