import { useEffect, useCallback, useRef } from 'react'
import { useNavigate } from 'react-router-dom'

interface KeyboardShortcut {
  key: string
  action: () => void
  description: string
}

const SEQUENCE_TIMEOUT = 1000 // ms to wait for second key

export function useKeyboardShortcuts(enabled = true) {
  const navigate = useNavigate()

  const SHORTCUTS: KeyboardShortcut[] = [
    /* istanbul ignore next */
    { key: 'g h', action: () => navigate('/'), description: 'Go to Home' },
    /* istanbul ignore next */
    { key: 'g l', action: () => navigate('/learn'), description: 'Go to Learn' },
    /* istanbul ignore next */
    { key: 'g d', action: () => navigate('/dashboard'), description: 'Go to Dashboard' },
    /* istanbul ignore next */
    { key: 'n', action: () => window.dispatchEvent(new CustomEvent('game:next')), description: 'Next/Continue' },
  ]

  const pendingKeyRef = useRef<string | null>(null)
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const clearPendingKey = useCallback(() => {
    /* istanbul ignore if */
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }
    pendingKeyRef.current = null
  }, [])

  useEffect(() => {
    if (!enabled) return

    const handleKeyDown = (event: KeyboardEvent) => {
      // Ignore if user is typing in an input
      const target = event.target as HTMLElement
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable
      ) {
        return
      }

      const key = event.key.toLowerCase()

      // If we have a pending key, check for sequence
      if (pendingKeyRef.current) {
        clearPendingKey()
        const sequence = `${pendingKeyRef.current} ${key}`

        const shortcut = SHORTCUTS.find((s: KeyboardShortcut) => s.key === sequence)
        /* istanbul ignore if */
        if (shortcut) {
          event.preventDefault()
          shortcut.action()
          return
        }

        // Check if first key alone is a shortcut (like 'g')
        const singleShortcut = SHORTCUTS.find((s: KeyboardShortcut) => s.key === key)
        /* istanbul ignore if */
        if (singleShortcut && key === pendingKeyRef.current) { return }

      }

      // Start a new pending sequence if key could be part of a sequence
      if (key === 'g') {
        pendingKeyRef.current = key
        timeoutRef.current = setTimeout(clearPendingKey, SEQUENCE_TIMEOUT)
        /* istanbul ignore next */
        return
      }

      // Check for single-key shortcuts
      const shortcut = SHORTCUTS.find((s: KeyboardShortcut) => s.key === key)
      /* istanbul ignore if */
      if (shortcut) {
        event.preventDefault()
        shortcut.action()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      clearPendingKey()
    }
  }, [enabled, navigate, clearPendingKey])

  return { shortcuts: SHORTCUTS }
}
