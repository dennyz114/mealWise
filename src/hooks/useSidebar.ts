import { useState, useCallback } from 'react'
import { SIDEBAR_STORAGE_KEY } from '@/lib/constants'

export const useSidebar = () => {
  const [isExpanded, setIsExpanded] = useState(() => {
    const stored = localStorage.getItem(SIDEBAR_STORAGE_KEY)
    return stored === 'true'
  })

  const toggle = useCallback(() => {
    setIsExpanded((prev) => {
      const next = !prev
      localStorage.setItem(SIDEBAR_STORAGE_KEY, String(next))
      return next
    })
  }, [])

  return { isExpanded, toggle }
}
