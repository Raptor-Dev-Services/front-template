import { Container } from './Container.jsx'

/**
 * Ilustracion neutra de la pantalla de error: una ventana con un enchufe desconectado. Decorativa
 * (aria-hidden): el mensaje lo dan el titulo y el cuerpo. Pinta con currentColor y tokens, asi que
 * sigue al tema sin variantes propias. Flota despacio (.ui-float) y se queda quieta con
 * prefers-reduced-motion.
 */
function ErrorIllustration() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 160 120"
      className="ui-float h-28 w-auto text-muted"
      fill="none"
      stroke="currentColor"
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="12" y="10" width="136" height="92" rx="12" className="fill-surface-muted" />
      <path d="M12 30h136" />
      <circle cx="26" cy="20" r="2.5" className="fill-current" />
      <circle cx="36" cy="20" r="2.5" className="fill-current" />
      <circle cx="46" cy="20" r="2.5" className="fill-current" />
      <path d="M40 68h22l6-10h6" />
      <path d="M74 52v12M74 64h-4" />
      <rect x="74" y="50" width="10" height="18" rx="3" />
      <path d="M120 68H98l-6 10" />
      <rect x="92" y="60" width="10" height="16" rx="3" />
      <path d="M86 58l4-4M86 70l4 4" />
    </svg>
  )
}

/**
 * ErrorScreen - la pantalla que ve el usuario cuando algo se rompio, en sus dos formas: un error
 * inesperado durante el render (ErrorBoundary) y una ruta que no existe (NotFoundPage). Para el
 * usuario son el mismo momento, asi que comparten esta vista (regla `error-screens`): que no fue culpa
 * suya, QUE fallo exactamente, y una salida en forma de boton.
 *
 * `technicalMessage` es lo unico que distingue a las dos formas: un 404 no tiene excepcion que
 * mostrar; un error de render si, y esconderlo "porque asusta" le quita a quien reporta el bug la
 * posibilidad de mandar una captura util.
 */
export function ErrorScreen({ eyebrow, title, body, technicalMessage, action }) {
  return (
    <section className="flex min-h-[70vh] items-center py-16">
      <Container className="text-center">
        <div className="flex justify-center">
          <ErrorIllustration />
        </div>
        <span className="ui-pill mt-6 inline-flex">{eyebrow}</span>
        <h1 className="mx-auto mt-5 max-w-2xl text-3xl font-bold tracking-tight text-content text-balance sm:text-4xl">
          {title}
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-lg leading-8 text-muted text-pretty">{body}</p>
        {technicalMessage ? (
          <div role="alert" data-tone="danger" className="ui-alert mx-auto mt-6 max-w-xl break-words text-left font-mono">
            {technicalMessage}
          </div>
        ) : null}
        <div className="mt-8 flex justify-center">{action}</div>
      </Container>
    </section>
  )
}

export default ErrorScreen
