# BOARD - front-template

Tablero Scrumban. Pull, no push: se jala de **Listo** cuando hay capacidad. WIP: En curso = 2, Revision = 2.
Cada tarjeta dice que se hace, como se sabe que esta terminada y de donde salio.

## Listo

- **Fijar las acciones de CI por SHA.** Hoy van por etiqueta mayor (`@v4`), que es mutable.
  Hecho cuando: `ci.yml` y `dependencias-estables.yml` referencian commits, con la version en comentario.
- **Pantalla de segundo factor (TOTP).** El back-template responde al login con `twoFactorRequired` y un
  `challengeToken` que se canjea en `POST /api/v1/auth/login/2fa`. Hoy el front corta con un mensaje
  (`auth.errors.twoFactorUnsupported`). Hecho cuando: el login pide el codigo, lo canjea y guarda la sesion,
  con prueba del flujo; y existe la pantalla de alta/baja de 2FA en la cuenta.

## En curso

## Revision

## Hecho

- 2026-09-24 Rutas `/api/v1` y nombres de permisos alineados con el back-template, verificado contra la API
  real por el proxy de Vite (login, listado, edicion, refresh, logout).
- 2026-09-24 Armazon generico portado desde un cliente web en produccion (ver `CHANGELOG.md`).
