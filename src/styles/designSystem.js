// designSystem.js - punto de entrada del design system en JS.
//
// Los tokens viven en src/index.css (@theme) con su espejo en ./tokens.js, y se consumen como
// utilidades semanticas (bg-surface, text-content, border-border, bg-primary...) o a traves de las
// primitivas de src/ui y sus clases .ui-*. Aqui solo queda el helper de clases condicionales.

/** Une clases condicionales, descartando las falsy: cx('a', cond && 'b'). */
export function cx(...classes) {
  return classes.filter(Boolean).join(' ')
}
