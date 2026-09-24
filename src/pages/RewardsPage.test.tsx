import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { screen, within, act, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import RewardsPage from './RewardsPage'
import { COLLECTIBLES_POOL, DAILY_REWARDS, type Collectible } from '@/data/collectibles'
import { REWARD_TIERS } from '@/data/milestones'
import { allQuests } from '@/data/quests'
import { closestContainer, renderPage, renderSeededPage, seedDefaultGame } from './test-utils'
import { STORAGE_KEYS } from '@/utils/gameUtils'
import type { GameState } from '@/contexts/GameContext'

// The page maps Sunday (0) to day 7 of the weekly reward track
const today = new Date().getDay()
const adjustedDay = today === 0 ? 7 : today

/** A fresh copy of a pool collectible, ready to drop into an inventory. */
function poolCollectible(id: string): Collectible {
  const collectible = COLLECTIBLES_POOL.find((entry) => entry.id === id)
  if (!collectible) throw new Error(`Unknown collectible id: ${id}`)
  return { ...collectible, used: false }
}

/**
 * Seeds the default save with `mutate` applied and renders the page. The
 * custom state must be written after `seedDefaultGame()` and rendered through
 * `renderPage`, which (unlike `renderSeededPage`) does not re-seed defaults.
 */
function seedAndRender(mutate: (game: GameState) => GameState): GameState {
  const game = seedDefaultGame()
  localStorage.setItem(STORAGE_KEYS.GAME, JSON.stringify(mutate(game)))
  renderPage(<RewardsPage />, { route: '/rewards', url: '/rewards' })
  return game
}

/** The save as it is persisted right now. */
function storedGame(): GameState {
  const raw = localStorage.getItem(STORAGE_KEYS.GAME)
  if (!raw) throw new Error('No game state persisted to localStorage')
  return JSON.parse(raw) as GameState
}

describe('RewardsPage', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  afterEach(() => {
    vi.restoreAllMocks()
    vi.useRealTimers()
  })

  it('renders the rewards hub with the seven daily reward slots', () => {
    renderSeededPage(<RewardsPage />, { route: '/rewards', url: '/rewards' })

    expect(screen.getByRole('heading', { level: 1, name: /Rewards Hub/ })).toBeInTheDocument()
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
    expect(screen.queryByRole('button', { name: 'CLAIM!' })).not.toBeInTheDocument()
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
    expect(screen.queryByRole('button', { name: /CLAIM PACK/ })).not.toBeInTheDocument()
  })

  it('pays today’s exact reward into the persisted save', async () => {
    const user = userEvent.setup()
    const reward = DAILY_REWARDS[adjustedDay - 1].reward
    const { game } = renderSeededPage(<RewardsPage />, { route: '/rewards', url: '/rewards' })

    await user.click(screen.getByRole('button', { name: 'CLAIM!' }))

    const stored = storedGame()
    expect(stored.dailyRewardsClaimed).toEqual([adjustedDay])
    // A brand new hero has no streak, so the payout is the plain table value
    if (reward.type === 'xp') {
      expect(stored.character.xp).toBe(game.character.xp + (reward.value ?? 0))
      expect(stored.character.gold).toBe(game.character.gold)
    }
    if (reward.type === 'gold') {
      expect(stored.character.gold).toBe(game.character.gold + (reward.value ?? 0))
      expect(stored.character.xp).toBe(game.character.xp)
    }
    if (reward.type === 'collectible') {
      expect(stored.collectibles.map((entry) => entry.id)).toEqual([reward.collectibleId])
    }
  })

  it('marks today’s reward as claimed and offers no second claim', () => {
    seedAndRender((game) => ({ ...game, dailyRewardsClaimed: [adjustedDay] }))

    expect(screen.getByText('✓')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'CLAIM!' })).not.toBeInTheDocument()
    // The claim survives a re-read of the save
    expect(storedGame().dailyRewardsClaimed).toEqual([adjustedDay])
  })

  it('spends a boost collectible and applies its multiplier', async () => {
    const user = userEvent.setup()
    const game = seedAndRender((state) => ({
      ...state,
      collectibles: [poolCollectible('xp_small')],
    }))

    expect(screen.getByText('(1 active)')).toBeInTheDocument()
    expect(screen.getByText('XP Scroll (2x)')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: '⚡ USE' }))

    // The inventory empties out and the boost is armed for the next quest
    expect(screen.getByText('(0 active)')).toBeInTheDocument()
    expect(
      screen.getByText('No collectibles yet. Complete quests to earn some!'),
    ).toBeInTheDocument()
    const stored = storedGame()
    expect(stored.collectibles[0].used).toBe(true)
    expect(stored.character.xpMultiplier).toBe(2)
    // Boosts pay out on the next quest, so neither currency moves here
    expect(stored.character.gold).toBe(game.character.gold)
    expect(stored.character.xp).toBe(game.character.xp)
  })

  it('pays exactly what the mystery box shows when it is closed', async () => {
    const user = userEvent.setup()
    // A common box rolls xp or gold first: 0 forces the currency table so the
    // popup shows a number this test can read back and verify against the save.
    vi.spyOn(Math, 'random').mockReturnValue(0)
    const game = seedAndRender((state) => ({
      ...state,
      collectibles: [poolCollectible('mystery_common')],
    }))

    await user.click(screen.getByRole('button', { name: '🎁 OPEN' }))

    expect(screen.getByText('Mystery Box Opened!')).toBeInTheDocument()
    const revealed = screen.getByText('Mystery Box Opened!').nextElementSibling
    if (!(revealed instanceof HTMLElement)) throw new Error('Mystery reward element missing')
    const xpReward = /^✨ \+(\d+) XP$/.exec(revealed.textContent)
    const goldReward = /^🪙 \+(\d+) Gold$/.exec(revealed.textContent)
    expect(xpReward ?? goldReward).not.toBeNull()

    await user.click(screen.getByRole('button', { name: /Awesome!/ }))

    const after = storedGame()
    expect(after.collectibles[0].used).toBe(true)
    expect(after.stats.mysteryBoxesOpened).toBe(game.stats.mysteryBoxesOpened + 1)
    if (xpReward) expect(after.character.xp).toBe(game.character.xp + Number(xpReward[1]))
    if (goldReward) expect(after.character.gold).toBe(game.character.gold + Number(goldReward[1]))
  })

  it('keeps whatever collectible a mystery box announces', async () => {
    const user = userEvent.setup()
    // 0.5 lands the epic box on the collectible half of its reward table
    vi.spyOn(Math, 'random').mockReturnValue(0.5)
    seedAndRender((state) => ({
      ...state,
      collectibles: [poolCollectible('mystery_epic')],
    }))

    await user.click(screen.getByRole('button', { name: '🎁 OPEN' }))

    const revealed = screen.getByText('Mystery Box Opened!').nextElementSibling
    if (!(revealed instanceof HTMLElement)) throw new Error('Mystery reward element missing')
    expect(revealed.textContent).toBe('📜 XP Scroll (2x)')

    await user.click(screen.getByRole('button', { name: /Awesome!/ }))

    const after = storedGame()
    // The opened box is spent and its contents stay in the inventory
    expect(after.collectibles[0]).toMatchObject({ id: 'mystery_epic', used: true })
    expect(after.collectibles[1]).toMatchObject({ id: 'xp_small', used: false })
    expect(screen.getByText('(1 active)')).toBeInTheDocument()
    expect(screen.getByText('XP Scroll (2x)')).toBeInTheDocument()
  })

  it('claims a completed milestone pack for its exact rewards', async () => {
    const user = userEvent.setup()
    const game = seedAndRender((state) => ({
      ...state,
      completedQuests: allQuests.slice(0, 5).map((quest) => ({
        topicId: quest.topicId,
        technologyId: quest.technologyId,
        questId: quest.id,
        completed: true,
        xpEarned: quest.xpReward,
        completedAt: new Date().toISOString(),
      })),
    }))

    const tier = REWARD_TIERS.find((entry) => entry.id === 'tier_1')
    if (!tier) throw new Error('Apprentice Pack missing from REWARD_TIERS')
    const card = closestContainer(screen.getByText(tier.name), '.rounded-lg')
    expect(within(card).getByText('100%')).toBeInTheDocument()

    await user.click(within(card).getByRole('button', { name: /CLAIM PACK/ }))

    const stored = storedGame()
    expect(stored.character.xp).toBe(game.character.xp + tier.rewards.xp)
    expect(stored.character.gold).toBe(game.character.gold + tier.rewards.gold)
    // The pack flips to its claimed state and cannot be claimed twice
    expect(within(card).getByText('✓ Claimed!')).toBeInTheDocument()
    expect(within(card).queryByRole('button', { name: /CLAIM PACK/ })).not.toBeInTheDocument()
  })

  it('shows the streak shield banner while shields are held', () => {
    seedAndRender((game) => ({ ...game, character: { ...game.character, streakShields: 2 } }))

    expect(screen.getByText('Streak Shield Active')).toBeInTheDocument()
    expect(screen.getByText('Your streak is protected for 2 day(s)')).toBeInTheDocument()
  })
})
