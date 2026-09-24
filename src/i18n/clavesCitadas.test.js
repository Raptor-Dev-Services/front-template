import { describe, it, expect } from 'vitest'
import { readFileSync, readdirSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

import { messages } from './messages.js'

// Detector: toda clave citada como literal en un `t('...')` tiene que EXISTIR en el diccionario.
// `translate.js` devuelve la clave cruda cuando no la encuentra, asi que una clave mal escrita no rompe
// nada: pinta el identificador en pantalla. Donde peor cae es en texto que nadie mira -un `sr-only`, un
// aria-label-, porque entonces solo lo oye quien usa lector de pantalla.
//
// La paridad entre idiomas la cubre paridadDeIdiomas.test.js; esto cubre lo contrario: que lo CITADO exista.
const SRC = join(dirname(fileURLToPath(import.meta.url)), '..')

function fuentes(dir) {
  const salida = []
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const ruta = join(dir, e.name)
    if (e.isDirectory()) salida.push(...fuentes(ruta))
    else if (/\.(js|jsx)$/.test(e.name) && !/\.test\./.test(e.name)) salida.push(ruta)
  }
  return salida
}

describe('las claves de i18n citadas en el codigo', () => {
  it('existen todas en el diccionario', () => {
    const archivos = fuentes(SRC)
    expect(archivos.length).toBeGreaterThan(5) // guarda: un barrido vacio pasaria sin mirar nada

    const rotas = []
    for (const ruta of archivos) {
      const src = readFileSync(ruta, 'utf8')
      for (const m of src.matchAll(/\bt\(\s*'([a-zA-Z][\w.]*)'/g)) {
        // Una clave que termina en punto se arma por concatenacion (`t('locale.short.' + code)`): se
        // comprueba que el PREFIJO exista y sea un nodo, que es lo unico verificable sin ejecutar.
        const clave = m[1]
        const objetivo = clave.endsWith('.') ? clave.slice(0, -1) : clave
        const valor = objetivo.split('.').reduce((n, p) => (n == null ? undefined : n[p]), messages.es)
        const bien = clave.endsWith('.') ? valor != null && typeof valor === 'object' : typeof valor === 'string'
        if (!bien) rotas.push(`${ruta.slice(SRC.length + 1)} -> ${clave}`)
      }
    }

    expect(rotas).toEqual([])
  })
})
