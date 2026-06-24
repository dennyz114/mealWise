import { useState } from 'react'
import { Calendar, Lock, ShoppingCart, Utensils } from 'lucide-react'
import { signInWithGoogle } from '@/lib/auth'
import { GoogleButton } from './GoogleButton'
import { FeatureHighlight } from './FeatureHighlight'
import { Footer } from '@/components/Footer'

type LoginPageProps = {
  onError?: (message: string) => void
}

export const LoginPage = ({ onError }: LoginPageProps) => {
  const [isLoading, setIsLoading] = useState(false)

  const handleGoogleSignIn = async () => {
    setIsLoading(true)
    const { error } = await signInWithGoogle()
    if (error) {
      onError?.(error.message)
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-dvh flex-col">
      <div className="flex flex-1 flex-col md:flex-row">
        {/* Left panel — branding (desktop) / hero (mobile) */}
        <div
          className="flex flex-1 flex-col items-center justify-center px-6 py-12 md:px-16 lg:px-24"
          style={{ background: 'var(--color-bg-tertiary)' }}
        >
          <div className="flex w-full max-w-md flex-col items-center text-center">
            <div
              className="mb-6 flex size-20 items-center justify-center rounded-[var(--radius-xl)]"
              style={{ background: 'var(--color-accent)' }}
            >
              <Calendar className="size-10 text-white" />
            </div>

            <h1 className="mb-2 text-[28px] font-medium text-[var(--color-text-primary)] md:text-[32px]">
              MealWise
            </h1>
            <p className="mb-10 text-[15px] text-[var(--color-text-secondary)]">
              From recipes to shopping list in minutes.
            </p>

            {/* Desktop features */}
            <div className="hidden w-full max-w-sm flex-col gap-6 md:flex">
              <FeatureHighlight
                icon={Utensils}
                iconBg="var(--color-accent)"
                title="Recipe library"
                description="Save meals with every ingredient"
              />
              <FeatureHighlight
                icon={Calendar}
                iconBg="#2d6a30"
                title="Weekly planner"
                description="Assign meals, plan weeks ahead"
              />
              <FeatureHighlight
                icon={ShoppingCart}
                iconBg="#8a6a2f"
                title="Smart shopping list"
                description="Grouped by category, check as you go"
              />
            </div>
          </div>
        </div>

        {/* Right panel / Mobile form */}
        <div className="flex flex-1 flex-col items-center justify-center px-6 py-12 md:bg-[var(--color-bg-primary)]">
          <div className="w-full max-w-sm">
            {/* Desktop header */}
            <div className="mb-8 hidden text-center md:block">
              <h2 className="mb-1 text-[22px] font-medium text-[var(--color-text-primary)]">
                Welcome back
              </h2>
              <p className="text-[14px] text-[var(--color-text-secondary)]">
                Sign in to your account
              </p>
            </div>

            {/* Mobile features */}
            <div className="mb-8 flex flex-col gap-4 md:hidden">
              <GoogleButton onClick={handleGoogleSignIn} isLoading={isLoading} />

              <p className="text-center text-[11px] font-medium uppercase tracking-[0.06em] text-[var(--color-text-tertiary)]">
                what you get
              </p>

              <FeatureHighlight
                icon={Utensils}
                iconBg="var(--color-accent-subtle)"
                title="Personal recipe library"
              />
              <FeatureHighlight
                icon={Calendar}
                iconBg="#2d6a30"
                title="Plan meals for any week"
              />
              <FeatureHighlight
                icon={ShoppingCart}
                iconBg="#8a6a2f"
                title="Auto shopping list by category"
              />
            </div>

            {/* Desktop form */}
            <div className="hidden md:block">
              <GoogleButton onClick={handleGoogleSignIn} isLoading={isLoading} />
            </div>

            <div className="mt-6 flex items-center gap-2 text-[13px] text-[var(--color-text-secondary)]">
              <Lock className="size-4" />
              <span>Secured by Google OAuth 2.0</span>
            </div>

            {/* Desktop divider + terms */}
            <div className="mt-8 hidden border-t border-[var(--color-border-default)] pt-6 md:block">
              <p className="text-[13px] text-[var(--color-text-tertiary)]">
                <a href="#" className="underline hover:text-[var(--color-accent)]">
                  Terms of Service
                </a>
                {' · '}
                <a href="#" className="underline hover:text-[var(--color-accent)]">
                  Privacy Policy
                </a>
              </p>
            </div>

            {/* Mobile terms */}
            <div className="mt-8 text-center md:hidden">
              <p className="text-[13px] text-[var(--color-text-tertiary)]">
                By continuing you agree to our{' '}
                <a href="#" className="underline hover:text-[var(--color-accent)]">
                  Terms
                </a>
                {' · '}
                <a href="#" className="underline hover:text-[var(--color-accent)]">
                  Privacy Policy
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}
