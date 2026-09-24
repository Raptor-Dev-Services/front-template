// tokens.js - espejo en JS de los tokens de diseno de src/index.css.
//
// La fuente que MANDA es el bloque @theme de src/index.css: de ahi salen las utilidades que usan los
// componentes (bg-surface, text-content, text-muted, border-border, bg-primary...) y las clases .ui-*.
// Este archivo existe para lo que no puede leer CSS -un grafico, un canvas, un correo- y como registro
// legible del sistema. Si cambias un valor alla, cambialo aqui; contrasteDeTokens.test.js lee el CSS.
//
// Paleta NEUTRA a proposito: la plantilla no tiene marca. Un producto cambia la escala `brand` y los
// `primary` y nada mas en el codigo sabe de colores. Cero magic values en los componentes.

export const colors = {
  // Escala de marca (zinc). Fija en los dos temas.
  brand: {
    50: '#fafafa',
    100: '#f4f4f5',
    200: '#e4e4e7',
    300: '#d4d4d8',
    400: '#a1a1aa',
    500: '#71717a',
    600: '#52525b',
    700: '#3f3f46',
    800: '#27272a',
    900: '#18181b',
    950: '#09090b',
  },
  // Semanticos: flipan entre claro y oscuro en index.css.
  light: {
    surface: '#ffffff',
    surfaceMuted: '#fafafa',
    surfaceRaised: '#ffffff',
    content: '#18181b',
    muted: '#52525b',
    subtle: '#a1a1aa',
    border: '#e4e4e7',
    borderStrong: '#d4d4d8',
    brandSoft: '#f4f4f5',
    brandText: '#18181b',
    focus: '#52525b',
    primary: '#18181b',
    primaryHover: '#3f3f46',
    primaryFg: '#ffffff',
    success: '#047857',
    warning: '#92400e',
    error: '#b91c1c',
    info: '#1d4ed8',
    dangerFill: '#b91c1c',
  },
  dark: {
    surface: '#09090b',
    surfaceMuted: '#18181b',
    surfaceRaised: '#1c1c1f',
    content: '#fafafa',
    muted: '#a1a1aa',
    subtle: '#71717a',
    border: '#27272a',
    borderStrong: '#3f3f46',
    brandSoft: 'rgba(255, 255, 255, 0.08)',
    brandText: '#fafafa',
    focus: '#a1a1aa',
    primary: '#fafafa',
    primaryHover: '#e4e4e7',
    primaryFg: '#09090b',
    success: '#34d399',
    warning: '#fbbf24',
    error: '#f87171',
    info: '#60a5fa',
    dangerFill: '#dc2626',
  },
}

export const typography = {
  fontSans: "'Inter', ui-sans-serif, system-ui, -apple-system, 'Segoe UI', sans-serif",
  fontMono: "'JetBrains Mono', ui-monospace, SFMono-Regular, monospace",
}

export const radius = {
  sm: '0.375rem',
  md: '0.5rem',
  lg: '0.75rem', // botones, campos
  xl: '1rem', // tarjetas y modales (limite: sin over-rounding)
  pill: '9999px', // solo badges
}

// Duraciones de motion (< 300ms en producto).
export const transitions = {
  fast: '150ms', // hover, feedback de boton
  normal: '200ms', // menus
  modal: '300ms', // modales, drawers
}

// Escala z-index semantica: describe el apilado REAL del cliente, no uno aspiracional.
export const zIndex = {
  sticky: 20, // topbar del panel
  drawerBackdrop: 30, // velo del menu movil
  drawer: 40, // panel del menu movil
  overlay: 50, // AppModal, menus flotantes, enlace de salto enfocado
  overlayStacked: 60, // AppModal encima de otro AppModal
  toast: 70, // AppNotification
}

export default { colors, typography, radius, transitions, zIndex }
