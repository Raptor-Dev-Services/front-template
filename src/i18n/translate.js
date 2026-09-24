// translate.js - resolucion PURA de claves i18n, sin React.
//
// El `t` del I18nProvider y los modulos que no son componentes (src/api/client.js, ErrorBoundary)
// comparten esta misma funcion, asi que una clave se traduce igual desde cualquier capa.
//
// Contrato clave: si el texto recibido NO es una clave conocida se devuelve TAL CUAL. Eso es lo que
// permite pasar por aqui un mensaje del backend sin tocarlo (ya viene listo para el usuario) y a la
// vez traducir los textos que genera el propio cliente.

import { messages } from './messages.js'
import { DEFAULT_LOCALE } from './locales.js'
import { readStoredLocale } from './locale.js'

/** Resuelve una key "a.b.c" contra un diccionario; undefined si falta o si apunta a un nodo. */
function resolvePath(dict, key) {
  const value = key.split('.').reduce((acc, part) => {
    if (acc && typeof acc === 'object' && part in acc) return acc[part]
    return undefined
  }, dict)
  return typeof value === 'string' ? value : undefined
}

/** Reemplaza {var} por su valor. Nunca concatenacion en los componentes. */
function interpolate(template, vars) {
  if (!vars) return template
  return template.replace(/\{(\w+)\}/g, (match, name) => (name in vars ? String(vars[name]) : match))
}

/**
 * Traduce una clave: idioma pedido -> idioma por defecto -> la propia entrada sin cambios.
 * Sin `locale` explicito usa el idioma persistido (ver locale.js).
 */
export function translateMessage(key, vars, locale = readStoredLocale()) {
  if (typeof key !== 'string') return key
  const active = resolvePath(messages[locale], key)
  if (active !== undefined) return interpolate(active, vars)
  const fallback = resolvePath(messages[DEFAULT_LOCALE], key)
  if (fallback !== undefined) return interpolate(fallback, vars)
  return key
}

export default translateMessage
