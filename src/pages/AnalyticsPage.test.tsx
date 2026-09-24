import { describe, it, expect, beforeEach } from 'vitest'
import { screen } from '@testing-library/react'
import AnalyticsPage from './AnalyticsPage'
import { allQuests, realms } from '@/data/quests'
import { BADGES } from '@/data/badges'
import { STORAGE_KEYS } from '@/utils/gameUtils'
import { renderPage, renderSeededPage, seedDefaultGame } from './test-utils'

const realmList = Object.values(realms)
const firstRealm = realmList[0]
const firstRealmQuests = allQuests.filter((q) => q.realmId === firstRealm.id)

describe('AnalyticsPage', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('renders the analytics header and overview stats', () => {
    renderSeededPage(<AnalyticsPage />, { route: '/analytics', url: '/analytics' })

    expect(
      screen.getByRole('heading', { level: 1, name: /Learning Analytics/ }),
    ).toBeInTheDocument()
    expect(screen.getByText('Quests Completed')).toBeInTheDocument()
    // A fresh account has completed none of the generated quests
    expect(screen.getByText(`of ${allQuests.length}`)).toBeInTheDocument()
    expect(screen.getByText('Completion Rate')).toBeInTheDocument()
    expect(screen.getByText('Badges Earned')).toBeInTheDocument()
    expect(screen.getByText(`of ${BADGES.length}`)).toBeInTheDocument()
    expect(screen.getByText('Day Streak 🔥')).toBeInTheDocument()
  })

  it('shows level progress for a brand new character', () => {
    const { character } = seedDefaultGame()
    renderSeededPage(<AnalyticsPage />, { route: '/analytics', url: '/analytics' })

    expect(screen.getByText('⭐ Level Progress')).toBeInTheDocument()
    expect(screen.getByText(`Level ${character.level}`)).toBeInTheDocument()
    expect(screen.getByText('Total XP')).toBeInTheDocument()
    expect(screen.getByText('Gold')).toBeInTheDocument()
    expect(screen.getByText('Prestige Bonus')).toBeInTheDocument()
    // Default prestige multiplier is 1.0
    expect(screen.getByText('1.0x')).toBeInTheDocument()
  })

  it('breaks progress down per realm', () => {
    renderSeededPage(<AnalyticsPage />, { route: '/analytics', url: '/analytics' })

    expect(screen.getByText('🗺️ Realm Progress')).toBeInTheDocument()
    for (const realm of realmList) {
      expect(screen.getByText(realm.name)).toBeInTheDocument()
    }
    // Nothing completed in the first realm yet
    expect(screen.getByText(`0/${firstRealmQuests.length}`)).toBeInTheDocument()
  })

  it('counts a completed quest in its realm and technology breakdown', () => {
    const quest = firstRealmQuests[0]
    const game = seedDefaultGame()
    game.completedQuests = [
      {
        topicId: quest.topicId,
        technologyId: quest.technologyId,
        questId: quest.id,
        completed: true,
        xpEarned: 100,
        completedAt: new Date().toISOString(),
      },
    ]
    localStorage.setItem(STORAGE_KEYS.GAME, JSON.stringify(game))
    // renderPage (not renderSeededPage) keeps the mutated save on disk
    renderPage(<AnalyticsPage />, { route: '/analytics', url: '/analytics' })

    expect(screen.getByText(`1/${firstRealmQuests.length}`)).toBeInTheDocument()
    // The finished technology appears in the breakdown list (the page uppercases
    // it via a CSS class, so the raw lowercase id is what ends up in the DOM)
    expect(screen.getByText(new RegExp(`^${quest.technologyId}$`, 'i'))).toBeInTheDocument()
  })

  it('reports performance metrics and badge collection progress', () => {
    renderSeededPage(<AnalyticsPage />, { route: '/analytics', url: '/analytics' })

    expect(screen.getByText('🎯 Performance Metrics')).toBeInTheDocument()
    expect(screen.getByText('Flawless Quests')).toBeInTheDocument()
    expect(screen.getByText('Quizzes Passed')).toBeInTheDocument()
    expect(screen.getByText('Fastest Quest')).toBeInTheDocument()
    // The "no fastest quest yet" sentinel is Infinity, which JSON cannot
    // represent - the load path restores it so the placeholder survives a
    // save/load round trip instead of collapsing to "0s".
    expect(screen.getByText('--')).toBeInTheDocument()
    expect(screen.queryByText('0s')).not.toBeInTheDocument()
    expect(screen.getByText('🏅 Badge Collection')).toBeInTheDocument()
    expect(screen.getByText(`0 / ${BADGES.length}`)).toBeInTheDocument()
    expect(
      screen.getByText('Keep completing quests and mini-games to earn more badges!'),
    ).toBeInTheDocument()
  })
})
