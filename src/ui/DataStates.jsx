import { ExclamationTriangleIcon, ArrowPathIcon } from '@heroicons/react/24/outline'
import { AppButton } from './AppButton.jsx'

// Los estados de una vista de datos, como primitivas: el marcado y la accesibilidad viven aqui una
// sola vez; el texto, el icono y la accion entran por props (ya traducidos) desde cada feature.

/**
 * Fallo de carga: mensaje y reintento. `role="alert"` hace que el lector lo anuncie sin que el usuario
 * tenga que ir a buscarlo; un error no puede quedarse en un parrafo de color.
 */
export function DataError({ title, message, onRetry, retryLabel }) {
  return (
    <div
      role="alert"
      className="flex flex-col items-center gap-4 rounded-xl border border-dashed border-border-strong p-10 text-center"
    >
      <span className="inline-flex size-12 items-center justify-center rounded-full bg-surface-muted text-warning">
        <ExclamationTriangleIcon aria-hidden="true" className="size-6" />
      </span>
      <h2 className="text-lg font-semibold text-content">{title}</h2>
      {message ? <p className="max-w-prose text-sm text-muted">{message}</p> : null}
      {onRetry ? (
        <AppButton variant="secondary" onClick={() => onRetry()}>
          <ArrowPathIcon aria-hidden="true" className="size-4" />
          {retryLabel}
        </AppButton>
      ) : null}
    </div>
  )
}

/** Vacio: no hay nada que mostrar y es un estado VALIDO, no un fallo. `children` es la accion sugerida. */
export function DataEmpty({ icon: Icon, title, body, children }) {
  return (
    <div className="flex flex-col items-center gap-4 rounded-xl border border-dashed border-border-strong p-12 text-center">
      {Icon ? (
        <span className="inline-flex size-12 items-center justify-center rounded-full bg-surface-muted text-muted">
          <Icon aria-hidden="true" className="size-6" />
        </span>
      ) : null}
      <div>
        <h2 className="text-lg font-semibold text-content">{title}</h2>
        {body ? <p className="mt-1 text-sm text-muted">{body}</p> : null}
      </div>
      {children}
    </div>
  )
}

/**
 * Carga: esqueleto de filas, no un spinner generico. Conserva la forma de lo que va a llegar, asi que
 * la pagina no salta al resolver. `label` es lo que oye el lector; `aria-busy` + `aria-live` lo
 * convierten en un estado anunciado y no en decoracion muda.
 */
export function RowsSkeleton({ rows = 6, label, avatar = true, trailing = false }) {
  return (
    <div aria-busy="true" aria-live="polite">
      <span className="sr-only">{label}</span>
      <ul className="divide-y divide-border" aria-hidden="true">
        {Array.from({ length: rows }).map((_, index) => (
          <li key={index} className="flex items-center gap-4 py-4">
            {avatar ? <div className="size-10 shrink-0 animate-pulse rounded-full bg-surface-muted" /> : null}
            <div className="flex-1 space-y-2">
              <div className="h-4 w-40 animate-pulse rounded bg-surface-muted" />
              <div className="h-3 w-56 animate-pulse rounded bg-surface-muted" />
            </div>
            {trailing ? <div className="h-6 w-20 shrink-0 animate-pulse rounded-full bg-surface-muted" /> : null}
          </li>
        ))}
      </ul>
    </div>
  )
}
