import { describe, it, expect, beforeEach } from 'vitest'
import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import MilestonesPage from './MilestonesPage'
import { MILESTONES } from '@/data/milestones'
import { renderPage, renderSeededPage, seedDefaultGame } from './test-utils'
import { STORAGE_KEYS } from '@/utils/gameUtils'
import { allQuests } from '@/data/quests'

describe('MilestonesPage', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('renders the milestones header and progress summary', () => {
    renderSeededPage(<MilestonesPage />, { route: '/milestones', url: '/milestones' })

    expect(screen.getByRole('heading', { level: 1, name: /Milestones/ })).toBeInTheDocument()
    expect(screen.getByText('Milestone Progress')).toBeInTheDocument()
    expect(screen.getByText(`0 of ${MILESTONES.length} milestones achieved`)).toBeInTheDocument()
  })

  it('summarises the player stats used by milestone triggers', () => {
    const { character } = seedDefaultGame()
    renderSeededPage(<MilestonesPage />, { route: '/milestones', url: '/milestones' })

    expect(screen.getByText('Total XP Earned')).toBeInTheDocument()
    expect(screen.getByText('Current Level')).toBeInTheDocument()
    expect(screen.getByText(`🔥 ${character.streakDays}`)).toBeInTheDocument()
  })

  it('lists every milestone from the static data', () => {
    renderSeededPage(<MilestonesPage />, { route: '/milestones', url: '/milestones' })

    for (const milestone of MILESTONES) {
      expect(screen.getByText(milestone.title)).toBeInTheDocument()
    }
  })

  it('offers status and type filters', () => {
    renderSeededPage(<MilestonesPage />, { route: '/milestones', url: '/milestones' })

    for (const label of ['All', 'Quests', 'Streaks', 'Levels', 'Realms', 'Quizzes', 'Mini-games']) {
      expect(screen.getAllByRole('button', { name: label }).length).toBeGreaterThan(0)
    }
    expect(screen.getByRole('button', { name: /Achieved/ })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Pending/ })).toBeInTheDocument()
  })

  it('opens a milestone detail modal with its progress and closes it', async () => {
    const user = userEvent.setup()
    const [first] = MILESTONES
    renderSeededPage(<MilestonesPage />, { route: '/milestones', url: '/milestones' })

    // The milestone title appears on its card and in the modal heading
    await user.click(screen.getAllByText(first.title)[0])

    expect(screen.getAllByRole('heading', { name: first.title }).length).toBeGreaterThan(0)
    expect(screen.getByText('Pending')).toBeInTheDocument()
    expect(screen.getByText('XP Bonus')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Close' }))
    // Only the card heading remains once the modal is dismissed
    expect(screen.getAllByRole('heading', { name: first.title })).toHaveLength(1)
  })

  it('reads milestone progress straight out of the save', () => {
    const game = seedDefaultGame()
    const bossQuest = allQuests[0]
    localStorage.setItem(
      STORAGE_KEYS.GAME,
      JSON.stringify({
        ...game,
        character: { ...game.character, level: 7, streakDays: 6 },
        completedQuests: [
          {
            topicId: 'boss_intro',
            technologyId: bossQuest.technologyId,
            questId: bossQuest.id,
            completed: true,
            xpEarned: bossQuest.xpReward,
            completedAt: new Date().toISOString(),
          },
        ],
      }),
    )
    renderPage(<MilestonesPage />, { route: '/milestones', url: '/milestones' })

    // Level and streak progress are the raw character values over the target
    expect(card('Rising Star').textContent).toContain('Reach level 5')
    expect(card('Rising Star').textContent).toContain('7 / 5')
    expect(within(card('Rising Star')).getByText('100%')).toBeInTheDocument()
    expect(within(card('Three Day Fire')).getByText('6 / 3')).toBeInTheDocument()

    // A boss topic in the quest log satisfies the first-boss trigger
    expect(within(card('Boss Slayer')).getByText('Defeat your first boss')).toBeInTheDocument()
    expect(within(card('Boss Slayer')).getByText('1 / 1')).toBeInTheDocument()

    // Triggers the page cannot compute always report zero progress
    expect(within(card('HTML Hero')).getByText('0 / 1')).toBeInTheDocument()
    expect(within(card('Perfectionist')).getByText('0 / 1')).toBeInTheDocument()
    expect(within(card('Quiz Whiz')).getByText('0 / 3')).toBeInTheDocument()
  })

  it('ranks an unlocked milestone first and lets the filters slice the list', async () => {
    const user = userEvent.setup()
    const game = seedDefaultGame()
    localStorage.setItem(
      STORAGE_KEYS.GAME,
      JSON.stringify({
        ...game,
        milestones: game.milestones.map((entry) =>
          entry.id === 'first_quest'
            ? { ...entry, unlocked: true, unlockedAt: '2026-01-15T00:00:00.000Z' }
            : entry,
        ),
      }),
    )
    renderPage(<MilestonesPage />, { route: '/milestones', url: '/milestones' })

    // The unlocked card celebrates with its message and a tick, the locked ones
    // still advertise their requirement
    expect(within(card('First Steps')).getByText('✓')).toBeInTheDocument()
    expect(
      within(card('First Steps')).getByText(
        'You completed your first quest! The journey begins...',
      ),
    ).toBeInTheDocument()
    expect(within(card('Getting Warmed Up')).getByText('Complete 5 quests')).toBeInTheDocument()
    expect(within(card('Getting Warmed Up')).queryByText('✓')).not.toBeInTheDocument()

    // Achieved milestones sort ahead of pending ones
    const grid = screen.getByText('First Steps').closest('.grid')
    if (!(grid instanceof HTMLElement)) throw new Error('Milestone grid missing')
    const titles = within(grid)
      .getAllByRole('button')
      .map((button) => button.textContent)
    expect(titles[0]).toContain('First Steps')

    // The status filter narrows to a single achieved milestone
    await user.click(screen.getByRole('button', { name: /Achieved/ }))
    expect(screen.getByText('First Steps')).toBeInTheDocument()
    expect(screen.queryByText('Getting Warmed Up')).not.toBeInTheDocument()

    // ...or hides it again
    await user.click(screen.getByRole('button', { name: /Pending/ }))
    expect(screen.queryByText('First Steps')).not.toBeInTheDocument()
    expect(screen.getByText('Getting Warmed Up')).toBeInTheDocument()

    // The type filter keeps only milestones of that category
    const statusGroup = screen.getByRole('button', { name: /Achieved/ }).closest('div')
    if (!(statusGroup instanceof HTMLElement)) throw new Error('Status filter group missing')
    await user.click(within(statusGroup).getByRole('button', { name: 'All' }))
    await user.click(screen.getByRole('button', { name: 'Streaks' }))
    expect(screen.getByText('Three Day Fire')).toBeInTheDocument()
    expect(screen.queryByText('Getting Warmed Up')).not.toBeInTheDocument()
    // Locked streak milestones advertise their category
    expect(within(card('Weekly Warrior')).getByText('Streaks')).toBeInTheDocument()
  })

  it('offers an empty state when no milestone matches the filters', async () => {
    const user = userEvent.setup()
    const game = seedDefaultGame()
    localStorage.setItem(
      STORAGE_KEYS.GAME,
      JSON.stringify({
        ...game,
        milestones: game.milestones.map((entry) =>
          entry.id === 'first_quest' ? { ...entry, unlocked: true } : entry,
        ),
      }),
    )
    renderPage(<MilestonesPage />, { route: '/milestones', url: '/milestones' })

    await user.click(screen.getByRole('button', { name: /Achieved/ }))
    await user.click(screen.getByRole('button', { name: 'Quizzes' }))

    expect(screen.getByText('No milestones match your filters.')).toBeInTheDocument()
    expect(screen.queryByText('First Steps')).not.toBeInTheDocument()
  })

  it('shows the unlock date when an achieved milestone is opened', async () => {
    const user = userEvent.setup()
    const game = seedDefaultGame()
    localStorage.setItem(
      STORAGE_KEYS.GAME,
      JSON.stringify({
        ...game,
        milestones: game.milestones.map((entry) =>
          entry.id === 'first_quest'
            ? { ...entry, unlocked: true, unlockedAt: '2026-01-15T00:00:00.000Z' }
            : entry,
        ),
      }),
    )
    renderPage(<MilestonesPage />, { route: '/milestones', url: '/milestones' })

    await user.click(within(card('First Steps')).getByText('First Steps'))

    // Achieved milestones celebrate instead of advertising the requirement
    expect(screen.getByText('Achieved!')).toBeInTheDocument()
    expect(screen.queryByText('Pending')).not.toBeInTheDocument()
    expect(screen.queryByText(/Complete 1 quests/)).not.toBeInTheDocument()
    expect(
      screen.getByText(new Date('2026-01-15T00:00:00.000Z').toLocaleDateString()),
    ).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Close' }))
    expect(screen.queryByText('Achieved!')).not.toBeInTheDocument()
  })
})

/** The milestone card that renders `title`. */
function card(title: string): HTMLElement {
  const element = screen.getByText(title).closest('button')
  if (!(element instanceof HTMLElement)) throw new Error(`No milestone card for "${title}"`)
  return element
}
