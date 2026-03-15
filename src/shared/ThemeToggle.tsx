import { Sun, Moon } from 'lucide-react'
import { useUIStore } from '@/lib/store'

export function ThemeToggle() {
  const { isDark, toggleDark } = useUIStore()

  return (
    <button
      type="button"
      onClick={toggleDark}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      title={isDark ? 'Light mode' : 'Dark mode'}
      className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-700 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200 transition-colors"
    >
      {isDark ? <Sun size={15} /> : <Moon size={15} />}
    </button>
  )
}
