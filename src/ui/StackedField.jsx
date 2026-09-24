// StackedField - par etiqueta:valor (dt/dd) con el que una tabla colapsa a tarjetas en movil. Debe ir
// dentro de un <dl>. La etiqueta es el mismo encabezado de columna, traducido.
//  - Horizontal por defecto (etiqueta a la izquierda, valor a la derecha).
//  - `vertical` para valores largos.
export function StackedField({ label, children, vertical = false }) {
  if (vertical) {
    return (
      <div>
        <dt className="text-xs font-medium uppercase tracking-wide text-muted">{label}</dt>
        <dd className="mt-0.5 break-words text-sm text-content">{children}</dd>
      </div>
    )
  }

  return (
    <div className="flex items-baseline justify-between gap-4">
      <dt className="shrink-0 text-xs font-medium uppercase tracking-wide text-muted">{label}</dt>
      <dd className="min-w-0 break-words text-right text-sm text-content">{children}</dd>
    </div>
  )
}

export default StackedField
