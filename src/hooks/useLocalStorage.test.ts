import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useLocalStorage } from './useLocalStorage'

describe('useLocalStorage', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  afterEach(() => {
    localStorage.clear()
  })

  it('returns initial value when localStorage is empty', () => {
    const { result } = renderHook(() => useLocalStorage('test-key', 'default'))
    expect(result.current[0]).toBe('default')
  })

  it('returns value from localStorage when present', () => {
    localStorage.setItem('test-key', JSON.stringify('stored-value'))
    const { result } = renderHook(() => useLocalStorage('test-key', 'default'))
    expect(result.current[0]).toBe('stored-value')
  })

  it('updates localStorage when value changes', () => {
    const { result } = renderHook(() => useLocalStorage('test-key', 'default'))
    act(() => {
      result.current[1]('new-value')
    })
    expect(result.current[0]).toBe('new-value')
    expect(localStorage.getItem('test-key')).toBe(JSON.stringify('new-value'))
  })

  it('handles object values', () => {
    const { result } = renderHook(() => useLocalStorage('test-key', { count: 0 }))
    act(() => {
      result.current[1]({ count: 5 })
    })
    expect(result.current[0]).toEqual({ count: 5 })
    expect(localStorage.getItem('test-key')).toEqual(JSON.stringify({ count: 5 }))
  })

  it('handles array values', () => {
    const { result } = renderHook(() => useLocalStorage('test-key', [1, 2, 3]))
    act(() => {
      result.current[1]([4, 5, 6])
    })
    expect(result.current[0]).toEqual([4, 5, 6])
  })

  it('handles function updates', () => {
    const { result } = renderHook(() => useLocalStorage('test-key', 10))
    act(() => {
      result.current[1]((prev: number) => prev + 5)
    })
    expect(result.current[0]).toBe(15)
  })

  it('returns initial value on invalid JSON in localStorage', () => {
    localStorage.setItem('test-key', 'invalid-json')
    const { result } = renderHook(() => useLocalStorage('test-key', 'default'))
    expect(result.current[0]).toBe('default')
  })

  it('handles null values correctly', () => {
    const { result } = renderHook(() => useLocalStorage<string | null>('test-key', null))
    expect(result.current[0]).toBe(null)
    act(() => {
      result.current[1]('non-null')
    })
    expect(result.current[0]).toBe('non-null')
  })

  it('syncs across tabs via storage event', () => {
    const { result } = renderHook(() => useLocalStorage('test-key', 'initial'))
    expect(result.current[0]).toBe('initial')
    act(() => {
      window.dispatchEvent(
        new StorageEvent('storage', {
          key: 'test-key',
          newValue: JSON.stringify('updated-from-tab'),
        })
      )
    })
    expect(result.current[0]).toBe('updated-from-tab')
  })

  it('handles setItem error gracefully', () => {
    const { result } = renderHook(() => useLocalStorage('test-key', 'initial'))

    // Mock localStorage.setItem to throw
    const originalSetItem = localStorage.setItem
    vi.spyOn(localStorage, 'setItem').mockImplementation(() => {
      throw new Error('Quota exceeded')
    })

    // Should not throw even though setItem fails
    act(() => {
      result.current[1]('new-value')
    })

    // State is updated (setValue is called before setItem)
    // The error is caught and logged, not thrown
    expect(result.current[0]).toBe('new-value')

    // Restore
    localStorage.setItem = originalSetItem
  })

  it('handles storage event with invalid JSON', () => {
    const { result } = renderHook(() => useLocalStorage('test-key', 'initial'))
    expect(result.current[0]).toBe('initial')
    act(() => {
      window.dispatchEvent(
        new StorageEvent('storage', {
          key: 'test-key',
          newValue: 'invalid-json{',
        })
      )
    })
    // Should keep original value on parse error
    expect(result.current[0]).toBe('initial')
  })

  it('unmounts and cleans up storage listener', () => {
    const addEventListenerSpy = vi.spyOn(window, 'addEventListener')
    const removeEventListenerSpy = vi.spyOn(window, 'removeEventListener')

    const { unmount } = renderHook(() => useLocalStorage('test-key', 'initial'))

    // Verify storage event listener was added
    expect(addEventListenerSpy).toHaveBeenCalledWith('storage', expect.any(Function))

    unmount()

    // Verify storage event listener was removed on unmount
    expect(removeEventListenerSpy).toHaveBeenCalledWith('storage', expect.any(Function))

    addEventListenerSpy.mockRestore()
    removeEventListenerSpy.mockRestore()
  })

  it('handles getItem error gracefully', () => {
    const originalGetItem = localStorage.getItem
    vi.spyOn(localStorage, 'getItem').mockImplementation(() => {
      throw new Error('Storage error')
    })

    const { result } = renderHook(() => useLocalStorage('test-key', 'fallback'))
    expect(result.current[0]).toBe('fallback')

    localStorage.getItem = originalGetItem
  })
})
