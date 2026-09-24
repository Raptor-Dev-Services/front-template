# HANDOFF - front-template

Estado actual para retomar en otra maquina o sesion. Se reescribe al cerrar cada sesion (skill `/handoff`).

## Estado al 2026-09-24

- Rama `main`, **empujada** (el usuario lo autorizo al cierre), arbol limpio, sin otras ramas.
- Puertas, remedidas el 2026-09-24 sobre `e72f634`: `npm run lint` limpio, `npm run build` ok,
  `npm test` **219 pruebas en 27 archivos**, en verde. El CI de `main` tambien en verde.
- Dependabot quedo activo: su primer PR (`actions/checkout` y `actions/setup-node` a v7) se mergeo
  en `e72f634`.
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
