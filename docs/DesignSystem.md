# Design system

La fuente que manda es el bloque `@theme` de `src/index.css`. De ahi salen las utilidades que usan los
componentes y las clases `.ui-*`. `src/styles/tokens.js` es su espejo en JS (para lo que no puede leer
CSS) y `src/styles/designSystem.js` solo exporta `cx()`.

**Cero magic values**: nada de `#hex`, `slate-*` o `indigo-*` en un componente. Si falta un token, se
agrega al `@theme` (y a los dos bloques oscuros si flipa).

---

## Paleta

Neutra a proposito (escala `brand` = zinc): la plantilla no tiene marca. Para darsela a un producto se
cambian `--color-brand-*` y `--color-primary*`; nada mas en el codigo sabe de colores.

| Utilidad | Para | Claro | Oscuro |
|---|---|---|---|
| `bg-surface` | fondo de la app | #ffffff | #09090b |
| `bg-surface-muted` | sidebar, hover, esqueletos | #fafafa | #18181b |
| `bg-surface-raised` | lo que flota (modal, menu, toast) | #ffffff | #1c1c1f |
| `text-content` | texto principal | #18181b | #fafafa |
| `text-muted` | texto secundario | #52525b | #a1a1aa |
| `text-subtle` | SOLO placeholders/decoracion (no cumple AA) | #a1a1aa | #71717a |
| `border-border` / `border-border-strong` | lineas y bordes de control | #e4e4e7 / #d4d4d8 | #27272a / #3f3f46 |
| `bg-brand-soft` + `text-brand-text` | item activo, pildoras | #f4f4f5 / #18181b | 8% blanco / #fafafa |
| `bg-primary` / `text-primary-fg` | accion principal (se invierte en oscuro) | #18181b / #fff | #fafafa / #09090b |
| `text-success` `text-warning` `text-error` `text-info` | estado, siempre con icono o texto | #047857 #92400e #b91c1c #1d4ed8 | #34d399 #fbbf24 #f87171 #60a5fa |

`contrasteDeTokens.test.js` verifica AA (4.5:1) de cada texto sobre las tres superficies en los dos temas,
de los estados sobre su propio tinte al 10% (badges, alertas), del boton principal y del destructivo, y
3:1 del anillo de foco. Tambien que los dos bloques oscuros no diverjan.

## Clases `.ui-*`

| Clase | Que es |
|---|---|
| `ui-btn` + `ui-btn-primary / -secondary / -danger / -ghost`, `ui-btn-sm` | botones (los pinta `AppButton`) |
| `ui-icon-btn` | boton-icono (lo pinta `IconButton`) |
| `ui-input` | campo de formulario; `aria-invalid="true"` pinta el borde de error |
| `ui-checkbox` | casilla con el color primario |
| `ui-badge[data-tone]` | pildora de estado (`StatusBadge`) |
| `ui-alert[data-tone]` | mensaje en linea (danger, success) |
| `ui-meter`, `ui-meter-fill[data-tone]` | barra de avance (`ProgressBar`) |
| `ui-pill`, `ui-eyebrow` | etiqueta y antetitulo |
| `ui-section` | zona de pagina: la separa una linea arriba, solo entre hermanas |
| `ui-card` | superficie con borde: SOLO para objetos repetibles, lo que flota o lo clickeable como un todo |
| `ui-skip-link` | enlace "saltar al contenido", visible solo con foco |
| `ui-float` | flotacion lenta de la ilustracion de error |

## Regla de layout (ui-layout-first)

La pantalla no flota y adentro no hay cajas. El contenido se apoya sobre `bg-surface`; las zonas se
separan con espacio, `ui-section` y tipografia. Borde y sombra solo para lo que flota. Los controles
(botones, campos) SI conservan su marco.

## Tema claro / oscuro

- La variante `dark:` responde a `[data-theme="dark"]` en `<html>` (`@custom-variant` en `index.css`), no a
  la preferencia del sistema.
- Un script en linea en `index.html` estampa `data-theme` **antes del primer pintado** (clave `app_theme`,
  default `light`); `ThemeProvider` lo mantiene despues y persiste la eleccion. La clave y el default
  estan atados por `ThemeProvider.test.jsx`, y la CSP del build permite ese script por su hash.
- Las pantallas NO escriben `dark:`: usan tokens semanticos, que ya flipan. `color-scheme` tambien cambia,
  asi que los controles nativos siguen al tema.

## Foco, motion y area tactil

- Foco visible global con `:focus-visible` y `--color-focus`: no se escribe por componente.
- Transiciones de 150-300 ms con `--ease-out-soft`; `prefers-reduced-motion` las anula.
- Controles de al menos 44 px de alto (`.ui-btn`, `.ui-input`, items del menu).

## Clases que no existen

`deadClasses.test.js` compila `index.css` con Tailwind y falla si el codigo usa una utilidad de color que
no genera CSS (por ejemplo `text-danger`: hay un TONO danger pero no un token de color danger).
