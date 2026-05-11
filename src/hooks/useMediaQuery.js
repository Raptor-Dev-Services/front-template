import { useEffect, useState } from 'react'

function getMatches(query) {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return false
  return window.matchMedia(query).matches
}

export default function useMediaQuery(query) {
  const [matches, setMatches] = useState(() => getMatches(query))

  useEffect(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return undefined
    const mql = window.matchMedia(query)
    const handleChange = (e) => setMatches(e.matches)
    setMatches(mql.matches)
    mql.addEventListener('change', handleChange)
    return () => mql.removeEventListener('change', handleChange)
  }, [query])

  return matches
}
