# BOARD - front-template

Tablero Scrumban. Pull, no push: se jala de **Listo** cuando hay capacidad. WIP: En curso = 2, Revision = 2.
Cada tarjeta dice que se hace, como se sabe que esta terminada y de donde salio.

## Listo

- **QR del secreto TOTP en "Mi cuenta"** (opcional). Hoy se muestra la clave agrupada y un enlace `otpauth://`
  (que en el telefono abre la app autenticadora). Un QR necesita una dependencia (`qrcode.react` o similar), y
  agregar un paquete se consulta. Hecho cuando: el QR se pinta desde `otpauthUri`, con la clave como respaldo.

## En curso

## Revision

## Hecho

- 2026-09-24 Login en dos pasos con segundo factor (codigo TOTP o de recuperacion) y pantalla "Mi cuenta"
  para activarlo (secreto, confirmacion, codigos de recuperacion una sola vez) y apagarlo con un codigo.
  Verificado contra el back-template real por el proxy de Vite.
- 2026-09-24 Acciones de CI fijadas por SHA, con Dependabot.
- 2026-09-24 El refresh y el logout mandan solo `refreshToken` (el contrato del back-template ya esta fijado).

- 2026-09-24 Rutas `/api/v1` y nombres de permisos alineados con el back-template, verificado contra la API
  real por el proxy de Vite (login, listado, edicion, refresh, logout).
- 2026-09-24 Armazon generico portado desde un cliente web en produccion (ver `CHANGELOG.md`).
