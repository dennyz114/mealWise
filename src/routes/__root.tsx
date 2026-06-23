import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createRootRoute, Outlet } from '@tanstack/react-router'
import { ThemeToggle } from '@/components/ThemeToggle'

const queryClient = new QueryClient()

export const Route = createRootRoute({
  component: () => (
    <QueryClientProvider client={queryClient}>
      <div className="flex min-h-dvh flex-col">
        <Outlet />
      </div>
      <ThemeToggle />
    </QueryClientProvider>
  ),
})
