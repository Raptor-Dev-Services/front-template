import { MoonIcon, SunIcon } from '@heroicons/react/24/outline'
import { IconButton } from './IconButton.jsx'
import { useTheme } from './theme/useTheme.js'
import { useI18n } from '../i18n/useI18n.js'

// Toggle de tema claro/oscuro. Icono + nombre accesible que dice el tema DESTINO (no el actual); el
// tooltip generico va aparte.
export function ThemeToggle({ className = '' }) {
  const { theme, toggleTheme } = useTheme()
  const { t } = useI18n()
  const isDark = theme === 'dark'

  return (
    <IconButton
      label={isDark ? t('theme.toLight') : t('theme.toDark')}
      title={t('theme.toggle')}
      onClick={toggleTheme}
      className={className}
    >
      {isDark ? <SunIcon aria-hidden="true" className="size-5" /> : <MoonIcon aria-hidden="true" className="size-5" />}
    </IconButton>
  )
}

export default ThemeToggle
