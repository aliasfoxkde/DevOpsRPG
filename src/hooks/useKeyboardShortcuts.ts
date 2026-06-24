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
    // Navigation shortcuts (g + key)
    /* istanbul ignore next */
    { key: 'g h', action: () => navigate('/'), description: 'Go to Home' },
    /* istanbul ignore next */
    { key: 'g l', action: () => navigate('/learn'), description: 'Go to Learn' },
    /* istanbul ignore next */
    { key: 'g d', action: () => navigate('/dashboard'), description: 'Go to Dashboard' },
    /* istanbul ignore next */
    { key: 'g q', action: () => navigate('/quests'), description: 'Go to Quests' },
    /* istanbul ignore next */
    { key: 'g c', action: () => navigate('/character'), description: 'Go to Character' },
    /* istanbul ignore next */
    { key: 'g r', action: () => navigate('/rewards'), description: 'Go to Rewards' },
    /* istanbul ignore next */
    { key: 'g b', action: () => navigate('/badges'), description: 'Go to Badges' },
    /* istanbul ignore next */
    { key: 'g m', action: () => navigate('/milestones'), description: 'Go to Milestones' },
    /* istanbul ignore next */
    { key: 'g s', action: () => navigate('/skills'), description: 'Go to Skills' },
    /* istanbul ignore next */
    { key: 'g w', action: () => navigate('/worldmap'), description: 'Go to World Map' },
    /* istanbul ignore next */
    { key: 'g p', action: () => navigate('/profile'), description: 'Go to Profile' },
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

  // 'N' key - Click focused button OR primary button OR first button
  const handleNKey = useCallback(() => {
    // Priority 1: Click already focused element if it's a button
    const activeElement = document.activeElement as HTMLButtonElement
    if (activeElement && activeElement.tagName === 'BUTTON' && !activeElement.disabled) {
      activeElement.click()
      return
    }

    // Priority 2: Find primary action button (ones with prominent styling)
    const primarySelectors = [
      'button[class*="from-amber-600"]',  // Amber gradient buttons
      'button[class*="from-green-600"]',  // Green gradient buttons
      'button[class*="from-purple-600"]', // Purple gradient buttons
      'button[class*="bg-amber-600"]',   // Amber solid buttons
      'button[class*="bg-green-600"]',   // Green solid buttons
      'button[class*="bg-purple-600"]',  // Purple solid buttons
    ]

    for (const selector of primarySelectors) {
      const btn = document.querySelector(selector) as HTMLButtonElement
      if (btn && !btn.disabled) {
        btn.click()
        return
      }
    }

    // Priority 3: Click any enabled button with "Take Quiz", "Complete", "Begin", "Start", "Continue" text
    const actionButtons = document.querySelectorAll('button')
    for (const btn of actionButtons) {
      if (btn.disabled) continue
      const text = btn.textContent?.toLowerCase() || ''
      if (text.includes('take quiz') || text.includes('complete') ||
          text.includes('begin') || text.includes('start') ||
          text.includes('continue') || text.includes('next') ||
          text.includes('finish') || text.includes('submit')) {
        btn.click()
        return
      }
    }

    // Priority 4: Click first visible enabled button
    for (const btn of actionButtons) {
      if (!btn.disabled && !btn.closest('[class*="hidden"]')) {
        btn.click()
        return
      }
    }
  }, [])

  useEffect(() => {
    if (!enabled) return

    const handleKeyDown = (event: KeyboardEvent) => {
      // Ignore if user is typing in an input (unless it's the N key for quiz fill-blank)
      const target = event.target as HTMLElement
      const isTyping = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable

      // 'N' key works EVERYWHERE to click buttons (even in inputs if not disabled)
      if (event.key.toLowerCase() === 'n') {
        event.preventDefault()

        // If in an input/textarea, blur it first then click button
        if (isTyping && target.tagName !== 'TEXTAREA') {
          target.blur()
        }

        handleNKey()
        return
      }

      // Ignore other shortcuts if typing
      if (isTyping) return

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
  }, [enabled, navigate, clearPendingKey, handleNKey])

  return { shortcuts: SHORTCUTS }
}
