import { describe, it, expect, afterEach } from 'vitest'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { render, screen, act } from '@testing-library/react'

import { DEFAULT_THEME, THEME_STORAGE_KEY, readStoredTheme } from './themeStorage.js'
import { ThemeProvider } from './ThemeProvider.jsx'
import { useTheme } from './useTheme.js'

const INDEX_HTML = readFileSync(resolve(import.meta.dirname, '../../../index.html'), 'utf8')

describe('el script anti-parpadeo de index.html', () => {
  it('lee la MISMA clave de almacenamiento que ThemeProvider', () => {
    // Si divergen, el primer pintado sale con otro tema y salta al montar React: el parpadeo vuelve.
    expect(INDEX_HTML).toContain(`localStorage.getItem('${THEME_STORAGE_KEY}')`)
  })

  it('cae al MISMO tema por omision que ThemeProvider', () => {
    expect(INDEX_HTML).toContain(`: '${DEFAULT_THEME}'`)
  })
})

function Sonda() {
  const { theme, toggleTheme } = useTheme()
  return (
    <button type="button" onClick={toggleTheme}>
      tema {theme}
    </button>
  )
}

describe('ThemeProvider', () => {
  afterEach(() => {
    localStorage.clear()
    document.documentElement.removeAttribute('data-theme')
  })

  it('sin eleccion guardada usa el tema por omision y lo estampa en <html>', () => {
    render(
      <ThemeProvider>
        <Sonda />
      </ThemeProvider>,
    )
    expect(screen.getByRole('button')).toHaveTextContent(`tema ${DEFAULT_THEME}`)
    expect(document.documentElement.getAttribute('data-theme')).toBe(DEFAULT_THEME)
  })

  it('al alternar persiste la eleccion explicita', () => {
    render(
      <ThemeProvider>
        <Sonda />
      </ThemeProvider>,
    )
    act(() => screen.getByRole('button').click())
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark')
    expect(readStoredTheme()).toBe('dark')
  })

  it('ignora un valor guardado que no es un tema', () => {
    localStorage.setItem(THEME_STORAGE_KEY, 'morado')
    expect(readStoredTheme()).toBeNull()
  })
})
