import { describe, it, expect, beforeEach } from 'vitest'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import CareerPathPage from './CareerPathPage'
import { CAREER_PATHS, type CareerPath } from '@/data/careerPaths'
import { allQuests } from '@/data/quests'
import { expectedAppliedXp, renderPage, renderSeededPage, seedDefaultGame } from './test-utils'
import { STORAGE_KEYS } from '@/utils/gameUtils'
import type { GameState } from '@/contexts/GameContext'

function pathCard(name: string): HTMLElement {
  const card = screen.getAllByRole('button').find((btn) => btn.textContent.includes(name))
  if (!card) throw new Error(`No career path card found for "${name}"`)
  return card
}

/** The milestone of `path` whose required quests form the smallest set. */
function cheapestMilestone(path: CareerPath) {
  return path.milestones
    .map((milestone) => {
      const questIds = new Set(
        path.technologies
          .filter((tech) => milestone.requiredTechnologies.includes(tech.id))
          .flatMap((tech) => tech.questIds),
      )
      return { milestone, questIds: [...questIds] }
    })
    .sort((a, b) => a.questIds.length - b.questIds.length)[0]
}

describe('CareerPathPage', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('renders the career paths header, intro and every path card', () => {
    renderSeededPage(<CareerPathPage />, { route: '/career-path', url: '/career-path' })

    expect(screen.getByRole('heading', { level: 1, name: /Career Paths/ })).toBeInTheDocument()
    expect(screen.getByText('Your DevOps Career Journey')).toBeInTheDocument()
    for (const label of ['All Paths', 'High Demand', 'Growing']) {
      expect(screen.getByRole('button', { name: label })).toBeInTheDocument()
    }
    for (const path of CAREER_PATHS) {
      expect(screen.getByText(path.name)).toBeInTheDocument()
    }
    // Every card advertises salary, time and technology count
    expect(screen.getAllByText('Salary Range')).toHaveLength(CAREER_PATHS.length)
    expect(screen.getAllByText('Est. Time')).toHaveLength(CAREER_PATHS.length)
    expect(screen.getAllByText('Technologies')).toHaveLength(CAREER_PATHS.length)
  })

  it('filters the cards by demand level', async () => {
    const user = userEvent.setup()
    renderSeededPage(<CareerPathPage />, { route: '/career-path', url: '/career-path' })

    await user.click(screen.getByRole('button', { name: 'High Demand' }))

    const highDemand = CAREER_PATHS.filter((p) => p.demandLevel === 'high')
    const notHighDemand = CAREER_PATHS.filter((p) => p.demandLevel !== 'high')
    expect(screen.getAllByText('Salary Range')).toHaveLength(highDemand.length)
    for (const path of highDemand) {
      expect(screen.getByText(path.name)).toBeInTheDocument()
    }
    for (const path of notHighDemand) {
      expect(screen.queryByText(path.name)).not.toBeInTheDocument()
    }

    await user.click(screen.getByRole('button', { name: 'Growing' }))

    const growing = CAREER_PATHS.filter((p) => p.demandLevel === 'growing')
    expect(growing.length).toBeGreaterThan(0)
    expect(screen.getAllByText('Salary Range')).toHaveLength(growing.length)

    await user.click(screen.getByRole('button', { name: 'All Paths' }))
    expect(screen.getAllByText('Salary Range')).toHaveLength(CAREER_PATHS.length)
  })

  it('opens a path detail modal with prerequisites, skill tree and milestones', async () => {
    const user = userEvent.setup()
    const path = CAREER_PATHS[0]
    renderSeededPage(<CareerPathPage />, { route: '/career-path', url: '/career-path' })

    await user.click(pathCard(path.name))

    // The path name now appears on the card and in the modal heading
    expect(screen.getAllByText(path.name).length).toBeGreaterThan(1)
    expect(screen.getByText('📋 Prerequisites')).toBeInTheDocument()
    expect(screen.getByText('🛠️ Technology Skill Tree')).toBeInTheDocument()
    expect(screen.getByText('🏆 Milestones')).toBeInTheDocument()
    for (const tech of path.technologies) {
      expect(screen.getByText(tech.name)).toBeInTheDocument()
    }
    // A new player has made no progress on any technology yet
    expect(screen.getAllByText('0% complete')).toHaveLength(path.technologies.length)
    for (const milestone of path.milestones) {
      expect(screen.getByText(milestone.name)).toBeInTheDocument()
    }

    await user.click(screen.getByRole('button', { name: 'Close' }))
    // Only the card heading remains once the modal is dismissed
    expect(screen.getAllByText(path.name)).toHaveLength(1)
    expect(screen.queryByText('🛠️ Technology Skill Tree')).not.toBeInTheDocument()
  })

  it('starts every technology at zero progress for a new player', () => {
    renderSeededPage(<CareerPathPage />, { route: '/career-path', url: '/career-path' })

    // Each card shows "Your Progress" at 0%
    expect(screen.getAllByText('0%')).toHaveLength(CAREER_PATHS.length)
  })

  it('pays a finished milestone through the modal claim button', async () => {
    const user = userEvent.setup()
    const path = CAREER_PATHS[0]
    const { milestone, questIds } = cheapestMilestone(path)
    if (questIds.length === 0) throw new Error(`Milestone ${milestone.id} requires no quests`)

    // Completing every quest of the milestone's required technologies unlocks it
    const questById = new Set(allQuests.map((quest) => quest.id))
    for (const questId of questIds) {
      expect(questById.has(questId), `quest ${questId} exists`).toBe(true)
    }
    const base = seedDefaultGame()
    localStorage.setItem(
      STORAGE_KEYS.GAME,
      JSON.stringify({
        ...base,
        completedQuests: questIds.map((questId, index) => ({
          topicId: `topic-${index}`,
          technologyId: 'html',
          questId,
          completed: true,
          xpEarned: 10,
          completedAt: new Date().toISOString(),
        })),
      }),
    )
    renderPage(<CareerPathPage />)

    await user.click(pathCard(path.name))

    const claimButton = screen.getByRole('button', { name: /🎁 Claim/ })
    await user.click(claimButton)

    // The claim pays the advertised bonus through the class bonus engine
    // (XP is class-multiplied; gold has no class bonus by default)
    const appliedXp = expectedAppliedXp(milestone.rewards.xpBonus, base.character)
    const appliedGold = Math.floor(milestone.rewards.goldBonus)
    expect(screen.getByRole('status')).toHaveTextContent(
      `${milestone.name}: +${appliedXp} XP, +${appliedGold} gold`,
    )

    const stored = JSON.parse(localStorage.getItem(STORAGE_KEYS.GAME) ?? '{}') as GameState
    expect(stored.claimedCareerMilestones).toEqual([`${path.id}:${milestone.id}`])
    expect(stored.character.xp).toBe(base.character.xp + appliedXp)
    expect(stored.character.gold).toBe(base.character.gold + appliedGold)
    // The claimed milestone flips to its ✓ state and the feedback can be dismissed
    expect(screen.getByText('✓ Claimed')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Dismiss' }))
    expect(screen.queryByRole('status')).not.toBeInTheDocument()
  })

  it('shows the demand-level banner in the detail modal and closes via ×', async () => {
    const user = userEvent.setup()
    const highDemand = CAREER_PATHS.find((p) => p.demandLevel === 'high')
    const growing = CAREER_PATHS.find((p) => p.demandLevel === 'growing')
    if (!highDemand || !growing) throw new Error('Expected both high and growing demand paths')

    renderSeededPage(<CareerPathPage />, { route: '/career-path', url: '/career-path' })

    // Every high-demand card carries the badge; the modal adds its own copy
    const cardBadges = CAREER_PATHS.filter((p) => p.demandLevel === 'high').length
    await user.click(pathCard(highDemand.name))
    expect(screen.getAllByText('🔥 High Demand')).toHaveLength(cardBadges + 1)
    await user.click(screen.getByRole('button', { name: '×' }))
    // Closing removes the modal's copy and its content with it
    expect(screen.getAllByText('🔥 High Demand')).toHaveLength(cardBadges)
    expect(screen.queryByText('📋 Prerequisites')).not.toBeInTheDocument()

    await user.click(pathCard(growing.name))
    expect(screen.getAllByText('📈 Growing')).toHaveLength(
      CAREER_PATHS.filter((p) => p.demandLevel === 'growing').length + 1,
    )
  })
})
