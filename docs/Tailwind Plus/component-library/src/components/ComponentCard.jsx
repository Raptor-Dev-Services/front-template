import { useState, Suspense } from 'react'
import ErrorBoundary from './ErrorBoundary.jsx'

const OVERLAY_PATH = '/overlays/'

function Spinner() {
  return (
    <div className="flex items-center justify-center gap-2 py-10 text-sm text-slate-400">
      <svg className="size-4 animate-spin" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
      </svg>
      Cargando…
    </div>
  )
}

function LaunchPlaceholder({ name, onLaunch }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-14">
      <svg className="size-10 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.347a1.125 1.125 0 0 1 0 1.972l-11.54 6.347a1.125 1.125 0 0 1-1.667-.986V5.653Z" />
      </svg>
      <p className="text-xs text-slate-400">Componente de capa — se abre al hacer clic</p>
      <button
        type="button"
        onClick={onLaunch}
        className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-700"
      >
        Abrir {name}
      </button>
    </div>
  )
}

export default function ComponentCard({ item }) {
  const [showCode, setShowCode] = useState(false)
  const [copied, setCopied] = useState(false)
  const [launched, setLaunched] = useState(false)
  const [resetKey, setResetKey] = useState(0)
  const Component = item.component

  const isOverlay = item.path.includes(OVERLAY_PATH)

  function handleReset() {
    setLaunched(false)
    setResetKey(k => k + 1)
  }

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(item.source)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Clipboard API not available
    }
  }

  return (
    <div className="flex flex-col rounded-xl border border-slate-200 bg-white shadow-sm" style={{ borderLeft: '4px solid #ff6100' }}>
      {/* Preview */}
      <div className="component-preview">
        {isOverlay && !launched ? (
          <LaunchPlaceholder name={item.name} onLaunch={() => setLaunched(true)} />
        ) : (
          <ErrorBoundary name={item.name}>
            <Suspense fallback={<Spinner />}>
              <Component key={resetKey} />
            </Suspense>
          </ErrorBoundary>
        )}
      </div>

      {/* Footer bar */}
      <div className="flex shrink-0 items-center justify-between border-t border-slate-100 bg-slate-50 px-4 py-2.5">
        <span className="text-sm font-medium text-slate-700">{item.name}</span>
        <div className="flex items-center gap-4">
          {isOverlay && launched && (
            <button
              type="button"
              onClick={handleReset}
              className="text-xs text-slate-400 transition hover:text-slate-600"
            >
              ↺ Reset
            </button>
          )}
          <button
            type="button"
            onClick={() => setShowCode(v => !v)}
            className="text-xs font-medium text-slate-400 transition hover:text-[#ff6100]"
          >
            {showCode ? '↑ Ocultar código' : '↓ Ver código'}
          </button>
        </div>
      </div>

      {/* Code block */}
      {showCode && (
        <div className="shrink-0 border-t border-slate-200">
          <div className="flex items-center justify-between bg-slate-800 px-4 py-2">
            <span className="font-mono text-xs text-slate-400">{item.filename}.jsx</span>
            <button
              type="button"
              onClick={handleCopy}
              className="text-xs text-slate-400 transition hover:text-white"
            >
              {copied ? '✓ Copiado' : 'Copiar'}
            </button>
          </div>
          <pre className="max-h-72 overflow-auto bg-slate-950 p-4 text-xs leading-relaxed text-slate-300">
            <code>{item.source}</code>
          </pre>
        </div>
      )}
    </div>
  )
}
