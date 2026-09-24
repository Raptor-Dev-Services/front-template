// locales.js - los idiomas soportados, sin arrastrar ningun diccionario.
//
// Vive aparte de messages.js a proposito: locale.js solo necesita saber QUE idiomas existen para
// validar la preferencia guardada, y si lo pidiera al modulo de diccionarios se llevaria por delante
// el diccionario entero al chunk principal.

export const SUPPORTED_LOCALES = ['es', 'en']
export const DEFAULT_LOCALE = 'es'
