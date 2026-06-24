import { createFileRoute, redirect } from '@tanstack/react-router'
import { getSession } from '@/lib/auth'
import { LoginPage } from '@/components/login/LoginPage'

export const Route = createFileRoute('/login')({
  beforeLoad: async () => {
    const session = await getSession()
    if (session) {
      throw redirect({ to: '/' as const })
    }
  },
  component: LoginPageRoute,
})

function LoginPageRoute() {
  return <LoginPage />
}
