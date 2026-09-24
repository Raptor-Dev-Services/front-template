# Tailwind Plus - biblioteca de referencia UI

Ejemplos de componentes para **consultar** antes de construir una pantalla: estructura, estados y
accesibilidad ya resueltos. Se leen y se adaptan; **nunca se pegan tal cual**.

Ruta: `docs/Tailwind Plus/` (dentro de este repo). No se compila ni se lintea: esta excluida de ESLint,
de Vitest, del escaneo de Tailwind (`@source not` en `src/index.css`) y del contexto de Docker.

---

## Colecciones disponibles

| Coleccion | Ruta | Cuando usar |
|---|---|---|
| **Application UI v4** | `application-ui-v4/react/` | Componentes de app interna: tablas, formularios, modales, navegacion, overlays. La mas relevante |
| **Catalyst UI Kit** | `catalyst-ui-kit/catalyst-ui-kit/typescript/` | Primitivos de referencia (button, input, dialog, dropdown...) para ver una API de componente completa |
| Marketing v4 | `marketing-v4/react/` | Heroes, precios, footers: para una landing |
| Ecommerce v4 | `ecommerce-v4/react/` | Grids de producto |

Tambien existen las variantes `html/` y `vue/` de Application UI.

---

## Reglas de adaptacion

Al tomar un ejemplo, antes de que llegue a `src/`:

1. **Primero busca la primitiva.** Si ya existe en `src/ui` (AppButton, TextField, AppModal, ActionMenu,
   Pagination, DataStates...), se usa la primitiva; el ejemplo solo sirve para la composicion.
2. **Colores a tokens, nunca literales.** Los ejemplos usan `indigo-*`, `gray-*`, `white`: se sustituyen
   por los semanticos de `src/index.css`:
   - fondo de pagina/panel -> `bg-surface`, `bg-surface-muted`, `bg-surface-raised`
   - texto -> `text-content`, `text-muted` (y `text-subtle` solo para placeholders)
   - bordes -> `border-border`, `border-border-strong`
   - accion principal -> la primitiva `AppButton` (clase `.ui-btn-primary`, token `--color-primary`)
   - estados -> `text-success`, `text-warning`, `text-error`, `text-info` o `StatusBadge` con `tone`
   - foco -> no se escribe: lo pone el `:focus-visible` global de `index.css`
3. **Dark mode: se BORRAN las clases `dark:*` del ejemplo.** Aqui el tema oscuro no se escribe pantalla por
   pantalla: los tokens semanticos ya flipan con `data-theme`. Un `dark:` solo se justifica para una isla
   que conserva su color en los dos temas (ver skill `theming-dark-mode` del catalogo).
4. **Todo texto por i18n.** Los textos en ingles del ejemplo pasan a claves en `src/i18n/messages.es.js` y
   `messages.en.js`, con el mismo juego de claves en los dos.
5. **Sin cajas de mas (regla `ui-layout-first`).** Los ejemplos envuelven zonas en tarjetas con borde y
   sombra; en el panel las zonas se separan con espacio, lineas (`.ui-section`) y tipografia.
6. **Eliminar `'use client'`** (directiva de Next.js) y adaptar imports: Headless UI y Heroicons ya estan
   instalados. No se instala nada nuevo sin consultarlo.

---

## Application UI v4 — Índice completo

### Application Shells (layouts de página completa)

Ruta: `application-ui-v4/react/application-shells/`

#### sidebar/
| Archivo | Descripción |
|---|---|
| `01-simple-sidebar.jsx` | Sidebar claro simple |
| `02-simple-dark-sidebar.jsx` | Sidebar oscuro simple |
| `03-sidebar-with-header.jsx` | Sidebar con header superior |
| `04-dark-sidebar-with-header.jsx` | Sidebar oscuro con header |
| `05-with-constrained-content-area.jsx` | Sidebar con contenido centrado/restringido |
| `06-with-off-white-background.jsx` | Sidebar fondo off-white |
| `07-simple-brand-sidebar.jsx` | Sidebar con branding de marca |
| `08-brand-sidebar-with-header.jsx` | Sidebar marca + header |

#### stacked/
| Archivo | Descripción |
|---|---|
| `01-with-bottom-border.jsx` | Shell apilado con borde inferior |
| `02-on-subtle-background.jsx` | Shell sobre fondo sutil |
| `03-with-lighter-page-header.jsx` | Shell con header de página claro |
| `04-branded-nav-with-compact-lighter-page-header.jsx` | Nav con marca + header compacto |
| `05-with-overlap.jsx` | Shell con overlap de contenido sobre header |
| `06-brand-nav-with-overlap.jsx` | Nav marca + overlap |
| `07-branded-nav-with-lighter-page-header.jsx` | Nav marca + header claro |
| `08-with-compact-lighter-page-header.jsx` | Shell compacto |
| `09-two-row-navigation-with-overlap.jsx` | Navegación doble fila + overlap |

#### multi-column/
| Archivo | Descripción |
|---|---|
| `01-full-width-three-column.jsx` | Layout 3 columnas full width |
| `02-full-width-secondary-column-on-right.jsx` | 2 columnas con secundaria a la derecha |
| `03-constrained-three-column.jsx` | 3 columnas restringidas |
| `04-constrained-with-sticky-columns.jsx` | 3 columnas con columnas sticky |
| `05-full-width-with-narrow-sidebar.jsx` | Full width + sidebar angosto |
| `06-full-width-with-narrow-sidebar-and-header.jsx` | Full width + sidebar angosto + header |

---

### Data Display

Ruta: `application-ui-v4/react/data-display/`

#### stats/ (tarjetas de métricas/KPIs)
| Archivo | Descripción |
|---|---|
| `01-with-trending.jsx` | Stats con indicador de tendencia (↑↓) |
| `02-simple.jsx` | Stats simples |
| `03-simple-in-cards.jsx` | Stats en tarjetas individuales |
| `04-with-brand-icon.jsx` | Stats con ícono de marca |
| `05-with-shared-borders.jsx` | Stats con bordes compartidos |

#### description-lists/ (listas de detalle clave-valor)
| Archivo | Descripción |
|---|---|
| `01-left-aligned.jsx` | Lista de descripción alineada a la izquierda |
| `03-left-aligned-in-card.jsx` | Lista en tarjeta |
| `04-left-aligned-striped.jsx` | Lista con filas alternadas |
| `05-two-column.jsx` | Lista en dos columnas |
| `06-left-aligned-with-inline-actions.jsx` | Lista con acciones inline por campo |
| `06-narrow-with-hidden-labels.jsx` | Lista angosta sin etiquetas visibles |

#### calendars/
| Archivo | Descripción |
|---|---|
| `01-small-with-meetings.jsx` | Calendario pequeño con eventos |
| `02-month-view.jsx` | Vista mensual completa |
| `03-week-view.jsx` | Vista semanal |
| `04-day-view.jsx` | Vista diaria |
| `05-year-view.jsx` | Vista anual |
| `06-double.jsx` | Doble calendario |
| `07-borderless-stacked.jsx` | Apilado sin bordes |
| `08-borderless-side-by-side.jsx` | Lado a lado sin bordes |

---

### Elements (elementos UI base)

Ruta: `application-ui-v4/react/elements/`

#### buttons/
| Archivo | Descripción |
|---|---|
| `01-primary-buttons.jsx` | Botones primarios (varios tamaños) |
| `02-secondary-buttons.jsx` | Botones secundarios |
| `05-soft-buttons.jsx` | Botones suaves (soft) |
| `06-buttons-with-leading-icon.jsx` | Botones con ícono a la izquierda |
| `07-buttons-with-trailing-icon.jsx` | Botones con ícono a la derecha |
| `08-rounded-primary-buttons.jsx` | Botones primarios redondeados (pill) |
| `09-rounded-secondary-buttons.jsx` | Botones secundarios redondeados |
| `10-circular-buttons.jsx` | Botones circulares (icon-only) |

#### badges/
| Archivo | Descripción |
|---|---|
| `01-with-border.jsx` | Badge con borde |
| `03-with-border-and-dot.jsx` | Badge con borde y punto de estado |
| `05-pill-with-border.jsx` | Badge pill con borde |
| `06-pill-with-border-and-dot.jsx` | Badge pill con punto |
| `07-with-border-remove-button.jsx` | Badge con botón de eliminar |
| `08-flat.jsx` | Badge flat |
| `09-flat-pill.jsx` | Badge flat pill |
| `10-flat-with-dot.jsx` | Badge flat con punto |
| `11-flat-pill-with-dot.jsx` | Badge flat pill con punto |
| `12-flat-with-remove-button.jsx` | Badge flat eliminable |
| `13-small-with-border.jsx` | Badge pequeño con borde |
| `14-small-flat.jsx` | Badge pequeño flat |

#### avatars/
| Archivo | Descripción |
|---|---|
| `01-circular-avatars.jsx` | Avatares circulares |
| `02-rounded-avatars.jsx` | Avatares redondeados |
| `07-circular-avatars-with-placeholder-icon.jsx` | Avatares con ícono placeholder |
| `08-circular-avatars-with-placeholder-initials.jsx` | Avatares con iniciales |
| `09-avatar-group-stacked-bottom-to-top.jsx` | Grupo de avatares apilados |
| `11-with-text.jsx` | Avatar con nombre y rol al lado |

#### dropdowns/
| Archivo | Descripción |
|---|---|
| `01-simple.jsx` | Dropdown simple |
| `02-with-dividers.jsx` | Dropdown con separadores |
| `03-with-icons.jsx` | Dropdown con íconos por opción |
| `04-with-minimal-menu-icon.jsx` | Dropdown con ícono minimalista |
| `05-with-simple-header.jsx` | Dropdown con header de sección |

#### button-groups/
| Archivo | Descripción |
|---|---|
| `01-basic.jsx` | Grupo de botones básico |
| `02-icon-only.jsx` | Grupo solo íconos |
| `03-with-stat.jsx` | Botón con contador/stat |
| `04-with-dropdown.jsx` | Botón con dropdown adjunto |
| `05-with-checkbox-and-dropdown.jsx` | Botón con checkbox + dropdown |

---

### Feedback

Ruta: `application-ui-v4/react/feedback/`

#### alerts/
| Archivo | Descripción |
|---|---|
| `01-with-description.jsx` | Alerta con descripción |
| `02-with-list.jsx` | Alerta con lista de errores |
| `03-with-actions.jsx` | Alerta con botones de acción |
| `04-with-link-on-right.jsx` | Alerta con link a la derecha |
| `05-with-accent-border.jsx` | Alerta con borde lateral de acento |
| `06-with-dismiss-button.jsx` | Alerta dismissable |

#### empty-states/
| Archivo | Descripción |
|---|---|
| `01-simple.jsx` | Estado vacío simple |
| `02-with-dashed-border.jsx` | Estado vacío con borde punteado |
| `03-with-starting-points.jsx` | Estado vacío con opciones de inicio |
| `04-with-recommendations.jsx` | Estado vacío con recomendaciones |

---

### Forms

Ruta: `application-ui-v4/react/forms/`

#### input-groups/ (inputs con variantes)
| Archivo | Descripción |
|---|---|
| `01-input-with-label.jsx` | Input básico con label |
| `02-input-with-label-and-help-text.jsx` | Input con label + texto de ayuda |
| `03-input-with-validation-error.jsx` | Input con estado de error |
| `04-input-with-disabled-state.jsx` | Input deshabilitado |
| `06-input-with-corner-hint.jsx` | Input con hint en esquina |
| `07-input-with-leading-icon.jsx` | Input con ícono a la izquierda |
| `08-input-with-trailing-icon.jsx` | Input con ícono a la derecha |
| `09-input-with-add-on.jsx` | Input con prefijo/sufijo (ej: "https://") |
| `10-input-with-inline-add-on.jsx` | Input con add-on inline |
| `12-input-with-inline-leading-dropdown.jsx` | Input con dropdown de prefijo |
| `14-input-with-leading-icon-and-trailing-button.jsx` | Input con ícono y botón |
| `19-input-with-pill-shape.jsx` | Input con forma pill |

#### select-menus/
| Archivo | Descripción |
|---|---|
| `01-simple-native.jsx` | Select nativo simple |
| `02-simple-custom.jsx` | Select custom con HeadlessUI |
| `03-custom-with-check-on-left.jsx` | Select con checkmark en opción activa |
| `04-custom-with-status-indicator.jsx` | Select con punto de estado |
| `05-custom-with-avatar.jsx` | Select con avatar por opción |
| `06-with-secondary-text.jsx` | Select con texto secundario |

#### comboboxes/ (autocomplete)
| Archivo | Descripción |
|---|---|
| `01-simple.jsx` | Combobox simple con filtro |
| `03-with-status-indicator.jsx` | Combobox con punto de estado |
| `04-with-avatar.jsx` | Combobox con avatar |
| `05-with-secondary-text.jsx` | Combobox con texto secundario |

#### form-layouts/ (layouts de formularios completos)
| Archivo | Descripción |
|---|---|
| `01-stacked.jsx` | Formulario apilado (un campo por fila) |
| `03-two-column.jsx` | Formulario dos columnas |
| `04-two-column-with-cards.jsx` | Formulario en tarjetas por sección |
| `05-labels-on-left.jsx` | Formulario con labels a la izquierda |

#### checkboxes/
| Archivo | Descripción |
|---|---|
| `01-list-with-description.jsx` | Lista de checkboxes con descripción |
| `02-list-with-inline-description.jsx` | Checkboxes con descripción inline |
| `03-list-with-checkbox-on-right.jsx` | Checkboxes a la derecha |
| `04-simple-list-with-heading.jsx` | Lista simple con heading |

#### radio-groups/
| Archivo | Descripción |
|---|---|
| `01-simple-list.jsx` | Radio group simple |
| `03-list-with-description.jsx` | Radio con descripción por opción |
| `08-list-with-descriptions-in-panel.jsx` | Radio en panel con descripción completa |
| `09-color-picker.jsx` | Selector de color con radios |
| `10-cards.jsx` | Radio group en tarjetas seleccionables |
| `11-small-cards.jsx` | Radio en tarjetas pequeñas |
| `12-stacked-cards.jsx` | Radio en tarjetas apiladas |

#### toggles/
| Archivo | Descripción |
|---|---|
| `01-simple-toggle.jsx` | Toggle simple |
| `03-toggle-with-icon.jsx` | Toggle con ícono |
| `04-with-left-label-and-description.jsx` | Toggle con label y descripción a la izquierda |
| `05-with-right-label.jsx` | Toggle con label a la derecha |

#### textareas/
| Archivo | Descripción |
|---|---|
| `01-simple.jsx` | Textarea básica |
| `02-with-avatar-and-actions.jsx` | Textarea con avatar y acciones (comentarios) |
| `04-with-title-and-pill-actions.jsx` | Textarea con título y acciones pill |

#### action-panels/ (paneles de acción con confirmación)
| Archivo | Descripción |
|---|---|
| `01-simple.jsx` | Panel de acción simple |
| `03-with-button-on-right.jsx` | Panel con botón a la derecha |
| `05-with-toggle.jsx` | Panel de acción con toggle |
| `06-with-input.jsx` | Panel de acción con input |
| `07-simple-well.jsx` | Panel tipo "well" simple |

---

### Headings

Ruta: `application-ui-v4/react/headings/`

#### page-headings/ (encabezados de página)
| Archivo | Descripción |
|---|---|
| `01-with-actions.jsx` | Page heading con botones de acción |
| `03-with-actions-and-breadcrumbs.jsx` | Page heading con breadcrumbs y acciones |
| `05-with-meta-and-actions.jsx` | Page heading con meta-información |
| `08-with-avatar-and-actions.jsx` | Page heading con avatar |
| `09-card-with-avatar-and-stats.jsx` | Page heading en tarjeta con stats |
| `12-with-filters-and-action.jsx` | Page heading con filtros inline |

#### section-headings/ (encabezados de sección dentro de página)
| Archivo | Descripción |
|---|---|
| `01-simple.jsx` | Section heading simple |
| `02-with-description.jsx` | Section heading con descripción |
| `03-with-actions.jsx` | Section heading con acciones múltiples |
| `04-with-action.jsx` | Section heading con una acción |
| `06-with-tabs.jsx` | Section heading con tabs |
| `07-with-actions-and-tabs.jsx` | Section heading con tabs y acciones |
| `10-with-badge-and-dropdown.jsx` | Section heading con badge y dropdown |

#### card-headings/ (encabezados de tarjeta)
| Archivo | Descripción |
|---|---|
| `01-simple.jsx` | Card heading simple |
| `02-with-action.jsx` | Card heading con un botón |
| `03-with-avatar-and-actions.jsx` | Card heading con avatar y acciones |
| `04-with-description-and-action.jsx` | Card heading con descripción |
| `06-with-avatar-meta-and-dropdown.jsx` | Card heading con avatar, meta y dropdown |

---

### Layout

Ruta: `application-ui-v4/react/layout/`

#### cards/
| Archivo | Descripción |
|---|---|
| `01-basic-card.jsx` | Tarjeta básica |
| `03-card-with-header.jsx` | Tarjeta con header |
| `04-card-with-footer.jsx` | Tarjeta con footer |
| `05-card-with-header-and-footer.jsx` | Tarjeta con header y footer |
| `06-card-with-gray-footer.jsx` | Tarjeta con footer gris |
| `07-card-with-gray-body.jsx` | Tarjeta con cuerpo gris |
| `08-well.jsx` | Panel tipo "well" (hundido) |

#### dividers/
| Archivo | Descripción |
|---|---|
| `01-with-label.jsx` | Divisor con etiqueta centrada |
| `04-with-title.jsx` | Divisor con título |
| `06-with-button.jsx` | Divisor con botón (ej: "Agregar sección") |
| `07-with-title-and-button.jsx` | Divisor con título y botón |

#### list-containers/
| Archivo | Descripción |
|---|---|
| `01-simple-with-dividers.jsx` | Contenedor de lista con divisores |
| `02-card-with-dividers.jsx` | Lista en tarjeta con divisores |
| `04-separate-cards.jsx` | Lista como tarjetas separadas |

---

### Lists

Ruta: `application-ui-v4/react/lists/`

#### tables/ (tablas de datos)
| Archivo | Descripción |
|---|---|
| `01-simple.jsx` | Tabla simple |
| `03-simple-in-card.jsx` | Tabla en tarjeta |
| `04-full-width.jsx` | Tabla full width |
| `05-with-striped-rows.jsx` | Tabla con filas alternadas |
| `06-with-uppercase-headings.jsx` | Tabla con headers en mayúsculas |
| `07-with-stacked-columns-on-mobile.jsx` | Tabla con columnas apiladas en mobile |
| `08-with-hidden-columns-on-mobile.jsx` | Tabla con columnas ocultas en mobile |
| `09-with-avatars-and-multiline-content.jsx` | Tabla con avatares y contenido multilínea |
| `10-with-sticky-header.jsx` | Tabla con header fijo (sticky) |
| `12-with-condensed-content.jsx` | Tabla compacta/condensada |
| `13-with-sortable-headings.jsx` | Tabla con headers ordenables (click) |
| `14-with-grouped-rows.jsx` | Tabla con filas agrupadas |
| `17-with-checkboxes.jsx` | Tabla con checkboxes de selección |

#### stacked-lists/ (listas tipo feed vertical)
| Archivo | Descripción |
|---|---|
| `01-simple.jsx` | Lista apilada simple |
| `03-with-links.jsx` | Lista con links en ítems |
| `05-with-inline-links-and-actions-menu.jsx` | Lista con links y menú de acciones |
| `06-with-badges-button-and-actions-menu.jsx` | Lista con badges y menú |
| `12-narrow-with-sticky-headings.jsx` | Lista angosta con headings sticky (agrupada) |
| `13-narrow-with-actions.jsx` | Lista angosta con acciones por ítem |

#### grid-lists/
| Archivo | Descripción |
|---|---|
| `01-contact-cards-with-small-portrait.jsx` | Grid de tarjetas de contacto |
| `03-simple-cards.jsx` | Grid de tarjetas simples |
| `04-horizontal-link-cards.jsx` | Grid de tarjetas horizontales con link |
| `05-actions-with-shared-borders.jsx` | Grid de acciones con bordes compartidos |

#### feeds/ (historial de actividad)
| Archivo | Descripción |
|---|---|
| `01-simple-with-icons.jsx` | Feed simple con íconos |
| `02-with-comments.jsx` | Feed con comentarios |
| `03-with-multiple-item-types.jsx` | Feed con múltiples tipos de evento |

---

### Navigation

Ruta: `application-ui-v4/react/navigation/`

#### tabs/
| Archivo | Descripción |
|---|---|
| `01-tabs-with-underline.jsx` | Tabs con subrayado |
| `02-tabs-with-underline-and-icons.jsx` | Tabs con subrayado e íconos |
| `03-tabs-in-pills.jsx` | Tabs en pills |
| `06-full-width-tabs-with-underline.jsx` | Tabs full width |
| `08-tabs-with-underline-and-badges.jsx` | Tabs con badges de conteo |

#### sidebar-navigation/
| Archivo | Descripción |
|---|---|
| `01-light.jsx` | Navegación lateral clara |
| `02-dark.jsx` | Navegación lateral oscura |
| `03-with-expandable-sections.jsx` | Nav lateral con secciones expandibles |
| `04-with-secondary-navigation.jsx` | Nav lateral con subnav |
| `05-brand.jsx` | Nav lateral con branding |

#### vertical-navigation/
| Archivo | Descripción |
|---|---|
| `01-simple.jsx` | Navegación vertical simple |
| `02-with-badges.jsx` | Nav vertical con badges |
| `03-with-icons-and-badges.jsx` | Nav vertical con íconos y badges |
| `04-with-icons.jsx` | Nav vertical con íconos |
| `05-with-secondary-navigation.jsx` | Nav vertical con subnav |

#### progress-bars/ (wizards, stepper)
| Archivo | Descripción |
|---|---|
| `01-simple.jsx` | Progress bar simple |
| `02-panels.jsx` | Stepper con paneles |
| `03-bullets.jsx` | Stepper con bullets |
| `05-circles.jsx` | Stepper con círculos |
| `07-circles-with-text.jsx` | Stepper con círculos y texto de paso |
| `08-progress-bar.jsx` | Barra de progreso |

#### breadcrumbs/
| Archivo | Descripción |
|---|---|
| `01-contained.jsx` | Breadcrumb contenido |
| `03-simple-with-chevrons.jsx` | Breadcrumb con chevrons |
| `04-simple-with-slashes.jsx` | Breadcrumb con slashes |

#### command-palettes/ (búsqueda global, Ctrl+K)
| Archivo | Descripción |
|---|---|
| `01-simple.jsx` | Command palette simple |
| `05-with-icons.jsx` | Command palette con íconos |
| `08-with-groups.jsx` | Command palette con grupos |
| `09-with-footer.jsx` | Command palette con footer de atajos |

#### pagination/
| Archivo | Descripción |
|---|---|
| `01-card-footer-with-page-buttons.jsx` | Paginación con botones de página |
| `02-centered-page-numbers.jsx` | Paginación centrada con números |
| `03-simple-card-footer.jsx` | Paginación simple Prev/Next |

#### navbars/
| Archivo | Descripción |
|---|---|
| `01-simple-dark-with-menu-button-on-left.jsx` | Navbar oscuro simple |
| `03-simple-dark.jsx` | Navbar oscuro |
| `05-simple.jsx` | Navbar claro simple |
| `07-dark-with-search.jsx` | Navbar con búsqueda |

---

### Overlays

Ruta: `application-ui-v4/react/overlays/`

#### modal-dialogs/
| Archivo | Descripción |
|---|---|
| `01-centered-with-single-action.jsx` | Modal centrado con una acción |
| `02-centered-with-wide-buttons.jsx` | Modal centrado con botones anchos |
| `03-simple-alert.jsx` | Modal de alerta simple (danger/warning) |
| `04-simple-with-dismiss-button.jsx` | Modal con botón de cierre |
| `05-simple-with-gray-footer.jsx` | Modal con footer gris |
| `06-simple-with-left-aligned-buttons.jsx` | Modal con botones alineados a la izquierda |

#### drawers/
| Archivo | Descripción |
|---|---|
| `01-empty.jsx` | Drawer vacío base |
| `01a-empty-wide.jsx` | Drawer vacío ancho |
| `02-with-background-overlay.jsx` | Drawer con overlay de fondo |
| `03-with-close-button-on-outside.jsx` | Drawer con botón de cierre exterior |
| `04-with-branded-header.jsx` | Drawer con header de marca |
| `05-with-sticky-footer.jsx` | Drawer con footer fijo |
| `06-create-project-form-example.jsx` | Drawer con formulario de creación |
| `06a-wide-create-project-form-example.jsx` | Drawer ancho con formulario |
| `07-user-profile-example.jsx` | Drawer de perfil de usuario |
| `09-file-details-example.jsx` | Drawer de detalle de registro |

#### notifications/
| Archivo | Descripción |
|---|---|
| `01-simple.jsx` | Notificación toast simple |
| `02-condensed.jsx` | Toast condensado |
| `03-with-actions-below.jsx` | Toast con acciones |
| `04-with-avatar.jsx` | Toast con avatar |
| `06-with-buttons-below.jsx` | Toast con botones debajo |

---

### Page Examples (páginas completas de referencia)

Ruta: `application-ui-v4/react/page-examples/`

Útiles como inspiración para nuevas pantallas completas.

| Archivo | Descripción |
|---|---|
| `home-screens/01-sidebar.jsx` | Home con sidebar |
| `home-screens/02-stacked.jsx` | Home con nav apilada |
| `detail-screens/01-sidebar.jsx` | Detalle con sidebar |
| `detail-screens/02-stacked.jsx` | Detalle con nav apilada |
| `settings-screens/01-sidebar.jsx` | Configuración con sidebar |
| `settings-screens/02-stacked.jsx` | Configuración con nav apilada |

---

## Catalyst UI Kit — Primitivos TypeScript

Ruta: `catalyst-ui-kit/catalyst-ui-kit/typescript/`

Componentes base de alta calidad. Referencia para ver la API completa de cada primitivo:

| Archivo | Componente |
|---|---|
| `button.tsx` | `<Button>` con variants y sizes |
| `input.tsx` | `<Input>` base |
| `textarea.tsx` | `<Textarea>` base |
| `select.tsx` | `<Select>` nativo |
| `checkbox.tsx` | `<Checkbox>` |
| `radio.tsx` | `<Radio>` y `<RadioGroup>` |
| `switch.tsx` | `<Switch>` toggle |
| `combobox.tsx` | `<Combobox>` autocomplete |
| `listbox.tsx` | `<Listbox>` select custom |
| `dialog.tsx` | `<Dialog>` modal |
| `dropdown.tsx` | `<Dropdown>` con animaciones |
| `table.tsx` | `<Table>`, `<TableHead>`, `<TableBody>`, `<TableRow>`, `<TableCell>` |
| `badge.tsx` | `<Badge>` con colores |
| `avatar.tsx` | `<Avatar>` con fallback |
| `pagination.tsx` | `<Pagination>` |
| `navbar.tsx` | `<Navbar>` |
| `sidebar.tsx` | `<Sidebar>` |
| `sidebar-layout.tsx` | `<SidebarLayout>` |
| `stacked-layout.tsx` | `<StackedLayout>` |
| `heading.tsx` | `<Heading>` y `<Subheading>` |
| `text.tsx` | `<Text>`, `<Strong>`, `<Code>` |
| `fieldset.tsx` | `<Fieldset>`, `<Field>`, `<Label>`, `<Description>`, `<ErrorMessage>` |
| `description-list.tsx` | `<DescriptionList>`, `<DescriptionTerm>`, `<DescriptionDetails>` |
| `divider.tsx` | `<Divider>` |
| `link.tsx` | `<Link>` |
| `auth-layout.tsx` | Layout de autenticación |
| `alert.tsx` | `<Alert>` |

---

## Flujo de uso

1. Identifica que necesitas (tabla, modal, formulario, estado vacio...).
2. Revisa si `src/ui` ya lo resuelve; si no, busca el ejemplo mas cercano en el indice de arriba.
3. Lee el archivo completo: estructura, estados, atributos `aria-*`.
4. Adapta aplicando las reglas: primitivas, tokens, sin `dark:`, textos por i18n, sin cajas de mas.
5. Corre `npm test`: `deadClasses.test.js` avisa si quedo una utilidad de color que no existe.
