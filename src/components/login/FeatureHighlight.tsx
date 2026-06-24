import type { LucideIcon } from 'lucide-react'

type FeatureHighlightProps = {
  icon: LucideIcon
  iconBg: string
  title: string
  description?: string
}

export const FeatureHighlight = ({ icon: Icon, iconBg, title, description }: FeatureHighlightProps) => {
  return (
    <div className="flex items-center gap-4">
      <div
        className="flex size-12 shrink-0 items-center justify-center rounded-[var(--radius-lg)]"
        style={{ background: iconBg }}
      >
        <Icon className="size-6 text-white" />
      </div>
      <div>
        <p className="text-[15px] font-medium text-[var(--color-text-primary)]">{title}</p>
        {description && (
          <p className="text-[14px] text-[var(--color-text-secondary)]">{description}</p>
        )}
      </div>
    </div>
  )
}
