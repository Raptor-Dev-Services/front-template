import { describe, it, expect } from 'vitest'

import { es } from './messages.es.js'
import en from './messages.en.js'

// Detector: los dos diccionarios tienen EXACTAMENTE el mismo juego de claves.
//
// El dano de una clave a medias no se ve en el idioma por defecto, que es el unico que suele mirarse:
// `translateMessage` cae al espanol cuando falta en el activo, asi que la interfaz en ingles mostraria
// texto en espanol y nadie se enteraria. Se comprueban las dos direcciones: una clave que sobra en
// ingles es texto que nadie pinta, y el dia que alguien la cite aparecera cruda en espanol.

function claves(nodo, prefijo = '') {
  const salida = []
  for (const [clave, valor] of Object.entries(nodo)) {
    const ruta = prefijo ? `${prefijo}.${clave}` : clave
    if (valor && typeof valor === 'object' && !Array.isArray(valor)) salida.push(...claves(valor, ruta))
    else salida.push(ruta)
  }
  return salida
}

describe('los diccionarios de i18n', () => {
  it('tienen el mismo juego de claves en los dos idiomas', () => {
    const enEspanol = claves(es)
    const enIngles = claves(en)
    // Guarda: si un import cambia de forma y llega un objeto vacio, el resto pasaria sin mirar nada.
    expect(enEspanol.length).toBeGreaterThan(50)

    const ingles = new Set(enIngles)
    const espanol = new Set(enEspanol)

    expect(enEspanol.filter((clave) => !ingles.has(clave))).toEqual([])
    expect(enIngles.filter((clave) => !espanol.has(clave))).toEqual([])
  })

  it('no dejan ningun texto vacio', () => {
    const vacias = (dict) =>
      claves(dict).filter((ruta) => ruta.split('.').reduce((n, p) => n[p], dict).trim() === '')
    expect(vacias(es)).toEqual([])
    expect(vacias(en)).toEqual([])
  })
})
