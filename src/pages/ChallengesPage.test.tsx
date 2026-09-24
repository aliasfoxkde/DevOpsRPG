import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { act, fireEvent, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ChallengesPage from './ChallengesPage'
import { STORAGE_KEYS } from '@/utils/gameUtils'
import { allQuests } from '@/data/quests'
import { closestContainer, renderPage, renderSeededPage, seedDefaultGame } from './test-utils'
import type { GameState } from '@/contexts/GameContext'

const WEEKLY_TITLES = [
  'Quest Crusader',
  'XP Harvest',
  'Streak Sentinel',
  'Mini-Game Champion',
  'Quiz Wizard',
]

const MONTHLY_TITLES = [
  'DevOps Champion',
  'XP Legend',
  'Monthly Master',
  'Game Enthusiast',
  'Quiz Oracle',
]

describe('ChallengesPage', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('renders the challenges header, tabs and daily dash panel', () => {
    renderSeededPage(<ChallengesPage />, { route: '/challenges', url: '/challenges' })

    expect(screen.getByRole('heading', { level: 1, name: /Challenges/ })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '⚡ Daily Dash' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '📅 Weekly Challenges' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '🗓️ Monthly Challenges' })).toBeInTheDocument()

    // Daily Dash is the default tab
    expect(screen.getByText('⚡ Daily Dash Speedrun')).toBeInTheDocument()
    expect(screen.getByText('--:--')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /START DAILY DASH/ })).toBeInTheDocument()
    expect(screen.getByText('⚡ How Daily Dash Works')).toBeInTheDocument()
  })

  it('starts a daily dash run and shows the live timer', async () => {
    const user = userEvent.setup()
    renderSeededPage(<ChallengesPage />, { route: '/challenges', url: '/challenges' })

    await user.click(screen.getByRole('button', { name: /START DAILY DASH/ }))

    expect(screen.getByText('Time Elapsed')).toBeInTheDocument()
    expect(screen.getByText('00:00')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Abandon Dash/ })).toBeInTheDocument()
    expect(screen.getByText('Complete these quests:')).toBeInTheDocument()
    expect(screen.getByText('Complete quests to track them here!')).toBeInTheDocument()
    // The five quest slots of the dash are displayed
    for (const slot of ['1', '2', '3', '4', '5']) {
      expect(screen.getByText(slot)).toBeInTheDocument()
    }
  })

  it('lists the weekly challenges with their reset countdown', async () => {
    const user = userEvent.setup()
    renderSeededPage(<ChallengesPage />, { route: '/challenges', url: '/challenges' })

    await user.click(screen.getByRole('button', { name: '📅 Weekly Challenges' }))

    expect(screen.getByText('📅 This Week')).toBeInTheDocument()
    expect(screen.getByText('Overall Progress')).toBeInTheDocument()
    // Only the quest-count challenge contributes to the overall total, so the
    // figure appears in the summary bar and on the Quest Crusader card
    expect(screen.getAllByText('0 / 20 quests')).toHaveLength(2)
    expect(screen.getByText(/remaining$/)).toBeInTheDocument()
    expect(screen.getByText('💡 How Challenges Work')).toBeInTheDocument()
    for (const title of WEEKLY_TITLES) {
      expect(screen.getByText(title)).toBeInTheDocument()
    }
    expect(screen.getByText('Complete 20 quests this week')).toBeInTheDocument()
    expect(screen.getByText('0 / 3000 XP')).toBeInTheDocument()
    // Nothing is complete yet, so every card is locked
    expect(screen.queryByRole('button', { name: 'CLAIM!' })).not.toBeInTheDocument()
  })

  it('lists the monthly challenges on their own tab', async () => {
    const user = userEvent.setup()
    renderSeededPage(<ChallengesPage />, { route: '/challenges', url: '/challenges' })

    await user.click(screen.getByRole('button', { name: '🗓️ Monthly Challenges' }))

    expect(screen.getByText('🗓️ This Month')).toBeInTheDocument()
    for (const title of MONTHLY_TITLES) {
      expect(screen.getByText(title)).toBeInTheDocument()
    }
    // Summary bar plus the DevOps Champion card
    expect(screen.getAllByText('0 / 100 quests')).toHaveLength(2)
    expect(screen.getByText('0 / 15000 XP')).toBeInTheDocument()
    expect(screen.queryByText('⚡ Daily Dash Speedrun')).not.toBeInTheDocument()
  })

  it('tracks real progress when a finished challenge is claimed', async () => {
    const user = userEvent.setup()
    const game = seedDefaultGame()
    game.character.xp = 3000
    game.character.streakDays = 7
    localStorage.setItem(STORAGE_KEYS.GAME, JSON.stringify(game))
    renderPage(<ChallengesPage />, { route: '/challenges', url: '/challenges' })

    await user.click(screen.getByRole('button', { name: '📅 Weekly Challenges' }))

    // Progress is derived from the save: XP and streak challenges are complete
    expect(screen.getByText('3000 / 3000 XP')).toBeInTheDocument()
    expect(screen.getByText('7 / 7 days')).toBeInTheDocument()

    // The completed XP Harvest challenge offers its claim button
    const card = closestContainer(screen.getByText('XP Harvest'), '.bg-card')
    expect(within(card).getByRole('button', { name: 'CLAIM!' })).toBeEnabled()

    await user.click(within(card).getByRole('button', { name: 'CLAIM!' }))

    // Claiming pays out (400 XP / 200 gold for XP Harvest) and marks the card
    // as claimed - the guard used to be inverted, making every claim a no-op.
    const raw = localStorage.getItem(STORAGE_KEYS.GAME)
    if (!raw) throw new Error('Expected the game state to be persisted')
    const save = JSON.parse(raw) as { character: { xp: number; gold: number } }
    expect(save.character.xp).toBe(3000 + 400)
    expect(save.character.gold).toBe(game.character.gold + 200)
    // The claimed card replaces its icon and claim button with ✓ markers.
    expect(
      within(closestContainer(screen.getByText('XP Harvest'), '.bg-card')).getAllByText('✓').length,
    ).toBeGreaterThan(0)
    expect(
      within(closestContainer(screen.getByText('XP Harvest'), '.bg-card')).queryByRole('button', {
        name: 'CLAIM!',
      }),
    ).not.toBeInTheDocument()
  })

  it('grants the advertised badge when a quest-count challenge is claimed', () => {
    const game = seedDefaultGame()
    localStorage.setItem(
      STORAGE_KEYS.GAME,
      JSON.stringify({
        ...game,
        completedQuests: allQuests.slice(0, 20).map((quest) => ({
          topicId: quest.topicId,
          technologyId: quest.technologyId,
          questId: quest.id,
          completed: true,
          xpEarned: quest.xpReward,
          completedAt: new Date().toISOString(),
        })),
      }),
    )
    renderPage(<ChallengesPage />, { route: '/challenges', url: '/challenges' })

    fireEvent.click(screen.getByRole('button', { name: '📅 Weekly Challenges' }))

    const card = closestContainer(screen.getByText('Quest Crusader'), '.bg-card')
    expect(within(card).getByText('20 / 20 quests')).toBeInTheDocument()
    // The whole progress bar is full, so the weekly summary is complete too
    expect(screen.getAllByText('20 / 20 quests')).toHaveLength(2)

    act(() => {
      fireEvent.click(within(card).getByRole('button', { name: 'CLAIM!' }))
    })

    const stored = storedGame()
    expect(stored.character.xp).toBe(game.character.xp + 600)
    expect(stored.character.gold).toBe(game.character.gold + 250)
    expect(stored.badges.find((badge) => badge.id === 'weekly_crusader')?.unlockedAt).toBeTruthy()
    expect(stored.stats.challengeComplete).toBe(game.stats.challengeComplete + 1)
    expect(within(card).getByText('CLAIMED')).toBeInTheDocument()
    expect(within(card).queryByRole('button', { name: 'CLAIM!' })).not.toBeInTheDocument()
  })

  it('shows the quests already finished in an active dash', () => {
    const game = seedDefaultGame()
    const done = allQuests.slice(0, 2)
    localStorage.setItem(
      STORAGE_KEYS.GAME,
      JSON.stringify({
        ...game,
        dailyDash: {
          active: true,
          startTime: Date.now(),
          completedQuests: done.map((quest) => quest.id),
          bestTime: null,
          lastPlayedDate: null,
        },
      }),
    )
    renderPage(<ChallengesPage />, { route: '/challenges', url: '/challenges' })

    expect(screen.getByText('Time Elapsed')).toBeInTheDocument()
    expect(screen.getByText('00:00')).toBeInTheDocument()
    for (const quest of done) {
      expect(screen.getByText(quest.title)).toBeInTheDocument()
    }
    // The first two slots are ticked off and the third is the live one
    expect(screen.getByText('3')).toBeInTheDocument()
  })

  it('summarises the last finished dash and offers a fresh start', () => {
    const game = seedDefaultGame()
    const finished = allQuests.slice(0, 5)
    localStorage.setItem(
      STORAGE_KEYS.GAME,
      JSON.stringify({
        ...game,
        dailyDash: {
          active: false,
          startTime: Date.now() - 83_000,
          completedQuests: finished.map((quest) => quest.id),
          bestTime: 83,
          lastPlayedDate: new Date().toISOString(),
        },
      }),
    )
    renderPage(<ChallengesPage />, { route: '/challenges', url: '/challenges' })

    // The best time is promoted onto the daily panel
    expect(screen.getByText('Best Time')).toBeInTheDocument()
    expect(screen.getByText('01:23')).toBeInTheDocument()
    // The completed run is recapped with its quest count and time
    const summary = closestContainer(screen.getByText('🎉 Last Dash Complete!'), '.text-center')
    expect(summary.textContent).toContain('5 quests in')
    expect(summary.textContent).toContain('01:23')
    // ...and the dash can be started again
    expect(screen.getByRole('button', { name: /START DAILY DASH/ })).toBeEnabled()
  })

  it('ticks the dash timer once per second', () => {
    vi.useFakeTimers()
    const game = seedDefaultGame()
    localStorage.setItem(
      STORAGE_KEYS.GAME,
      JSON.stringify({
        ...game,
        dailyDash: {
          active: true,
          startTime: Date.now(),
          completedQuests: [],
          bestTime: null,
          lastPlayedDate: null,
        },
      }),
    )
    renderPage(<ChallengesPage />, { route: '/challenges', url: '/challenges' })

    expect(screen.getByText('00:00')).toBeInTheDocument()

    act(() => {
      vi.advanceTimersByTime(1000)
    })
    expect(screen.getByText('00:01')).toBeInTheDocument()

    act(() => {
      vi.advanceTimersByTime(59_000)
    })
    expect(screen.getByText('01:00')).toBeInTheDocument()
  })

  it('counts the weekly reset down to the hour late in the week', () => {
    vi.useFakeTimers()
    // The countdown always targets next Monday, so park the clock on a Sunday
    vi.setSystemTime(nextSundayAt(20))
    renderSeededPage(<ChallengesPage />, { route: '/challenges', url: '/challenges' })

    fireEvent.click(screen.getByRole('button', { name: '📅 Weekly Challenges' }))

    expect(screen.getByText('4h remaining')).toBeInTheDocument()
  })

  it('reports the final hour before the weekly reset', () => {
    vi.useFakeTimers()
    vi.setSystemTime(nextSundayAt(23.5))
    renderSeededPage(<ChallengesPage />, { route: '/challenges', url: '/challenges' })

    fireEvent.click(screen.getByRole('button', { name: '📅 Weekly Challenges' }))

    expect(screen.getByText('Less than 1h')).toBeInTheDocument()
  })

  it('returns to the daily dash from a challenge tab', async () => {
    const user = userEvent.setup()
    renderSeededPage(<ChallengesPage />, { route: '/challenges', url: '/challenges' })

    await user.click(screen.getByRole('button', { name: '🗓️ Monthly Challenges' }))
    expect(screen.queryByText('⚡ How Daily Dash Works')).not.toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: '⚡ Daily Dash' }))

    expect(screen.getByText('⚡ Daily Dash Speedrun')).toBeInTheDocument()
    expect(screen.getByText('⚡ How Daily Dash Works')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /START DAILY DASH/ })).toBeEnabled()
    expect(screen.queryByText('🗓️ This Month')).not.toBeInTheDocument()
  })
})

/** The next Sunday at `hour` (fractional hours allowed) in local time. */
function nextSundayAt(hour: number): Date {
  const date = new Date()
  date.setDate(date.getDate() + ((7 - date.getDay()) % 7))
  date.setHours(Math.floor(hour), (hour % 1) * 60, 0, 0)
  return date
}

/** The save as it is persisted right now. */
function storedGame(): GameState {
  const raw = localStorage.getItem(STORAGE_KEYS.GAME)
  if (!raw) throw new Error('Expected the game state to be persisted')
  return JSON.parse(raw) as GameState
}
