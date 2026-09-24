import { readFileSync, readdirSync, statSync } from 'node:fs'
import path from 'node:path'
import { compile } from 'tailwindcss'

// Detector de clases MUERTAS: las que se escriben en un className y no generan ni una linea de CSS.
//
// Es la falla silenciosa mas facil de cometer, porque el vocabulario invita: hay un TONO 'danger'
// (.ui-badge[data-tone='danger'], .ui-btn-danger) pero NO hay token de color `danger`.
// Escribir `text-danger` compila, pasa el lint y se ve casi bien -el texto sale del color heredado en
// vez del rojo-, asi que nadie lo nota hasta que un mensaje de error se lee como texto normal.
//
// El oraculo es el propio Tailwind: se compila `src/index.css` con los candidatos y se mira cuales no
// dejaron selector. Asi el detector no mantiene ninguna lista de nombres validos, y sigue siendo
// correcto cuando alguien agregue, renombre o quite un token.

const RAIZ = path.resolve(import.meta.dirname, '..')

// Un token con interpolacion o mayusculas no es una clase literal: lo arma el codigo en tiempo de
// ejecucion y Tailwind no puede opinar sobre el.
const LITERAL = /^[a-z0-9[\]:/._-]+$/

// Solo se revisan las utilidades que toman un COLOR, que es donde vive el fallo que este archivo caza:
// el nombre de un token que no existe compila igual y pinta el color heredado. Fuera de esta lista hay
// clases legitimas que Tailwind no conoce -las .ui-* de la capa components, o las de una hoja propia- y
// acusarlas llenaria el detector de ruido hasta que alguien lo apague.
const UTILIDADES_DE_COLOR =
  /^(?:[a-z-]+:)*(?:text|bg|border|ring|divide|fill|stroke|outline|decoration|accent|caret|placeholder|from|via|to|shadow)-/

// El valor de cada className, sea "..." o {expresion}. Las llaves se cuentan balanceadas: con un
// [^}]* la expresion se cortaria en el primer `${...}` y las clases de despues no se revisarian.
function expresionesDeClassName(fuente) {
  const valores = []
  const marca = /className=/g
  let encontrado
  while ((encontrado = marca.exec(fuente)) !== null) {
    let i = encontrado.index + encontrado[0].length
    if (fuente[i] === '"' || fuente[i] === "'") {
      const cierre = fuente.indexOf(fuente[i], i + 1)
      if (cierre > i) valores.push(fuente.slice(i + 1, cierre))
      continue
    }
    if (fuente[i] !== '{') continue
    let profundidad = 0
    const inicio = i
    for (; i < fuente.length; i += 1) {
      if (fuente[i] === '{') profundidad += 1
      else if (fuente[i] === '}') {
        profundidad -= 1
        if (profundidad === 0) break
      }
    }
    valores.push(fuente.slice(inicio + 1, i))
  }
  return valores
}

function archivosFuente(dir, acc = []) {
  for (const entrada of readdirSync(dir)) {
    const ruta = path.join(dir, entrada)
    if (statSync(ruta).isDirectory()) archivosFuente(ruta, acc)
    else if (/\.jsx?$/.test(entrada) && !/\.test\.jsx?$/.test(entrada)) acc.push(ruta)
  }
  return acc
}

/** Todos los tokens literales que aparecen dentro de un className, con el archivo donde se escribieron. */
export function clasesUsadas() {
  const porClase = new Map()
  for (const archivo of archivosFuente(RAIZ)) {
    const fuente = readFileSync(archivo, 'utf8')
    for (const expresion of expresionesDeClassName(fuente)) {
      // De la expresion solo interesan sus literales: lo interpolado lo arma el codigo en ejecucion.
      for (const trozo of expresion.split(/['"`]/)) {
        for (const token of trozo.split(/\s+/)) {
          if (!token || !LITERAL.test(token)) continue
          if (!UTILIDADES_DE_COLOR.test(token)) continue
          if (!porClase.has(token)) porClase.set(token, new Set())
          porClase.get(token).add(path.relative(RAIZ, archivo))
        }
      }
    }
  }
  return porClase
}

/** Compila index.css con todos los candidatos y devuelve los que no produjeron selector. */
export async function clasesSinCss(clases) {
  // Se materializa ANTES de compilar: si `clases` llega como iterador (Map.keys()), gastarlo en la
  // compilacion deja el filtro de abajo sobre una secuencia vacia y el detector reporta "cero
  // muertas" siempre. Es exactamente la falla silenciosa que este archivo existe para cazar.
  const candidatos = [...clases]
  const compilador = await compile(readFileSync(path.join(RAIZ, 'index.css'), 'utf8'), {
    base: path.resolve(RAIZ, '..'),
    loadStylesheet: async (id, base) => {
      const archivo = id.startsWith('tailwindcss')
        ? path.resolve(RAIZ, '..', 'node_modules', id.endsWith('.css') ? id : `${id}/index.css`)
        : path.resolve(base, id)
      return { path: archivo, base: path.dirname(archivo), content: readFileSync(archivo, 'utf8') }
    },
  })
  const css = compilador.build(candidatos)
  // Tailwind escapa los caracteres que no son validos en un selector.
  const escapar = (clase) => clase.replace(/([/.:[\]@])/g, '\\$1')
  return candidatos.filter((clase) => !css.includes(`.${escapar(clase)}`))
}
