import { useCallback, useEffect, useMemo, useState } from 'react'
import { I18nContext } from './I18nContext.js'
import { SUPPORTED_LOCALES, loadLocaleMessages } from './messages.js'
import { readStoredLocale, persistLocale } from './locale.js'
import { translateMessage } from './translate.js'
import { DEFAULT_CURRENCY } from './currency.js'

// Construir un Intl.*Format cuesta del orden de cien veces mas que formatear con uno ya construido, y
// formatCurrency/formatDate se llaman por fila de tabla. Por eso el formateador se cachea por
// locale + opciones a nivel de modulo; el useCallback de abajo solo estabiliza la identidad de la
// funcion, no la del formateador que construye por dentro.
const numberFormatters = new Map()
const dateFormatters = new Map()

function cachedFormatter(cache, Ctor, locale, options) {
  const key = `${locale}|${JSON.stringify(options)}`
  let formatter = cache.get(key)
  if (!formatter) {
    formatter = new Ctor(locale, options)
    cache.set(key, formatter)
  }
  return formatter
}

export function I18nProvider({ children }) {
  const [locale, setLocaleState] = useState(readStoredLocale)

  // <html lang> sigue al idioma activo: lo usan los lectores de pantalla para elegir voz.
  useEffect(() => {
    document.documentElement.setAttribute('lang', locale)
  }, [locale])

  // Carga el diccionario ANTES de conmutar, y persiste ANTES de cambiar el estado. `translateMessage`
  // lee el idioma persistido para traducir fuera de React, y esperar a un efecto lo dejaria un turno
  // atrasado; conmutar antes de que llegue el diccionario pintaria un render con claves crudas. Si la
  // descarga falla (red caida), no se conmuta: mejor seguir en el idioma actual.
  const setLocale = useCallback(async (next) => {
    if (!SUPPORTED_LOCALES.includes(next)) return
    await loadLocaleMessages(next)
    persistLocale(next)
    setLocaleState(next)
  }, [])

  // t(key, vars): idioma activo -> idioma por defecto -> la clave cruda (nunca vacio).
  const t = useCallback((key, vars) => translateMessage(key, vars, locale), [locale])

  const formatCurrency = useCallback(
    (amount, currency = DEFAULT_CURRENCY) =>
      cachedFormatter(numberFormatters, Intl.NumberFormat, locale, { style: 'currency', currency }).format(amount),
    [locale],
  )

  // Las fechas llegan del backend en UTC (ISO 8601); esta es la unica capa que las pasa a hora local.
  // Un valor vacio o invalido devuelve '' en vez de lanzar RangeError en medio de una tabla.
  const formatDate = useCallback(
    (value, options = { dateStyle: 'medium' }) => {
      if (value === null || value === undefined || value === '') return ''
      const date = value instanceof Date ? value : new Date(value)
      if (Number.isNaN(date.getTime())) return ''
      return cachedFormatter(dateFormatters, Intl.DateTimeFormat, locale, options).format(date)
    },
    [locale],
  )

  const value = useMemo(
    () => ({ t, locale, setLocale, locales: SUPPORTED_LOCALES, formatCurrency, formatDate }),
    [t, locale, setLocale, formatCurrency, formatDate],
  )

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
}

export default I18nProvider
