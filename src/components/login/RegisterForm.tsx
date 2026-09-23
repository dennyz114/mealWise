import { useState, type FormEvent } from 'react'
import { signUp } from '@/lib/auth'
import { toFriendlyAuthError } from '@/lib/authErrors'
import {
  authErrorClassName,
  authInputClassName,
  authLabelClassName,
  authPrimaryButtonClassName,
} from './fieldStyles'

const MIN_PASSWORD_LENGTH = 6

type RegisterFormProps = {
  onSwitchToLogin: () => void
  onRegistered: (message: string) => void
}

export const RegisterForm = ({ onSwitchToLogin, onRegistered }: RegisterFormProps) => {
  const [email, setEmail] = useState('')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError(null)

    const trimmedEmail = email.trim()
    const trimmedFirstName = firstName.trim()
    const trimmedLastName = lastName.trim()

    if (!trimmedEmail || !trimmedFirstName || !trimmedLastName || !password || !confirmPassword) {
      setError('All fields are required.')
      return
    }

    if (password.length < MIN_PASSWORD_LENGTH) {
      setError(`Password must be at least ${MIN_PASSWORD_LENGTH} characters.`)
      return
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    setIsLoading(true)
    const { error: authError } = await signUp({
      email: trimmedEmail,
      password,
      firstName: trimmedFirstName,
      lastName: trimmedLastName,
    })

    if (authError) {
      setError(toFriendlyAuthError(authError))
      setIsLoading(false)
      return
    }

    onRegistered('Account created successfully. Sign in to continue.')
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div>
        <label htmlFor="register-email" className={authLabelClassName}>
          Email
        </label>
        <input
          id="register-email"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          className={authInputClassName}
          disabled={isLoading}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="register-first-name" className={authLabelClassName}>
            First name
          </label>
          <input
            id="register-first-name"
            type="text"
            autoComplete="given-name"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            placeholder="Jane"
            className={authInputClassName}
            disabled={isLoading}
          />
        </div>
        <div>
          <label htmlFor="register-last-name" className={authLabelClassName}>
            Last name
          </label>
          <input
            id="register-last-name"
            type="text"
            autoComplete="family-name"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            placeholder="Doe"
            className={authInputClassName}
            disabled={isLoading}
          />
        </div>
      </div>

      <div>
        <label htmlFor="register-password" className={authLabelClassName}>
          Password
        </label>
        <input
          id="register-password"
          type="password"
          autoComplete="new-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="At least 6 characters"
          className={authInputClassName}
          disabled={isLoading}
        />
      </div>

      <div>
        <label htmlFor="register-confirm-password" className={authLabelClassName}>
          Confirm password
        </label>
        <input
          id="register-confirm-password"
          type="password"
          autoComplete="new-password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          placeholder="Repeat your password"
          className={authInputClassName}
          disabled={isLoading}
        />
      </div>

      {error && <div className={authErrorClassName}>{error}</div>}

      <button type="submit" disabled={isLoading} className={authPrimaryButtonClassName}>
        {isLoading ? 'Creating account...' : 'Create account'}
      </button>

      <p className="text-center text-[13px] text-[var(--color-text-secondary)]">
        Already have an account?{' '}
        <button
          type="button"
          onClick={onSwitchToLogin}
          disabled={isLoading}
          className="font-medium text-[var(--color-accent)] underline hover:text-[var(--color-accent-hover)]"
        >
          Sign in
        </button>
      </p>
    </form>
  )
}
