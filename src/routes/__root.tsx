import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createRootRoute, Outlet } from '@tanstack/react-router'
import { TranslationProvider } from '@/components/TranslationProvider'

const queryClient = new QueryClient()

export const Route = createRootRoute({
  component: () => (
    <TranslationProvider>
      <QueryClientProvider client={queryClient}>
        <Outlet />
      </QueryClientProvider>
    </TranslationProvider>
  ),
})
