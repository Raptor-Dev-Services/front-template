// csp.js - construye la Content-Security-Policy de la SPA y la inyecta como <meta> en el build.
//
// POR QUE UN <meta> Y NO SOLO UNA CABECERA. La cabecera es mejor (permite Report-Only y
// frame-ancestors), pero depende del hosting de cada producto. El <meta> viaja DENTRO del artefacto:
// funciona en nginx, en un bucket o en cualquier CDN sin configurar nada y sin poder olvidarse en una
// mudanza. nginx.conf agrega por cabecera lo que el <meta> no puede expresar.
//
// LO QUE UN <meta> NO PUEDE EXPRESAR (por eso no esta abajo, no por olvido):
//   - frame-ancestors: se ignora en <meta>. Contra el clickjacking va la CABECERA (nginx.conf).
//   - report-uri / report-to: se ignoran en <meta>, asi que esta politica no puede estrenarse en modo
//     advisory. La contramedida: se DERIVA de la configuracion real en vez de escribirse a mano, y el
//     build falla si un origen no se puede resolver.

import { createHash } from 'node:crypto'

/**
 * Hashes `'sha256-...'` de los <script> INLINE del HTML (los que no tienen `src`). El hash cubre el
 * contenido EXACTO: un espacio de diferencia lo invalida, por eso se calcula del HTML ya final (el
 * handler corre en `order: 'post'`) y nunca se escribe a mano.
 *
 * Los saltos de linea se normalizan a LF ANTES de hashear, porque es lo que hashea el navegador: el
 * parser de HTML convierte CRLF (y CR suelto) en LF antes de que el script exista en el DOM. En Windows,
 * con core.autocrlf, index.html sale del checkout en CRLF; sin esta linea el hash del build no coincidia
 * con el del navegador y el script del tema quedaba BLOQUEADO en produccion, en silencio.
 */
export function inlineScriptHashes(html) {
  const hashes = []
  const inlineScript = /<script(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/gi
  let match
  while ((match = inlineScript.exec(html)) !== null) {
    const body = match[1].replace(/\r\n?/g, '\n')
    if (!body.trim()) continue // <script></script> vacio: nada que ejecutar ni que permitir
    hashes.push(`'sha256-${createHash('sha256').update(body, 'utf8').digest('base64')}'`)
  }
  return hashes
}

/** Origen (esquema+host+puerto) de una URL o de un host pelado ('auth.example.com'). */
function toOrigin(value, varName) {
  const raw = value.trim()
  const withScheme = /^https?:\/\//.test(raw) ? raw : `https://${raw}`
  try {
    return new URL(withScheme).origin
  } catch {
    // Fallar en el build, no producir una politica que bloquee la API en silencio: una CSP mal armada
    // no da error, solo deja de funcionar la mitad de la app.
    throw new Error(`[csp] ${varName} no es una URL ni un host valido: ${JSON.stringify(value)}`)
  }
}

/** El mismo origen visto como WebSocket: http -> ws, https -> wss. */
function toWebSocketOrigin(origin) {
  return origin.replace(/^http/, 'ws')
}

/**
 * Arma la politica a partir de las variables de entorno ya resueltas por Vite.
 * - VITE_API_BASE_URL: origen de la API. Vacio = mismo origen, que ya cubre 'self'.
 * - VITE_AUTH_ORIGIN (opcional): proveedor de identidad externo (OIDC) que la SPA llama y embebe en un
 *   iframe para renovar en silencio. Sin el, no se permite ningun iframe.
 * @param {Record<string, string>} env variables VITE_* del build.
 * @param {string[]} scriptHashes hashes de los <script> inline del HTML final.
 */
export function buildCsp(env = {}, scriptHashes = []) {
  const apiOrigin = env.VITE_API_BASE_URL ? toOrigin(env.VITE_API_BASE_URL, 'VITE_API_BASE_URL') : null
  const authOrigin = env.VITE_AUTH_ORIGIN ? toOrigin(env.VITE_AUTH_ORIGIN, 'VITE_AUTH_ORIGIN') : null

  // connect-src: a donde puede hablar el JS. El origen ws:// va APARTE del http:// aunque sean el mismo
  // host: el navegador no da por permitido ws://x cuando la lista dice http://x, y un canal en vivo
  // (SignalR, WebSocket) se caeria despues de un negotiate que si paso.
  const connect = ["'self'"]
  if (apiOrigin) connect.push(apiOrigin, toWebSocketOrigin(apiOrigin))
  if (authOrigin) connect.push(authOrigin)

  const directives = [
    ['default-src', ["'self'"]],
    // Sin 'unsafe-inline' ni 'unsafe-eval': es la linea que de verdad contiene un XSS. Los scripts
    // inline se permiten uno por uno con su hash (hoy: el anti-parpadeo del tema en index.html).
    ['script-src', ["'self'", ...scriptHashes]],
    // 'unsafe-inline' en estilos es una concesion real: React escribe `style={{...}}` como atributo
    // (la barra de progreso). Inyectar CSS es un vector mucho mas debil que inyectar script.
    ['style-src', ["'self'", "'unsafe-inline'"]],
    // Imagenes de usuario suelen ser URLs prefirmadas de un almacenamiento cuyo host no se conoce en
    // build: `https:` en vez de una lista, que sigue prohibiendo http://.
    ['img-src', ["'self'", 'data:', 'blob:', 'https:']],
    ['font-src', ["'self'", 'data:']],
    ['connect-src', connect],
    ['frame-src', authOrigin ? [authOrigin] : ["'none'"]],
    // Nada de <object>/<embed>, y <base> no se puede reescribir para secuestrar rutas relativas.
    ['object-src', ["'none'"]],
    ['base-uri', ["'self'"]],
    ['form-action', ["'self'"]],
    ['worker-src', ["'self'", 'blob:']],
    ['manifest-src', ["'self'"]],
  ]

  const policy = directives.map(([name, values]) => `${name} ${values.join(' ')}`)

  // Solo si TODO el trafico externo declarado ya es https. Con una API en http (un staging sin TLS)
  // esto reescribiria sus llamadas a https y las tumbaria, en silencio.
  const external = connect.filter((v) => v !== "'self'")
  if (external.length > 0 && external.every((v) => v.startsWith('https://') || v.startsWith('wss://'))) {
    policy.push('upgrade-insecure-requests')
  }

  return policy.join('; ')
}

/**
 * Plugin de Vite: inyecta el <meta> de CSP en index.html. Solo en `build`: en `dev` estorbaria (el HMR
 * usa websocket y eval) y el servidor de desarrollo no es lo que se despliega.
 */
export function cspMetaTag() {
  let env = {}
  return {
    name: 'front-template-csp-meta',
    apply: 'build',
    configResolved(config) {
      env = config.env
    },
    transformIndexHtml: {
      order: 'post',
      handler(html) {
        // El <meta charset> tiene que caer en los primeros 1024 bytes o el navegador adivina la
        // codificacion; la CSP se inserta justo despues, por delante de todo <script> y <link>.
        const charset = /<meta\s+charset=[^>]*>/i.exec(html)
        if (!charset) {
          throw new Error('[csp] index.html no declara <meta charset>: no hay donde anclar la CSP')
        }
        const tag = `<meta http-equiv="Content-Security-Policy" content="${buildCsp(env, inlineScriptHashes(html))}">`
        const at = charset.index + charset[0].length
        return `${html.slice(0, at)}\n    ${tag}${html.slice(at)}`
      },
    },
  }
}
