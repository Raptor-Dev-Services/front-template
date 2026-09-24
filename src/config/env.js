// env.js - UNICA capa que lee `import.meta.env.VITE_*`. Ningun otro modulo hardcodea URLs ni lee
// variables de entorno directamente.
//
// Toda variable VITE_* es PUBLICA: Vite la hornea en el bundle en tiempo de build y cualquiera puede
// leerla desde las DevTools del navegador. Aqui nunca va una llave privada, un secreto de firma ni una
// credencial; eso vive solo en el backend.

/**
 * Lee `key` de `source` y cae a `fallback` si falta O si viene vacia. Tratar la cadena vacia como
 * ausente es a proposito: un `VITE_X=` en un .env produce '' y no undefined, y sin esto el fallback
 * no aplicaria nunca. Exportada para poder probarla sin depender de `import.meta.env`.
 */
export function readVar(source, key, fallback = '') {
  const value = source?.[key]
  return value === undefined || value === null || value === '' ? fallback : value
}

const source = import.meta.env

export const env = {
  /** Titulo de la app (tambien lo usa index.html via %VITE_APP_TITLE%). */
  appTitle: readVar(source, 'VITE_APP_TITLE', 'front-template'),
  /**
   * ORIGEN de la API, SIN el prefijo `/api`: los servicios de src/api ya piden '/api/...'.
   * Vacio (el default) significa "mismo origen": en desarrollo lo atiende el proxy de Vite.
   * Ejemplo en produccion: https://api.example.com
   */
  apiBaseUrl: readVar(source, 'VITE_API_BASE_URL', ''),
  /** Idioma de arranque (es | en). La eleccion guardada del usuario manda sobre esto. */
  defaultLocale: readVar(source, 'VITE_DEFAULT_LOCALE', 'es'),
  /** Version mostrada en la UI (la estampa el pipeline de build). */
  softwareVersion: readVar(source, 'VITE_SOFTWARE_VERSION', 'dev-local'),
  /** True en el build de produccion. */
  isProduction: source.PROD === true,
}

export default env
