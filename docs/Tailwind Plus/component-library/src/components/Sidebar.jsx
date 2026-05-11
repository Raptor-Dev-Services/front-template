import {
  CubeIcon,
  ViewColumnsIcon,
  PencilSquareIcon,
  Bars3Icon,
  RectangleGroupIcon,
  BellAlertIcon,
  TableCellsIcon,
  ChartBarIcon,
  DocumentTextIcon,
  ComputerDesktopIcon,
  DocumentDuplicateIcon,
} from '@heroicons/react/24/outline'
import { formatCategory } from '../utils.js'

const ICONS = {
  'elements': CubeIcon,
  'layout': ViewColumnsIcon,
  'forms': PencilSquareIcon,
  'navigation': Bars3Icon,
  'overlays': RectangleGroupIcon,
  'feedback': BellAlertIcon,
  'lists': TableCellsIcon,
  'data-display': ChartBarIcon,
  'headings': DocumentTextIcon,
  'application-shells': ComputerDesktopIcon,
  'page-examples': DocumentDuplicateIcon,
}

function catCount(categoryData) {
  return Object.values(categoryData).reduce((acc, items) => acc + items.length, 0)
}

export default function Sidebar({
  categories,
  activeCategory,
  activeSubcategory,
  registry,
  totalComponents,
  onSelectCategory,
  onSelectSubcategory,
}) {
  return (
    <aside className="flex w-72 shrink-0 flex-col overflow-hidden bg-slate-900">
      {/* Logo */}
      <div className="shrink-0 border-b border-slate-700/50 px-4 py-4">
        <div className="flex items-center gap-3">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-[#ff6100]">
            <CubeIcon className="size-5 text-white" />
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-white">Component Library</p>
            <p className="text-xs text-slate-400">Tailwind Plus · React</p>
          </div>
        </div>
      </div>

      {/* Category nav */}
      <nav className="flex-1 overflow-y-auto px-2 py-3">
        <p className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
          Application UI v4
        </p>
        <div className="space-y-0.5">
          {categories.map(cat => {
            const isActive = cat === activeCategory
            const Icon = ICONS[cat] ?? CubeIcon
            const subcategories = Object.keys(registry[cat] || {})
            const count = catCount(registry[cat] || {})

            return (
              <div key={cat}>
                {/* Category button */}
                <button
                  type="button"
                  onClick={() => onSelectCategory(cat)}
                  className={`flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-sm transition ${
                    isActive
                      ? 'bg-white/10 font-medium text-white'
                      : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'
                  }`}
                >
                  <Icon className="size-4 shrink-0" />
                  <span className="flex-1 text-left">{formatCategory(cat)}</span>
                  <span className={`tabular-nums text-xs ${isActive ? 'text-slate-400' : 'text-slate-600'}`}>
                    {count}
                  </span>
                </button>

                {/* Subcategory list (visible only when this category is active) */}
                {isActive && (
                  <div className="mb-1 ml-9 mt-0.5 space-y-0.5">
                    <button
                      type="button"
                      onClick={() => onSelectSubcategory(null)}
                      className={`w-full rounded-md px-3 py-1.5 text-left text-xs transition ${
                        activeSubcategory === null
                          ? 'font-semibold text-[#ff6100]'
                          : 'text-slate-500 hover:text-slate-300'
                      }`}
                    >
                      Todos
                    </button>
                    {subcategories.map(sub => (
                      <button
                        key={sub}
                        type="button"
                        onClick={() => onSelectSubcategory(sub)}
                        className={`flex w-full items-center justify-between rounded-md px-3 py-1.5 text-xs transition ${
                          activeSubcategory === sub
                            ? 'font-semibold text-[#ff6100]'
                            : 'text-slate-500 hover:text-slate-300'
                        }`}
                      >
                        <span>{formatCategory(sub)}</span>
                        <span className="tabular-nums text-slate-600">{registry[cat][sub].length}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </nav>

      {/* Footer */}
      <div className="shrink-0 border-t border-slate-700/50 px-4 py-3">
        <p className="text-xs text-slate-500">{totalComponents} componentes en total</p>
      </div>
    </aside>
  )
}
