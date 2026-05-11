# Design System

Tokens centralizados en `src/styles/designSystem.js`. **Nunca hardcodear clases Tailwind repetitivas — siempre usar los tokens.**

```js
import { ui, cx } from '../styles/designSystem'
```

---

## Paleta de colores

| Rol | Color | Hex |
|---|---|---|
| Acento principal | Naranja | `#ff6100` |
| Hover acento | Naranja claro | `#ff7b00` |
| Focus ring | Naranja claro | `#ff7b00` |
| Primario | Slate 900 | `#0f172a` |
| Fondo app | Slate 50 | `#f8fafc` |
| Borde estándar | Slate 200 | `#e2e8f0` |
| Texto principal | Slate 900 | `#0f172a` |
| Texto secundario | Slate 600 | `#475569` |
| Texto sutil | Slate 500 | `#64748b` |

---

## cx() — clases condicionales

Equivalente a `clsx`. Filtra valores falsy y une con espacio.

```js
cx('base-class', isActive && 'active-class', hasError && 'error-class')
// → 'base-class active-class'  (si isActive=true, hasError=false)

cx(ui.controls.primaryButton, 'w-full')
// → 'inline-flex min-h-11 items-center ... w-full'
```

---

## ui.layout

| Token | Clases Tailwind | Uso |
|---|---|---|
| `ui.layout.appSection` | `flex min-h-[calc(100vh-6.5rem)] flex-col gap-4 text-slate-900 sm:gap-5 lg:gap-6` | Shell de página sin borde (Home, dashboards) |
| `ui.layout.moduleShell` | `flex min-h-[calc(100vh-6.5rem)] flex-col gap-4 rounded-xl border border-slate-200 bg-slate-50 p-3 text-slate-900 shadow-sm sm:p-4 lg:gap-5 lg:p-5` | Shell de módulo con borde y padding — wrapper principal de casi toda página |
| `ui.layout.stickyTopBar` | `sticky top-0 z-50 border-b border-gray-200 bg-white/95 backdrop-blur` | Barra superior fija (AppNavbar) |

---

## ui.surface

| Token | Uso |
|---|---|
| `ui.surface.panel` | Tarjeta blanca con borde slate-200 y shadow-sm |
| `ui.surface.panelSoft` | Tarjeta slate-50 con borde y shadow-sm |
| `ui.surface.toolbar` | Panel de filtros/acciones con borde, padding y rounded-[1.5rem] |
| `ui.surface.tablePanel` | Wrapper de tabla: overflow-hidden, rounded-lg, borde slate-200 |
| `ui.surface.drawer` | Panel lateral deslizante — fondo blanco, shadow-xl |
| `ui.surface.drawerGlass` | Panel lateral con backdrop-blur y bg-white/90 |
| `ui.surface.modal` | Contenedor de modal: max-w-md, rounded-xl, bg-white, shadow-xl |
| `ui.surface.notification` | Toast flotante: max-w-sm, rounded-lg, shadow-lg, ring-1 |

---

## ui.typography

| Token | Clases | Uso |
|---|---|---|
| `ui.typography.heroTitle` | `text-2xl font-black tracking-tight text-slate-900 sm:text-3xl lg:text-4xl` | Título hero de pantalla principal |
| `ui.typography.pageTitle` | `text-lg font-semibold text-slate-900 sm:text-xl` | Título de página |
| `ui.typography.sectionTitle` | `text-xl font-semibold text-slate-900` | Título de sección |
| `ui.typography.cardTitle` | `text-sm font-semibold text-slate-900 sm:text-base` | Título de tarjeta |
| `ui.typography.body` | `text-sm leading-6 text-slate-600` | Texto de cuerpo |
| `ui.typography.bodyStrong` | `text-sm font-medium text-slate-700` | Cuerpo resaltado |
| `ui.typography.eyebrow` | `text-xs font-semibold uppercase tracking-wide text-slate-500` | Etiqueta encima de un valor (en tarjetas mobile) |
| `ui.typography.tableHead` | `text-xs font-semibold uppercase tracking-wide text-slate-600` | Encabezado de columna de tabla |

---

## ui.controls — Inputs

| Token | Uso |
|---|---|
| `ui.controls.input` | Input estándar — min-h-11, focus ring naranja |
| `ui.controls.inputCompact` | Input sin min-height — para filtros en toolbars |
| `ui.controls.textarea` | Textarea w-full |
| `ui.controls.disabledInput` | Input solo lectura — bg-slate-100, cursor-not-allowed |
| `ui.controls.checkbox` | Checkbox size-4, focus ring slate-900 |

---

## ui.controls — Botones

| Token | Apariencia | Uso |
|---|---|---|
| `ui.controls.primaryButton` | Fondo slate-900, texto blanco, min-h-11 | Acción principal del módulo |
| `ui.controls.accentButton` | Fondo `#ff6100`, texto blanco, min-h-11 | CTA destacado ("Nuevo", "Guardar") |
| `ui.controls.secondaryButton` | Borde slate-300, fondo blanco, min-h-11 | Acción secundaria ("Cancelar", "Actualizar") |
| `ui.controls.infoSoftButton` | Borde sky-300, fondo sky-50, texto sky-700 | Acción informativa suave |
| `ui.controls.destructiveButton` | Fondo red-600, texto blanco, min-h-11 | Acción destructiva directa |
| `ui.controls.destructiveSoftButton` | Borde red-300, fondo red-50, texto red-700 | Acción destructiva suave |
| `ui.controls.subtleButton` | Fondo gris translúcido, min-h-11 | Acción discreta |
| `ui.controls.iconButton` | Circular size-10, fondo gris translúcido | Botón solo ícono |
| `ui.controls.menuButton` | Texto xs, borde, sin min-height | Botón de menú compacto |
| `ui.controls.compactDestructiveButton` | Texto xs, borde rose-300, sin min-height | Destruir compacto |

---

## ui.controls — Navegación

```jsx
// Siempre combinar los tres tokens:
<button className={cx(ui.controls.navItem, isActive ? ui.controls.navItemActive : ui.controls.navItemIdle)}>
  Mi módulo
</button>
```

| Token | Clases |
|---|---|
| `ui.controls.navItem` | `min-h-11 whitespace-nowrap rounded-md px-3 py-2 text-sm font-semibold transition` |
| `ui.controls.navItemActive` | `bg-slate-900 text-white` |
| `ui.controls.navItemIdle` | `text-slate-700 hover:bg-slate-100` |

---

## ui.feedback

| Token | Uso |
|---|---|
| `ui.feedback.errorBanner` | Banner de error — borde red-200, fondo red-50, texto red-700 |
| `ui.feedback.emptyState` | Estado vacío en tabla — centrado, py-6, text-slate-500 |
| `ui.feedback.loadingState` | Estado de carga en tabla — igual que emptyState |

```jsx
// Error de módulo
{m.error && <div className={ui.feedback.errorBanner}>{m.error}</div>}

// Tabla vacía
<tr><td colSpan={5} className={ui.feedback.emptyState}>Sin registros</td></tr>

// Cargando
<tr><td colSpan={5} className={ui.feedback.loadingState}>Cargando…</td></tr>
```

---

## ui.table

Tokens para construir tablas desde cero cuando `MasterTable` no es suficiente.

```jsx
<div className={ui.table.wrapper}>
  <div className={ui.table.scroll}>
    <table className={ui.table.element}>
      <thead className={ui.table.head}>
        <tr>
          <th className={ui.table.th}>ID</th>
          <th className={ui.table.th}>Nombre</th>
        </tr>
      </thead>
      <tbody className={ui.table.row}>
        {rows.map(row => (
          <tr key={row.id} className="hover:bg-slate-50">
            <td className={ui.table.td}>{row.id}</td>
            <td className={ui.table.td}>{row.name}</td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
</div>
```

| Token | Clases | Elemento |
|---|---|---|
| `ui.table.wrapper` | `min-h-0 flex-1 overflow-hidden rounded-lg border border-slate-200 bg-white` | Div contenedor |
| `ui.table.mobileHint` | `border-b border-slate-200 px-3 py-2 text-xs font-medium uppercase tracking-wide text-slate-500 sm:hidden` | Hint mobile antes de tabla |
| `ui.table.scroll` | `overflow-x-auto` | Div con scroll horizontal |
| `ui.table.element` | `min-w-[48rem] divide-y divide-slate-200 text-sm lg:min-w-full` | `<table>` |
| `ui.table.head` | `sticky top-0 bg-slate-100 text-left text-slate-700` | `<thead>` |
| `ui.table.th` | `whitespace-nowrap px-3 py-3 font-semibold` | `<th>` |
| `ui.table.td` | `whitespace-nowrap px-3 py-2 align-top` | `<td>` |
| `ui.table.row` | `divide-y divide-slate-100 bg-white text-slate-800` | `<tbody>` |

---

## ui.badge

```jsx
<span className={ui.badge.success}>Activo</span>
<span className={ui.badge.warning}>Pendiente</span>
<span className={ui.badge.blocked}>Bloqueado</span>
<span className={ui.badge.info}>Informativo</span>
<span className={ui.badge.neutral}>Inactivo</span>
```

| Token | Color | Uso |
|---|---|---|
| `ui.badge.success` | Emerald | Activo, aprobado, correcto |
| `ui.badge.warning` | Amber | Pendiente, advertencia |
| `ui.badge.blocked` | Rose | Bloqueado, rechazado |
| `ui.badge.info` | Sky | Informativo, en proceso |
| `ui.badge.neutral` | Slate | Inactivo, sin estado |

---

## ui.drawer

Para paneles laterales implementados con HeadlessUI Dialog:

```jsx
<Dialog>
  <div className={ui.drawer.overlay} />
  <div className={ui.drawer.shell}>
    <div className={ui.drawer.panel}>
      <div className={ui.surface.drawer}>
        <div className={ui.drawer.header}>
          {/* botón de cierre */}
        </div>
        <div className={ui.drawer.body}>
          <div className={ui.drawer.inner}>
            {/* contenido */}
          </div>
        </div>
      </div>
    </div>
  </div>
</Dialog>
```

| Token | Clases |
|---|---|
| `ui.drawer.overlay` | `fixed inset-0 bg-black/25` |
| `ui.drawer.shell` | `pointer-events-none fixed inset-y-0 right-0 flex w-full justify-end pl-0 sm:max-w-full sm:pl-10 lg:pl-16` |
| `ui.drawer.panel` | `pointer-events-auto h-full w-full max-w-full transform transition duration-500 ease-in-out data-closed:translate-x-full sm:w-screen sm:max-w-md sm:duration-700` |
| `ui.drawer.header` | `sticky top-0 z-10 flex justify-end px-4 pt-4 sm:px-6 sm:pt-6` |
| `ui.drawer.body` | `flex-1 px-4 pb-6 sm:px-6 sm:pb-8` |
| `ui.drawer.inner` | `mx-auto w-full max-w-sm space-y-8 sm:space-y-10` |

---

## ui.modal

Para modales custom (cuando los componentes de layout no alcanzan):

```jsx
<div className={ui.modal.overlay}>
  <div className={ui.surface.modal}>
    <div className={ui.modal.header}>
      <h2>Título</h2>
    </div>
    <div className={ui.modal.body}>
      {/* contenido */}
    </div>
    <div className={ui.modal.footer}>
      <button className={ui.controls.secondaryButton}>Cancelar</button>
      <button className={ui.controls.primaryButton}>Confirmar</button>
    </div>
  </div>
</div>
```

| Token | Clases |
|---|---|
| `ui.modal.overlay` | `fixed inset-0 z-[60] flex items-center justify-center bg-black/45 p-4` |
| `ui.modal.header` | `border-b border-slate-200 px-4 py-3` |
| `ui.modal.body` | `space-y-3 px-4 py-4 text-sm text-slate-700` |
| `ui.modal.footer` | `flex justify-end gap-2 border-t border-slate-200 px-4 py-3` |

---

## Cómo agregar tokens nuevos

Editar `src/styles/designSystem.js` y agregar bajo la categoría correspondiente:

```js
export const ui = {
  controls: {
    // ... tokens existentes ...
    myNewButton: 'inline-flex items-center rounded-md bg-violet-600 px-3 py-2 text-sm font-semibold text-white',
  },
}
```

Nunca definir clases repetitivas directamente en los componentes.
