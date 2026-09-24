# front-template

Plantilla de cliente web de Raptor Dev Services: el armazon con el que arranca el front de un producto,
listo para hablar con el [`back-template`](../back-template).

**Stack:** React 19, Vite 8, Tailwind CSS 4, React Router 7, axios, Headless UI, Heroicons. JavaScript.

## Que trae

- **Cliente HTTP central** con envelope camelCase/PascalCase, refresh de sesion deduplicado ante 401,
  errores clasificados y traducidos (nunca el ingles de axios) y cancelacion de peticiones obsoletas.
- **Sesion** con "recordarme" (localStorage o sessionStorage), claims del JWT (roles y permisos) y
  decodificador UTF-8.
- **Guardas de ruta** por sesion y por permiso, y menu filtrado por el mismo permiso.
- **i18n es/en** con carga diferida del idioma, pruebas de paridad y de claves citadas.
- **Tema claro/oscuro** sin parpadeo, con tokens neutros y contraste AA probado en los dos temas.
- **Primitivas accesibles** (botones, campos, modal con foco atrapado, menu de acciones, paginacion,
  estados de datos, toast) y limites de error en dos niveles con pantalla de error y 404.
- **Modulo de ejemplo `users`**: listado paginado en el servidor con la pagina en la URL, estados de carga,
  vacio y error, edicion, baja con confirmacion y exportacion completa a CSV.
- **Despliegue**: recarga unica ante chunks viejos, CSP generada en el build, imagen Docker con nginx
  endurecido y CI con lint, build, pruebas, auditoria y escaneo de secretos.

## Inicio rapido

```bash
npm install
npm run dev        # http://localhost:5179
```

Con el `back-template` corriendo en `http://localhost:5060`, entra por `/login`. Para apuntar a otra API,
crea `.env.dev.local` con `VITE_DEV_API_PROXY_TARGET=http://localhost:PUERTO`.

Si trabajas con Claude Code, instala el catalogo en el repo con **`/catalogo install`**.

## Scripts

| Script | Que hace |
|---|---|
| `npm run dev` | Vite en 5179 con `.env.dev` y proxy de `/api` |
| `npm run dev:host` | Igual, expuesto en la red local |
| `npm run build` | Build de produccion en `dist/` |
| `npm run build:staging` | Build con `.env.staging` |
| `npm run preview` | Sirve `dist/` en 4179 |
| `npm run lint` | ESLint (flat config) |
| `npm test` / `npm run test:watch` | Vitest |

## Estructura

```
src/
  api/        cliente HTTP y servicios        auth/      sesion, JWT, permisos
  features/   pantallas por feature           i18n/      idiomas
  layouts/    AppLayout, PublicLayout          routes/    rutas y guardas
  pages/      adaptadores de ruta              ui/        primitivas y tema
  styles/     tokens                           utils/     csv, url, chunks
  config/     env.js
```

## Documentacion

| Documento | Contenido |
|---|---|
| [`docs/Architecture.md`](docs/Architecture.md) | Estructura, flujos, cliente HTTP, sesion, rutas, errores |
| [`docs/Patterns.md`](docs/Patterns.md) | Como agregar un modulo, paso a paso |
| [`docs/Components.md`](docs/Components.md) | Primitivas de `src/ui` y cuando usar cada feedback |
| [`docs/DesignSystem.md`](docs/DesignSystem.md) | Tokens, clases `.ui-*`, tema, accesibilidad visual |
| [`docs/Environment.md`](docs/Environment.md) | Variables, puertos, Docker, CI |
| [`docs/Rules.md`](docs/Rules.md) | Reglas no negociables y anti-patrones |
| [`docs/TailwindPlus.md`](docs/TailwindPlus.md) | La libreria de referencia UI y como adaptarla |
| [`CLAUDE.md`](CLAUDE.md) | Instrucciones para Claude Code (espejo: `AGENTS.md`) |

## Usarla para un producto

Ver la seccion "Al usar la plantilla para un producto" de [`CLAUDE.md`](CLAUDE.md): nombre, marca, prefijo
de almacenamiento, permisos y favicon.
