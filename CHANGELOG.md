# Changelog

Formato: [Keep a Changelog](https://keepachangelog.com/es-ES/1.1.0/). Versionado: SemVer.

## [Unreleased]

## [0.2.0] - 2026-09-24

Armazon generico portado desde un cliente web en produccion. Rompe con la 0.1: cambian la estructura,
el cliente HTTP, la sesion y el design system.

### Agregado
- Verificacion en dos pasos: el login pide el codigo de la app autenticadora (o uno de recuperacion) cuando la
  cuenta la tiene activa, y la pantalla **Mi cuenta** (`/account`) permite activarla y apagarla. Los codigos
  de recuperacion se muestran una sola vez, con copiar y descargar.
- ESLint flat config y Vitest con pruebas junto al codigo.
- Capa i18n es/en con carga diferida, traduccion pura y pruebas de paridad y de claves citadas.
- Tokens neutros con tema claro/oscuro sin parpadeo y pruebas de contraste AA y de clases muertas.
- Primitivas accesibles en `src/ui`, `ErrorBoundary` en dos niveles, pantalla de error y 404.
- Cliente HTTP central con refresh deduplicado, errores clasificados y `isAbortError`; `fetchAllPages`.
- Sesion con claims (roles, permisos), decodificador UTF-8 y guardas `RequireAuth`/`RequirePermission`.
- Recarga unica ante chunks viejos tras un despliegue.
- Modulo de ejemplo `users` reconstruido: paginacion en servidor con la pagina en la URL, edicion, baja
  con confirmacion, exportacion CSV.
- CI (lint, build, test, audit, gitleaks), puerta de dependencias estables, CSP en el build, Dockerfile
  y nginx endurecidos.

### Cambiado
- El refresh y el logout mandan solo `refreshToken`; las acciones de CI van fijadas por SHA, con Dependabot.
- Dev server en 5179 con `strictPort` y proxy de `/api` a `localhost:5060`.
- `npm run dev` corre con `--mode dev` (antes `.env.dev` no lo leia nadie mas que compose).
- Dependencias a versiones estables actuales (React 19.3, Vite 8.3, Tailwind 4.3, axios 1.20).

### Eliminado
- `styled-components`, `xlsx`, `xlsx-populate`, `@dnd-kit/*`, `@microsoft/signalr` (sin uso).
- `src/components/*` y el objeto `ui` de la v1.

### Corregido
- Todas las llamadas salian a `/api/api/...`.
- `npm run lint` fallaba (no habia configuracion).
- Claims con acentos salian con mojibake.
- Etiquetas del login sin asociar a sus campos.
- Tailwind compilaba la libreria de referencia entera en el CSS (684 kB -> 40 kB).
- Las cabeceras de seguridad de nginx no llegaban a `/assets` ni a `index.html`.

## [0.1.0]

Version inicial de la plantilla.
