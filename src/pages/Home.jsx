import { Link } from 'react-router-dom'
import { ui } from '../styles/designSystem'

export default function Home() {
  return (
    <section className={ui.layout.appSection}>
      <div className="flex flex-col gap-2">
        <h1 className={ui.typography.heroTitle}>front-template</h1>
        <p className={ui.typography.body}>
          Plantilla base para aplicaciones React + Vite + Tailwind CSS 4 siguiendo los patrones del design system.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className={`${ui.surface.panel} p-5`}>
          <h2 className={ui.typography.cardTitle}>Módulo de ejemplo</h2>
          <p className={`mt-1 ${ui.typography.body}`}>
            CRUD completo de usuarios conectado al back-template. Patrón service → hook → page → Desktop/Mobile.
          </p>
          <div className="mt-4">
            <Link to="/app/example/users" className={ui.controls.accentButton}>
              Ver usuarios
            </Link>
          </div>
        </div>

        <div className={`${ui.surface.panel} p-5`}>
          <h2 className={ui.typography.cardTitle}>Design System</h2>
          <p className={`mt-1 ${ui.typography.body}`}>
            Tokens centralizados en <code className="rounded bg-slate-100 px-1 text-xs">src/styles/designSystem.js</code>.
            Importa <code className="rounded bg-slate-100 px-1 text-xs">ui</code> y <code className="rounded bg-slate-100 px-1 text-xs">cx</code>.
          </p>
        </div>

        <div className={`${ui.surface.panel} p-5`}>
          <h2 className={ui.typography.cardTitle}>Componentes compartidos</h2>
          <p className={`mt-1 ${ui.typography.body}`}>
            RecordEditModal, MasterActionModal, AppNotification, Modal, FormField, Pagination en <code className="rounded bg-slate-100 px-1 text-xs">src/components/</code>.
          </p>
        </div>
      </div>
    </section>
  )
}
