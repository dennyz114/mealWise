import { useState } from 'react'
import { useTranslation } from '@/hooks/useTranslation'
import { Button } from '@/components/ui/button'

type MealNameStepProps = {
  initialName: string
  onContinue: (name: string) => void
  onCancel: () => void
}

export const MealNameStep = ({
  initialName,
  onContinue,
  onCancel,
}: MealNameStepProps) => {
  const { t } = useTranslation()
  const [name, setName] = useState(initialName)

  const handleContinue = () => {
    if (name.trim()) {
      onContinue(name.trim())
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && name.trim()) {
      handleContinue()
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <label className="mb-1.5 block text-[13px] text-[var(--color-text-secondary)]">
          {t('meals.wizardMealName')}
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={t('meals.wizardNamePlaceholder')}
          className="w-full rounded-[var(--radius-md)] border-[0.5px] border-[var(--color-border-default)] bg-[var(--color-bg-primary)] px-3 py-2.5 text-[13px] text-[var(--color-text-primary)] outline-none placeholder:text-[var(--color-text-tertiary)] focus:border-[1.5px] focus:border-[var(--color-accent)]"
          autoFocus
        />
      </div>

      <p className="text-[12px] text-[var(--color-text-secondary)]">
        {t('meals.wizardNameHelper')}
      </p>

      <div className="space-y-2">
        <Button
          onClick={handleContinue}
          disabled={!name.trim()}
          className="w-full"
        >
          {t('meals.wizardContinue')}
        </Button>
        <Button
          variant="ghost"
          onClick={onCancel}
          className="w-full"
        >
          {t('meals.wizardCancel')}
        </Button>
      </div>
    </div>
  )
}
