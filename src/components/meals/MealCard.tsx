import type { Meal } from '@/types/meals'
import { useTranslation } from '@/hooks/useTranslation'
import { cn } from '@/lib/utils'

const formatRelativeTime = (dateString: string): string => {
  const now = Date.now()
  const then = new Date(dateString).getTime()
  const diffMs = now - then

  const minutes = Math.floor(diffMs / 60_000)
  if (minutes < 1) return 'just now'
  if (minutes < 60) return `${minutes}m ago`

  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`

  const days = Math.floor(hours / 24)
  if (days < 7) return `${days}d ago`

  const weeks = Math.floor(days / 7)
  if (weeks < 4) return `${weeks}w ago`

  const months = Math.floor(days / 30)
  if (months < 12) return `${months}mo ago`

  const years = Math.floor(months / 12)
  return `${years}y ago`
}

type MealCardProps = {
  meal: Meal
  ingredientCount: number
  onClick: () => void
  onDelete: () => void
  isDesktop: boolean
}

export const MealCard = ({
  meal,
  ingredientCount,
  onClick,
  onDelete,
  isDesktop,
}: MealCardProps) => {
  const { t } = useTranslation()

  const ingredientText =
    ingredientCount === 1
      ? t('meals.ingredientCount_one')
      : t('meals.ingredientCount', { count: ingredientCount })

  return (
    <div
      className={cn(
        'flex items-center gap-[var(--space-3)] rounded-[var(--radius-lg)] border-[0.5px] border-[var(--color-border-default)] bg-[var(--color-bg-primary)] p-3',
        'cursor-pointer transition-colors hover:bg-[var(--color-bg-secondary)]',
      )}
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          onClick()
        }
      }}
    >
      {/* Meal icon */}
      <div className="flex size-11 shrink-0 items-center justify-center rounded-full bg-[var(--color-accent-subtle)]">
        <i className={`ti ${meal.icon} text-lg text-[var(--color-accent)]`} />
      </div>

      {/* Meal info */}
      <div className="min-w-0 flex-1">
        <p className="truncate text-[15px] font-medium text-[var(--color-text-primary)]">
          {meal.name}
        </p>
        <p className="text-[12px] text-[var(--color-text-secondary)]">
          {ingredientText}
        </p>
        {isDesktop && (
          <p className="mt-0.5 text-[12px] text-[var(--color-text-tertiary)]">
            {t('meals.updatedAgo', { time: formatRelativeTime(meal.updatedAt) })}
          </p>
        )}
      </div>

      {/* Right side action */}
      {isDesktop ? (
        <button
          onClick={(e) => {
            e.stopPropagation()
            onDelete()
          }}
          className="flex size-10 shrink-0 items-center justify-center rounded-[var(--radius-md)] text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-secondary)] hover:text-[var(--color-cat-protein-text)]"
          aria-label="Delete meal"
        >
          <i className="ti ti-trash text-[18px]" />
        </button>
      ) : (
        <div className="flex size-10 shrink-0 items-center justify-center rounded-[var(--radius-md)] text-[var(--color-text-tertiary)]">
          <i className="ti ti-chevron-right text-[18px]" />
        </div>
      )}
    </div>
  )
}
