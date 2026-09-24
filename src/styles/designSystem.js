// designSystem.js - helper `cx` y, TEMPORALMENTE, el objeto `ui` de la primera version.
//
// Los tokens viven en src/index.css (@theme) con su espejo en ./tokens.js, y se consumen como
// utilidades semanticas (bg-surface, text-content...) o por las primitivas de src/ui.
//
// `ui` es LEGADO: solo lo usan las pantallas de la primera version de la plantilla, que se reemplazan
// en el siguiente commit. No lo uses en codigo nuevo.

/** Une clases condicionales, descartando las falsy: cx('a', cond && 'b'). */
export function cx(...classes) {
  return classes.filter(Boolean).join(' ')
}

/** @deprecated legado de la v1; se elimina junto con las pantallas que lo usan. */
export const ui = {
  layout: {
    appSection:   'flex min-h-[calc(100vh-6.5rem)] flex-col gap-4 text-slate-900 sm:gap-5 lg:gap-6',
    moduleShell:  'flex min-h-[calc(100vh-6.5rem)] flex-col gap-4 rounded-xl border border-slate-200 bg-slate-50 p-3 text-slate-900 shadow-sm sm:p-4 lg:gap-5 lg:p-5',
    stickyTopBar: 'sticky top-0 z-50 border-b border-gray-200 bg-white/95 backdrop-blur',
  },
  surface: {
    panel:        'rounded-xl border border-slate-200 bg-white shadow-sm',
    panelSoft:    'rounded-xl border border-slate-200 bg-slate-50 shadow-sm',
    toolbar:      'rounded-[1.5rem] border border-slate-200 bg-white p-4 shadow-sm sm:p-5',
    tablePanel:   'overflow-hidden rounded-lg border border-slate-200 bg-white',
    drawer:       'relative flex h-full flex-col overflow-y-auto rounded-none bg-white shadow-xl sm:rounded-l-2xl',
    drawerGlass:  'relative flex h-full flex-col overflow-y-auto rounded-none bg-white/90 shadow-xl backdrop-blur-sm sm:rounded-l-2xl',
    modal:        'w-full max-w-md rounded-xl bg-white shadow-xl',
    notification: 'w-full max-w-sm rounded-lg bg-white shadow-lg ring-1 ring-slate-900/10',
  },
  typography: {
    heroTitle:   'text-2xl font-black tracking-tight text-slate-900 sm:text-3xl lg:text-4xl',
    pageTitle:   'text-lg font-semibold text-slate-900 sm:text-xl',
    sectionTitle:'text-xl font-semibold text-slate-900',
    cardTitle:   'text-sm font-semibold text-slate-900 sm:text-base',
    body:        'text-sm leading-6 text-slate-600',
    bodyStrong:  'text-sm font-medium text-slate-700',
    eyebrow:     'text-xs font-semibold uppercase tracking-wide text-slate-500',
    tableHead:   'text-xs font-semibold uppercase tracking-wide text-slate-600',
  },
  controls: {
    input:
      'min-h-11 rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-slate-400 focus:bg-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#ff7b00]',
    inputCompact:
      'rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-slate-400 focus:bg-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#ff7b00]',
    textarea:
      'w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-slate-400 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#ff7b00]',
    primaryButton:
      'inline-flex min-h-11 items-center justify-center rounded-md bg-slate-900 px-3 py-2 text-sm font-semibold text-white transition hover:bg-slate-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#ff7b00] disabled:cursor-not-allowed disabled:opacity-50',
    accentButton:
      'inline-flex min-h-11 items-center justify-center rounded-md bg-[#ff6100] px-3 py-2 text-sm font-semibold text-white transition hover:bg-[#ff7b00] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#ff7b00] disabled:cursor-not-allowed disabled:opacity-60',
    secondaryButton:
      'inline-flex min-h-11 items-center justify-center rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-800 transition hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#ff7b00] disabled:cursor-not-allowed disabled:opacity-50',
    infoSoftButton:
      'inline-flex min-h-11 items-center justify-center rounded-md border border-sky-300 bg-sky-50 px-3 py-2 text-sm font-semibold text-sky-700 transition hover:bg-sky-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#ff7b00] disabled:cursor-not-allowed disabled:opacity-50',
    destructiveButton:
      'inline-flex min-h-11 items-center justify-center rounded-md bg-red-600 px-3 py-2 text-sm font-semibold text-white transition hover:bg-red-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#ff7b00] disabled:cursor-not-allowed disabled:opacity-50',
    destructiveSoftButton:
      'inline-flex min-h-11 items-center justify-center rounded-md border border-red-300 bg-red-50 px-3 py-2 text-sm font-semibold text-red-700 transition hover:bg-red-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#ff7b00] disabled:cursor-not-allowed disabled:opacity-50',
    subtleButton:
      'inline-flex min-h-11 items-center justify-center rounded-md bg-gray-950/5 px-3 py-2 text-sm font-semibold text-gray-900 transition hover:bg-gray-950/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#ff7b00]',
    iconButton:
      'relative inline-flex size-10 shrink-0 items-center justify-center rounded-full bg-gray-950/5 text-gray-700 transition hover:bg-gray-950/10 hover:text-gray-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#ff7b00]',
    navItem:       'min-h-11 whitespace-nowrap rounded-md px-3 py-2 text-sm font-semibold transition',
    navItemActive: 'bg-slate-900 text-white',
    navItemIdle:   'text-slate-700 hover:bg-slate-100',
    menuButton:
      'rounded-md border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-800 transition hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#ff7b00] disabled:cursor-not-allowed disabled:opacity-50',
    disabledInput:
      'min-h-11 w-full rounded-md border border-slate-300 bg-slate-100 px-3 py-2 text-sm text-slate-500 cursor-not-allowed',
    checkbox:
      'size-4 rounded border-slate-300 text-slate-900 focus:ring-slate-900',
    compactDestructiveButton:
      'rounded-md border border-rose-300 px-2 py-1 text-xs font-semibold text-rose-700 transition hover:bg-rose-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#ff7b00] disabled:cursor-not-allowed disabled:opacity-50',
  },
  feedback: {
    errorBanner:   'rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700',
    emptyState:    'px-3 py-6 text-center text-slate-500',
    loadingState:  'px-3 py-6 text-center text-slate-500',
  },
  table: {
    wrapper:    'min-h-0 flex-1 overflow-hidden rounded-lg border border-slate-200 bg-white',
    mobileHint: 'border-b border-slate-200 px-3 py-2 text-xs font-medium uppercase tracking-wide text-slate-500 sm:hidden',
    scroll:     'overflow-x-auto',
    element:    'min-w-[48rem] divide-y divide-slate-200 text-sm lg:min-w-full',
    head:       'sticky top-0 bg-slate-100 text-left text-slate-700',
    th:         'whitespace-nowrap px-3 py-3 font-semibold',
    td:         'whitespace-nowrap px-3 py-2 align-top',
    row:        'divide-y divide-slate-100 bg-white text-slate-800',
  },
  drawer: {
    overlay: 'fixed inset-0 bg-black/25',
    shell:   'pointer-events-none fixed inset-y-0 right-0 flex w-full justify-end pl-0 sm:max-w-full sm:pl-10 lg:pl-16',
    panel:   'pointer-events-auto h-full w-full max-w-full transform transition duration-500 ease-in-out data-closed:translate-x-full sm:w-screen sm:max-w-md sm:duration-700',
    header:  'sticky top-0 z-10 flex justify-end px-4 pt-4 sm:px-6 sm:pt-6',
    body:    'flex-1 px-4 pb-6 sm:px-6 sm:pb-8',
    inner:   'mx-auto w-full max-w-sm space-y-8 sm:space-y-10',
  },
  modal: {
    overlay: 'fixed inset-0 z-[60] flex items-center justify-center bg-black/45 p-4',
    header:  'border-b border-slate-200 px-4 py-3',
    body:    'space-y-3 px-4 py-4 text-sm text-slate-700',
    footer:  'flex justify-end gap-2 border-t border-slate-200 px-4 py-3',
  },
  badge: {
    success: 'inline-flex rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-700',
    warning: 'inline-flex rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-700',
    blocked: 'inline-flex rounded-full bg-rose-100 px-2 py-0.5 text-xs font-semibold text-rose-700',
    info:    'inline-flex rounded-full bg-sky-100 px-2 py-0.5 text-xs font-semibold text-sky-700',
    neutral: 'inline-flex rounded-full bg-slate-200 px-2 py-0.5 text-xs font-semibold text-slate-700',
  },
}
