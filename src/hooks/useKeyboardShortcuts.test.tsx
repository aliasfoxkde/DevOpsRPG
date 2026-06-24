import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { act } from '@testing-library/react'
import { renderHook } from '@testing-library/react'
import { useKeyboardShortcuts } from './useKeyboardShortcuts'
import { MemoryRouter } from 'react-router-dom'

// Test wrapper that provides router context
function wrapper({ children }: { children: React.ReactNode }) {
  return (
    <MemoryRouter initialEntries={['/']}>
      {children}
    </MemoryRouter>
  )
}

describe('useKeyboardShortcuts', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.restoreAllMocks()
  })

  it('returns shortcuts list', () => {
    const { result } = renderHook(() => useKeyboardShortcuts(), { wrapper })

    expect(result.current.shortcuts).toHaveLength(4)
    expect(result.current.shortcuts[0].key).toBe('g h')
    expect(result.current.shortcuts[1].key).toBe('g l')
    expect(result.current.shortcuts[2].key).toBe('g d')
    expect(result.current.shortcuts[3].key).toBe('n')
  })

  it('does not trigger when disabled', () => {
    const { result } = renderHook(() => useKeyboardShortcuts(false), { wrapper })

    expect(result.current.shortcuts).toBeDefined()
  })

  it('contains correct descriptions', () => {
    const { result } = renderHook(() => useKeyboardShortcuts(), { wrapper })

    expect(result.current.shortcuts[0].description).toBe('Go to Home')
    expect(result.current.shortcuts[1].description).toBe('Go to Learn')
    expect(result.current.shortcuts[2].description).toBe('Go to Dashboard')
    expect(result.current.shortcuts[3].description).toBe('Next/Continue')
  })

  it('does not trigger when typing in input', () => {
    renderHook(() => useKeyboardShortcuts(true), { wrapper })

    const input = document.createElement('input')
    document.body.appendChild(input)
    input.focus()

    const event = new KeyboardEvent('keydown', {
      key: 'g',
      bubbles: true,
    })
    input.dispatchEvent(event)

    document.body.removeChild(input)
  })

  it('does not trigger when typing in textarea', () => {
    renderHook(() => useKeyboardShortcuts(true), { wrapper })

    const textarea = document.createElement('textarea')
    document.body.appendChild(textarea)
    textarea.focus()

    const event = new KeyboardEvent('keydown', {
      key: 'g',
      bubbles: true,
    })
    textarea.dispatchEvent(event)

    document.body.removeChild(textarea)
  })

  it('handles g key to start sequence', () => {
    renderHook(() => useKeyboardShortcuts(true), { wrapper })

    const event = new KeyboardEvent('keydown', {
      key: 'g',
      bubbles: true,
    })
    window.dispatchEvent(event)
  })

  it('handles g h sequence', () => {
    renderHook(() => useKeyboardShortcuts(true), { wrapper })

    // First 'g'
    act(() => {
      vi.advanceTimersByTime(0)
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'g', bubbles: true }))
    })

    // Then 'h'
    act(() => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'h', bubbles: true }))
    })
  })

  it('handles single-key shortcut', () => {
    renderHook(() => useKeyboardShortcuts(true), { wrapper })

    act(() => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }))
    })
  })

  it('handles g l sequence to navigate to learn', () => {
    renderHook(() => useKeyboardShortcuts(true), { wrapper })

    // First 'g'
    act(() => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'g', bubbles: true }))
    })

    // Then 'l'
    act(() => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'l', bubbles: true }))
    })
  })

  it('handles g d sequence to navigate to dashboard', () => {
    renderHook(() => useKeyboardShortcuts(true), { wrapper })

    // First 'g'
    act(() => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'g', bubbles: true }))
    })

    // Then 'd'
    act(() => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'd', bubbles: true }))
    })
  })

  it('clears pending key after timeout', () => {
    renderHook(() => useKeyboardShortcuts(true), { wrapper })

    // First 'g' - starts sequence
    act(() => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'g', bubbles: true }))
    })

    // Advance timers past the SEQUENCE_TIMEOUT (1000ms)
    act(() => {
      vi.advanceTimersByTime(1001)
    })

    // Now pressing 'h' alone should be treated as single key, not sequence
    act(() => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'h', bubbles: true }))
    })
  })

  it('ignores when pending key matches single key shortcut (g g case)', () => {
    renderHook(() => useKeyboardShortcuts(true), { wrapper })

    // First 'g'
    act(() => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'g', bubbles: true }))
    })

    // Second 'g' - should be ignored (g g not a valid shortcut)
    act(() => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'g', bubbles: true }))
    })
  })

  it('ignores shortcut when typing in contentEditable element', () => {
    renderHook(() => useKeyboardShortcuts(true), { wrapper })

    const div = document.createElement('div')
    div.contentEditable = 'true'
    document.body.appendChild(div)
    div.focus()

    act(() => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'g', bubbles: true }))
    })

    document.body.removeChild(div)
  })

  it('clears pending key after invalid sequence and does nothing', () => {
    renderHook(() => useKeyboardShortcuts(true), { wrapper })

    // First 'g' - starts sequence
    act(() => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'g', bubbles: true }))
    })

    // 't' - invalid sequence, clears pending and does nothing
    act(() => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 't', bubbles: true }))
    })
  })

  it('handles single-key shortcut that is not defined', () => {
    renderHook(() => useKeyboardShortcuts(true), { wrapper })

    // Press a key that has no shortcut defined
    act(() => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'z', bubbles: true }))
    })
  })

  it('starts new sequence after invalid sequence timeout', () => {
    renderHook(() => useKeyboardShortcuts(true), { wrapper })

    // First 'g' - starts sequence
    act(() => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'g', bubbles: true }))
    })

    // 't' - invalid sequence
    act(() => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 't', bubbles: true }))
    })

    // Now 'g' again - should start new sequence
    act(() => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'g', bubbles: true }))
    })

    // Complete the sequence with 'h'
    act(() => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'h', bubbles: true }))
    })
  })
})
