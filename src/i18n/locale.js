// locale.js - unica fuente de verdad del idioma activo.
//
// Lo consumen dos capas que no se conocen entre si: el I18nProvider (que lo sube a estado de React) y
// translateMessage (resolucion pura, fuera de React, para modulos como src/api/client.js). Al vivir la
// lectura y la escritura en un solo modulo, las dos capas ven siempre el mismo idioma: el provider
// persiste aqui en el mismo turno en que cambia su estado, asi que una traduccion hecha fuera de React
// nunca se queda con el idioma anterior.

import { SUPPORTED_LOCALES, DEFAULT_LOCALE } from './locales.js'
import { env } from '../config/env.js'

/** Clave de almacenamiento. Renombrala con el prefijo de tu producto al usar la plantilla. */
export const LOCALE_STORAGE_KEY = 'app_locale'

/** Idioma activo: preferencia guardada -> configuracion de entorno -> idioma por defecto. */
export function readStoredLocale() {
  try {
    const stored = window.localStorage.getItem(LOCALE_STORAGE_KEY)
    if (stored && SUPPORTED_LOCALES.includes(stored)) return stored
  } catch {
    // localStorage no disponible (modo privado): se cae a la configuracion de entorno.
  }
  return SUPPORTED_LOCALES.includes(env.defaultLocale) ? env.defaultLocale : DEFAULT_LOCALE
}

/** Persiste el idioma elegido. Ignora en silencio un locale no soportado. */
export function persistLocale(locale) {
  if (!SUPPORTED_LOCALES.includes(locale)) return
  try {
    window.localStorage.setItem(LOCALE_STORAGE_KEY, locale)
  } catch {
    // no-op
  }
}
