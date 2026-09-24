import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline'

// Paginacion accesible: indicador de pagina + anterior/siguiente. Dos detalles que se pierden al
// recopiarla y aqui quedan garantizados:
//  - `nav` con `aria-label`: el lector anuncia el bloque como navegacion, no como dos botones sueltos.
//  - `aria-live="polite"` en el indicador: al cambiar de pagina el usuario OYE en que pagina quedo.
//
// Los textos entran por props (ya traducidos) porque cada listado nombra sus filas; el marcado no.
// Con una sola pagina no se pinta nada: un paginador que no lleva a ningun lado es ruido.
export function Pagination({ page, pageCount, label, info, prevLabel, nextLabel, onPrev, onNext, disabled = false }) {
  if (pageCount <= 1) return null

  const buttonClass =
    'ui-btn ui-btn-secondary ui-btn-sm'

  return (
    <nav aria-label={label} className="mt-4 flex flex-wrap items-center justify-between gap-4 text-sm">
      <p aria-live="polite" className="text-muted">
        {info}
      </p>
      <div className="flex items-center gap-2">
        <button type="button" onClick={onPrev} disabled={disabled || page <= 1} className={buttonClass}>
          <ChevronLeftIcon aria-hidden="true" className="size-4" />
          {prevLabel}
        </button>
        <button type="button" onClick={onNext} disabled={disabled || page >= pageCount} className={buttonClass}>
          {nextLabel}
          <ChevronRightIcon aria-hidden="true" className="size-4" />
        </button>
      </div>
    </nav>
  )
}

export default Pagination
