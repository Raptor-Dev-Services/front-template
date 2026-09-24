# BOARD - front-template

Tablero Scrumban. Pull, no push: se jala de **Listo** cuando hay capacidad. WIP: En curso = 2, Revision = 2.
Cada tarjeta dice que se hace, como se sabe que esta terminada y de donde salio.

## Listo

- **Fijar las acciones de CI por SHA.** Hoy van por etiqueta mayor (`@v4`), que es mutable.
  Hecho cuando: `ci.yml` y `dependencias-estables.yml` referencian commits, con la version en comentario.
- **Alinear los nombres de permisos con el back-template.** `src/auth/permissions.js` asume `users.read`
  y `users.manage`. Hecho cuando: coinciden con el catalogo de permisos que emita la API y el modulo
  `users` se ve con una sesion real.

## En curso

## Revision

## Hecho

- 2026-09-24 Armazon generico portado desde un cliente web en produccion (ver `CHANGELOG.md`).
