import { type ReactNode } from 'react'
import * as Dialog from '@radix-ui/react-dialog'
import { useBreakpoint } from '@/hooks/useBreakpoint'

type BottomSheetProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  title?: string
  children: ReactNode
}

export const BottomSheet = ({ open, onOpenChange, title, children }: BottomSheetProps) => {
  const { isDesktop } = useBreakpoint()

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/50 data-[state=open]:animate-in" />
        <Dialog.Content
          className={[
            'fixed z-50 bg-[var(--color-bg-primary)] p-[var(--space-4)] focus:outline-none',
            isDesktop
              ? 'left-1/2 top-1/2 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-[var(--radius-xl)]'
              : 'bottom-0 left-0 right-0 max-h-[85vh] overflow-y-auto rounded-t-[20px]',
          ].join(' ')}
        >
          {!isDesktop && (
            <div className="mx-auto mb-4 h-1 w-9 rounded-full bg-[var(--color-border-strong)]" />
          )}

          <div className="mb-4 flex items-center justify-between">
            {title && (
              <Dialog.Title className="text-[17px] font-medium text-[var(--color-text-primary)]">
                {title}
              </Dialog.Title>
            )}
            {isDesktop && (
              <Dialog.Close asChild>
                <button
                  className="flex size-8 items-center justify-center rounded-[var(--radius-md)] text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-secondary)] hover:text-[var(--color-text-primary)]"
                  aria-label="Close"
                >
                  <i className="ti ti-x text-lg" />
                </button>
              </Dialog.Close>
            )}
          </div>

          {children}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
