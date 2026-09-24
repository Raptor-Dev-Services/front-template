# AGENTS.md - front-template

Espejo portable de [`CLAUDE.md`](CLAUDE.md), para agentes que no leen ese archivo. Si difieren, manda
`CLAUDE.md`.

- **Que es:** la plantilla de cliente web generica de Raptor Dev Services, companera del `back-template`.
- **Stack:** React 19 + Vite 8 + Tailwind CSS 4 + React Router 7 + axios + Headless UI + Heroicons, en
  JavaScript.
- **Dev:** `npm run dev` en `http://localhost:5179`; `/api` se reenvia a `http://localhost:5060`.
- **Puertas:** `npm run lint`, `npm run build` y `npm test` en verde antes de cada commit.
- **Documentacion:** `docs/Architecture.md`, `docs/Patterns.md` (como agregar un modulo),
  `docs/Components.md`, `docs/DesignSystem.md`, `docs/Environment.md`, `docs/Rules.md`.
- **Catalogo de agentes/skills/reglas:** no viene instalado; se instala con `/catalogo install`.

## Leyes no negociables (resumen)

1. Arquitectura por feature: `pages/*` solo re-exportan; logica en `features/<f>/`; HTTP en `src/api`.
2. Envelope via `resolveApiEnvelope` / `extractApiErrorMessage`.
3. i18n sin hardcode, claves en `es` y `en`.
4. Cuatro estados en toda vista de datos; paginacion en el servidor; lo compartible en la URL.
5. Tokens y primitivas de `src/ui`, sin magic values; layout sin cajas de mas.
6. Accesibilidad WCAG 2.1 AA.
7. Cero secretos en `VITE_*`; el backend autoriza y resuelve el tenant.
8. Conventional Commits en espanol con trailers de atribucion; tags y push solo a peticion.
