export function formatCategory(slug) {
  return slug
    .replace(/-/g, ' ')
    .replace(/\b\w/g, c => c.toUpperCase())
}

export function formatFilename(filename) {
  // Remove leading "01-" / "01a-" number prefix, then title-case
  return filename
    .replace(/^\d+[a-z]?-/, '')
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}
