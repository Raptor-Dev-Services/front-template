// messages.js - registro de diccionarios de i18n. Cero texto visible hardcodeado en componentes.
//
// Cada idioma es su propio modulo y este registro decide cual se carga:
//
//  - El idioma por defecto va ESTATICO y no puede ser perezoso: es el fallback de `translateMessage`,
//    que resuelve contra el cuando una clave falta en el idioma activo. Si no estuviera cargado, una
//    clave incompleta se pintaria cruda en pantalla.
//  - Cualquier otro se carga con `loadLocaleMessages` ANTES de montar la app (main.jsx) y antes de
//    conmutar de idioma (I18nProvider). `translateMessage` es sincrona y la consumen modulos que no son
//    componentes (src/api/client.js): para cuando alguien traduce, el diccionario ya tiene que estar.
//
// Regla que no cambia: mismo set de claves en todos los idiomas, nunca a medias (paridadDeIdiomas.test).

import { es } from './messages.es.js'
import { DEFAULT_LOCALE, SUPPORTED_LOCALES } from './locales.js'

export { DEFAULT_LOCALE, SUPPORTED_LOCALES }

/** Diccionarios ya disponibles. Se muta al cargar un idioma; `translateMessage` lee de aqui. */
export const messages = { [DEFAULT_LOCALE]: es }

// Un cargador por idioma perezoso. Se listan uno a uno, en vez de un import con plantilla
// (`./messages.${locale}.js`), porque la plantilla tambien casa con el idioma por defecto y el bundler
// avisa de que ese modulo es a la vez estatico y dinamico. Agregar un idioma es agregar su linea aqui.
const LAZY_LOADERS = {
  en: () => import('./messages.en.js'),
}

/** Carga el diccionario de un idioma si aun no esta. Idempotente y segura de llamar en paralelo. */
export async function loadLocaleMessages(locale) {
  if (!SUPPORTED_LOCALES.includes(locale) || messages[locale]) return
  const load = LAZY_LOADERS[locale]
  if (!load) return
  messages[locale] = (await load()).default
}

export default messages
