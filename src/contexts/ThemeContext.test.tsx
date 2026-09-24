import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { render, screen, act } from '@testing-library/react'
import { renderToString } from 'react-dom/server'
import { ThemeProvider, useTheme } from './ThemeContext'

interface FakeMql {
  matches: boolean
  setMatches: (matches: boolean) => void
  emitChange: () => void
  listenerCount: () => number
}

// Mock matchMedia globally. A plain `matches` boolean cannot model the OS
// flipping its colour scheme at runtime, so the mock hands back a query list
// whose `matches` can be changed and whose change listeners can be fired.
// Like a real browser it returns the same list for the same query string.
function createMatchMediaMock(matches: boolean): ((query: string) => MediaQueryList) & {
  queries: FakeMql[]
} {
  const queries: FakeMql[] = []
  const cache = new Map<string, MediaQueryList>()
  return Object.assign(
    (query: string): MediaQueryList => {
      const cached = cache.get(query)
      if (cached) return cached

      let current = matches
      const listeners = new Set<EventListener>()
      // `matches` stays live through `current`, matching how a real query
      // list reflects (and only reflects) the OS state.
      const mql: MediaQueryList = {
        get matches() {
          return current
        },
        media: query,
        onchange: null,
        addListener: () => {},
        removeListener: () => {},
        addEventListener: (_type: string, listener: EventListener) => {
          listeners.add(listener)
        },
        removeEventListener: (_type: string, listener: EventListener) => {
          listeners.delete(listener)
        },
        dispatchEvent: () => false,
      }
      queries.push({
        get matches() {
          return current
        },
        setMatches(next: boolean) {
          current = next
        },
        emitChange() {
          listeners.forEach((listener) => {
            listener({ type: 'change' } as MediaQueryListEvent)
          })
        },
        listenerCount: () => listeners.size,
      })
      cache.set(query, mql)
      return mql
    },
    { queries },
  )
}

// Test component that uses the context
function TestComponent() {
  const { theme, resolvedTheme, setTheme } = useTheme()

  return (
    <div>
      <p data-testid="theme">{theme}</p>
      <p data-testid="resolved-theme">{resolvedTheme}</p>
      <button
        onClick={() => {
          setTheme('light')
        }}
      >
        Light
      </button>
      <button
        onClick={() => {
          setTheme('dark')
        }}
      >
        Dark
      </button>
      <button
        onClick={() => {
          setTheme('system')
        }}
      >
        System
      </button>
    </div>
  )
}

function renderProvider() {
  return render(
    <ThemeProvider>
      <TestComponent />
    </ThemeProvider>,
  )
}

describe('ThemeContext', () => {
  beforeEach(() => {
    localStorage.clear()
    document.documentElement.className = ''
    vi.useFakeTimers()
    // Default mock for light mode
    vi.stubGlobal('matchMedia', createMatchMediaMock(false))
  })

  afterEach(() => {
    localStorage.clear()
    document.documentElement.className = ''
    vi.useRealTimers()
    vi.restoreAllMocks()
  })

  it('defaults to dark when no preference is stored (dark-first app)', () => {
    renderProvider()

    expect(screen.getByTestId('theme')).toHaveTextContent('dark')
    expect(screen.getByTestId('resolved-theme')).toHaveTextContent('dark')
  })

  it('falls back to dark when the stored preference is not a theme', () => {
    localStorage.setItem('theme', 'neon-purple')

    renderProvider()

    expect(screen.getByTestId('theme')).toHaveTextContent('dark')
    expect(screen.getByTestId('resolved-theme')).toHaveTextContent('dark')
  })

  it('resolves system theme to light when prefers-color-scheme is light', () => {
    // matchMedia is already stubbed globally to return false (light mode)
    localStorage.setItem('theme', 'system')
    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>,
    )

    expect(screen.getByTestId('resolved-theme')).toHaveTextContent('light')
  })

  it('resolves system theme to dark when prefers-color-scheme is dark', () => {
    // Re-stub matchMedia for dark mode
    vi.stubGlobal('matchMedia', createMatchMediaMock(true))

    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>,
    )

    expect(screen.getByTestId('resolved-theme')).toHaveTextContent('dark')
  })

  it('sets theme to light explicitly', () => {
    renderProvider()

    const lightButton = screen.getByText('Light')
    act(() => {
      lightButton.click()
    })

    expect(screen.getByTestId('theme')).toHaveTextContent('light')
    expect(screen.getByTestId('resolved-theme')).toHaveTextContent('light')
    expect(localStorage.getItem('theme')).toBe('light')
  })

  it('sets theme to dark explicitly', () => {
    renderProvider()

    const darkButton = screen.getByText('Dark')
    act(() => {
      darkButton.click()
    })

    expect(screen.getByTestId('theme')).toHaveTextContent('dark')
    expect(screen.getByTestId('resolved-theme')).toHaveTextContent('dark')
    expect(localStorage.getItem('theme')).toBe('dark')
  })

  it('persists theme to localStorage', () => {
    renderProvider()

    const darkButton = screen.getByText('Dark')
    act(() => {
      darkButton.click()
    })

    expect(localStorage.getItem('theme')).toBe('dark')
  })

  it('persists the system choice so a reload restores it', () => {
    const { unmount } = renderProvider()

    act(() => {
      screen.getByText('System').click()
    })

    expect(localStorage.getItem('theme')).toBe('system')
    expect(screen.getByTestId('resolved-theme')).toHaveTextContent('light')
    unmount()

    // A fresh provider reads the persisted setting back out of storage.
    renderProvider()
    expect(screen.getByTestId('theme')).toHaveTextContent('system')
    expect(screen.getByTestId('resolved-theme')).toHaveTextContent('light')
  })

  it('restores theme from localStorage on mount', () => {
    localStorage.setItem('theme', 'dark')

    renderProvider()

    expect(screen.getByTestId('theme')).toHaveTextContent('dark')
    expect(screen.getByTestId('resolved-theme')).toHaveTextContent('dark')
  })

  it('throws error when used outside of provider', () => {
    // Suppress console.error for this test
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    expect(() => {
      render(<TestComponent />)
    }).toThrow('useTheme must be used within a ThemeProvider')

    consoleSpy.mockRestore()
  })

  it('handles theme change from dark to system', () => {
    // Start with dark
    localStorage.setItem('theme', 'dark')
    vi.stubGlobal('matchMedia', createMatchMediaMock(false))

    renderProvider()

    expect(screen.getByTestId('theme')).toHaveTextContent('dark')
    expect(screen.getByTestId('resolved-theme')).toHaveTextContent('dark')

    // Switch to system
    const systemButton = screen.getByText('System')
    act(() => {
      systemButton.click()
    })

    expect(screen.getByTestId('theme')).toHaveTextContent('system')
  })

  describe('html element class', () => {
    it('stamps the resolved theme on <html> and replaces the old one', () => {
      renderProvider()

      expect(document.documentElement).toHaveClass('dark')
      expect(document.documentElement).not.toHaveClass('light')

      act(() => {
        screen.getByText('Light').click()
      })

      expect(document.documentElement).toHaveClass('light')
      expect(document.documentElement).not.toHaveClass('dark')
    })

    it('re-resolves the system theme when the OS colour scheme flips', () => {
      const matchMedia = createMatchMediaMock(false)
      vi.stubGlobal('matchMedia', matchMedia)
      localStorage.setItem('theme', 'system')
      renderProvider()

      expect(screen.getByTestId('resolved-theme')).toHaveTextContent('light')
      expect(document.documentElement).toHaveClass('light')

      // The OS switches to dark mode underneath the app.
      act(() => {
        matchMedia.queries[0].setMatches(true)
        matchMedia.queries[0].emitChange()
      })

      expect(screen.getByTestId('resolved-theme')).toHaveTextContent('dark')
      expect(document.documentElement).toHaveClass('dark')
      expect(document.documentElement).not.toHaveClass('light')
    })

    it('stops listening for OS changes once an explicit theme is picked', () => {
      const matchMedia = createMatchMediaMock(true)
      vi.stubGlobal('matchMedia', matchMedia)
      renderProvider()

      act(() => {
        screen.getByText('System').click()
      })
      expect(screen.getByTestId('resolved-theme')).toHaveTextContent('dark')

      act(() => {
        screen.getByText('Light').click()
      })
      expect(screen.getByTestId('resolved-theme')).toHaveTextContent('light')

      // The OS flipping now has no effect on the resolved theme.
      act(() => {
        matchMedia.queries[0].setMatches(false)
        matchMedia.queries[0].emitChange()
      })

      expect(screen.getByTestId('resolved-theme')).toHaveTextContent('light')
      expect(document.documentElement).toHaveClass('light')
    })

    it('detaches its OS listener when the provider unmounts', () => {
      const matchMedia = createMatchMediaMock(false)
      vi.stubGlobal('matchMedia', matchMedia)
      localStorage.setItem('theme', 'system')

      const { unmount } = renderProvider()
      expect(matchMedia.queries[0].listenerCount()).toBe(1)

      unmount()

      expect(matchMedia.queries[0].listenerCount()).toBe(0)
    })
  })

  it('renders the dark default when there is no window (server render)', () => {
    localStorage.setItem('theme', 'light')
    vi.stubGlobal('window', undefined)

    const html = renderToString(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>,
    )

    // Storage cannot be read on the server, so the dark-first default wins;
    // with no `matchMedia` to consult, the system preference resolves to light.
    expect(html).toContain('dark</p>')
    expect(html).toContain('>light<')
    // Nothing was written back either.
    expect(localStorage.getItem('theme')).toBe('light')
  })
})
