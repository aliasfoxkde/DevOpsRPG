import { createContext, useContext, useEffect, useState, ReactNode } from 'react'

export type Theme = 'light' | 'dark' | 'system'

// Dark is the app's designed, accessibility-audited presentation. The light
// palette is not yet coherently themed (components hardcode dark surfaces),
// so first-time visitors default to dark; the setting remains fully
// user-overridable. See docs/planning/003-QUALITY_PLAN.md Phase 3.
const DEFAULT_THEME: Theme = 'dark'

interface ThemeContextType {
  theme: Theme
  resolvedTheme: 'light' | 'dark'
  setTheme: (theme: Theme) => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(() => {
    /* istanbul ignore if */
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('theme')
      return stored === 'light' || stored === 'dark' || stored === 'system' ? stored : DEFAULT_THEME
    }
    return DEFAULT_THEME
  })

  const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>(() => {
    /* istanbul ignore if */
    if (typeof window !== 'undefined') {
      if (theme === 'system') {
        return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
      }
      /* istanbul ignore next */
      return theme
    }
    return 'light'
  })

  useEffect(() => {
    const root = document.documentElement

    const updateResolvedTheme = () => {
      let resolved: 'light' | 'dark'
      if (theme === 'system') {
        resolved = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
      } else {
        resolved = theme
      }
      setResolvedTheme(resolved)
      root.classList.remove('light', 'dark')
      root.classList.add(resolved)
    }

    updateResolvedTheme()

    if (theme === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
      const handler = () => {
        updateResolvedTheme()
      }
      mediaQuery.addEventListener('change', handler)
      return () => {
        mediaQuery.removeEventListener('change', handler)
      }
    }
  }, [theme])

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme)
    localStorage.setItem('theme', newTheme)
  }

  return (
    <ThemeContext.Provider value={{ theme, resolvedTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

/* eslint-disable react-refresh/only-export-components */
export function useTheme() {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}
