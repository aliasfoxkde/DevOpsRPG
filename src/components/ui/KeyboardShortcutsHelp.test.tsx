import { describe, it, expect } from 'vitest'
import { render, screen, act, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import KeyboardShortcutsHelp from './KeyboardShortcutsHelp'

// The dialog listens for window keydown outside React's event system, so the
// dispatch is act-wrapped to flush the state change before asserting.
function pressKey(key: string, init: KeyboardEventInit = {}, target: EventTarget = window) {
  act(() => {
    target.dispatchEvent(
      new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true, ...init }),
    )
  })
}

describe('KeyboardShortcutsHelp', () => {
  it('starts closed, showing only the floating help button', () => {
    render(<KeyboardShortcutsHelp />)

    expect(screen.queryByRole('dialog')).toBeNull()
    expect(screen.getByRole('button', { name: 'Show keyboard shortcuts' })).toHaveAttribute(
      'title',
      'Keyboard Shortcuts (?)',
    )
  })

  it('opens the dialog from the floating button', async () => {
    const user = userEvent.setup()
    render(<KeyboardShortcutsHelp />)

    await user.click(screen.getByRole('button', { name: 'Show keyboard shortcuts' }))

    const dialog = screen.getByRole('dialog')
    expect(dialog).toHaveAttribute('aria-modal', 'true')
    expect(dialog).toHaveAttribute('aria-labelledby', 'keyboard-shortcuts-title')
    expect(
      screen.getByRole('heading', { level: 2, name: /Keyboard Shortcuts/ }),
    ).toBeInTheDocument()
  })

  it('toggles open with the "?" key', () => {
    render(<KeyboardShortcutsHelp />)

    pressKey('?')
    expect(screen.getByRole('dialog')).toBeInTheDocument()

    pressKey('?')
    expect(screen.queryByRole('dialog')).toBeNull()
  })

  it('ignores "?" when typed with a modifier held', () => {
    render(<KeyboardShortcutsHelp />)

    pressKey('?', { shiftKey: true })
    pressKey('?', { ctrlKey: true })
    pressKey('?', { metaKey: true })

    expect(screen.queryByRole('dialog')).toBeNull()
  })

  it('ignores "?" typed while an input has focus', () => {
    render(
      <>
        <label>
          Search
          <input />
        </label>
        <KeyboardShortcutsHelp />
      </>,
    )
    const input = screen.getByRole('textbox')
    input.focus()

    // The keypress happens while the caret is in the input, so the event
    // bubbles up from there and the handler must ignore it
    pressKey('?', {}, input)

    expect(screen.queryByRole('dialog')).toBeNull()
  })

  it('closes with Escape while open', () => {
    render(<KeyboardShortcutsHelp />)
    pressKey('?')
    expect(screen.getByRole('dialog')).toBeInTheDocument()

    pressKey('Escape')
    expect(screen.queryByRole('dialog')).toBeNull()
  })

  it('ignores Escape while closed', () => {
    render(<KeyboardShortcutsHelp />)
    pressKey('Escape')
    expect(screen.queryByRole('dialog')).toBeNull()
  })

  it('closes from the close button', async () => {
    const user = userEvent.setup()
    render(<KeyboardShortcutsHelp />)
    await user.click(screen.getByRole('button', { name: 'Show keyboard shortcuts' }))

    await user.click(screen.getByRole('button', { name: 'Close keyboard shortcuts' }))

    expect(screen.queryByRole('dialog')).toBeNull()
    // The floating button comes back so help can be reopened
    expect(screen.getByRole('button', { name: 'Show keyboard shortcuts' })).toBeInTheDocument()
  })

  it('closes on a backdrop click but not on a click inside the panel', async () => {
    const user = userEvent.setup()
    render(<KeyboardShortcutsHelp />)
    await user.click(screen.getByRole('button', { name: 'Show keyboard shortcuts' }))
    const dialog = screen.getByRole('dialog')

    // Clicking the panel content (the heading) must not dismiss the dialog
    await user.click(screen.getByRole('heading', { level: 2, name: /Keyboard Shortcuts/ }))
    expect(screen.getByRole('dialog')).toBe(dialog)

    // Clicking the backdrop itself (the outer handler) dismisses it
    fireEvent.click(dialog)
    expect(screen.queryByRole('dialog')).toBeNull()
  })

  it('lists navigation and action shortcuts together under "All"', () => {
    render(<KeyboardShortcutsHelp />)

    pressKey('?')
    expect(screen.getByRole('dialog')).toBeInTheDocument()

    expect(screen.getByText('Scroll down')).toBeInTheDocument()
    expect(screen.getByText('Click primary button')).toBeInTheDocument()
    expect(screen.getByText('Go to Home')).toBeInTheDocument()
  })

  it('filters the list to the selected category', async () => {
    const user = userEvent.setup()
    render(<KeyboardShortcutsHelp />)
    await user.click(screen.getByRole('button', { name: 'Show keyboard shortcuts' }))

    await user.click(screen.getByRole('button', { name: 'Actions' }))

    expect(screen.getByText('Click primary button')).toBeInTheDocument()
    expect(screen.queryByText('Scroll down')).toBeNull()
    expect(screen.queryByText('Go to Home')).toBeNull()
  })

  it('shows every shortcut again when returning to "All"', async () => {
    const user = userEvent.setup()
    render(<KeyboardShortcutsHelp />)
    await user.click(screen.getByRole('button', { name: 'Show keyboard shortcuts' }))
    await user.click(screen.getByRole('button', { name: 'Help' }))

    // The Help category only contains the "?" entry
    expect(screen.queryByText('Scroll down')).toBeNull()
    expect(screen.getByText('Show this help')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'All' }))
    expect(screen.getByText('Scroll down')).toBeInTheDocument()
  })

  it('renders each shortcut with its key in a <kbd>', async () => {
    const user = userEvent.setup()
    render(<KeyboardShortcutsHelp />)
    await user.click(screen.getByRole('button', { name: 'Show keyboard shortcuts' }))

    const row = screen.getByText('Scroll down').closest('div')
    const kbd = row?.querySelector('kbd')
    expect(kbd).toHaveTextContent('j')
  })

  it('documents the toggle key inside the dialog footer', async () => {
    const user = userEvent.setup()
    render(<KeyboardShortcutsHelp />)
    await user.click(screen.getByRole('button', { name: 'Show keyboard shortcuts' }))

    const footer = screen.getByText(/to toggle this help/)
    expect(footer).toBeInTheDocument()
    expect(footer.querySelector('kbd')).toHaveTextContent('?')
  })
})
