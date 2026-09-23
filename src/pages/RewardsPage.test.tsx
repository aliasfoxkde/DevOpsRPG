import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { screen, within, act, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import RewardsPage from './RewardsPage'
import { DAILY_REWARDS } from '@/data/collectibles'
import { REWARD_TIERS } from '@/data/milestones'
import { closestContainer, renderSeededPage, seedDefaultGame } from './test-utils'

// The page maps Sunday (0) to day 7 of the weekly reward track
const today = new Date().getDay()
const adjustedDay = today === 0 ? 7 : today

describe('RewardsPage', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('renders the rewards hub with the seven daily reward slots', () => {
    renderSeededPage(<RewardsPage />, { route: '/rewards', url: '/rewards' })

    expect(
      screen.getByRole('heading', { level: 1, name: /Rewards Hub/ }),
    ).toBeInTheDocument()
    expect(screen.getByText('Daily Rewards')).toBeInTheDocument()
    for (let day = 1; day <= DAILY_REWARDS.length; day += 1) {
      expect(screen.getByText(`Day ${day}`)).toBeInTheDocument()
    }
    expect(screen.getByText(`Day ${adjustedDay} reward available!`)).toBeInTheDocument()
  })

  it('claims today’s daily reward exactly once', async () => {
    const user = userEvent.setup()
    renderSeededPage(<RewardsPage />, { route: '/rewards', url: '/rewards' })

    // Only the current day offers a claim button
    await user.click(screen.getByRole('button', { name: 'CLAIM!' }))

    expect(screen.getByText('✓')).toBeInTheDocument()
    expect(
      screen.queryByRole('button', { name: 'CLAIM!' }),
    ).not.toBeInTheDocument()
  })

  it('shows the streak calendar with its milestones', () => {
    renderSeededPage(<RewardsPage />, { route: '/rewards', url: '/rewards' })

    expect(screen.getByText('Streak Calendar')).toBeInTheDocument()
    expect(screen.getByText('Day Streak')).toBeInTheDocument()
    expect(screen.getByText('Current Streak')).toBeInTheDocument()
    // A new player is a beginner with every milestone still locked
    expect(screen.getByText('👶 Beginner')).toBeInTheDocument()
    for (const milestone of ['3 Days', '7 Days', '14 Days', '30 Days']) {
      expect(screen.getByText(milestone)).toBeInTheDocument()
    }
    expect(screen.getAllByText('🔒')).toHaveLength(4)
  })

  it('spins the bonus wheel and reports a prize', async () => {
    vi.useFakeTimers()
    renderSeededPage(<RewardsPage />, { route: '/rewards', url: '/rewards' })

    fireEvent.click(screen.getByRole('button', { name: '🎲 SPIN!' }))

    expect(screen.getByRole('button', { name: 'Spinning...' })).toBeDisabled()

    // The two second animation resolves into a prize
    await act(async () => {
      await vi.advanceTimersByTimeAsync(2000)
    })

    expect(screen.getByText(/You won:/)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '🎲 SPIN!' })).toBeEnabled()
  })

  it('starts with an empty collectible inventory', () => {
    renderSeededPage(<RewardsPage />, { route: '/rewards', url: '/rewards' })

    expect(screen.getByText('Collectibles')).toBeInTheDocument()
    expect(screen.getByText('(0 active)')).toBeInTheDocument()
    expect(
      screen.getByText('No collectibles yet. Complete quests to earn some!'),
    ).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /USE/ })).not.toBeInTheDocument()
  })

  it('lists every milestone pack with its rewards and live progress', () => {
    const { character, completedQuests } = seedDefaultGame()
    renderSeededPage(<RewardsPage />, { route: '/rewards', url: '/rewards' })

    expect(screen.getByText('Milestone Packs')).toBeInTheDocument()
    for (const tier of REWARD_TIERS) {
      const card = closestContainer(screen.getByText(tier.name), '.rounded-lg')
      expect(within(card).getByText(tier.description)).toBeInTheDocument()
      expect(within(card).getByText(`+${tier.rewards.xp} XP`)).toBeInTheDocument()
      expect(within(card).getByText(`+${tier.rewards.gold} Gold`)).toBeInTheDocument()
      // Progress is the current value over the required one, level 1 already
      // covers part of the level based packs
      const current =
        tier.requirement.type === 'quests'
          ? completedQuests.length
          : tier.requirement.type === 'level'
            ? character.level
            : character.xp
      const expected = Math.min(100, Math.round((current / tier.requirement.value) * 100))
      expect(within(card).getByText(`${expected}%`)).toBeInTheDocument()
    }
    // No pack is complete, so no claim button is offered yet
    expect(
      screen.queryByRole('button', { name: /CLAIM PACK/ }),
    ).not.toBeInTheDocument()
  })
})
