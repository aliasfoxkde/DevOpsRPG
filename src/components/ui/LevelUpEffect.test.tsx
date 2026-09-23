import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { render, act } from '@testing-library/react'
import { LevelUpEffect, AnimatedXPBar, LevelUpBadge } from './LevelUpEffect'

// The whole module runs on timers and microtasks, so they are faked/flushed
// explicitly to keep the animations deterministic.
beforeEach(() => {
  vi.useFakeTimers()
})

afterEach(() => {
  vi.useRealTimers()
})

// Renders and then flushes the mount-time microtask that creates particles
function renderLevelUp(level: number, onComplete: () => void) {
  const utils = render(<LevelUpEffect level={level} onComplete={onComplete} />)
  return { ...utils, flush: () => act(async () => {}) }
}

describe('LevelUpEffect', () => {
  it('renders the celebration copy and the new level', async () => {
    const onComplete = vi.fn()
    const { container, flush } = renderLevelUp(7, onComplete)
    await flush()

    expect(container.textContent).toContain('LEVEL UP!')
    expect(container.textContent).toContain('7')
    expect(container.textContent).toContain('Keep going, hero!')
  })

  it('bursts 30 particles', async () => {
    const onComplete = vi.fn()
    const { container, flush } = renderLevelUp(2, onComplete)
    await flush()

    expect(container.querySelectorAll('.bg-amber-400')).toHaveLength(30)
  })

  it('reveals the copy and the level in staggered stages', async () => {
    const onComplete = vi.fn()
    const { container, flush } = renderLevelUp(9, onComplete)
    await flush()

    const divByText = (text: string) =>
      Array.from(container.querySelectorAll('div')).find(
        (node) => node.textContent === text
      ) as HTMLElement

    const levelUpText = divByText('LEVEL UP!')
    const levelNumber = divByText('9')

    // Nothing has animated in yet
    expect(levelUpText).toHaveClass('opacity-0')
    expect(levelNumber).toHaveClass('opacity-0')

    act(() => {
      vi.advanceTimersByTime(200)
    })
    expect(levelUpText).toHaveClass('opacity-100')
    // Level number is still waiting for its stage
    expect(levelNumber).toHaveClass('opacity-0')

    act(() => {
      vi.advanceTimersByTime(400)
    })
    expect(levelNumber).toHaveClass('opacity-100')
  })

  it('does not finish before the celebration ends', () => {
    const onComplete = vi.fn()
    render(<LevelUpEffect level={3} onComplete={onComplete} />)

    act(() => {
      vi.advanceTimersByTime(1000)
    })
    expect(onComplete).not.toHaveBeenCalled()
  })

  it('calls onComplete when the celebration finishes', () => {
    const onComplete = vi.fn()
    render(<LevelUpEffect level={3} onComplete={onComplete} />)

    act(() => {
      vi.advanceTimersByTime(2500)
    })
    expect(onComplete).toHaveBeenCalledTimes(1)
  })
})

describe('AnimatedXPBar', () => {
  const fillOf = (container: HTMLElement) =>
    container.firstElementChild?.firstElementChild as HTMLElement

  it('renders the current xp share without animation chrome', async () => {
    const { container } = render(<AnimatedXPBar xp={40} maxXp={100} />)
    await act(async () => {})

    expect(fillOf(container)).toHaveStyle({ width: '40%' })
    expect(container.querySelector('.animate-ping')).toBeNull()
  })

  it('clamps the bar at 100% when xp exceeds the maximum', async () => {
    const { container } = render(<AnimatedXPBar xp={250} maxXp={100} />)
    await act(async () => {})

    expect(fillOf(container)).toHaveStyle({ width: '100%' })
  })

  it('shows an empty bar when there is no xp', async () => {
    const { container } = render(<AnimatedXPBar xp={0} maxXp={100} />)
    await act(async () => {})

    expect(fillOf(container)).toHaveStyle({ width: '0%' })
  })

  it('counts up towards the new xp while animating', async () => {
    const { container, rerender } = render(
      <AnimatedXPBar xp={0} maxXp={100} showAnimation />
    )
    expect(fillOf(container)).toHaveStyle({ width: '0%' })

    rerender(<AnimatedXPBar xp={100} maxXp={100} showAnimation />)
    act(() => {
      vi.advanceTimersByTime(600)
    })
    // The count-up applies its value from a microtask after each tick
    await act(async () => {})

    expect(parseFloat(fillOf(container).style.width)).toBeGreaterThan(0)
    // The animated bar shows its sheen
    expect(container.querySelector('.animate-ping')).not.toBeNull()
  })

  it('jumps straight to the value when animation is off', async () => {
    const { container, rerender } = render(<AnimatedXPBar xp={0} maxXp={100} />)
    rerender(<AnimatedXPBar xp={100} maxXp={100} />)
    // The jump is applied in a microtask after the prop change
    await act(async () => {})

    expect(fillOf(container)).toHaveStyle({ width: '100%' })
    expect(container.querySelector('.animate-ping')).toBeNull()
  })
})

describe('LevelUpBadge', () => {
  it('displays the level number', () => {
    const { container } = render(<LevelUpBadge level={12} />)
    expect(container.textContent).toBe('12')
  })

  it('colours the badge by level tier', () => {
    const tiers: Array<{ level: number; gradient: string }> = [
      { level: 55, gradient: 'from-purple-600' },
      { level: 35, gradient: 'from-amber-600' },
      { level: 25, gradient: 'from-green-600' },
      { level: 15, gradient: 'from-blue-600' },
      { level: 3, gradient: 'from-slate-600' },
    ]

    for (const { level, gradient } of tiers) {
      const { container, unmount } = render(<LevelUpBadge level={level} />)
      expect(container.firstElementChild, `level ${level}`).toHaveClass(gradient)
      unmount()
    }
  })
})
