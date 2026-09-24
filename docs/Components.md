# Primitivas de UI (`src/ui`)

Antes de construir un control, revisa esta lista. Todas consumen tokens (ver `DesignSystem.md`) y reciben
los textos **ya traducidos** por props, salvo las que traen su propio texto de sistema (cerrar, mostrar
contrasena), que lo resuelven con `useI18n`.

## Acciones

| Componente | Uso | Notas |
|---|---|---|
| `AppButton` | Boton o enlace con aspecto de boton | `variant`: primary, secondary, danger, ghost; `size="sm"`; `to` (Link), `href` (a) o boton |
| `IconButton` | Accion sin texto visible | `label` **obligatorio**: es el nombre accesible y el tooltip |
| `ActionMenu` | Menu "..." de acciones por fila | `label` + `items: [{ key, label, onSelect, icon?, tone?, hidden?, disabled? }]`; sin items visibles no se pinta |

## Formularios

| Componente | Uso | Notas |
|---|---|---|
| `TextField` | Campo de texto | `id` obligatorio (ata la etiqueta), `hint`, `error` (aria-invalid + aria-describedby) |
| `PasswordField` | Contrasena con mostrar/ocultar | Boton con `aria-pressed` |
| `Select` | Seleccion nativa | `options=[{ value, label }]` o hijos `<option>` |
| `Checkbox` | Casilla con etiqueta | La etiqueta envuelve al input: todo el texto es area de clic |
| `Switch` | Interruptor | `role="switch"`, `label` o `labelledBy` obligatorio |

La maquina del formulario es `useFormState` (`src/features/shared/hooks`): valores, errores por campo,
error de envio, guarda de doble envio y reinicio por `resetKey`.

## Overlays

| Componente | Uso | Notas |
|---|---|---|
| `AppModal` | El UNICO modal | Foco atrapado, Esc, retorno de foco (probado). `busy` bloquea el cierre; `onSubmit` mete cuerpo y pie en un `<form>`; `scroll="body"` para formularios largos |
| `ConfirmDialog` | Confirmacion antes de una accion sensible | `onConfirm()` devuelve `{ ok, message }`; sin ok muestra el mensaje en el dialogo |
| `AppNotification` + `useNotification` | Aviso flotante con el RESULTADO de una accion | success/info: `role="status"` y se oculta solo; error/warning: `role="alert"`; el error no se auto-oculta |

## Estados de datos

| Componente | Estado |
|---|---|
| `RowsSkeleton` | carga (`aria-busy`, texto para lector de pantalla) |
| `DataError` | fallo, con `role="alert"` y boton de reintento |
| `DataEmpty` | vacio valido, con accion sugerida opcional |
| `RouteLoading` | espera de una ruta diferida (`role="status"`) |

Usa `LOAD_STATUS` (`src/utils/loadStatus.js`) para los tres estados; el vacio se decide sobre `success`.

## Presentacion

| Componente | Uso |
|---|---|
| `SectionHeading` | Encabezado de pagina: titulo, subtitulo, acciones |
| `Container` | Ancho maximo + gutter en pantallas publicas |
| `StatusBadge` | Estado en pildora: `label` + `tone` (neutral, success, warning, danger, info) |
| `ProgressBar` | Avance 0-100 con `role="progressbar"` |
| `Pagination` | Anterior/siguiente con `aria-live` en el indicador; se oculta con una sola pagina |
| `StackedField` | Par etiqueta/valor (`dt/dd`) para la vista movil de una tabla |

## Sistema

| Componente | Uso |
|---|---|
| `ErrorBoundary` | Limite de error; va en dos niveles (App y layouts) |
| `ErrorScreen` | Pantalla compartida por el error inesperado y el 404 |
| `LocaleSwitcher` | Selector de idioma |
| `ThemeToggle` | Tema claro/oscuro |
| `theme/ThemeProvider`, `theme/useTheme` | Estado del tema (ver `DesignSystem.md`) |

---

## Que mecanismo de feedback usar

| Situacion | Mecanismo |
|---|---|
| La lista no cargo | `DataError` en el lugar de la lista |
| Error de validacion de un campo | `error` del campo (TextField...) |
| El servidor rechazo un formulario o una confirmacion | `<p role="alert" data-tone="danger" className="ui-alert">` dentro del modal |
| Una accion salio bien | `AppNotification` tipo success |
| Antes de algo destructivo | `ConfirmDialog` |
| Un error de render | `ErrorBoundary` (automatico) |
