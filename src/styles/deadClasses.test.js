import { describe, it, expect } from 'vitest'

import { clasesUsadas, clasesSinCss } from './deadClasses.js'

// El detector de clases muertas, corriendo sobre el codigo real. Existe porque el fallo que caza no da
// error: `text-danger` compila, pasa el lint y pinta el mensaje de error en el color heredado; un
// `border-default` dibuja el borde en el color del texto en vez del gris del token. Nadie lo reporta:
// se ve "casi bien".
describe('clases de color muertas', () => {
  it('ninguna utilidad de color usada en el codigo se queda sin CSS', async () => {
    const usadas = clasesUsadas()
    const muertas = await clasesSinCss(usadas.keys())

    // El mensaje dice DONDE, porque el nombre solo no basta para arreglarlo.
    const detalle = muertas.map((clase) => `${clase} (${[...usadas.get(clase)].join(', ')})`)
    expect(detalle).toEqual([])
  })

  it('el detector reconoce como muerta una utilidad sobre un token inexistente', async () => {
    // Sin esta prueba el detector puede quedarse mudo -y un detector mudo reporta cero muertas para
    // siempre-.
    expect(await clasesSinCss(['text-danger', 'border-default'])).toEqual(['text-danger', 'border-default'])
  })

  it('el detector NO acusa a una utilidad que si resuelve', async () => {
    expect(
      await clasesSinCss(['text-error', 'border-border', 'divide-border', 'bg-surface-muted', 'text-muted', 'bg-primary']),
    ).toEqual([])
  })
})
