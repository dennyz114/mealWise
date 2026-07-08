import { Button } from '@/components/ui/button'

type EmptyStateProps = {
  icon: string
  title: string
  description: string
  actionLabel?: string
  onAction?: () => void
}

export const EmptyState = ({
  icon,
  title,
  description,
  actionLabel,
  onAction,
}: EmptyStateProps) => {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="mb-4 flex size-20 items-center justify-center rounded-[var(--radius-xl)] bg-[var(--color-accent-subtle)]">
        <i className={`ti ${icon} text-[40px] text-[var(--color-accent)]`} />
      </div>

      <h3 className="text-[17px] font-medium text-[var(--color-text-primary)]">
        {title}
      </h3>

      <p className="mt-1 max-w-[280px] text-[13px] text-[var(--color-text-secondary)]">
        {description}
      </p>

      {actionLabel && onAction && (
        <Button
          variant="secondary"
          onClick={onAction}
          className="mt-6"
        >
          <i className="ti ti-plus text-[16px]" />
          {actionLabel}
        </Button>
      )}
    </div>
  )
}
