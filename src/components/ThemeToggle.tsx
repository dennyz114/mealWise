import { useTheme } from '@/lib/theme'

export const ThemeToggle = () => {
  const { theme, setTheme } = useTheme()

  const isDark = theme === 'dark'

  return (
    <button
      type="button"
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      className="fixed bottom-6 right-6 z-50 flex size-11 items-center justify-center rounded-full transition-colors"
      style={{
        background: 'var(--color-accent)',
        color: '#ffffff',
      }}
    >
      <i className={`ti ${isDark ? 'ti-sun' : 'ti-moon'} text-xl`} />
    </button>
  )
}
