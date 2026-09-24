import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/react'
import { CheckIcon, LanguageIcon } from '@heroicons/react/24/outline'
import { useI18n } from '../i18n/useI18n.js'
import { cx } from '../styles/designSystem.js'

// Selector de idioma. Menu de Headless UI: navegable por teclado y con el foco gestionado. La
// preferencia la persiste I18nProvider.
export function LocaleSwitcher({ className = '' }) {
  const { locale, setLocale, locales, t } = useI18n()

  return (
    <Menu as="div" className={cx('relative', className)}>
      <MenuButton
        className="inline-flex h-10 items-center gap-1.5 rounded-lg border border-border px-2.5 text-sm font-medium text-muted transition-colors duration-150 hover:bg-surface-muted hover:text-content"
        aria-label={t('locale.label')}
      >
        <LanguageIcon aria-hidden="true" className="size-5" />
        <span>{t(`locale.short.${locale}`)}</span>
      </MenuButton>
      <MenuItems
        transition
        anchor="bottom end"
        className="z-50 w-40 origin-top-right rounded-lg border border-border bg-surface-raised p-1 shadow-lg transition duration-150 ease-out [--anchor-gap:0.25rem] focus:outline-none data-closed:scale-95 data-closed:opacity-0"
      >
        {locales.map((code) => (
          <MenuItem key={code}>
            <button
              type="button"
              lang={code}
              onClick={() => void setLocale(code)}
              className="flex w-full items-center justify-between rounded-md px-3 py-2 text-sm text-content data-focus:bg-surface-muted"
            >
              <span>{t(`locale.${code}`)}</span>
              {code === locale ? <CheckIcon aria-hidden="true" className="size-4 text-content" /> : null}
            </button>
          </MenuItem>
        ))}
      </MenuItems>
    </Menu>
  )
}

export default LocaleSwitcher
