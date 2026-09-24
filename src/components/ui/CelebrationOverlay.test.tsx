import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { render, screen, act } from '@testing-library/react'
import CelebrationOverlay, { StreakBonus, MilestonePopup } from './CelebrationOverlay'

// jsdom's animation frames run on their own clock, so they are replaced with a
// queue the tests drain by hand. This keeps the confetti teardown observable.
let frameCallbacks: Map<number, (time: number) => void>
let nextFrameHandle: number

function stubAnimationFrames() {
  frameCallbacks = new Map()
  nextFrameHandle = 1
  vi.stubGlobal('requestAnimationFrame', (callback: (time: number) => void): number => {
    frameCallbacks.set(nextFrameHandle, callback)
    return nextFrameHandle++
  })
  vi.stubGlobal('cancelAnimationFrame', (handle: number): void => {
    frameCallbacks.delete(handle)
  })
}

function runAnimationFrame() {
  const pending = [...frameCallbacks.values()]
  frameCallbacks.clear()
  let time = 16
  for (const callback of pending) {
    callback(time)
    time += 16
  }
}

function pendingFrameCount(): number {
  return frameCallbacks.size
}

function confettiPieces(container: HTMLElement): HTMLElement[] {
  const overlay = container.firstElementChild
  return overlay ? Array.from(overlay.querySelectorAll<HTMLDivElement>('div.animate-fall')) : []
}

beforeEach(() => {
  vi.useFakeTimers()
  stubAnimationFrames()
})

afterEach(() => {
  vi.unstubAllGlobals()
  vi.useRealTimers()
})

describe('CelebrationOverlay', () => {
  it('renders a full screen confetti burst of fifty pieces', () => {
    const { container } = render(<CelebrationOverlay />)

    expect(container.firstElementChild).toHaveClass('pointer-events-none', 'overflow-hidden')
    expect(confettiPieces(container)).toHaveLength(50)
  })

  it('positions every piece along the top edge with its own colour, size and delay', () => {
    const { container } = render(<CelebrationOverlay />)

    for (const piece of confettiPieces(container)) {
      expect(piece).toHaveClass('absolute')
      expect(piece).toHaveClass('animate-fall')
      expect(piece.style.top).toBe('-20px')
      expect(piece.style.left).toMatch(/%$/)
      // jsdom serialises hex colours back out as rgb()
      expect(piece.style.backgroundColor).toMatch(/^#[0-9a-f]{6}$|^rgb\(/)
      expect(Number.parseFloat(piece.style.width)).toBeGreaterThanOrEqual(5)
      expect(Number.parseFloat(piece.style.height)).toBeGreaterThanOrEqual(5)
      expect(piece.style.animationDelay).toMatch(/s$/)
      expect(piece.style.transform).toMatch(/^rotate\(\d+(\.\d+)?deg\)$/)
    }
  })

  it('rounds every third piece into a circle and squares the rest', () => {
    const { container } = render(<CelebrationOverlay />)

    const pieces = confettiPieces(container)
    expect(pieces[0].style.borderRadius).toBe('50%')
    expect(pieces[1].style.borderRadius).toBe('2px')
    expect(pieces[2].style.borderRadius).toBe('2px')
    expect(pieces[3].style.borderRadius).toBe('50%')
    expect(pieces[48].style.borderRadius).toBe('50%')
  })

  it('keeps the burst on screen until the four second animation window ends', () => {
    const { container } = render(<CelebrationOverlay />)

    act(() => {
      vi.advanceTimersByTime(3999)
    })
    expect(confettiPieces(container)).toHaveLength(50)

    act(() => {
      vi.advanceTimersByTime(1)
    })
    // The pieces are only dropped once the browser hands back a frame.
    expect(confettiPieces(container)).toHaveLength(50)
    expect(pendingFrameCount()).toBe(1)

    act(() => {
      runAnimationFrame()
    })
    expect(container).toBeEmptyDOMElement()
  })

  it('stops requesting frames once the burst has been cleared', () => {
    render(<CelebrationOverlay />)

    act(() => {
      vi.advanceTimersByTime(4000)
    })
    act(() => {
      runAnimationFrame()
    })

    expect(pendingFrameCount()).toBe(0)
  })

  it('cancels the teardown timer when it unmounts early', () => {
    const { unmount } = render(<CelebrationOverlay />)

    unmount()
    act(() => {
      vi.advanceTimersByTime(5000)
    })

    expect(pendingFrameCount()).toBe(0)
  })
})

describe('StreakBonus', () => {
  it('celebrates the streak and its bonus xp', () => {
    render(<StreakBonus streak={12} />)

    expect(screen.getByText('🔥')).toBeInTheDocument()
    expect(screen.getByText('12 Day Streak!')).toBeInTheDocument()
    expect(screen.getByText('+60 Bonus XP!')).toBeInTheDocument()
  })

  it('renders zero streaks without crashing the overlay', () => {
    render(<StreakBonus streak={0} />)

    expect(screen.getByText('0 Day Streak!')).toBeInTheDocument()
    expect(screen.getByText('+0 Bonus XP!')).toBeInTheDocument()
  })
})

describe('MilestonePopup', () => {
  function renderPopup(onComplete: () => void) {
    return render(
      <MilestonePopup
        icon="🛡️"
        title="First Quest"
        message="You completed your very first quest."
        xpBonus={75}
        onComplete={onComplete}
      />,
    )
  }

  it('shows the milestone art, copy and xp bonus', () => {
    renderPopup(vi.fn())

    expect(screen.getByText('🛡️')).toBeInTheDocument()
    expect(screen.getByText('⭐ MILESTONE UNLOCKED!')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'First Quest' })).toBeInTheDocument()
    expect(screen.getByText('You completed your very first quest.')).toBeInTheDocument()
    expect(screen.getByText('+75 XP BONUS!')).toBeInTheDocument()
    expect(screen.getByText('Auto-closing...')).toBeInTheDocument()
  })

  it('hides itself after three and a half seconds, then reports completion', () => {
    const onComplete = vi.fn()
    renderPopup(onComplete)

    act(() => {
      vi.advanceTimersByTime(3499)
    })
    expect(screen.getByText('First Quest')).toBeInTheDocument()
    expect(onComplete).not.toHaveBeenCalled()

    act(() => {
      vi.advanceTimersByTime(1)
    })
    expect(screen.queryByText('First Quest')).toBeNull()
    expect(onComplete).not.toHaveBeenCalled()

    act(() => {
      vi.advanceTimersByTime(300)
    })
    expect(onComplete).toHaveBeenCalledTimes(1)
  })

  it('never reports completion for a popup that unmounted first', () => {
    const onComplete = vi.fn()
    const { unmount } = renderPopup(onComplete)

    unmount()
    act(() => {
      vi.advanceTimersByTime(5000)
    })

    expect(onComplete).not.toHaveBeenCalled()
  })
})
