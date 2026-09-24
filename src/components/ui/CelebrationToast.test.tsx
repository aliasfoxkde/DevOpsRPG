import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { render, screen, act, fireEvent } from '@testing-library/react'
import { ToastManager } from './CelebrationToast'

type ToastType = 'milestone' | 'encouragement' | 'achievement' | 'levelup'

interface ToastItem {
  id: string
  message: string
  type: ToastType
  icon?: string
  xpGained?: number
}

function makeToast(overrides: Partial<ToastItem> = {}): ToastItem {
  return { id: 'toast-1', message: 'You did it!', type: 'milestone', ...overrides }
}

function renderToasts(toasts: ToastItem[]) {
  const onRemove = vi.fn()
  const utils = render(<ToastManager toasts={toasts} onRemove={onRemove} />)
  return { ...utils, onRemove }
}

// The toast root carries the animated position/opacity classes; the message
// sits three levels below it inside the themed card.
function toastRoot(message: string): HTMLElement | null {
  return screen.getByText(message).closest('.fixed')
}

// The exit transition and the delayed removal both run on timers.
beforeEach(() => {
  vi.useFakeTimers()
})

afterEach(() => {
  vi.useRealTimers()
})

describe('ToastManager', () => {
  it('renders nothing but the stack container when there are no toasts', () => {
    const { container } = renderToasts([])

    expect(container.textContent).toBe('')
    expect(screen.queryByRole('button')).toBeNull()
  })

  it('stacks several toasts and spaces them by their index', () => {
    renderToasts([
      makeToast({ id: 'a', message: 'First toast' }),
      makeToast({ id: 'b', message: 'You did it!', type: 'levelup' }),
    ])

    expect(screen.getByText('First toast')).toBeInTheDocument()
    expect(screen.getByText('You did it!')).toBeInTheDocument()

    // Each toast sits in a plain wrapper div that carries its stacking offset.
    const firstWrapper = toastRoot('First toast')?.parentElement
    const secondWrapper = toastRoot('You did it!')?.parentElement
    expect(firstWrapper).toHaveStyle({ marginTop: '0px' })
    expect(secondWrapper).toHaveStyle({ marginTop: '10px' })
    expect(firstWrapper?.parentElement?.children).toHaveLength(2)
  })

  it('removes only the toast whose close button was pressed', () => {
    const { onRemove } = renderToasts([
      makeToast({ id: 'a', message: 'First toast' }),
      makeToast({ id: 'b', message: 'Second toast' }),
    ])

    fireEvent.click(screen.getAllByRole('button', { name: '×' })[0])
    act(() => {
      vi.advanceTimersByTime(300)
    })

    expect(onRemove).toHaveBeenCalledTimes(1)
    expect(onRemove).toHaveBeenCalledWith('a')
    expect(screen.getByText('Second toast')).toBeInTheDocument()
  })
})

describe('CelebrationToast', () => {
  describe('type styling', () => {
    it.each([
      ['milestone', '🏆', 'border-amber-500'],
      ['encouragement', '💪', 'border-purple-500'],
      ['achievement', '🎉', 'border-green-500'],
      ['levelup', '⬆️', 'border-blue-500'],
    ] as [ToastType, string, string][])(
      'uses the %s palette and its default icon when none is given',
      (type, defaultIcon, borderClass) => {
        renderToasts([makeToast({ type })])

        expect(screen.getByText(defaultIcon)).toBeInTheDocument()
        expect(screen.getByText('You did it!').closest('.border-2')).toHaveClass(borderClass)
      },
    )

    it('prefers an explicit icon over the type default', () => {
      renderToasts([makeToast({ type: 'levelup', icon: '🥇' })])

      expect(screen.getByText('🥇')).toBeInTheDocument()
      expect(screen.queryByText('⬆️')).toBeNull()
    })
  })

  describe('xp line', () => {
    it('shows the xp gained when it is positive', () => {
      renderToasts([makeToast({ xpGained: 125 })])

      expect(screen.getByText('+125 XP')).toBeInTheDocument()
    })

    it('omits the xp line when no xp was gained', () => {
      renderToasts([makeToast({ xpGained: 0 })])

      expect(screen.queryByText(/\d+ XP/)).toBeNull()
    })

    it('omits the xp line when the prop is not supplied', () => {
      renderToasts([makeToast()])

      expect(screen.queryByText(/\d+ XP/)).toBeNull()
    })
  })

  describe('auto dismiss', () => {
    it('stays fully visible until the five second timer elapses', () => {
      const { onRemove } = renderToasts([makeToast()])

      act(() => {
        vi.advanceTimersByTime(4999)
      })

      const wrapper = toastRoot('You did it!')
      expect(wrapper).toHaveClass('opacity-100')
      expect(wrapper).toHaveClass('translate-y-0')
      expect(wrapper).not.toHaveClass('opacity-0')
      expect(onRemove).not.toHaveBeenCalled()
    })

    it('starts the exit transition after five seconds, then removes itself', () => {
      const { onRemove } = renderToasts([makeToast({ id: 'auto-1' })])

      act(() => {
        vi.advanceTimersByTime(5000)
      })

      const wrapper = toastRoot('You did it!')
      expect(wrapper).toHaveClass('opacity-0')
      expect(wrapper).toHaveClass('translate-y-[-20px]')
      expect(onRemove).not.toHaveBeenCalled()

      act(() => {
        vi.advanceTimersByTime(300)
      })
      expect(onRemove).toHaveBeenCalledTimes(1)
      expect(onRemove).toHaveBeenCalledWith('auto-1')
    })
  })

  describe('manual dismiss', () => {
    it('exits immediately on close but waits for the transition before removing', () => {
      const { onRemove } = renderToasts([makeToast({ id: 'manual-1' })])

      fireEvent.click(screen.getByRole('button', { name: '×' }))

      const wrapper = toastRoot('You did it!')
      expect(wrapper).toHaveClass('opacity-0')
      expect(wrapper).toHaveClass('translate-y-[-20px]')
      expect(onRemove).not.toHaveBeenCalled()

      act(() => {
        vi.advanceTimersByTime(299)
      })
      expect(onRemove).not.toHaveBeenCalled()

      act(() => {
        vi.advanceTimersByTime(1)
      })
      expect(onRemove).toHaveBeenCalledWith('manual-1')
    })

    it('does not call the remove callback twice if the exit already began', () => {
      const { onRemove } = renderToasts([makeToast({ id: 'once-1' })])

      fireEvent.click(screen.getByRole('button', { name: '×' }))
      act(() => {
        vi.advanceTimersByTime(5000)
      })

      expect(onRemove).toHaveBeenCalledTimes(1)
    })

    it('replaces the auto-scheduled removal when dismissed mid-exit', () => {
      const { onRemove } = renderToasts([makeToast({ id: 'late-1' })])

      // Five seconds in, the exit has begun and a removal is already booked
      // for 300ms later. Dismissing now cancels that booking...
      act(() => {
        vi.advanceTimersByTime(5100)
      })
      fireEvent.click(screen.getByRole('button', { name: '×' }))

      act(() => {
        vi.advanceTimersByTime(299)
      })
      expect(onRemove).not.toHaveBeenCalled()

      // ...and books a fresh one, 300ms after the click.
      act(() => {
        vi.advanceTimersByTime(1)
      })
      expect(onRemove).toHaveBeenCalledTimes(1)
    })
  })

  describe('cleanup', () => {
    it('never removes a toast that unmounted before its timers fired', () => {
      const { unmount, onRemove } = renderToasts([makeToast({ id: 'gone-1' })])

      unmount()
      act(() => {
        vi.advanceTimersByTime(10_000)
      })

      expect(onRemove).not.toHaveBeenCalled()
    })

    it('cancels the pending removal when it unmounts mid-transition', () => {
      const { unmount, onRemove } = renderToasts([makeToast({ id: 'mid-1' })])

      fireEvent.click(screen.getByRole('button', { name: '×' }))
      unmount()
      act(() => {
        vi.advanceTimersByTime(2000)
      })

      expect(onRemove).not.toHaveBeenCalled()
    })
  })
})
