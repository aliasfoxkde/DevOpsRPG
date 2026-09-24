import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import BadgesPage from './BadgesPage'
import { BADGES, type Badge } from '@/data/badges'
import { closestContainer, renderPage, renderSeededPage, seedDefaultGame } from './test-utils'
import { STORAGE_KEYS } from '@/utils/gameUtils'
import type { GameState } from '@/contexts/GameContext'

const UNLOCKED_AT = '2026-09-01T10:00:00.000Z'
const RARITY_ORDER: Badge['rarity'][] = ['legendary', 'epic', 'rare', 'uncommon', 'common']

/** The category filter labels the page renders. */
const CATEGORY_LABELS: Record<Badge['category'], string> = {
  quest: 'Quests',
  streak: 'Streaks',
  skill: 'Skills',
  social: 'Social',
  secret: 'Secret',
  seasonal: 'Seasonal',
}

type User = ReturnType<typeof userEvent.setup>

/** A quest-completion record shaped like the provider's own `TopicProgress`. */
function completedQuest(
  topicId: string,
  technologyId: string,
): GameState['completedQuests'][number] {
  return {
    topicId,
    technologyId,
    questId: `quest_${topicId}`,
    completed: true,
    xpEarned: 25,
  }
}

/** Marks the named badges as earned in the seeded save. */
function unlockBadges(game: GameState, ...ids: string[]): GameState['badges'] {
  return game.badges.map((badge) =>
    ids.includes(badge.id) ? { ...badge, unlockedAt: UNLOCKED_AT } : badge,
  )
}

/** The masked badge cards currently on the grid, in display order. */
function maskedCards(): HTMLElement[] {
  return screen.getAllByRole('button').filter((button) => button.textContent.includes('???'))
}

/** True when element `a` is rendered before element `b`. */
function comesBefore(a: Element, b: Element): boolean {
  return (b.compareDocumentPosition(a) & Node.DOCUMENT_POSITION_PRECEDING) !== 0
}

/**
 * The grid order the page sorts badges into: rarity tier first, earned badges
 * leading their tier, catalog order breaking the remaining ties.
 */
function expectedGridOrder(
  filters: { category?: Badge['category']; rarity?: Badge['rarity'] } = {},
  unlocked: string[] = [],
): Badge[] {
  return BADGES.filter(
    (badge) =>
      (!filters.category || badge.category === filters.category) &&
      (!filters.rarity || badge.rarity === filters.rarity),
  )
    .slice()
    .sort((a, b) => {
      const rarityDiff = RARITY_ORDER.indexOf(a.rarity) - RARITY_ORDER.indexOf(b.rarity)
      if (rarityDiff !== 0) return rarityDiff
      return (unlocked.includes(a.id) ? 0 : 1) - (unlocked.includes(b.id) ? 0 : 1)
    })
}

/**
 * Opens the detail modal of `badgeId`, which must be masked, and returns the
 * modal panel. The filters describe what the page is currently showing.
 */
async function openBadgeModal(
  user: User,
  badgeId: string,
  filters: { category?: Badge['category']; rarity?: Badge['rarity'] } = {},
): Promise<HTMLElement> {
  const order = expectedGridOrder(filters)
  const index = order.findIndex((badge) => badge.id === badgeId)
  if (index < 0) throw new Error(`${badgeId} is not part of the current grid`)
  const cards = maskedCards()
  if (cards.length !== order.length) {
    throw new Error(`Expected ${order.length} masked cards, found ${cards.length}`)
  }
  await user.click(cards[index])
  return modalPanel()
}

/** The white detail panel of the badge modal. */
function modalPanel(): HTMLElement {
  return closestContainer(screen.getByText('Category'), 'div.max-w-sm')
}

/** The tinted header block of the badge modal. */
function modalHeader(panel: HTMLElement): Element {
  const header = panel.querySelector('div.p-6')
  if (!header) throw new Error('The badge modal header block is missing')
  return header
}

/** Closes the badge modal, if one is open. */
async function closeModal(user: User): Promise<void> {
  await user.click(screen.getByRole('button', { name: 'Close' }))
}

describe('BadgesPage', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('renders the badge collection header', () => {
    renderSeededPage(<BadgesPage />, { route: '/badges', url: '/badges' })

    expect(screen.getByRole('heading', { level: 1, name: /Badge Collection/ })).toBeInTheDocument()
    expect(screen.getByText('Collection Progress')).toBeInTheDocument()
    // The count reflects actual unlocks (zero for a fresh account), not the
    // length of the stored badges array, which pre-seeds the whole catalog.
    expect(screen.getByText(`0 of ${BADGES.length} badges earned`)).toBeInTheDocument()
  })

  it('shows every badge masked while locked for a fresh account', () => {
    const { badges } = seedDefaultGame()
    renderSeededPage(<BadgesPage />, { route: '/badges', url: '/badges' })

    expect(badges).toHaveLength(BADGES.length)
    expect(screen.getAllByText('???')).toHaveLength(BADGES.length)
  })

  it('offers category, status and rarity filters', () => {
    renderSeededPage(<BadgesPage />, { route: '/badges', url: '/badges' })

    for (const label of ['All', 'Quests', 'Streaks', 'Skills', 'Social', 'Secret', 'Seasonal']) {
      expect(screen.getAllByRole('button', { name: label }).length).toBeGreaterThan(0)
    }
    expect(screen.getByRole('button', { name: 'All Rarities' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Unlocked/ })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Locked/ })).toBeInTheDocument()
  })

  it('opens a badge detail modal showing locked status and rewards', async () => {
    const user = userEvent.setup()
    renderSeededPage(<BadgesPage />, { route: '/badges', url: '/badges' })

    await user.click(screen.getAllByRole('button', { name: /\?\?\?/ })[0])

    expect(screen.getByRole('heading', { name: '???' })).toBeInTheDocument()
    expect(screen.getByText('Locked')).toBeInTheDocument()
    // Locked badges expose their progress instead of their identity
    expect(screen.getByText('Progress')).toBeInTheDocument()
    expect(screen.getByText('Category')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Close' })).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Close' }))
    expect(screen.queryByRole('heading', { name: '???' })).not.toBeInTheDocument()
  })

  it('filters the grid down to locked badges only', async () => {
    const user = userEvent.setup()
    renderSeededPage(<BadgesPage />, { route: '/badges', url: '/badges' })

    await user.click(screen.getByRole('button', { name: /🔒 Locked/ }))

    // Every badge is still listed because none are unlocked yet
    expect(screen.getAllByText('???')).toHaveLength(BADGES.length)
  })

  it('counts earned badges per category and lists them first on the grid', () => {
    const game = seedDefaultGame()
    localStorage.setItem(
      STORAGE_KEYS.GAME,
      JSON.stringify({
        ...game,
        badges: unlockBadges(game, 'first_quest', 'streak_100'),
      }),
    )
    renderPage(<BadgesPage />, { route: '/badges', url: '/badges' })

    expect(screen.getByText(`2 of ${BADGES.length} badges earned`)).toBeInTheDocument()
    expect(screen.getByText(`${Math.round((2 / BADGES.length) * 100)}%`)).toBeInTheDocument()

    // One earned badge in each of the quest and streak buckets
    for (const cat of ['quest', 'streak', 'skill', 'social', 'secret', 'seasonal'] as const) {
      const total = BADGES.filter((badge) => badge.category === cat).length
      const earned = BADGES.filter(
        (badge) => badge.category === cat && ['first_quest', 'streak_100'].includes(badge.id),
      ).length
      const label = `${earned}/${total}`
      if (total === 0) {
        // Social and seasonal have no badges at all, so their tiles collide
        expect(screen.getAllByText(label)).toHaveLength(2)
      } else {
        expect(screen.getByText(label)).toBeInTheDocument()
      }
    }

    // The earned quest badge is unmasked while the rest of the set stays hidden
    expect(screen.getByText('First Steps')).toBeInTheDocument()
    expect(maskedCards()).toHaveLength(BADGES.length - 2)
  })

  it('shows the unlocked badge first within its rarity tier', async () => {
    const user = userEvent.setup()
    const game = seedDefaultGame()
    localStorage.setItem(
      STORAGE_KEYS.GAME,
      JSON.stringify({ ...game, badges: unlockBadges(game, 'quiz_master') }),
    )
    renderPage(<BadgesPage />, { route: '/badges', url: '/badges' })

    await user.click(screen.getByRole('button', { name: 'Secret' }))
    await user.click(screen.getByRole('button', { name: 'rare' }))

    // 'Quiz Master' is the earned rare secret badge, so it jumps ahead of the
    // other rare secrets it trails in the catalog
    const tier = expectedGridOrder({ category: 'secret', rarity: 'rare' }, ['quiz_master'])
    expect(tier.length).toBeGreaterThan(1)
    expect(tier[0].id).toBe('quiz_master')

    const unlockedCard = screen.getByText('Quiz Master').closest('button')
    if (!unlockedCard) throw new Error('The earned badge card is missing')
    const masked = maskedCards()
    // The earned badge is unmasked, so one card short of the full tier
    expect(masked).toHaveLength(tier.length - 1)
    expect(within(unlockedCard).getByText('✓')).toBeInTheDocument()
    expect(comesBefore(unlockedCard, masked[0])).toBe(true)
  })

  it('describes an earned badge in the modal and shares its card', async () => {
    const user = userEvent.setup()
    // jsdom has no object URL support, so the download pipeline is stubbed
    const createObjectURL = vi.fn((_blob: Blob | MediaSource) => 'blob:devopsquest-badge')
    const revokeObjectURL = vi.fn()
    URL.createObjectURL = createObjectURL
    URL.revokeObjectURL = revokeObjectURL
    const click = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {})

    const game = seedDefaultGame()
    localStorage.setItem(
      STORAGE_KEYS.GAME,
      JSON.stringify({ ...game, badges: unlockBadges(game, 'streak_30') }),
    )
    renderPage(<BadgesPage />, { route: '/badges', url: '/badges' })

    await user.click(screen.getByRole('button', { name: /Monthly Master/ }))

    const panel = modalPanel()
    expect(within(panel).getByText('Monthly Master')).toBeInTheDocument()
    expect(within(panel).getByText('Maintain a 30-day streak')).toBeInTheDocument()
    expect(within(panel).getByText('epic')).toBeInTheDocument()
    expect(within(panel).getByText('+750')).toBeInTheDocument()
    expect(within(panel).getByText('+375')).toBeInTheDocument()
    expect(within(panel).getByText('Unlocked!')).toBeInTheDocument()
    expect(within(panel).getByText('Streaks')).toBeInTheDocument()
    // Earned badges expose their identity instead of a progress read-out
    expect(within(panel).queryByText('Progress')).not.toBeInTheDocument()

    await user.click(within(panel).getByRole('button', { name: /Share Achievement/ }))

    expect(createObjectURL).toHaveBeenCalledTimes(1)
    const blob = createObjectURL.mock.calls[0][0] as Blob
    expect(blob.type).toBe('image/svg+xml')
    expect(click).toHaveBeenCalledTimes(1)
    expect(revokeObjectURL).toHaveBeenCalledWith('blob:devopsquest-badge')

    // The modal header uses the epic tint
    expect(modalHeader(panel)).toHaveClass('from-purple-900/50')

    await user.click(within(panel).getByRole('button', { name: 'Close' }))
    expect(screen.queryByText('Category')).not.toBeInTheDocument()
  })

  it('states the exact requirement for every locked badge requirement type', async () => {
    const user = userEvent.setup()
    renderSeededPage(<BadgesPage />, { route: '/badges', url: '/badges' })

    const cases: Array<[string, string, Badge['category']]> = [
      ['quest_10', 'Complete 10 quests (0/10)', 'quest'],
      ['streak_3', 'Maintain 3 day streak (0/3)', 'streak'],
      ['level_5', 'Reach level 5 (1/5)', 'skill'],
      ['quiz_first', 'Complete 1 quizzes (0/1)', 'quest'],
      ['minigame_first', 'Complete 1 mini-games (0/1)', 'quest'],
      ['html_master', 'Complete all html quests', 'skill'],
      ['foundations_complete', 'Complete 1 realms', 'quest'],
      // Requirement types the page cannot compute fall through to the default
      ['quiz_perfect', 'Complete the requirement to unlock', 'skill'],
    ]

    for (const [badgeId, requirementText, category] of cases) {
      await user.click(screen.getByRole('button', { name: CATEGORY_LABELS[category] }))
      const panel = await openBadgeModal(user, badgeId, { category })
      expect(within(panel).getByText(requirementText)).toBeInTheDocument()
      expect(within(panel).getByText('Locked')).toBeInTheDocument()
      await closeModal(user)
    }
  })

  it('tracks progress towards the remaining requirement types', async () => {
    const user = userEvent.setup()
    const game = seedDefaultGame()
    localStorage.setItem(
      STORAGE_KEYS.GAME,
      JSON.stringify({
        ...game,
        character: { ...game.character, level: 3, streakDays: 1 },
        completedQuests: [
          completedQuest('html_intro', 'html'),
          completedQuest('quiz_basics', 'html'),
          completedQuest('test_basics', 'css'),
        ],
        completedRealms: ['foundations'],
      }),
    )
    renderPage(<BadgesPage />, { route: '/badges', url: '/badges' })

    const cases: Array<[string, string, string, Badge['category']]> = [
      // level: 3 of the 5 required levels
      ['level_5', 'Reach level 5 (3/5)', '60%', 'skill'],
      // streak: 1 of 3 days
      ['streak_3', 'Maintain 3 day streak (1/3)', '33%', 'streak'],
      // quiz: two quiz-tagged completions already banked
      ['quiz_first', 'Complete 1 quizzes (2/1)', '100%', 'quest'],
      // tech_complete: html has a completion, so its gate is cleared
      ['html_master', 'Complete all html quests', '100%', 'skill'],
      // realm_complete: one realm done of the one required
      ['foundations_complete', 'Complete 1 realms', '100%', 'quest'],
    ]

    for (const [badgeId, requirementText, progress, category] of cases) {
      await user.click(screen.getByRole('button', { name: CATEGORY_LABELS[category] }))
      const panel = await openBadgeModal(user, badgeId, { category })
      expect(within(panel).getByText(requirementText)).toBeInTheDocument()
      expect(within(panel).getByText(progress)).toBeInTheDocument()
      await closeModal(user)
    }
  })

  it('tints the modal header for every rarity', async () => {
    const user = userEvent.setup()
    renderSeededPage(<BadgesPage />, { route: '/badges', url: '/badges' })

    const expected: Array<[string, Badge['rarity'], Badge['rarity'], string]> = [
      ['completionist', 'legendary', 'legendary', 'from-amber-900/50'],
      ['speed_demon', 'epic', 'epic', 'from-purple-900/50'],
      ['early_bird', 'rare', 'rare', 'from-blue-900/50'],
      ['first_legendary', 'uncommon', 'uncommon', 'from-green-900/50'],
      ['first_mystery', 'common', 'common', 'from-slate-800'],
    ]

    await user.click(screen.getByRole('button', { name: 'Secret' }))
    for (const [badgeId, rarity, rarityFilter, tint] of expected) {
      await user.click(screen.getByRole('button', { name: rarityFilter }))
      const panel = await openBadgeModal(user, badgeId, { category: 'secret', rarity })
      expect(modalHeader(panel)).toHaveClass(tint)
      await closeModal(user)
    }
  })

  it('narrows the grid with combined filters and offers an empty state', async () => {
    const user = userEvent.setup()
    const game = seedDefaultGame()
    localStorage.setItem(
      STORAGE_KEYS.GAME,
      JSON.stringify({ ...game, badges: unlockBadges(game, 'first_quest') }),
    )
    renderPage(<BadgesPage />, { route: '/badges', url: '/badges' })

    // Category + status: exactly one earned quest badge
    await user.click(screen.getByRole('button', { name: 'Quests' }))
    await user.click(screen.getByRole('button', { name: /✓ Unlocked/ }))
    expect(maskedCards()).toHaveLength(0)
    expect(screen.getByText('First Steps')).toBeInTheDocument()

    // Status flips back to the locked remainder
    await user.click(screen.getByRole('button', { name: /🔒 Locked/ }))
    expect(maskedCards()).toHaveLength(
      BADGES.filter((badge) => badge.category === 'quest').length - 1,
    )

    // Rarity narrows the same category further
    await user.click(screen.getByRole('button', { name: 'All Rarities' }))
    await user.click(screen.getByRole('button', { name: 'legendary' }))
    expect(maskedCards()).toHaveLength(
      BADGES.filter((badge) => badge.category === 'quest' && badge.rarity === 'legendary').length,
    )

    // No seasonal badges exist at all, so that bucket renders the empty state
    await user.click(screen.getByRole('button', { name: 'Seasonal' }))
    expect(screen.getByText('No badges match your filters.')).toBeInTheDocument()
    expect(maskedCards()).toHaveLength(0)
  })
})
