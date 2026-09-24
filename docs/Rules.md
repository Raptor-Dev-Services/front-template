# Reglas del proyecto

Las leyes que no se negocian. El detalle de cada una esta en `Architecture.md`, `Patterns.md`,
`Components.md` y `DesignSystem.md`; las reglas completas del catalogo se instalan con `/catalogo install`.

## Arquitectura

1. **Por feature.** `src/pages/*` son adaptadores de una linea; la logica vive en
   `src/features/<f>/` (`<Name>Page.jsx`, `hooks/`, `components/`, `utils/`).
2. **Un solo cliente HTTP.** Todo pasa por `http` de `src/api/client.js`, en un servicio de `src/api/`.
   Nada de `fetch` ni axios suelto en componentes.
3. **Envelope por helpers.** `resolveApiEnvelope` para leer, `extractApiErrorMessage` para mostrar. El
   mensaje del backend se muestra tal cual; el front no lo reescribe.
4. **Solo `env.js` lee `import.meta.env`.** Ninguna URL hardcodeada. Ningun secreto en una `VITE_*`.
5. **El tenant y la autorizacion son del backend.** El front no envia `tenant_id` ni confia en su propio
   gateo: ocultar una opcion es UX.

## Estados y datos

6. **Cuatro estados en toda vista de datos**: carga, error (con reintento), vacio y exito. Nunca una
   pantalla en blanco.
7. **Paginacion y filtros en el servidor**; el total es el del servidor. Filtrar en el cliente solo sobre
   un conjunto que se tiene COMPLETO (`fetchAllPages`).
8. **Cancelar lo obsoleto.** `useAbortableLoad` + `isAbortError`: una cancelacion no es un error.
9. **La URL guarda lo compartible** (pagina, filtros, pestana), validado y sin escribir el default.

## UI

10. **Tokens, no magic values.** Utilidades semanticas y primitivas de `src/ui`; nada de hex ni paletas
    de Tailwind en un componente. El tema oscuro no se escribe por pantalla.
11. **Layout primero.** Sin cajas alrededor de zonas; borde y sombra solo para lo que flota.
12. **Primitivas antes que markup nuevo.** Un solo modal (`AppModal`), un solo toast (`AppNotification`).
13. **i18n sin excepcion.** Cero texto visible hardcodeado; claves en `es` y `en` a la vez.

## Accesibilidad (WCAG 2.1 AA)

14. Etiqueta atada a cada campo (`id` + `htmlFor`), errores por `aria-describedby`, `role="alert"` en los
    errores y `role="status"` en los avisos.
15. Operable por teclado, foco visible (global), boton-icono con nombre (`IconButton label`).
16. Contraste AA (lo prueba `contrasteDeTokens.test.js`); el estado nunca solo por color.
17. Enlace de salto a `#main-content` en cada layout; `prefers-reduced-motion` respetado.

## Calidad

18. `npm run lint`, `npm run build` y `npm test` en verde antes de cada commit. Las pruebas van junto al
    codigo (`*.test.js(x)`).
19. No se instala una libreria sin consultarlo, y nunca una version prerelease o flotante
    (`dependencias-estables.yml`).
20. Conventional Commits. Tags y push solo a peticion.

## Anti-patrones

- Logica en `src/pages/*`; HTTP en un componente.
- `setState` sincronico dentro de un `useEffect` (el lint lo marca como error): deriva el valor o ajusta
  el estado durante el render comparando con el valor anterior, como `useFormState`.
- Mostrar `error.message` de axios al usuario (sale en ingles): usa `extractApiErrorMessage`.
- Guardar en el estado lo que se puede calcular; duplicar en `useState` lo que ya esta en la URL.
- Copiar un ejemplo de Tailwind Plus sin re-tokenizar ni traducir (ver `TailwindPlus.md`).
