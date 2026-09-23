import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, fireEvent, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Modal } from './Modal'

// Harness so the modal can be opened/closed the way the app does: by
// re-rendering with a different `isOpen` while a trigger keeps focus.
function Harness({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  return (
    <>
      <button onClick={onClose}>Open</button>
      <Modal isOpen={isOpen} onClose={onClose} title="Quest Details">
        <p>Modal body</p>
        <button>First</button>
        <button>Last</button>
      </Modal>
    </>
  )
}

describe('Modal', () => {
  let onClose: () => void
  const onCloseMock = vi.fn()

  beforeEach(() => {
    onCloseMock.mockClear()
    onClose = onCloseMock
    document.body.style.overflow = ''
  })

  describe('conditional rendering', () => {
    it('renders nothing when closed', () => {
      const { container } = render(<Modal isOpen={false} onClose={onClose} title="Hi">body</Modal>)
      expect(container).toBeEmptyDOMElement()
      expect(screen.queryByRole('dialog')).toBeNull()
    })

    it('renders a portal into document.body when open (not the local container)', () => {
      const { container } = render(
        <Modal isOpen onClose={onClose} title="Quest Details">
          <p>Modal body</p>
        </Modal>
      )
      expect(container).toBeEmptyDOMElement()
      const dialog = screen.getByRole('dialog')
      // Rendered outside the component's own DOM tree, into the document body
      expect(container.contains(dialog)).toBe(false)
      expect(document.body.contains(dialog)).toBe(true)
    })

    it('renders the dialog with title and children', () => {
      render(
        <Modal isOpen onClose={onClose} title="Quest Details">
          <p>Modal body</p>
        </Modal>
      )
      expect(screen.getByRole('heading', { level: 2, name: 'Quest Details' })).toBeInTheDocument()
      expect(screen.getByText('Modal body')).toBeInTheDocument()
    })

    it('exposes aria-modal and links the title via aria-labelledby', () => {
      render(
        <Modal isOpen onClose={onClose} title="Quest Details">
          body
        </Modal>
      )
      const dialog = screen.getByRole('dialog')
      expect(dialog).toHaveAttribute('aria-modal', 'true')
      expect(dialog).toHaveAttribute('aria-labelledby', 'modal-title')
    })

    it('omits aria-labelledby when there is no title', () => {
      render(<Modal isOpen onClose={onClose}>body</Modal>)
      expect(screen.getByRole('dialog')).not.toHaveAttribute('aria-labelledby')
      expect(document.getElementById('modal-title')).toBeNull()
    })

    it('hides the close button when showCloseButton is false', () => {
      render(
        <Modal isOpen onClose={onClose} title="Titled" showCloseButton={false}>
          body
        </Modal>
      )
      expect(screen.queryByRole('button', { name: 'Close modal' })).toBeNull()
      // Title still renders on its own
      expect(screen.getByRole('heading', { name: 'Titled' })).toBeInTheDocument()
    })

    it('applies size and variant classes to the dialog box', () => {
      const { rerender } = render(
        <Modal isOpen onClose={onClose}>body</Modal>
      )
      expect(screen.getByRole('dialog')).toHaveClass('max-w-lg')

      rerender(<Modal isOpen onClose={onClose} size="xl">body</Modal>)
      expect(screen.getByRole('dialog')).toHaveClass('max-w-4xl')

      rerender(<Modal isOpen onClose={onClose} variant="victory">body</Modal>)
      expect(screen.getByRole('dialog')).toHaveClass('border-amber-500')
    })
  })

  describe('closing interactions', () => {
    it('calls onClose when the close button is clicked', async () => {
      const user = userEvent.setup()
      render(<Modal isOpen onClose={onClose}>body</Modal>)
      await user.click(screen.getByRole('button', { name: 'Close modal' }))
      expect(onClose).toHaveBeenCalledTimes(1)
    })

    it('calls onClose when Escape is pressed', () => {
      render(<Modal isOpen onClose={onClose}>body</Modal>)
      fireEvent.keyDown(document, { key: 'Escape' })
      expect(onClose).toHaveBeenCalledTimes(1)
    })

    it('ignores Escape while closed (listener must not leak into the page)', () => {
      render(<Modal isOpen={false} onClose={onClose}>body</Modal>)
      fireEvent.keyDown(document, { key: 'Escape' })
      expect(onClose).not.toHaveBeenCalled()
    })

    it('does not wire a second Escape handler when onClose identity changes', () => {
      const { rerender } = render(<Modal isOpen onClose={onClose}>body</Modal>)
      const next = vi.fn()
      rerender(<Modal isOpen onClose={next}>body</Modal>)
      fireEvent.keyDown(document, { key: 'Escape' })
      expect(next).toHaveBeenCalledTimes(1)
      expect(onClose).not.toHaveBeenCalled()
    })

    it('closes on overlay click but not on clicks inside the dialog', () => {
      render(
        <Modal isOpen onClose={onClose}>
          <button>Inside</button>
        </Modal>
      )
      const overlay = screen.getByRole('dialog').parentElement as HTMLElement

      fireEvent.click(screen.getByRole('button', { name: 'Inside' }))
      expect(onClose).not.toHaveBeenCalled()

      fireEvent.click(overlay)
      expect(onClose).toHaveBeenCalledTimes(1)
    })
  })

  describe('focus management', () => {
    it('moves focus to the first focusable element on open', () => {
      render(<Harness isOpen onClose={onClose} />)
      const closeButton = screen.getByRole('button', { name: 'Close modal' })
      expect(document.activeElement).toBe(closeButton)
    })

    it('wraps Tab from the last element back to the first', () => {
      render(<Harness isOpen onClose={onClose} />)
      const closeButton = screen.getByRole('button', { name: 'Close modal' })
      const last = screen.getByRole('button', { name: 'Last' })

      last.focus()
      expect(document.activeElement).toBe(last)

      fireEvent.keyDown(document, { key: 'Tab' })
      expect(document.activeElement).toBe(closeButton)
    })

    it('wraps Shift+Tab from the first element to the last', () => {
      render(<Harness isOpen onClose={onClose} />)
      const closeButton = screen.getByRole('button', { name: 'Close modal' })
      const last = screen.getByRole('button', { name: 'Last' })

      closeButton.focus()
      fireEvent.keyDown(document, { key: 'Tab', shiftKey: true })
      expect(document.activeElement).toBe(last)
    })

    it('leaves Tab alone when focus is in the middle of the dialog', () => {
      render(<Harness isOpen onClose={onClose} />)
      const first = screen.getByRole('button', { name: 'First' })
      first.focus()
      // Native tab handling is untouched — the trap only intervenes at the edges
      fireEvent.keyDown(document, { key: 'Tab' })
      expect(document.activeElement).toBe(first)
    })

    it('restores focus to the trigger element after closing', () => {
      const { rerender } = render(<Harness isOpen={false} onClose={onClose} />)
      const trigger = screen.getByRole('button', { name: 'Open' })
      trigger.focus()

      rerender(<Harness isOpen onClose={onClose} />)
      expect(document.activeElement).not.toBe(trigger)

      rerender(<Harness isOpen={false} onClose={onClose} />)
      expect(document.activeElement).toBe(trigger)
    })
  })

  describe('body scroll lock', () => {
    it('locks body scroll while open and releases it on close', () => {
      const { rerender } = render(<Modal isOpen onClose={onClose}>body</Modal>)
      expect(document.body).toHaveStyle({ overflow: 'hidden' })

      rerender(<Modal isOpen={false} onClose={onClose}>body</Modal>)
      expect(document.body.style.overflow).toBe('')
    })

    it('releases the scroll lock when the modal unmounts', () => {
      const { unmount } = render(<Modal isOpen onClose={onClose}>body</Modal>)
      expect(document.body).toHaveStyle({ overflow: 'hidden' })

      act(() => {
        unmount()
      })
      expect(document.body.style.overflow).toBe('')
    })
  })
})
