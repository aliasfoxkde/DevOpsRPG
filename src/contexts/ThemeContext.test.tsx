import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { render, screen, act } from '@testing-library/react'
import { ThemeProvider, useTheme } from './ThemeContext'

// Mock matchMedia globally
function createMatchMediaMock(matches: boolean): (query: string) => MediaQueryList {
  return vi.fn((query: string): MediaQueryList => ({
    matches,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  }))
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

describe('ThemeContext', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.useFakeTimers()
    // Default mock for light mode
    vi.stubGlobal('matchMedia', createMatchMediaMock(false))
  })

  afterEach(() => {
    localStorage.clear()
    vi.useRealTimers()
    vi.restoreAllMocks()
  })

  it('defaults to dark when no preference is stored (dark-first app)', () => {
    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>,
    )

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
    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>,
    )

    const lightButton = screen.getByText('Light')
    act(() => {
      lightButton.click()
    })

    expect(screen.getByTestId('theme')).toHaveTextContent('light')
    expect(screen.getByTestId('resolved-theme')).toHaveTextContent('light')
    expect(localStorage.getItem('theme')).toBe('light')
  })

  it('sets theme to dark explicitly', () => {
    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>,
    )

    const darkButton = screen.getByText('Dark')
    act(() => {
      darkButton.click()
    })

    expect(screen.getByTestId('theme')).toHaveTextContent('dark')
    expect(screen.getByTestId('resolved-theme')).toHaveTextContent('dark')
    expect(localStorage.getItem('theme')).toBe('dark')
  })

  it('persists theme to localStorage', () => {
    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>,
    )

    const darkButton = screen.getByText('Dark')
    act(() => {
      darkButton.click()
    })

    expect(localStorage.getItem('theme')).toBe('dark')
  })

  it('restores theme from localStorage on mount', () => {
    localStorage.setItem('theme', 'dark')

    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>,
    )

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

    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>,
    )

    expect(screen.getByTestId('theme')).toHaveTextContent('dark')
    expect(screen.getByTestId('resolved-theme')).toHaveTextContent('dark')

    // Switch to system
    const systemButton = screen.getByText('System')
    act(() => {
      systemButton.click()
    })

    expect(screen.getByTestId('theme')).toHaveTextContent('system')
  })
})
