import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

// Guarda de contraste AA de los tokens de texto, en los DOS temas.
//
// Por que existe: un componente que usa tokens -lo correcto- puede quedar ilegible igual si el TOKEN
// esta mal elegido para uno de los temas (texto oscuro sobre fondo oscuro que nadie mira porque trabaja
// en claro). Esta prueba lee el CSS de verdad, no una copia de los valores, para que no pueda quedarse
// desincronizada del archivo que manda.

const CSS = readFileSync(resolve(import.meta.dirname, '../index.css'), 'utf8')

/** Valor de un token en el bloque claro (`@theme`) o en el de `:root[data-theme='dark']`. */
function token(nombre, tema) {
  const bloque =
    tema === 'dark'
      ? CSS.slice(CSS.indexOf(":root[data-theme='dark'] {"))
      : CSS.slice(CSS.indexOf('@theme'), CSS.indexOf('@media'))
  const m = bloque.match(new RegExp(`--color-${nombre}:\\s*([^;]+);`))
  if (!m) throw new Error(`token --color-${nombre} no encontrado en el tema ${tema}`)
  return m[1].trim()
}

function rgb(valor) {
  const hex = valor.match(/^#([0-9a-f]{6})$/i)
  if (hex) {
    const n = parseInt(hex[1], 16)
    return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255, a: 1 }
  }
  const m = valor.match(/rgba?\(([^)]+)\)/)
  if (!m) throw new Error(`no se pudo leer el color: ${valor}`)
  const p = m[1].split(',').map((x) => parseFloat(x))
  return { r: p[0], g: p[1], b: p[2], a: p[3] ?? 1 }
}

/** Compone un color translucido sobre su fondo. Sin esto, un rgba() se mide como si fuera opaco. */
function componer(frente, fondo) {
  return {
    r: frente.r * frente.a + fondo.r * (1 - frente.a),
    g: frente.g * frente.a + fondo.g * (1 - frente.a),
    b: frente.b * frente.a + fondo.b * (1 - frente.a),
    a: 1,
  }
}

/** Equivalente de color-mix(in srgb, color X%, transparent) sobre un fondo opaco. */
function tinte(color, porcentaje, fondo) {
  return componer({ ...color, a: porcentaje / 100 }, fondo)
}

function contraste(texto, fondo) {
  const lum = (c) => {
    const f = (v) => {
      const s = v / 255
      return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4
    }
    return 0.2126 * f(c.r) + 0.7152 * f(c.g) + 0.0722 * f(c.b)
  }
  const [a, b] = [lum(texto), lum(fondo)]
  return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05)
}

const AA_TEXTO = 4.5
const AA_NO_TEXTO = 3 // bordes de foco y controles (WCAG 1.4.11)
const SUPERFICIES = ['surface', 'surface-muted', 'surface-raised']

describe('contraste AA de los tokens', () => {
  for (const tema of ['light', 'dark']) {
    describe(tema, () => {
      it('texto principal y secundario sobre las tres superficies', () => {
        for (const texto of ['content', 'muted']) {
          for (const s of SUPERFICIES) {
            const valor = contraste(rgb(token(texto, tema)), rgb(token(s, tema)))
            expect(valor, `${texto} sobre ${s}`).toBeGreaterThanOrEqual(AA_TEXTO)
          }
        }
      })

      it('brand-text sobre brand-soft (item activo del menu)', () => {
        const fondo = componer(rgb(token('brand-soft', tema)), rgb(token('surface', tema)))
        expect(contraste(rgb(token('brand-text', tema)), fondo)).toBeGreaterThanOrEqual(AA_TEXTO)
      })

      it('el texto del boton principal sobre su fondo', () => {
        expect(contraste(rgb(token('primary-fg', tema)), rgb(token('primary', tema)))).toBeGreaterThanOrEqual(AA_TEXTO)
        expect(
          contraste(rgb(token('primary-fg', tema)), rgb(token('primary-hover', tema))),
        ).toBeGreaterThanOrEqual(AA_TEXTO)
      })

      it('texto blanco sobre el boton destructivo', () => {
        expect(contraste(rgb('#ffffff'), rgb(token('danger-fill', tema)))).toBeGreaterThanOrEqual(AA_TEXTO)
      })

      it('los colores de estado se leen como texto, tambien sobre su propio tinte (badges, alertas)', () => {
        for (const estado of ['success', 'warning', 'error', 'info']) {
          const color = rgb(token(estado, tema))
          for (const s of SUPERFICIES) {
            const superficie = rgb(token(s, tema))
            expect(contraste(color, superficie), `${estado} sobre ${s}`).toBeGreaterThanOrEqual(AA_TEXTO)
            expect(contraste(color, tinte(color, 10, superficie)), `${estado} sobre su tinte en ${s}`).toBeGreaterThanOrEqual(
              AA_TEXTO,
            )
          }
        }
      })

      it('el anillo de foco se distingue de las superficies', () => {
        for (const s of SUPERFICIES) {
          expect(contraste(rgb(token('focus', tema)), rgb(token(s, tema))), `focus sobre ${s}`).toBeGreaterThanOrEqual(
            AA_NO_TEXTO,
          )
        }
      })
    })
  }

  it('los dos bloques oscuros (@media y [data-theme]) declaran los mismos valores', () => {
    // Si divergen, el primer pintado con el sistema en oscuro sale con otros colores y "parpadea".
    const media = CSS.slice(CSS.indexOf('@media (prefers-color-scheme: dark)'), CSS.indexOf(":root[data-theme='dark'] {"))
    const explicito = CSS.slice(CSS.indexOf(":root[data-theme='dark'] {"), CSS.indexOf('@layer base'))
    const decls = (bloque) => [...bloque.matchAll(/(--color-[\w-]+):\s*([^;]+);/g)].map((m) => `${m[1]}=${m[2].trim()}`)
    expect(decls(media).length).toBeGreaterThan(10)
    expect(decls(media)).toEqual(decls(explicito))
  })
})
