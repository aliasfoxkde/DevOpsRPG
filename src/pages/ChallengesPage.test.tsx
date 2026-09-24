import { describe, it, expect, beforeEach } from 'vitest'
import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ChallengesPage from './ChallengesPage'
import { STORAGE_KEYS } from '@/utils/gameUtils'
import { closestContainer, renderPage, renderSeededPage, seedDefaultGame } from './test-utils'

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
})
