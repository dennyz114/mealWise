import { cn } from '@/lib/utils'

type StepProgressProps = {
  currentStep: number
  totalSteps: number
  className?: string
}

export const StepProgress = ({
  currentStep,
  totalSteps,
  className,
}: StepProgressProps) => {
  return (
    <div className={cn('flex items-center gap-1.5', className)}>
      {Array.from({ length: totalSteps }, (_, i) => (
        <div
          key={i}
          className={cn(
            'h-2 rounded-full transition-all duration-200',
            i === currentStep
              ? 'w-5 bg-[var(--color-accent)]'
              : 'w-2 bg-[var(--color-border-strong)]',
          )}
        />
      ))}
    </div>
  )
}
