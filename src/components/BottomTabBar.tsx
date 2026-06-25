import { Link } from '@tanstack/react-router'
import { NAV_ITEMS } from '@/lib/constants'
import { cn } from '@/lib/utils'

export const BottomTabBar = () => {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 flex border-t border-[var(--color-border-default)] bg-[var(--color-bg-primary)] pb-[env(safe-area-inset-bottom)] md:hidden">
      {NAV_ITEMS.map((item) => (
        <Link
          key={item.path}
          to={item.path}
          activeProps={{
            className: 'border-[var(--color-accent)] font-medium text-[var(--color-accent)]',
          }}
          inactiveProps={{
            className: 'border-transparent text-[var(--color-text-secondary)]',
          }}
          className={cn(
            'flex flex-1 flex-col items-center gap-0.5 border-t-2 py-2 text-xs transition-colors',
          )}
        >
          <i className={`ti ${item.icon} text-xl`} />
          <span>{item.label}</span>
        </Link>
      ))}
    </nav>
  )
}
