import { useContext } from 'react'
import { I18nContext } from './I18nContext.js'

/** Acceso a la capa de i18n: { t, locale, setLocale, locales, formatCurrency, formatDate }. */
export function useI18n() {
  const ctx = useContext(I18nContext)
  if (!ctx) {
    throw new Error('useI18n debe usarse dentro de <I18nProvider>')
  }
  return ctx
}

export default useI18n
