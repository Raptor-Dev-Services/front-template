import { useCallback, useEffect, useMemo, useState } from 'react'
import { ThemeContext } from './ThemeContext.js'
import { DEFAULT_THEME, persistTheme, readStoredTheme } from './themeStorage.js'

// Tema controlado por la APLICACION (skill theming-dark-mode): el tema resuelto se estampa como
// data-theme en <html> y el CSS flipa los tokens. Sin eleccion explicita el tema es DEFAULT_THEME, no
// el del sistema operativo: asi todos ven lo mismo y el script de index.html puede decidir el primer
// pintado sin esperar a React.
export function ThemeProvider({ children }) {
  // null = el usuario nunca eligio.
  const [choice, setChoiceState] = useState(readStoredTheme)
  const theme = choice ?? DEFAULT_THEME

  // Sincroniza el DOM (sistema externo) con el tema resuelto.
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
  }, [theme])

  // Persiste solo la eleccion explicita, no el default.
  useEffect(() => {
    persistTheme(choice)
  }, [choice])

  const setChoice = useCallback((next) => setChoiceState(next === 'light' || next === 'dark' ? next : null), [])
  const toggleTheme = useCallback(() => setChoiceState(theme === 'dark' ? 'light' : 'dark'), [theme])

  const value = useMemo(() => ({ theme, choice, toggleTheme, setChoice }), [theme, choice, toggleTheme, setChoice])

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

export default ThemeProvider
