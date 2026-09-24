import { cx } from '../styles/designSystem.js'

// SectionHeading - encabezado consistente: eyebrow opcional + titulo + subtitulo + acciones. Es el
// encabezado de pagina del panel: la jerarquia la da la tipografia, no una caja alrededor.
export function SectionHeading({ eyebrow, title, subtitle, actions, as: TitleTag = 'h1', id, className = '' }) {
  return (
    <header className={cx('flex flex-wrap items-start justify-between gap-4', className)}>
      <div className="min-w-0 max-w-2xl">
        {eyebrow ? <span className="ui-eyebrow">{eyebrow}</span> : null}
        <TitleTag id={id} className={cx('text-2xl font-bold tracking-tight text-content text-balance', eyebrow && 'mt-2')}>
          {title}
        </TitleTag>
        {subtitle ? <p className="mt-2 text-muted text-pretty">{subtitle}</p> : null}
      </div>
      {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
    </header>
  )
}

export default SectionHeading
