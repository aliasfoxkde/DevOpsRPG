// Behavior tests for the dashboard's streak tracker: the at-risk banner, the
// 7-day activity grid, the next-milestone progress bar and the tip copy.
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { StreakTracker } from './StreakTracker'
import { GameProvider } from '../../contexts/GameContext'
import { STORAGE_KEYS } from '../../utils/gameUtils'
import { seedDefaultGame } from '../../pages/test-utils'

/** Mounts the tracker against a save with the given streak fields. */
function renderTracker(overrides: {
  streakDays?: number
  lastActive?: string
  completedAt?: string[]
}) {
  const base = seedDefaultGame()
  localStorage.setItem(
    STORAGE_KEYS.GAME,
    JSON.stringify({
      ...base,
      character: {
        ...base.character,
        streakDays: overrides.streakDays ?? 0,
        lastActive: overrides.lastActive ?? new Date().toISOString().split('T')[0],
      },
      completedQuests: (overrides.completedAt ?? []).map((completedAt, index) => ({
        topicId: `topic-${index}`,
        technologyId: 'html',
        questId: `q-${index}`,
        completed: true,
        xpEarned: 10,
        completedAt,
      })),
    }),
  )
  return render(
    <GameProvider>
      <StreakTracker />
    </GameProvider>,
  )
}

describe('StreakTracker', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('warns that the streak is at risk when the last activity is two days old', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-09-29T12:00:00Z'))
    renderTracker({ streakDays: 5, lastActive: '2026-09-26' })

    expect(
      screen.getByText('⚠️ Your streak is at risk! Complete a quest now to save it!'),
    ).toBeInTheDocument()
    expect(screen.getByText('5')).toBeInTheDocument()
  })

  it('reports the day as earned when the hero was active today', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-09-29T12:00:00Z'))
    renderTracker({ streakDays: 3, lastActive: '2026-09-29' })

    expect(screen.getByText("You've earned today's XP!")).toBeInTheDocument()
    expect(screen.queryByText(/streak is at risk/)).not.toBeInTheDocument()
  })

  it('marks the days a quest was completed on the 7-day grid', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-09-29T12:00:00Z'))
    renderTracker({
      completedAt: ['2026-09-28T10:00:00.000Z', '2026-09-29T09:00:00.000Z'],
    })

    // Two active days are ticked; the grid always spans exactly seven cells
    expect(screen.getAllByText('✓')).toHaveLength(2)
    expect(screen.getByText('Last 7 Days')).toBeInTheDocument()
  })

  it('counts the days to the next milestone and ticks achieved ones', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-09-29T12:00:00Z'))
    renderTracker({ streakDays: 8 })

    // 8 days: Week Warrior (7) is achieved, Fortnight Fighter (14) is next
    expect(screen.getByText('6 days to Fortnight Fighter')).toBeInTheDocument()
    expect(screen.getByText('8 days')).toBeInTheDocument()
    expect(screen.getByText('14 days')).toBeInTheDocument()
    // Only the first milestone carries the achieved tick
    expect(screen.getAllByText('✓')).toHaveLength(1)
    expect(screen.getByText('💎 22 days to Monthly Master!')).toBeInTheDocument()
  })

  it('invites a fresh hero to start their first streak', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-09-29T12:00:00Z'))
    renderTracker({ streakDays: 0, lastActive: '2026-09-20' })

    expect(
      screen.getByText('💡 Start your streak by completing a quest today!'),
    ).toBeInTheDocument()
    // A zero streak is not "at risk" — there is nothing to lose yet
    expect(screen.queryByText(/streak is at risk/)).not.toBeInTheDocument()
  })
})
