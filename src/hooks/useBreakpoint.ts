import { useState, useEffect } from 'react'
import { BREAKPOINT } from '@/lib/constants'

export const useBreakpoint = () => {
  const [isDesktop, setIsDesktop] = useState(() =>
    window.matchMedia(`(min-width: ${BREAKPOINT}px)`).matches,
  )

  useEffect(() => {
    const mql = window.matchMedia(`(min-width: ${BREAKPOINT}px)`)
    const handler = (e: MediaQueryListEvent) => setIsDesktop(e.matches)

    mql.addEventListener('change', handler)
    return () => mql.removeEventListener('change', handler)
  }, [])

  return { isDesktop }
}
