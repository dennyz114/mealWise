import { Link } from '@tanstack/react-router'
import { NAV_ITEMS, SIDEBAR_WIDTH_COLLAPSED, SIDEBAR_WIDTH_EXPANDED } from '@/lib/constants'
import { useSidebar } from '@/hooks/useSidebar'
import { useTranslation } from '@/hooks/useTranslation'
import { cn } from '@/lib/utils'
import type { Household } from '@/types/household'

type SidebarProps = {
  household?: Household | null
}

const navTranslationKeys: Record<string, string> = {
  '/meals': 'nav.meals',
  '/planner': 'nav.planner',
  '/shopping': 'nav.shopping',
}

export const Sidebar = ({ household }: SidebarProps) => {
  const { isExpanded, toggle } = useSidebar()
  const { t } = useTranslation()
  const width = isExpanded ? SIDEBAR_WIDTH_EXPANDED : SIDEBAR_WIDTH_COLLAPSED
  const hasHousehold = !!household

  return (
    <aside
      className="hidden flex-shrink-0 flex-col border-r border-[var(--color-border-default)] bg-[var(--color-bg-primary)] transition-[width] duration-200 md:flex"
      style={{ width }}
    >
      <button
        onClick={toggle}
        className="flex h-12 items-center justify-center text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
        aria-label={isExpanded ? 'Collapse sidebar' : 'Expand sidebar'}
      >
        <i className={`ti ti-chevron-${isExpanded ? 'left' : 'right'} text-lg`} />
      </button>

      <nav className="flex flex-col gap-1 px-2">
        {NAV_ITEMS.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            activeProps={{
              className: 'bg-[var(--color-accent-subtle)] font-medium text-[var(--color-accent)]',
            }}
            inactiveProps={{
              className: 'text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-secondary)] hover:text-[var(--color-text-primary)]',
            }}
            className={cn(
              'flex items-center gap-3 rounded-[var(--radius-md)] px-3 py-2.5 text-sm transition-colors',
              !hasHousehold && 'pointer-events-none opacity-40',
            )}
          >
            <i className={`ti ${item.icon} text-lg`} />
            {isExpanded && <span>{t(navTranslationKeys[item.path] ?? '')}</span>}
          </Link>
        ))}
      </nav>
    </aside>
  )
}