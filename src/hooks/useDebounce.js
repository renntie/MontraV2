import { useState, useEffect } from 'react'

/**
 * useDebounce - delays value update
 * @param {*}      value - value to debounce
 * @param {number} delay - delay in ms (default 350)
 */
export const useDebounce = (value, delay = 350) => {
  const [debouncedValue, setDebouncedValue] = useState(value)

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay)
    return () => clearTimeout(timer)
  }, [value, delay])

  return debouncedValue
}
