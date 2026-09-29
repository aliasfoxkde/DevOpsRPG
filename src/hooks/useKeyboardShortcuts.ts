import { useEffect, useCallback, useRef } from 'react'
import { useNavigate } from 'react-router-dom'

export interface ShortcutSpec {
  key: string
  description: string
  category: 'navigation' | 'action' | 'accessibility'
}

/**
 * The advertised catalogue, shared with the help modal so a shortcut can
 * never be documented differently from how it behaves. Keys are matched
 * case-sensitively: uppercase `G` scrolls to the bottom, lowercase `g`
 * starts a two-key sequence, and `g L`/`g C`/`g S` are distinct from any
 * lowercase neighbour.
 */
export const SHORTCUT_SPECS: ShortcutSpec[] = [
  { key: 'j', description: 'Scroll down', category: 'navigation' },
  { key: 'k', description: 'Scroll up', category: 'navigation' },
  { key: 'G', description: 'Go to bottom', category: 'navigation' },
  { key: 'g h', description: 'Go to Home', category: 'navigation' },
  { key: 'g q', description: 'Go to Quests', category: 'navigation' },
  { key: 'g c', description: 'Go to Character', category: 'navigation' },
  { key: 'g r', description: 'Go to Rewards', category: 'navigation' },
  { key: 'g b', description: 'Go to Badges', category: 'navigation' },
  { key: 'g m', description: 'Go to Milestones', category: 'navigation' },
  { key: 'g s', description: 'Go to Settings', category: 'navigation' },
  { key: 'g w', description: 'Go to World Map', category: 'navigation' },
  { key: 'g p', description: 'Go to Profile', category: 'navigation' },
  { key: 'g a', description: 'Go to About', category: 'navigation' },
  { key: 'g f', description: 'Go to FAQ', category: 'navigation' },
  { key: 'g L', description: 'Go to Leaderboard', category: 'navigation' },
  { key: 'g C', description: 'Go to Challenges', category: 'navigation' },
  { key: 'g S', description: 'Go to Store', category: 'navigation' },
  { key: 'g g', description: 'Go to Mini-Games', category: 'navigation' },
  { key: '/', description: 'Focus search', category: 'action' },
  { key: 'n', description: 'Activate primary action', category: 'action' },
  { key: '?', description: 'Show keyboard shortcuts', category: 'accessibility' },
]

const SEQUENCE_TIMEOUT = 1000 // ms to wait for second key

/** The routes the g-sequences bind to — all real paths in src/App.tsx. */
const G_ROUTES: Record<string, string> = {
  'g h': '/',
  'g q': '/quests',
  'g c': '/character',
  'g r': '/rewards',
  'g b': '/badges',
  'g m': '/milestones',
  'g s': '/settings',
  'g w': '/worldmap',
  'g p': '/profile',
  'g a': '/about',
  'g f': '/faq',
  'g L': '/leaderboard',
  'g C': '/challenges',
  'g S': '/store',
  'g g': '/games',
}

export function useKeyboardShortcuts(enabled = true) {
  const navigate = useNavigate()

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

  // 'n' key - Click focused button OR primary button OR first action button
  const handleNKey = useCallback(() => {
    // Priority 1: Click already focused element if it's a button
    const activeElement = document.activeElement as HTMLButtonElement | null
    if (activeElement && activeElement.tagName === 'BUTTON' && !activeElement.disabled) {
      activeElement.click()
      return
    }

    // Priority 2: Find primary action button (ones with prominent styling)
    const primarySelectors = [
      'button[class*="from-amber-600"]', // Amber gradient buttons
      'button[class*="from-green-600"]', // Green gradient buttons
      'button[class*="from-purple-600"]', // Purple gradient buttons
      'button[class*="bg-amber-600"]', // Amber solid buttons
      'button[class*="bg-green-600"]', // Green solid buttons
      'button[class*="bg-purple-600"]', // Purple solid buttons
    ]

    for (const selector of primarySelectors) {
      const btn = document.querySelector<HTMLButtonElement>(selector)
      if (btn && !btn.disabled) {
        btn.click()
        return
      }
    }

    // Priority 3: Click any enabled button with "Take Quiz", "Complete", "Begin", "Start", "Continue" text
    const actionButtons = document.querySelectorAll('button')
    for (const btn of actionButtons) {
      if (btn.disabled) continue
      const text = btn.textContent.toLowerCase()
      if (
        text.includes('take quiz') ||
        text.includes('complete') ||
        text.includes('begin') ||
        text.includes('start') ||
        text.includes('continue') ||
        text.includes('next') ||
        text.includes('finish') ||
        text.includes('submit')
      ) {
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
      // Ignore everything while the user is on an input/textarea, except the
      // '?' help key — typing a letter must never trigger a shortcut.
      const target = event.target as HTMLElement
      const isTyping =
        target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable

      if (event.key === 'Escape') {
        // If focused on input, blur it
        if (isTyping) {
          target.blur()
          return
        }
        // Close any open modals
        const closeButtons = document.querySelectorAll(
          '[aria-modal="true"] button[class*="text-2xl"]',
        )
        for (const btn of closeButtons) {
          if ((btn as HTMLElement).offsetParent !== null) {
            ;(btn as HTMLButtonElement).click()
            return
          }
        }
      }

      if (isTyping && event.key !== '?') return

      // '?' key - show keyboard shortcuts
      if (event.key === '?') {
        const shortcutBtn = document.querySelector<HTMLButtonElement>(
          '[aria-label="Show keyboard shortcuts"]',
        )
        if (shortcutBtn) shortcutBtn.click()
        return
      }

      // Exact-key matching: shift+G scrolls, lowercase g opens a sequence.
      if (pendingKeyRef.current) {
        const sequence = `${pendingKeyRef.current} ${event.key}`
        clearPendingKey()

        const route = G_ROUTES[sequence]
        if (route) {
          event.preventDefault()
          void navigate(route)
          return
        }
      } else if (event.key === 'g') {
        pendingKeyRef.current = event.key
        timeoutRef.current = setTimeout(clearPendingKey, SEQUENCE_TIMEOUT)
        return
      }

      if (event.key === 'n') {
        event.preventDefault()
        handleNKey()
        return
      }

      const spec = SHORTCUT_SPECS.find((s) => s.key === event.key)
      if (spec) {
        event.preventDefault()
        if (event.key === 'j') {
          window.scrollBy({ top: 50, behavior: 'smooth' })
        } else if (event.key === 'k') {
          window.scrollBy({ top: -50, behavior: 'smooth' })
        } else if (event.key === 'G') {
          window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' })
        } else if (event.key === '/') {
          const searchInput = document.querySelector<HTMLInputElement>(
            'input[type="search"], input[placeholder*="Search"], input[placeholder*="search"]',
          )
          if (searchInput) searchInput.focus()
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      clearPendingKey()
    }
  }, [enabled, navigate, clearPendingKey, handleNKey])

  return { shortcuts: SHORTCUT_SPECS }
}
