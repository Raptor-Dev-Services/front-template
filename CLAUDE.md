# CLAUDE.md - front-template

Instrucciones para Claude Code al trabajar en **front-template**: la plantilla de cliente web de Raptor
Dev Services, companera del `back-template`. Es el armazon desde el que arranca el front de un producto
nuevo: se copia, se renombra y se le agregan modulos. Por eso todo aqui es **generico**: nada de marca,
nada de dominio de un cliente.

## Contexto de trabajo

- Stack: React 19 + Vite 8 + Tailwind CSS 4 + React Router 7 + axios + Headless UI + Heroicons, en
  **JavaScript** (no TypeScript).
- Dev: `http://localhost:5179` (Vite, `strictPort`). 5173-5178 son de otros productos de la maquina.
- API en dev: `http://localhost:5060` (`back-template`), por el proxy de Vite (`/api`).
- Contrato con el backend: envelope `{ isSuccess | success, data, message, errors, utcTimeStamp }`
  (camelCase o PascalCase), JWT con claims `sub`, `email`, `role`, `permission` (arreglo) y `tenant_id`;
  endpoints `/api/v1/auth/login` (+ `/login/2fa`), `/api/v1/auth/refresh`, `/api/v1/auth/logout`,
  `/api/v1/account/me` y `/account/2fa/*`, `/api/v1/users` (paginado).
- Referencia UI: `docs/Tailwind Plus/` se **consulta**, no se copia (ver `docs/TailwindPlus.md`).

## Configuracion de Claude Code

`.claude/` se versiona, pero el catalogo NO viene instalado: en un repo nuevo, corre **`/catalogo
install`** para traer agentes, skills y reglas segun el stack (frontend + i18n). `.claude/launch.json`
define el servidor de desarrollo para las herramientas de preview.

## Estructura

```
src/
  main.jsx, App.jsx        arranque y composition root (ErrorBoundary > Theme > I18n > Router)
  routes/                  AppRoutes, guards (RequireAuth, RequirePermission), lazyRoute
  layouts/                 AppLayout (panel), PublicLayout (login, 404), navItems
  pages/                   adaptadores de ruta de UNA linea
  features/<f>/            <Name>Page.jsx + hooks/ + components/ + utils/
  features/shared/hooks/   useFormState, useAbortableLoad, useDebouncedValue, useOnVisible, useCsvExport
  api/                     client.js (instancia unica + envelope + refresh), paging, servicios
  auth/                    session.js (tokens + claims), jwt.js, permissions.js
  i18n/                    provider, translate pura, diccionarios es/en
  ui/                      primitivas accesibles + theme/
  styles/                  tokens.js, designSystem.js (cx), pruebas de tokens
  utils/                   csv, url, loadStatus, chunkRecovery
  config/env.js            UNICO lector de import.meta.env
vite/csp.js                CSP inyectada en el build
```

Detalle: `docs/Architecture.md`. Como agregar un modulo: `docs/Patterns.md` (el modulo `users` es la
referencia viva: **abrelo antes de escribir uno nuevo**).

## Comandos

```bash
npm install
npm run dev            # http://localhost:5179 (lee .env.dev)
npm run build          # dist/ (inyecta la CSP)
npm run build:staging
npm run preview        # http://localhost:4179
npm run lint
npm test               # vitest run
npm run test:watch
python scripts/check-prerelease-deps.py   # puerta de dependencias estables (en Windows, python)
```

Antes de cada commit: `npm run lint`, `npm run build` y `npm test` en verde.

## Leyes no negociables

1. **Arquitectura por feature.** `pages/*` solo re-exportan; la logica vive en `features/<f>/`. HTTP solo
   en servicios de `src/api/` sobre el cliente central.
2. **Envelope por helpers.** `resolveApiEnvelope` y `extractApiErrorMessage`. El mensaje del backend se
   muestra tal cual; el texto de axios nunca llega al usuario.
3. **i18n sin excepcion.** Cero texto visible hardcodeado; claves en `es` y `en` a la vez (lo vigilan
   `paridadDeIdiomas.test.js` y `clavesCitadas.test.js`). Fechas UTC a hora local solo con `formatDate`.
4. **Cuatro estados** en toda vista de datos: carga, error con reintento, vacio y exito.
5. **Paginacion y filtros en el servidor**; lo compartible (pagina, filtros) en la URL.
6. **Tokens, no magic values.** Utilidades semanticas (`bg-surface`, `text-content`, `text-muted`,
   `border-border`, `bg-primary`) y clases `.ui-*`. Paleta neutra: la marca de un producto se cambia en
   `src/index.css`. El tema oscuro no se escribe por pantalla.
7. **Layout primero:** la pantalla no flota y adentro no hay cajas; borde y sombra solo para lo que flota.
8. **Accesibilidad WCAG 2.1 AA:** etiquetas atadas, foco visible, teclado, contraste (probado), estado no
   solo por color, `role="alert"`/`"status"`, enlace de salto.
9. **Seguridad:** ningun secreto en `VITE_*`; el front no envia `tenant_id`; ocultar por permiso es UX,
   el backend autoriza.
10. **Commits:** Conventional Commits en espanol, con los trailers de atribucion. Tags y push solo a
    peticion.

Lista completa: `docs/Rules.md`.

## Que NO hacer

- Logica en `src/pages/*`, o `fetch`/axios suelto en un componente.
- Texto visible sin i18n, o una clave solo en un idioma.
- Un color literal (`#hex`, `slate-*`, `indigo-*`) o un `dark:` en una pantalla.
- `setState` sincronico en un `useEffect` (el lint lo marca como error).
- Otro modal que no sea `AppModal`, otro toast que no sea `AppNotification`.
- Copiar un ejemplo de Tailwind Plus sin re-tokenizar, traducir y quitar sus cajas.
- Instalar un paquete sin consultarlo, o uno prerelease/flotante.
- Hardcodear el nombre del producto: sale de `app.name` en i18n y de `VITE_APP_TITLE`.

## Al usar la plantilla para un producto

Renombra: `name` en `package.json`, `app.name` en los diccionarios, `VITE_APP_TITLE`, el prefijo `app_` de
las claves de almacenamiento (`auth/session.js`, `i18n/locale.js`, `ui/theme/themeStorage.js` y el script
de `index.html`), la escala `brand`/`primary` de `src/index.css`, el favicon y los nombres de
`auth/permissions.js` para que coincidan con el catalogo del backend. Documenta las decisiones en
`HANDOFF.md` y el tablero en `BOARD.md`.
