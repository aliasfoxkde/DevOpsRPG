import { describe, it, expect, beforeEach } from 'vitest'
import { act, fireEvent, screen, within } from '@testing-library/react'
import SideQuestsPage from './SideQuestsPage'
import { renderPage, renderSeededPage, seedDefaultGame } from './test-utils'
import { STORAGE_KEYS } from '@/utils/gameUtils'
import type { GameState } from '@/contexts/GameContext'
import type { SideQuest } from '@/data/sidequests'

/** Builds a side quest fixture; daily by default, never expiring. */
function sideQuest(overrides: Partial<SideQuest> & { id: string; title: string }): SideQuest {
  return {
    type: 'daily',
    description: `Do ${overrides.title}`,
    icon: '📜',
    requirement: { type: 'complete_quests', count: 2 },
    rewards: { xp: 75, gold: 30 },
    completed: false,
    progress: 0,
    ...overrides,
  }
}

/** Replaces the generated side quests with a deterministic fixture set. */
function seedQuests(quests: SideQuest[]): GameState {
  const game = seedDefaultGame()
  const seeded = { ...game, sideQuests: quests }
  localStorage.setItem(STORAGE_KEYS.GAME, JSON.stringify(seeded))
  return seeded
}

/** The section (daily / weekly / secret) whose heading is `title`. */
function section(title: string): HTMLElement {
  const element = screen.getByText(title).closest('div')
  if (!(element instanceof HTMLElement)) throw new Error(`No section for "${title}"`)
  return element
}

describe('SideQuestsPage', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('renders the page heading and intro copy', () => {
    renderSeededPage(<SideQuestsPage />)
    expect(screen.getByRole('heading', { level: 1, name: /Side Quests/ })).toBeInTheDocument()
    expect(screen.getByText('Complete bonus objectives for extra rewards!')).toBeInTheDocument()
  })

  it('renders the daily, weekly and secret quest sections', () => {
    renderSeededPage(<SideQuestsPage />)
    expect(screen.getByText('Daily Quests')).toBeInTheDocument()
    expect(screen.getByText('Weekly Quests')).toBeInTheDocument()
    expect(screen.getByText('Secret Quests')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: /Tips/ })).toBeInTheDocument()
  })

  it('renders freshly generated daily quests with their rewards', () => {
    const { sideQuests } = seedDefaultGame()
    const daily = sideQuests.filter((quest) => quest.type === 'daily')

    renderSeededPage(<SideQuestsPage />)

    // A fresh account rolls 3 of the 8 daily quests from the pool
    expect(daily).toHaveLength(3)
    const dailySection = screen.getByText('Daily Quests').closest('div') as HTMLElement
    for (const quest of daily) {
      expect(within(dailySection).getByText(quest.title)).toBeInTheDocument()
    }
    // Progress starts at zero for a new player
    expect(within(dailySection).getAllByText(/^0 \//).length).toBeGreaterThan(0)
  })

  it('hides claim buttons while quest progress is incomplete', () => {
    renderSeededPage(<SideQuestsPage />)
    // No quest has progress yet, so nothing can be claimed
    expect(screen.queryByText('CLAIM')).not.toBeInTheDocument()
  })

  it('documents the weekly reset cadence', () => {
    renderSeededPage(<SideQuestsPage />)
    expect(screen.getByText('Resets at midnight')).toBeInTheDocument()
    expect(screen.getByText('Resets every Monday')).toBeInTheDocument()
  })

  it('pays a claimable quest out through the real context action', () => {
    const weekly = sideQuest({
      id: 'sq_weekly_1',
      type: 'weekly',
      title: 'Weekly Grind',
      description: 'Complete 5 quests this week',
      requirement: { type: 'complete_quests', count: 5 },
      rewards: { xp: 250, gold: 120, badge: 'streak_3' },
      progress: 5,
    })
    const game = seedQuests([
      sideQuest({ id: 'sq_daily_1', title: 'Daily Dedication', progress: 2 }),
      weekly,
    ])
    renderPage(<SideQuestsPage />)

    // Both ready quests advertise their claim and their progress is complete
    expect(within(section('Daily Quests')).getByRole('button', { name: 'CLAIM' })).toBeEnabled()
    expect(within(section('Weekly Quests')).getByRole('button', { name: 'CLAIM' })).toBeEnabled()
    expect(within(section('Daily Quests')).getByText('2 / 2')).toBeInTheDocument()
    expect(within(section('Daily Quests')).getByText('(0/1 complete)')).toBeInTheDocument()
    expect(within(section('Weekly Quests')).getByText('(0/1 complete)')).toBeInTheDocument()
    // A badge reward is advertised alongside the currency
    expect(within(section('Weekly Quests')).getByText('+ Badge')).toBeInTheDocument()

    act(() => {
      fireEvent.click(within(section('Weekly Quests')).getByRole('button', { name: 'CLAIM' }))
    })

    // The claim is persisted and the card flips to its claimed state
    const raw = localStorage.getItem(STORAGE_KEYS.GAME)
    if (!raw) throw new Error('Expected the game state to be persisted')
    const save = JSON.parse(raw) as GameState
    expect(save.character.xp).toBe(game.character.xp + 250)
    expect(save.character.gold).toBe(game.character.gold + 120)
    expect(within(section('Weekly Quests')).getByText('(1/1 complete)')).toBeInTheDocument()
    expect(within(section('Weekly Quests')).getByText('✓ Claimed')).toBeInTheDocument()
    expect(
      within(section('Weekly Quests')).queryByRole('button', { name: 'CLAIM' }),
    ).not.toBeInTheDocument()
    // The daily quest is untouched
    expect(within(section('Daily Quests')).getByText('(0/1 complete)')).toBeInTheDocument()
  })

  it('hides the progress bar on claimed and expired quests', () => {
    seedQuests([
      sideQuest({ id: 'sq_done_1', title: 'Already Done', completed: true, progress: 3 }),
      sideQuest({
        id: 'sq_old_1',
        title: 'Yesterday Business',
        progress: 5,
        requirement: { type: 'complete_quests', count: 5 },
        expiresAt: '2020-01-01T00:00:00.000Z',
      }),
      sideQuest({ id: 'sq_secret_1', type: 'secret', title: 'Hidden Truth', completed: true }),
    ])
    renderPage(<SideQuestsPage />)

    // Claimed quests are struck through with no claim control
    expect(within(section('Daily Quests')).getByText('✓ Claimed')).toBeInTheDocument()
    expect(within(section('Daily Quests')).queryByText(/\/ 5/)).not.toBeInTheDocument()
    expect(
      within(section('Daily Quests')).queryByRole('button', { name: 'CLAIM' }),
    ).not.toBeInTheDocument()

    // A quest whose window passed shows the expired state even at full progress
    expect(within(section('Daily Quests')).getByText('Expired')).toBeInTheDocument()
    expect(
      within(section('Daily Quests')).queryByRole('button', { name: 'CLAIM' }),
    ).not.toBeInTheDocument()
    expect(within(section('Daily Quests')).getByText('(1/2 complete)')).toBeInTheDocument()
    expect(within(section('Secret Quests')).getByText('(1/1 discovered)')).toBeInTheDocument()
  })

  it('shows the empty state for a section with nothing to offer', () => {
    seedQuests([sideQuest({ id: 'sq_daily_1', title: 'Daily Dedication', progress: 1 })])
    renderPage(<SideQuestsPage />)

    expect(within(section('Weekly Quests')).getByText('No Weekly Quests')).toBeInTheDocument()
    expect(
      within(section('Secret Quests')).getByText('No Secret Quests Discovered'),
    ).toBeInTheDocument()
    expect(within(section('Secret Quests')).getByText('(0/0 discovered)')).toBeInTheDocument()
  })

  it('falls back to the daily empty state when no daily quest rolled', () => {
    seedQuests([])
    renderPage(<SideQuestsPage />)

    expect(within(section('Daily Quests')).getByText('No Daily Quests')).toBeInTheDocument()
    expect(within(section('Daily Quests')).getByText('(0/0 complete)')).toBeInTheDocument()
    expect(within(section('Daily Quests')).getByText('Resets at midnight')).toBeInTheDocument()
  })
})
