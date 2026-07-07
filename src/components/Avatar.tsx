import { cn } from '@/lib/utils'

type AvatarProps = {
  src?: string
  alt?: string
  displayName: string
  size?: 'sm' | 'md'
  color?: { bg: string; text: string }
  className?: string
}

const sizeClasses = {
  sm: 'size-8 text-sm',
  md: 'size-10 text-base',
}

export const Avatar = ({ src, alt, displayName, size = 'sm', color, className }: AvatarProps) => {
  const initial = displayName?.charAt(0)?.toUpperCase() ?? '?'

  if (src) {
    return (
      <img
        src={src}
        alt={alt ?? displayName}
        className={cn('rounded-full object-cover', sizeClasses[size], className)}
      />
    )
  }

  if (color) {
    return (
      <div
        className={cn(
          'inline-flex items-center justify-center rounded-full font-medium',
          sizeClasses[size],
          className,
        )}
        style={{ backgroundColor: color.bg, color: color.text }}
      >
        {initial}
      </div>
    )
  }

  return (
    <div
      className={cn(
        'inline-flex items-center justify-center rounded-full',
        'bg-[var(--color-accent-subtle)] font-medium text-[var(--color-accent)]',
        sizeClasses[size],
        className,
      )}
    >
      {initial}
    </div>
  )
}
