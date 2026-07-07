import type { IngredientCategory } from '@/types/meals'
import { useTranslation } from '@/hooks/useTranslation'

const CATEGORY_STYLES: Record<
  IngredientCategory,
  { bg: string; text: string; icon: string }
> = {
  vegetables: {
    bg: 'var(--color-cat-veg-bg)',
    text: 'var(--color-cat-veg-text)',
    icon: 'ti-plant-2',
  },
  proteins: {
    bg: 'var(--color-cat-protein-bg)',
    text: 'var(--color-cat-protein-text)',
    icon: 'ti-meat',
  },
  pantry: {
    bg: 'var(--color-cat-pantry-bg)',
    text: 'var(--color-cat-pantry-text)',
    icon: 'ti-package',
  },
  fruits: {
    bg: 'var(--color-cat-fruit-bg)',
    text: 'var(--color-cat-fruit-text)',
    icon: 'ti-apple',
  },
  spices: {
    bg: 'var(--color-cat-spice-bg)',
    text: 'var(--color-cat-spice-text)',
    icon: 'ti-sparkles',
  },
  cleaning: {
    bg: 'var(--color-cat-clean-bg)',
    text: 'var(--color-cat-clean-text)',
    icon: 'ti-droplet',
  },
}

type CategoryBadgeProps = {
  category: IngredientCategory
}

export const CategoryBadge = ({ category }: CategoryBadgeProps) => {
  const { t } = useTranslation()
  const style = CATEGORY_STYLES[category] ?? CATEGORY_STYLES.pantry

  return (
    <span
      className="inline-flex items-center gap-1 rounded-[20px] px-[10px] py-[3px] text-[11px] font-medium"
      style={{ background: style.bg, color: style.text }}
    >
      <i className={`ti ${style.icon} text-[12px]`} />
      {t(`categories.${category}`)}
    </span>
  )
}
