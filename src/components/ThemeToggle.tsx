import { Sun, Moon } from 'lucide-react'
import { useTheme } from '@/lib/theme'
import { Button } from '@/components/ui/button'

export const ThemeToggle = () => {
  const { theme, setTheme } = useTheme()

  const isDark = theme === 'dark'

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <Button
        variant="icon-only"
        icon={isDark ? Sun : Moon}
        tooltip={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
        onClick={() => setTheme(isDark ? 'light' : 'dark')}
      />
    </div>
  )
}
