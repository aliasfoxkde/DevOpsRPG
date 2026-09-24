import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { act, fireEvent, render, screen } from '@testing-library/react'
import { renderHook } from '@testing-library/react'
import { useKeyboardShortcuts } from './useKeyboardShortcuts'
import { MemoryRouter, useLocation } from 'react-router-dom'

// Test wrapper that provides router context and exposes the current pathname so
// navigation shortcuts can be asserted on real route changes.
function LocationProbe() {
  const location = useLocation()
  return <span data-testid="pathname">{location.pathname}</span>
}

function wrapper({ children }: { children: React.ReactNode }) {
  return (
    <MemoryRouter initialEntries={['/']}>
      {children}
      <LocationProbe />
    </MemoryRouter>
  )
}

function pressKey(key: string, target: EventTarget = window): void {
  act(() => {
    target.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true }))
  })
}

function currentPath(): string {
  return screen.getByTestId('pathname').textContent
}

/** Appends a fixture element to the body and registers it for removal. */
function addElement(element: HTMLElement): HTMLElement {
  document.body.appendChild(element)
  createdElements.push(element)
  return element
}

const createdElements: HTMLElement[] = []

function addSearchInput(): HTMLInputElement {
  const input = document.createElement('input')
  input.type = 'search'
  input.setAttribute('placeholder', 'Search quests')
  return input
}

describe('useKeyboardShortcuts', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    document.body.className = ''
    createdElements.length = 0
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.restoreAllMocks()
    for (const element of createdElements) element.remove()
    createdElements.length = 0
    document.body.className = ''
  })

  describe('shortcut catalogue', () => {
    it('returns shortcuts list', () => {
      const { result } = renderHook(() => useKeyboardShortcuts(), { wrapper })

      expect(result.current.shortcuts).toHaveLength(24)
      expect(result.current.shortcuts[0].key).toBe('j')
      expect(result.current.shortcuts[1].key).toBe('k')
      expect(result.current.shortcuts[2].key).toBe('gg')
      expect(result.current.shortcuts[3].key).toBe('G')
    })

    it('contains correct descriptions and categories', () => {
      const { result } = renderHook(() => useKeyboardShortcuts(), { wrapper })

      expect(result.current.shortcuts[0].description).toBe('Scroll down')
      expect(result.current.shortcuts[0].category).toBe('navigation')
      expect(result.current.shortcuts[1].description).toBe('Scroll up')
      expect(result.current.shortcuts[2].description).toBe('Go to top')
      expect(result.current.shortcuts[3].description).toBe('Go to bottom')
      expect(result.current.shortcuts.find((s) => s.key === '/')?.category).toBe('action')
      expect(result.current.shortcuts.find((s) => s.key === '?')?.category).toBe('accessibility')
    })

    it('every navigation sequence maps to a route', () => {
      const { result } = renderHook(() => useKeyboardShortcuts(), { wrapper })
      const routes = result.current.shortcuts.filter((s) => s.key.startsWith('g '))

      expect(routes).toHaveLength(17)
      expect(result.current.shortcuts.find((s) => s.key === 'g h')?.description).toBe('Go to Home')
      expect(result.current.shortcuts.find((s) => s.key === 'g l')?.description).toBe('Go to Learn')
    })
  })

  describe('when disabled', () => {
    it('does not react to any key', () => {
      const scrollBy = vi.spyOn(window, 'scrollBy').mockImplementation(() => {})
      renderHook(() => useKeyboardShortcuts(false), { wrapper })

      pressKey('j')
      pressKey('m')

      expect(scrollBy).not.toHaveBeenCalled()
      expect(document.body.classList.contains('hidden-scroll')).toBe(false)
    })

    it('still exposes the catalogue for the help screen', () => {
      const { result } = renderHook(() => useKeyboardShortcuts(false), { wrapper })

      expect(result.current.shortcuts).toHaveLength(24)
    })
  })

  describe('scroll shortcuts', () => {
    it('scrolls down 50px on j', () => {
      const scrollBy = vi.spyOn(window, 'scrollBy').mockImplementation(() => {})
      renderHook(() => useKeyboardShortcuts(), { wrapper })

      pressKey('j')

      expect(scrollBy).toHaveBeenCalledWith({ top: 50, behavior: 'smooth' })
    })

    it('scrolls up 50px on k', () => {
      const scrollBy = vi.spyOn(window, 'scrollBy').mockImplementation(() => {})
      renderHook(() => useKeyboardShortcuts(), { wrapper })

      pressKey('k')

      expect(scrollBy).toHaveBeenCalledWith({ top: -50, behavior: 'smooth' })
    })

    it("treats uppercase 'G' as the sequence prefix, so 'Go to bottom' cannot fire", () => {
      // Keys are lowercased before matching, so the standalone 'G' and 'gg'
      // catalogue entries are shadowed: 'G' opens a pending g-sequence instead
      // of scrolling, and 'g g' navigates to /games instead of scrolling to top.
      const scrollTo = vi.spyOn(window, 'scrollTo').mockImplementation(() => {})
      renderHook(() => useKeyboardShortcuts(), { wrapper })

      pressKey('G')

      expect(scrollTo).not.toHaveBeenCalled()
      expect(vi.getTimerCount()).toBe(1)
    })

    it('stops scrolling after unmount', () => {
      const scrollBy = vi.spyOn(window, 'scrollBy').mockImplementation(() => {})
      const { unmount } = renderHook(() => useKeyboardShortcuts(), { wrapper })

      unmount()
      pressKey('j')

      expect(scrollBy).not.toHaveBeenCalled()
    })
  })

  describe('g sequences', () => {
    it.each([
      ['h', '/'],
      ['l', '/learn'],
      ['d', '/dashboard'],
      ['q', '/quests'],
      ['c', '/character'],
      ['r', '/rewards'],
      ['b', '/badges'],
      ['m', '/milestones'],
      ['s', '/settings'],
      ['w', '/worldmap'],
      ['p', '/profile'],
      ['a', '/about'],
      ['f', '/faq'],
      ['g', '/games'],
    ])("navigates to %s route for 'g %s'", (key, expectedPath) => {
      renderHook(() => useKeyboardShortcuts(), { wrapper })

      pressKey('g')
      pressKey(key)

      expect(currentPath()).toBe(expectedPath)
    })

    it('navigates twice in a row without re-pressing g', () => {
      renderHook(() => useKeyboardShortcuts(), { wrapper })

      pressKey('g')
      pressKey('l')
      pressKey('g')
      pressKey('d')

      expect(currentPath()).toBe('/dashboard')
    })

    it("resolves uppercase 'L' to the lowercase binding, which wins the 'g l' route", () => {
      // Keys are lowercased before matching, so the distinct 'g L'
      // (leaderboard), 'g C' (challenges) and 'g S' (store) catalogue entries
      // are shadowed by their lowercase counterparts.
      renderHook(() => useKeyboardShortcuts(), { wrapper })

      pressKey('g')
      pressKey('L')

      expect(currentPath()).toBe('/learn')
    })

    it('ignores the second key when the sequence times out', () => {
      renderHook(() => useKeyboardShortcuts(), { wrapper })

      pressKey('g')
      act(() => {
        vi.advanceTimersByTime(1001)
      })
      pressKey('h')

      expect(currentPath()).toBe('/')
      expect(vi.getTimerCount()).toBe(0)
    })

    it('drops an unknown sequence and treats the next g as a fresh one', () => {
      renderHook(() => useKeyboardShortcuts(), { wrapper })

      pressKey('g')
      pressKey('t')
      expect(currentPath()).toBe('/')

      pressKey('g')
      pressKey('q')
      expect(currentPath()).toBe('/quests')
    })

    it('clears the pending sequence timer on unmount', () => {
      const { unmount } = renderHook(() => useKeyboardShortcuts(), { wrapper })

      pressKey('g')
      expect(vi.getTimerCount()).toBe(1)

      unmount()

      // The sequence timeout was cancelled with the listener, so nothing can
      // fire after the hook is gone.
      expect(vi.getTimerCount()).toBe(0)
    })
  })

  describe('single-key actions', () => {
    it('focuses the search input on /', () => {
      renderHook(() => useKeyboardShortcuts(), { wrapper })
      const input = addElement(addSearchInput())

      pressKey('/')

      expect(document.activeElement).toBe(input)
    })

    it('activates the shortcuts help button on ?', () => {
      renderHook(() => useKeyboardShortcuts(), { wrapper })
      const helpButton = document.createElement('button')
      helpButton.setAttribute('aria-label', 'Show keyboard shortcuts')
      const click = vi.spyOn(helpButton, 'click').mockImplementation(() => {})
      addElement(helpButton)

      pressKey('?')

      expect(click).toHaveBeenCalledTimes(1)
    })

    it('toggles the sidebar class on m', () => {
      renderHook(() => useKeyboardShortcuts(), { wrapper })

      pressKey('m')
      expect(document.body.classList.contains('hidden-scroll')).toBe(true)

      pressKey('m')
      expect(document.body.classList.contains('hidden-scroll')).toBe(false)
    })

    it('does nothing for keys without a binding', () => {
      const scrollTo = vi.spyOn(window, 'scrollTo').mockImplementation(() => {})
      renderHook(() => useKeyboardShortcuts(), { wrapper })

      pressKey('z')

      expect(scrollTo).not.toHaveBeenCalled()
      expect(currentPath()).toBe('/')
    })

    it('cancels a pending sequence when a second single-key shortcut arrives', () => {
      const scrollBy = vi.spyOn(window, 'scrollBy').mockImplementation(() => {})
      renderHook(() => useKeyboardShortcuts(), { wrapper })

      pressKey('g')
      pressKey('j')

      expect(scrollBy).toHaveBeenCalledWith({ top: 50, behavior: 'smooth' })
      expect(currentPath()).toBe('/')
    })
  })

  describe("the 'n' key activates the primary action", () => {
    it('clicks the focused button first', () => {
      renderHook(() => useKeyboardShortcuts(), { wrapper })
      const focused = document.createElement('button')
      const fallback = document.createElement('button')
      fallback.textContent = 'Take Quiz'
      addElement(focused)
      addElement(fallback)
      const focusedClick = vi.spyOn(focused, 'click').mockImplementation(() => {})
      const fallbackClick = vi.spyOn(fallback, 'click').mockImplementation(() => {})
      focused.focus()

      pressKey('n')

      expect(focusedClick).toHaveBeenCalledTimes(1)
      expect(fallbackClick).not.toHaveBeenCalled()
    })

    it('ignores the focused element when it is disabled and uses a styled primary button', () => {
      renderHook(() => useKeyboardShortcuts(), { wrapper })
      const disabled = document.createElement('button')
      disabled.disabled = true
      const primary = document.createElement('button')
      primary.className = 'bg-amber-600 text-white'
      addElement(disabled)
      addElement(primary)
      const disabledClick = vi.spyOn(disabled, 'click').mockImplementation(() => {})
      const primaryClick = vi.spyOn(primary, 'click').mockImplementation(() => {})
      disabled.focus()

      pressKey('n')

      expect(disabledClick).not.toHaveBeenCalled()
      expect(primaryClick).toHaveBeenCalledTimes(1)
    })

    it('clicks the first action-labelled button when nothing is focused', () => {
      renderHook(() => useKeyboardShortcuts(), { wrapper })
      const plain = document.createElement('button')
      plain.textContent = 'Nothing interesting'
      const action = document.createElement('button')
      action.textContent = 'Take Quiz'
      addElement(plain)
      addElement(action)
      const plainClick = vi.spyOn(plain, 'click').mockImplementation(() => {})
      const actionClick = vi.spyOn(action, 'click').mockImplementation(() => {})

      pressKey('n')

      expect(actionClick).toHaveBeenCalledTimes(1)
      expect(plainClick).not.toHaveBeenCalled()
    })

    it('matches any of the action words case-insensitively', () => {
      renderHook(() => useKeyboardShortcuts(), { wrapper })
      const button = document.createElement('button')
      button.textContent = 'SUBMIT ANSWER'
      addElement(button)
      const click = vi.spyOn(button, 'click').mockImplementation(() => {})

      pressKey('n')

      expect(click).toHaveBeenCalledTimes(1)
    })

    it('clicks the first visible enabled button as a last resort', () => {
      renderHook(() => useKeyboardShortcuts(), { wrapper })
      const button = document.createElement('button')
      button.textContent = 'Mystery'
      addElement(button)
      const click = vi.spyOn(button, 'click').mockImplementation(() => {})

      pressKey('n')

      expect(click).toHaveBeenCalledTimes(1)
    })

    it('skips buttons inside a hidden container', () => {
      renderHook(() => useKeyboardShortcuts(), { wrapper })
      const hiddenWrapper = document.createElement('div')
      hiddenWrapper.className = 'hidden-panel'
      const hiddenButton = document.createElement('button')
      hiddenButton.textContent = 'Hidden action'
      hiddenWrapper.appendChild(hiddenButton)
      const visibleButton = document.createElement('button')
      visibleButton.textContent = 'Visible action'
      addElement(hiddenWrapper)
      addElement(visibleButton)
      const hiddenClick = vi.spyOn(hiddenButton, 'click').mockImplementation(() => {})
      const visibleClick = vi.spyOn(visibleButton, 'click').mockImplementation(() => {})

      pressKey('n')

      expect(hiddenClick).not.toHaveBeenCalled()
      expect(visibleClick).toHaveBeenCalledTimes(1)
    })

    it('blurs a focused input before activating the action', () => {
      renderHook(() => useKeyboardShortcuts(), { wrapper })
      const input = addElement(addSearchInput())
      const action = document.createElement('button')
      action.textContent = 'Continue'
      addElement(action)
      const actionClick = vi.spyOn(action, 'click').mockImplementation(() => {})
      input.focus()

      pressKey('n', input)

      expect(document.activeElement).not.toBe(input)
      expect(actionClick).toHaveBeenCalledTimes(1)
    })
  })

  describe('Escape', () => {
    it('blurs the input the user is typing in', () => {
      renderHook(() => useKeyboardShortcuts(), { wrapper })
      const input = addElement(addSearchInput())
      input.focus()

      pressKey('Escape', input)

      expect(document.activeElement).not.toBe(input)
    })

    it('clicks the close button of an open modal', () => {
      renderHook(() => useKeyboardShortcuts(), { wrapper })
      const modal = document.createElement('div')
      modal.setAttribute('aria-modal', 'true')
      const closeButton = document.createElement('button')
      closeButton.className = 'text-2xl'
      modal.appendChild(closeButton)
      addElement(modal)
      // jsdom performs no layout, so offsetParent is stubbed to mean "visible".
      Object.defineProperty(closeButton, 'offsetParent', { value: document.body })
      const click = vi.spyOn(closeButton, 'click').mockImplementation(() => {})

      pressKey('Escape')

      expect(click).toHaveBeenCalledTimes(1)
    })

    it('skips close buttons that are not rendered', () => {
      renderHook(() => useKeyboardShortcuts(), { wrapper })
      const modal = document.createElement('div')
      modal.setAttribute('aria-modal', 'true')
      const closeButton = document.createElement('button')
      closeButton.className = 'text-2xl'
      modal.appendChild(closeButton)
      addElement(modal)
      Object.defineProperty(closeButton, 'offsetParent', { value: null })
      const click = vi.spyOn(closeButton, 'click').mockImplementation(() => {})

      pressKey('Escape')

      expect(click).not.toHaveBeenCalled()
    })
  })

  describe('typing suppression', () => {
    it('ignores shortcuts typed into an input', () => {
      const scrollBy = vi.spyOn(window, 'scrollBy').mockImplementation(() => {})
      renderHook(() => useKeyboardShortcuts(), { wrapper })
      const input = addElement(addSearchInput())
      input.focus()

      pressKey('j', input)
      pressKey('m', input)

      expect(scrollBy).not.toHaveBeenCalled()
      expect(document.body.classList.contains('hidden-scroll')).toBe(false)
    })

    it('ignores shortcuts typed into a textarea', () => {
      const scrollBy = vi.spyOn(window, 'scrollBy').mockImplementation(() => {})
      renderHook(() => useKeyboardShortcuts(), { wrapper })
      const textarea = document.createElement('textarea')
      addElement(textarea)
      textarea.focus()

      pressKey('j', textarea)

      expect(scrollBy).not.toHaveBeenCalled()
    })

    it('ignores shortcuts typed into a contenteditable element', () => {
      const scrollBy = vi.spyOn(window, 'scrollBy').mockImplementation(() => {})
      renderHook(() => useKeyboardShortcuts(), { wrapper })
      const editable = document.createElement('div')
      editable.contentEditable = 'true'
      // jsdom does not compute editing state from the attribute.
      Object.defineProperty(editable, 'isContentEditable', { value: true })
      addElement(editable)
      editable.focus()

      pressKey('j', editable)

      expect(scrollBy).not.toHaveBeenCalled()
    })

    it('still opens the help modal from inside an input', () => {
      renderHook(() => useKeyboardShortcuts(), { wrapper })
      const input = addElement(addSearchInput())
      input.focus()
      const helpButton = document.createElement('button')
      helpButton.setAttribute('aria-label', 'Show keyboard shortcuts')
      const click = vi.spyOn(helpButton, 'click').mockImplementation(() => {})
      addElement(helpButton)

      pressKey('?', input)

      expect(click).toHaveBeenCalledTimes(1)
    })
  })

  describe('rendered component integration', () => {
    it('navigates a real route from a rendered tree', () => {
      function Page() {
        useKeyboardShortcuts()
        return <p>Shortcuts active</p>
      }
      render(
        <MemoryRouter initialEntries={['/']}>
          <LocationProbe />
          <Page />
        </MemoryRouter>,
      )

      fireEvent.keyDown(window, { key: 'g' })
      fireEvent.keyDown(window, { key: 'q' })

      expect(currentPath()).toBe('/quests')
      expect(screen.getByText('Shortcuts active')).toBeInTheDocument()
    })
  })
})
