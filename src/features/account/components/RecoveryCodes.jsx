import { useState } from 'react'
import { ArrowDownTrayIcon, ClipboardDocumentIcon } from '@heroicons/react/24/outline'
import { AppButton } from '../../../ui/AppButton.jsx'
import { useI18n } from '../../../i18n/useI18n.js'

/** Descarga los codigos como .txt, sin servidor: el unico lugar donde existen en claro es esta pantalla. */
function downloadCodes(codes, fileName) {
  const blob = new Blob([`${codes.join('\r\n')}\r\n`], { type: 'text/plain;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = fileName
  link.click()
  URL.revokeObjectURL(url)
}

// RecoveryCodes - los codigos de recuperacion recien emitidos. Se muestran UNA vez (el backend solo guarda
// su hash), asi que la pantalla no ofrece "cerrar": ofrece "ya los guarde", que es lo que el usuario
// tiene que haber hecho antes de irse.
export function RecoveryCodes({ codes, onDone }) {
  const { t } = useI18n()
  const [copied, setCopied] = useState(null)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(codes.join('\n'))
      setCopied('ok')
    } catch {
      // Sin permiso de portapapeles (o sin contexto seguro): se dice, y quedan la descarga y la lista.
      setCopied('failed')
    }
  }

  return (
    <div className="space-y-4">
      <p role="status" data-tone="success" className="ui-alert">
        {t('account.twoFactor.enabledNow')}
      </p>
      <p data-tone="warning" className="ui-alert">
        {t('account.twoFactor.codesWarning')}
      </p>

      <ol aria-label={t('account.twoFactor.codesLabel')} className="grid grid-cols-2 gap-x-6 gap-y-2 font-mono text-sm text-content">
        {codes.map((code) => (
          <li key={code}>{code}</li>
        ))}
      </ol>

      <div className="flex flex-wrap gap-3">
        <AppButton variant="secondary" size="sm" onClick={handleCopy}>
          <ClipboardDocumentIcon aria-hidden="true" className="size-4" />
          {t('account.twoFactor.copy')}
        </AppButton>
        <AppButton variant="secondary" size="sm" onClick={() => downloadCodes(codes, t('account.twoFactor.fileName'))}>
          <ArrowDownTrayIcon aria-hidden="true" className="size-4" />
          {t('account.twoFactor.download')}
        </AppButton>
      </div>
      {copied ? (
        <p role="status" className="text-sm text-muted">
          {copied === 'ok' ? t('account.twoFactor.copied') : t('account.twoFactor.copyFailed')}
        </p>
      ) : null}

      <AppButton onClick={onDone}>{t('account.twoFactor.saved')}</AppButton>
    </div>
  )
}

export default RecoveryCodes
