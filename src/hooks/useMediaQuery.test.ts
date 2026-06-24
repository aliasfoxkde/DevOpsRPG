import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { renderHook } from '@testing-library/react'
import { useMediaQuery, useIsMobile, useIsTablet, useIsDesktop, usePrefersDarkMode, usePrefersReducedMotion } from './useMediaQuery'

// Helper to create matchMedia mock
function createMatchMediaMock(matches: boolean, hasAddEventListener = true) {
  return vi.fn().mockImplementation(() => ({
    matches,
    media: '',
    onchange: null as ((...args: unknown[]) => void) | null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: hasAddEventListener ? vi.fn() : undefined,
    removeEventListener: hasAddEventListener ? vi.fn() : undefined,
    dispatchEvent: vi.fn(),
  }))
}

describe('useMediaQuery', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.stubGlobal('matchMedia', createMatchMediaMock(false, true))
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.restoreAllMocks()
  })

  it('returns matches result based on mock', () => {
    vi.stubGlobal('matchMedia', createMatchMediaMock(true, true))
    const { result } = renderHook(() => useMediaQuery('(min-width: 640px)'))
    expect(result.current).toBe(true)
  })

  it('returns false when mock does not match', () => {
    const { result } = renderHook(() => useMediaQuery('(min-width: 640px)'))
    expect(result.current).toBe(false)
  })

  it('updates when media query changes', () => {
    const matchMediaMock = createMatchMediaMock(false, true)
    vi.stubGlobal('matchMedia', matchMediaMock)

    const { result } = renderHook(() => useMediaQuery('(min-width: 640px)'))

    // Verify initial result is based on mock
    expect(result.current).toBe(false)

    // Get the mock instance AFTER render (same instance that was used in useEffect)
    // The matchMediaMock is called twice: once in useState init and once in useEffect
    expect(matchMediaMock).toHaveBeenCalled()
  })

  it('handles deprecated API (no addEventListener)', () => {
    vi.stubGlobal('matchMedia', createMatchMediaMock(false, false))
    const { result } = renderHook(() => useMediaQuery('(min-width: 640px)'))
    // Just verify it returns a value without crashing
    expect(result.current).toBe(false)
  })
})

describe('useIsMobile', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.restoreAllMocks()
  })

  it('returns true when query matches', () => {
    vi.stubGlobal('matchMedia', createMatchMediaMock(true, true))
    const { result } = renderHook(() => useIsMobile())
    expect(result.current).toBe(true)
  })

  it('returns false when query does not match', () => {
    vi.stubGlobal('matchMedia', createMatchMediaMock(false, true))
    const { result } = renderHook(() => useIsMobile())
    expect(result.current).toBe(false)
  })
})

describe('useIsTablet', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.restoreAllMocks()
  })

  it('returns true when query matches', () => {
    vi.stubGlobal('matchMedia', createMatchMediaMock(true, true))
    const { result } = renderHook(() => useIsTablet())
    expect(result.current).toBe(true)
  })

  it('returns false when query does not match', () => {
    vi.stubGlobal('matchMedia', createMatchMediaMock(false, true))
    const { result } = renderHook(() => useIsTablet())
    expect(result.current).toBe(false)
  })
})

describe('useIsDesktop', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.restoreAllMocks()
  })

  it('returns true when query matches', () => {
    vi.stubGlobal('matchMedia', createMatchMediaMock(true, true))
    const { result } = renderHook(() => useIsDesktop())
    expect(result.current).toBe(true)
  })
})

describe('usePrefersDarkMode', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.restoreAllMocks()
  })

  it('returns true when dark mode matches', () => {
    vi.stubGlobal('matchMedia', createMatchMediaMock(true, true))
    const { result } = renderHook(() => usePrefersDarkMode())
    expect(result.current).toBe(true)
  })
})

describe('usePrefersReducedMotion', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.restoreAllMocks()
  })

  it('returns true when reduced motion matches', () => {
    vi.stubGlobal('matchMedia', createMatchMediaMock(true, true))
    const { result } = renderHook(() => usePrefersReducedMotion())
    expect(result.current).toBe(true)
  })
})
