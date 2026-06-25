import { createFileRoute } from '@tanstack/react-router'
import { useTranslation } from '@/hooks/useTranslation'

export const Route = createFileRoute('/_authenticated/shopping')({
  component: ShoppingPage,
})

function ShoppingPage() {
  const { t } = useTranslation()

  return (
    <div className="p-4">
      <h1 className="text-lg font-medium text-[var(--color-text-primary)]">{t('nav.shopping')}</h1>
      <p className="mt-2 text-sm text-[var(--color-text-secondary)]">{t('common.comingSoon')}</p>
    </div>
  )
}
