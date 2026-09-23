import { useState, type FormEvent } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { signInWithPassword } from '@/lib/auth'
import { toFriendlyAuthError } from '@/lib/authErrors'
import {
  authErrorClassName,
  authInputClassName,
  authLabelClassName,
  authPrimaryButtonClassName,
  authSuccessClassName,
} from './fieldStyles'

type LoginFormProps = {
  onSwitchToRegister: () => void
  successMessage?: string | null
}

export const LoginForm = ({ onSwitchToRegister, successMessage }: LoginFormProps) => {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError(null)

    if (!email.trim() || !password) {
      setError('Email and password are required.')
      return
    }

    setIsLoading(true)
    const { error: authError } = await signInWithPassword(email.trim(), password)

    if (authError) {
      setError(toFriendlyAuthError(authError))
      setIsLoading(false)
      return
    }

    await navigate({ to: '/' })
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div>
        <label htmlFor="login-email" className={authLabelClassName}>
          Email
        </label>
        <input
          id="login-email"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          className={authInputClassName}
          disabled={isLoading}
        />
      </div>

      <div>
        <label htmlFor="login-password" className={authLabelClassName}>
          Password
        </label>
        <input
          id="login-password"
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Your password"
          className={authInputClassName}
          disabled={isLoading}
        />
      </div>

      {successMessage && <div className={authSuccessClassName}>{successMessage}</div>}
      {error && <div className={authErrorClassName}>{error}</div>}

      <button type="submit" disabled={isLoading} className={authPrimaryButtonClassName}>
        {isLoading ? 'Signing in...' : 'Sign in'}
      </button>

      <p className="text-center text-[13px] text-[var(--color-text-secondary)]">
        Don&apos;t have an account?{' '}
        <button
          type="button"
          onClick={onSwitchToRegister}
          disabled={isLoading}
          className="font-medium text-[var(--color-accent)] underline hover:text-[var(--color-accent-hover)]"
        >
          Create account
        </button>
      </p>
    </form>
  )
}
