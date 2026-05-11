import { useState, useMemo, useEffect } from 'react'
import { registry, categories, totalComponents } from './registry.js'
import { formatCategory } from './utils.js'
import Sidebar from './components/Sidebar.jsx'
import ComponentCard from './components/ComponentCard.jsx'

function parseHash() {
  const hash = window.location.hash.slice(1) // remove '#'
  const [cat, sub] = hash.split('/')
  return { cat: cat || null, sub: sub || null }
}

function buildHash(cat, sub) {
  return sub ? `#${cat}/${sub}` : `#${cat}`
}

export default function App() {
  const initial = parseHash()
  const [activeCategory, setActiveCategory] = useState(
    (initial.cat && categories.includes(initial.cat)) ? initial.cat : categories[0]
  )
  const [activeSubcategory, setActiveSubcategory] = useState(
    (initial.sub && registry[initial.cat]?.[initial.sub]) ? initial.sub : null
  )
  const [search, setSearch] = useState('')

  // Sync state → URL hash
  useEffect(() => {
    const newHash = buildHash(activeCategory, activeSubcategory)
    if (window.location.hash !== newHash) {
      history.replaceState(null, '', newHash)
    }
  }, [activeCategory, activeSubcategory])

  // Sync URL hash → state (browser back/forward)
  useEffect(() => {
    function onHashChange() {
      const { cat, sub } = parseHash()
      if (cat && categories.includes(cat)) {
        setActiveCategory(cat)
        setActiveSubcategory((sub && registry[cat]?.[sub]) ? sub : null)
        setSearch('')
      }
    }
    window.addEventListener('hashchange', onHashChange)
    return () => window.removeEventListener('hashchange', onHashChange)
  }, [])

  const categoryData = registry[activeCategory] || {}

  // Filter by search query within the current category
  const filteredData = useMemo(() => {
    if (!search.trim()) return categoryData
    const q = search.toLowerCase()
    const result = {}
    for (const [sub, items] of Object.entries(categoryData)) {
      const filtered = items.filter(item => item.name.toLowerCase().includes(q))
      if (filtered.length > 0) result[sub] = filtered
    }
    return result
  }, [categoryData, search])

  // Which subcategories to show (all, or just the active one)
  const visibleSubcategories = useMemo(() => {
    const keys = Object.keys(filteredData)
    if (activeSubcategory && keys.includes(activeSubcategory)) return [activeSubcategory]
    return keys
  }, [filteredData, activeSubcategory])

  const visibleCount = useMemo(
    () => visibleSubcategories.reduce((acc, sub) => acc + (filteredData[sub]?.length ?? 0), 0),
    [visibleSubcategories, filteredData],
  )

  const rawCategoryCount = useMemo(
    () => Object.values(categoryData).reduce((acc, items) => acc + items.length, 0),
    [categoryData],
  )

  function handleSelectCategory(cat) {
    history.pushState(null, '', buildHash(cat, null))
    setActiveCategory(cat)
    setActiveSubcategory(null)
    setSearch('')
  }

  function handleSelectSubcategory(sub) {
    history.pushState(null, '', buildHash(activeCategory, sub))
    setActiveSubcategory(sub)
  }

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      <Sidebar
        categories={categories}
        activeCategory={activeCategory}
        activeSubcategory={activeSubcategory}
        registry={registry}
        totalComponents={totalComponents}
        onSelectCategory={handleSelectCategory}
        onSelectSubcategory={handleSelectSubcategory}
      />

      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top bar */}
        <header className="shrink-0 border-b border-slate-200 bg-white/95 backdrop-blur-sm">
          <div className="flex items-center gap-4 px-6 py-3">
            <div>
              <h1 className="text-base font-semibold text-slate-900">
                {formatCategory(activeCategory)}
              </h1>
              <p className="text-xs text-slate-400">
                {visibleCount}
                {search && ` de ${rawCategoryCount}`}{' '}
                {visibleCount === 1 ? 'componente' : 'componentes'}
                {activeSubcategory && ` · ${formatCategory(activeSubcategory)}`}
              </p>
            </div>

            <input
              type="search"
              placeholder="Buscar en esta categoría…"
              value={search}
              onChange={e => {
                setSearch(e.target.value)
                setActiveSubcategory(null)
              }}
              className="ml-auto w-60 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 placeholder-slate-400 transition focus:border-slate-300 focus:bg-white focus:outline-none"
            />
          </div>
        </header>

        {/* Component grid */}
        <main className="flex-1 overflow-y-auto px-6 py-8">
          {visibleSubcategories.length === 0 ? (
            <div className="flex items-center justify-center py-24 text-sm text-slate-400">
              {search
                ? `Sin resultados para "${search}" en ${formatCategory(activeCategory)}`
                : 'No hay componentes en esta categoría'}
            </div>
          ) : (
            <div className="space-y-14">
              {visibleSubcategories.map(sub => (
                <section key={sub} id={sub}>
                  {/* Subcategory heading */}
                  <div className="mb-5 flex items-baseline gap-3 border-b border-slate-200 pb-3">
                    <h2 className="text-sm font-semibold text-slate-800">
                      {formatCategory(sub)}
                    </h2>
                    <span className="text-xs text-slate-400">
                      {filteredData[sub].length}{' '}
                      {filteredData[sub].length === 1 ? 'componente' : 'componentes'}
                    </span>
                  </div>

                  {/* 2-column grid on wide screens */}
                  <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
                    {filteredData[sub].map(item => (
                      <ComponentCard key={item.path} item={item} />
                    ))}
                  </div>
                </section>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
