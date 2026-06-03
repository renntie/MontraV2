import { useState, useEffect } from 'react'

/**
 * useMediaQuery - reactive media query hook
 * @param {string} query - CSS media query string
 * @returns {boolean}
 */
export const useMediaQuery = (query) => {
  const [matches, setMatches] = useState(() => {
    if (typeof window === 'undefined') return false
    return window.matchMedia(query).matches
  })

  useEffect(() => {
    const mql     = window.matchMedia(query)
    const handler = (e) => setMatches(e.matches)
    mql.addEventListener('change', handler)
    setMatches(mql.matches)
    return () => mql.removeEventListener('change', handler)
  }, [query])

  return matches
}

// Convenience hooks
export const useIsDesktop = () => useMediaQuery('(min-width: 1024px)')
export const useIsMobile  = () => useMediaQuery('(max-width: 1023px)')
