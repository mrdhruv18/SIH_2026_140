'use client'

import React from 'react'
import { Sun, Moon } from 'lucide-react'
import { useTheme } from '@/context/theme-context'

interface ThemeToggleProps {
  className?: string
}

export function ThemeToggle({ className = '' }: ThemeToggleProps) {
  const { theme, toggleTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  const isLight = mounted && theme === 'light'

  return (
    <button
      onClick={toggleTheme}
      type="button"
      className={`relative inline-flex h-9 w-9 items-center justify-center rounded-xl border transition-all duration-300 hover:scale-105 active:scale-95 ${className}`}
      style={{
        borderColor: 'var(--q-line)',
        background: 'color-mix(in oklch, var(--q-bg-deep) 70%, transparent)',
      }}
      title={isLight ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
      aria-label={isLight ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
    >
      {isLight ? (
        <Moon className="h-4 w-4 transition-transform duration-300 -rotate-12 text-amber-600 hover:rotate-0" />
      ) : (
        <Sun className="h-4 w-4 transition-transform duration-300 rotate-0 text-amber-400 hover:rotate-45" />
      )}
    </button>
  )
}
