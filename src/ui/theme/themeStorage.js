// Clave y valor por omision del tema. El script en linea de index.html usa EXACTAMENTE los mismos (lo
// fija ThemeProvider.test.jsx): si divergen, vuelve el parpadeo del primer pintado y nadie entiende por
// que. Renombra la clave con el prefijo de tu producto en los dos sitios a la vez.
export const THEME_STORAGE_KEY = 'app_theme'
export const DEFAULT_THEME = 'light'

/** Eleccion explicita guardada ('light' | 'dark'), o null si el usuario nunca eligio. */
export function readStoredTheme() {
  try {
    const stored = window.localStorage.getItem(THEME_STORAGE_KEY)
    if (stored === 'light' || stored === 'dark') return stored
  } catch {
    // localStorage bloqueado (modo privado): sin eleccion.
  }
  return null
}

export function persistTheme(choice) {
  try {
    if (choice) window.localStorage.setItem(THEME_STORAGE_KEY, choice)
    else window.localStorage.removeItem(THEME_STORAGE_KEY)
  } catch {
    // no-op
  }
}
