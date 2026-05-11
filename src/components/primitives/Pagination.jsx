import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/20/solid'
import { cx } from '../../styles/designSystem'

export default function Pagination({ page, totalPages, onPageChange, loading }) {
  if (totalPages <= 1) return null

  const pages = buildPageList(page, totalPages)

  return (
    <nav className="flex items-center justify-center gap-1" aria-label="Paginación">
      <PageBtn
        onClick={() => onPageChange(page - 1)}
        disabled={page <= 1 || loading}
        aria-label="Página anterior"
      >
        <ChevronLeftIcon className="size-4" />
      </PageBtn>

      {pages.map((p, i) =>
        p === '…' ? (
          <span key={`ellipsis-${i}`} className="px-2 text-sm text-slate-400 select-none">…</span>
        ) : (
          <PageBtn
            key={p}
            onClick={() => onPageChange(p)}
            active={p === page}
            disabled={loading}
          >
            {p}
          </PageBtn>
        )
      )}

      <PageBtn
        onClick={() => onPageChange(page + 1)}
        disabled={page >= totalPages || loading}
        aria-label="Página siguiente"
      >
        <ChevronRightIcon className="size-4" />
      </PageBtn>
    </nav>
  )
}

function PageBtn({ onClick, disabled, active, children, ...rest }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cx(
        'inline-flex size-8 items-center justify-center rounded-md text-sm font-medium transition',
        'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#ff7b00]',
        'disabled:cursor-not-allowed disabled:opacity-40',
        active
          ? 'bg-slate-900 text-white'
          : 'text-slate-700 hover:bg-slate-100',
      )}
      {...rest}
    >
      {children}
    </button>
  )
}

function buildPageList(current, total) {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1)
  const pages = []
  const add = (p) => { if (!pages.includes(p)) pages.push(p) }

  add(1)
  if (current > 4) pages.push('…')
  for (let p = Math.max(2, current - 1); p <= Math.min(total - 1, current + 1); p++) add(p)
  if (current < total - 3) pages.push('…')
  add(total)

  return pages
}
