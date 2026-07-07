import { useState, useRef, type ReactNode, type TouchEvent } from 'react'
import { cn } from '@/lib/utils'

const SWIPE_THRESHOLD = 80

type SwipeableCardProps = {
  children: ReactNode
  onDelete: () => void
}

export const SwipeableCard = ({ children, onDelete }: SwipeableCardProps) => {
  const [translateX, setTranslateX] = useState(0)
  const [isRevealed, setIsRevealed] = useState(false)
  const [isSwiping, setIsSwiping] = useState(false)
  const touchStartX = useRef(0)
  const touchCurrentX = useRef(0)

  const handleTouchStart = (e: TouchEvent) => {
    const touch = e.touches[0]
    if (!touch) return
    touchStartX.current = touch.clientX
    setIsSwiping(true)
  }

  const handleTouchMove = (e: TouchEvent) => {
    if (!isSwiping) return

    const touch = e.touches[0]
    if (!touch) return
    touchCurrentX.current = touch.clientX
    const diff = touchStartX.current - touchCurrentX.current

    if (diff > 0) {
      setTranslateX(Math.min(diff, 100))
    } else {
      setTranslateX(0)
    }
  }

  const handleTouchEnd = () => {
    setIsSwiping(false)
    const diff = touchStartX.current - touchCurrentX.current

    if (diff >= SWIPE_THRESHOLD) {
      setTranslateX(80)
      setIsRevealed(true)
    } else {
      setTranslateX(0)
      setIsRevealed(false)
    }
  }

  const handleDeleteTap = () => {
    onDelete()
    setTranslateX(0)
    setIsRevealed(false)
  }

  return (
    <div className="relative overflow-hidden rounded-[var(--radius-lg)]">
      {/* Delete background */}
      <div
        className="absolute right-0 top-0 flex size-full items-center justify-center bg-[#dc2626]"
        style={{ width: 80 }}
      >
        {isRevealed && (
          <button
            onClick={handleDeleteTap}
            className="flex size-full items-center justify-center text-white"
            aria-label="Delete"
          >
            <i className="ti ti-trash text-[20px]" />
          </button>
        )}
      </div>

      {/* Card content */}
      <div
        className={cn(
          'relative z-10 bg-[var(--color-bg-primary)]',
          !isSwiping && 'transition-transform duration-200 ease-out',
        )}
        style={{ transform: `translateX(-${translateX}px)` }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {children}
      </div>
    </div>
  )
}
