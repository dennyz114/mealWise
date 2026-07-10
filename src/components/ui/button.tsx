import { type ButtonHTMLAttributes } from 'react'
import { Loader2 } from 'lucide-react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 rounded-[var(--radius-md)] border border-[var(--color-border-strong)] bg-[var(--color-bg-primary)] px-4 py-2 font-medium transition-colors disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        primary:
          'bg-[var(--color-accent)] text-white hover:bg-[var(--color-accent-hover)]',
        secondary:
          'text-[var(--color-text-primary)] hover:bg-[var(--color-bg-secondary)]',
        success:
          'bg-[#0D9488] text-white border-[#0D9488] hover:bg-[#0F766E]',
        ghost:
          'border-transparent bg-transparent text-[var(--color-text-primary)] hover:bg-[var(--color-bg-secondary)]',
        'icon-only':
          'size-10 p-0 text-[var(--color-text-primary)] hover:bg-[var(--color-bg-secondary)]',
      },
    },
    defaultVariants: {
      variant: 'primary',
    },
  }
)

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof buttonVariants> & {
    icon?: React.ComponentType<{ className?: string }>
    isLoading?: boolean
    tooltip?: string
  }

export const Button = ({
  className,
  variant,
  icon: Icon,
  isLoading = false,
  tooltip,
  disabled,
  children,
  ...props
}: ButtonProps) => {
  const isDisabled = disabled || isLoading

  const button = (
    <button
      className={cn(buttonVariants({ variant, className }))}
      disabled={isDisabled}
      aria-disabled={isDisabled}
      aria-label={tooltip}
      {...props}
    >
      {isLoading ? (
        <Loader2 className="size-4 animate-spin" />
      ) : Icon ? (
        <Icon className="size-4" />
      ) : null}
      {children}
    </button>
  )

  if (variant === 'icon-only' && tooltip && !isLoading) {
    return (
      <div className="relative inline-flex group">
        {button}
        <div className="pointer-events-none absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-[var(--radius-sm)] bg-[var(--color-text-primary)] px-2 py-1 text-[11px] text-[var(--color-bg-primary)] opacity-0 transition-opacity group-hover:opacity-100">
          {tooltip}
        </div>
      </div>
    )
  }

  return button
}
