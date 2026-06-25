import { createFileRoute, redirect } from '@tanstack/react-router'
import { getSession } from '@/lib/auth'
import { AppLayout } from '@/components/AppLayout'

export const Route = createFileRoute('/_authenticated')({
  beforeLoad: async () => {
    const session = await getSession()
    if (!session) {
      throw redirect({ to: '/login' })
    }
  },
  component: AppLayout,
})
