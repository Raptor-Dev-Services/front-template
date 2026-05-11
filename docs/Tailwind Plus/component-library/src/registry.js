import { lazy } from 'react'
import { formatFilename } from './utils.js'

// Extract category / subcategory / filename from a glob path
function parsePath(fullPath) {
  const match = fullPath.match(/\/react\/([^/]+)\/([^/]+)\/([^/]+)\.jsx$/)
  if (!match) return null
  return { category: match[1], subcategory: match[2], filename: match[3] }
}

// Lazy-load component modules (loaded on demand when category is visited)
const loaders = import.meta.glob('../../application-ui-v4/react/**/*.jsx')

// Eagerly load raw source strings (text only, fast)
const sources = import.meta.glob('../../application-ui-v4/react/**/*.jsx', {
  eager: true,
  query: '?raw',
  import: 'default',
})

const CATEGORY_ORDER = [
  'elements',
  'layout',
  'forms',
  'navigation',
  'overlays',
  'feedback',
  'lists',
  'data-display',
  'headings',
  'application-shells',
  'page-examples',
]

export const registry = {}

for (const [path, loader] of Object.entries(loaders)) {
  const info = parsePath(path)
  if (!info) continue

  const { category, subcategory, filename } = info

  if (!registry[category]) registry[category] = {}
  if (!registry[category][subcategory]) registry[category][subcategory] = []

  registry[category][subcategory].push({
    name: formatFilename(filename),
    filename,
    component: lazy(loader),
    source: sources[path] ?? '',
    path,
  })
}

export const categories = Object.keys(registry).sort((a, b) => {
  const ai = CATEGORY_ORDER.indexOf(a)
  const bi = CATEGORY_ORDER.indexOf(b)
  if (ai === -1 && bi === -1) return a.localeCompare(b)
  if (ai === -1) return 1
  if (bi === -1) return -1
  return ai - bi
})

export const totalComponents = Object.values(registry).reduce(
  (total, cat) => total + Object.values(cat).reduce((t, items) => t + items.length, 0),
  0,
)
