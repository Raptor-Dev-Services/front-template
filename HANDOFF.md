# HANDOFF - front-template

Estado actual para retomar en otra maquina o sesion. Se reescribe al cerrar cada sesion (skill `/handoff`).

## Estado al 2026-09-24

- Rama `main`, sin push: los commits del port del armazon estan solo en local.
- Puertas: `npm run lint` limpio, `npm run build` ok, `npm test` en verde.
- Verificado a mano: el front corriendo en 5179 contra un mock de la API en 5060 (login, paginacion,
  baja, tema, idioma, logout) y la imagen Docker (healthy, cabeceras, CSP sin violaciones en Edge).

## Pendiente

- Probar contra el `back-template` real cuando exponga `/api/auth/logout`, claims `permission` y la
  API en 5060. Ver `BOARD.md`.

## Decisiones que no se rediscuten

- JavaScript, no TypeScript.
- Paleta neutra (zinc): la marca la pone cada producto en `src/index.css`.
- Tokens en localStorage/sessionStorage segun "recordarme" (no cookie httpOnly): es el contrato actual
  del back-template.
- Sin cliente de tiempo real: se agrega cuando exista un canal que consumir (`docs/Patterns.md`).

## Como arrancar

```bash
npm install
npm run dev          # http://localhost:5179
```
