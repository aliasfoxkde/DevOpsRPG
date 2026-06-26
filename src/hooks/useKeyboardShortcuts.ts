import { useEffect, useCallback, useRef } from 'react'
import { useNavigate } from 'react-router-dom'

interface KeyboardShortcut {
  key: string
  action: () => void
  description: string
  category?: 'navigation' | 'action' | 'accessibility'
}

const SEQUENCE_TIMEOUT = 1000 // ms to wait for second key

export function useKeyboardShortcuts(enabled = true) {
  const navigate = useNavigate()

  const SHORTCUTS: KeyboardShortcut[] = [
    // Vim-style navigation
    /* istanbul ignore next */
    { key: 'j', action: () => window.scrollBy({ top: 50, behavior: 'smooth' }), description: 'Scroll down', category: 'navigation' },
    /* istanbul ignore next */
    { key: 'k', action: () => window.scrollBy({ top: -50, behavior: 'smooth' }), description: 'Scroll up', category: 'navigation' },
    /* istanbul ignore next */
    { key: 'gg', action: () => window.scrollTo({ top: 0, behavior: 'smooth' }), description: 'Go to top', category: 'navigation' },
    /* istanbul ignore next */
    { key: 'G', action: () => window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' }), description: 'Go to bottom', category: 'navigation' },

    // Navigation shortcuts (g + key)
    /* istanbul ignore next */
    { key: 'g h', action: () => navigate('/'), description: 'Go to Home', category: 'navigation' },
    /* istanbul ignore next */
    { key: 'g l', action: () => navigate('/learn'), description: 'Go to Learn', category: 'navigation' },
    /* istanbul ignore next */
    { key: 'g d', action: () => navigate('/dashboard'), description: 'Go to Dashboard', category: 'navigation' },
    /* istanbul ignore next */
    { key: 'g q', action: () => navigate('/quests'), description: 'Go to Quests', category: 'navigation' },
    /* istanbul ignore next */
    { key: 'g c', action: () => navigate('/character'), description: 'Go to Character', category: 'navigation' },
    /* istanbul ignore next */
    { key: 'g r', action: () => navigate('/rewards'), description: 'Go to Rewards', category: 'navigation' },
    /* istanbul ignore next */
    { key: 'g b', action: () => navigate('/badges'), description: 'Go to Badges', category: 'navigation' },
    /* istanbul ignore next */
    { key: 'g m', action: () => navigate('/milestones'), description: 'Go to Milestones', category: 'navigation' },
    /* istanbul ignore next */
    { key: 'g s', action: () => navigate('/settings'), description: 'Go to Settings', category: 'navigation' },
    /* istanbul ignore next */
    { key: 'g w', action: () => navigate('/worldmap'), description: 'Go to World Map', category: 'navigation' },
    /* istanbul ignore next */
    { key: 'g p', action: () => navigate('/profile'), description: 'Go to Profile', category: 'navigation' },
    /* istanbul ignore next */
    { key: 'g a', action: () => navigate('/about'), description: 'Go to About', category: 'navigation' },
    /* istanbul ignore next */
    { key: 'g f', action: () => navigate('/faq'), description: 'Go to FAQ', category: 'navigation' },
    /* istanbul ignore next */
    { key: 'g L', action: () => navigate('/leaderboard'), description: 'Go to Leaderboard', category: 'navigation' },
    /* istanbul ignore next */
    { key: 'g C', action: () => navigate('/challenges'), description: 'Go to Challenges', category: 'navigation' },
    /* istanbul ignore next */
    { key: 'g S', action: () => navigate('/store'), description: 'Go to Store', category: 'navigation' },
    /* istanbul ignore next */
    { key: 'g g', action: () => navigate('/games'), description: 'Go to Mini-Games', category: 'navigation' },

    // Action shortcuts
    /* istanbul ignore next */
    { key: '/', action: () => {
      const searchInput = document.querySelector('input[type="search"], input[placeholder*="Search"], input[placeholder*="search"]') as HTMLInputElement
      if (searchInput) searchInput.focus()
    }, description: 'Focus search', category: 'action' },
    /* istanbul ignore next */
    { key: '?', description: 'Show keyboard shortcuts', action: () => {}, category: 'accessibility' },
    /* istanbul ignore next */
    { key: 'm', action: () => document.body.classList.toggle('hidden-scroll'), description: 'Toggle sidebar', category: 'action' },
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
      // Ignore if user is on an input/textarea (except for specific keys)
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

      // Escape key - close modals or blur inputs
      if (event.key === 'Escape') {
        // If focused on input, blur it
        if (isTyping) {
          target.blur()
          return
        }
        // Close any open modals
        const closeButtons = document.querySelectorAll('[aria-modal="true"] button[class*="text-2xl"]')
        for (const btn of closeButtons) {
          if ((btn as HTMLElement).offsetParent !== null) {
            (btn as HTMLButtonElement).click()
            return
          }
        }
      }

      // Ignore other shortcuts if typing (unless it's ? for help)
      if (isTyping && event.key !== '?') return

      const key = event.key.toLowerCase()

      // '?' key - show keyboard shortcuts
      if (key === '?') {
        // Trigger the keyboard shortcuts help modal
        const shortcutBtn = document.querySelector('[aria-label="Show keyboard shortcuts"]') as HTMLButtonElement
        if (shortcutBtn) shortcutBtn.click()
        return
      }

      // If we have a pending key, check for sequence
      if (pendingKeyRef.current) {
        const sequence = `${pendingKeyRef.current} ${key}`
        clearPendingKey()

        const shortcut = SHORTCUTS.find((s: KeyboardShortcut) => s.key === sequence)
        /* istanbul ignore if */
        if (shortcut) {
          event.preventDefault()
          shortcut.action()
          return
        }
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, navigate, clearPendingKey, handleNKey])

  return { shortcuts: SHORTCUTS }
}
