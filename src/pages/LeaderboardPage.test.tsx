import { describe, it, expect, beforeEach } from 'vitest'
import { screen, within, act } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import LeaderboardPage from './LeaderboardPage'
import { realms, allQuests } from '@/data/quests'
import { renderPage, renderSeededPage, seedDefaultGame } from './test-utils'
import { renderGame } from '@/contexts/test-utils'
import { STORAGE_KEYS, XP_PER_LEVEL } from '@/utils/gameUtils'
import type { GameState } from '@/contexts/GameContext'

// Realms in the unlock order the ladder renders (the page sorts its own copy).
const LADDER = Object.values(realms).sort((a, b) => a.requiredLevel - b.requiredLevel)

/**
 * Seeds a save with the default state overlaid by whatever the mutator
 * changes; only the branches the mutator touches are copied so the cached
 * defaults object is never modified.
 */
function seedWith(apply: (draft: GameState) => void): GameState {
  const base = seedDefaultGame()
  const merged: GameState = {
    ...base,
    character: { ...base.character },
    badges: [...base.badges],
    completedQuests: [...base.completedQuests],
    completedTopics: [...base.completedTopics],
    completedRealms: [...base.completedRealms],
    dailyActivity: [...base.dailyActivity],
    // Nested stat branches must be copied too — mutating them in place would
    // poison the cached defaults every later seed starts from.
    stats: { ...base.stats },
    dailyDash: { ...base.dailyDash },
    pvpStats: { ...base.pvpStats },
    skillXp: { ...base.skillXp },
  }
  apply(merged)
  localStorage.setItem(STORAGE_KEYS.GAME, JSON.stringify(merged))
  return merged
}

/** The record tile whose label reads `label`. */
function recordTile(label: string): HTMLElement {
  const tile = screen
    .getAllByText(label)
    .map((el) => el.closest('div.rounded-lg'))
    .find((el): el is HTMLElement => el instanceof HTMLElement)
  if (!tile) throw new Error(`no record tile found for "${label}"`)
  return tile
}

/** A ladder row, found by its realm name. */
function ladderRow(name: string): HTMLElement {
  const row = screen
    .getAllByText(name)
    .map((el) => el.closest('div.grid'))
    .find((el): el is HTMLElement => el instanceof HTMLElement)
  if (!row) throw new Error(`no ladder row found for "${name}"`)
  return row
}

describe('LeaderboardPage', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('frames the board around the player, with no fabricated rivals', () => {
    const { character } = seedDefaultGame()
    renderSeededPage(<LeaderboardPage />, { route: '/leaderboard', url: '/leaderboard' })

    expect(screen.getByRole('heading', { level: 1, name: /Leaderboard/ })).toBeInTheDocument()
    expect(screen.getByText(character.name)).toBeInTheDocument()
    expect(screen.getByText(`Level ${character.level} ${character.class}`)).toBeInTheDocument()
    // No rival roster, no dead timeframe filters
    expect(screen.queryByText('ShadowCoder')).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /This Week/i })).not.toBeInTheDocument()
    expect(screen.queryByText(/All Time/i)).not.toBeInTheDocument()
  })

  it('states the exact XP still missing for the next level', () => {
    seedWith((draft) => {
      draft.character.level = 3
      draft.character.xp = 250
      draft.character.xpToNextLevel = 3 * XP_PER_LEVEL
    })
    renderPage(<LeaderboardPage />, { route: '/leaderboard', url: '/leaderboard' })

    // The target for level 4 is 300 cumulative XP, so 50 remain
    expect(screen.getByText('Level 4 in')).toBeInTheDocument()
    expect(screen.getByText('50 XP')).toBeInTheDocument()
    expect(screen.getByRole('progressbar', { name: 'Progress to level 4' })).toHaveAttribute(
      'aria-valuenow',
      '50',
    )
  })

  it('renders the full realm ladder with honest completion states', () => {
    seedWith((draft) => {
      draft.character.level = 7
      draft.completedRealms = ['foundations']
    })
    renderPage(<LeaderboardPage />, { route: '/leaderboard', url: '/leaderboard' })

    expect(screen.getByRole('heading', { name: /Realm Ladder/ })).toBeInTheDocument()
    for (const realm of LADDER) {
      const row = ladderRow(realm.name)
      expect(within(row).getByText(`Lv ${realm.requiredLevel}`)).toBeInTheDocument()
    }
    // Foundations is finished, the level-5 realm is open, everything past 7 is locked
    expect(ladderRow(LADDER[0].name).textContent).toContain('✅ Completed')
    expect(ladderRow(LADDER[1].name).textContent).toContain('⭐ Unlocked')
    expect(ladderRow(LADDER[2].name).textContent).toContain('🔒 Reach level 10')
  })

  it('reports personal records from the save', () => {
    seedWith((draft) => {
      draft.character.gold = 1234
      draft.character.streakDays = 9
      draft.completedQuests = draft.completedQuests.concat(
        Array.from({ length: 12 }, (_, i) => ({
          questId: `q${i}`,
          topicId: `t${i}`,
          technologyId: 'git',
          completed: true,
          xpEarned: 10,
        })),
      )
      draft.completedTopics = [
        { topicId: 'css_flexbox', technologyId: 'css', completed: true, xpEarned: 30 },
      ]
      draft.badges = draft.badges.map((badge, i) =>
        i < 4 ? { ...badge, unlockedAt: '2026-01-01T00:00:00.000Z' } : badge,
      )
      draft.stats.fastestQuestTime = 42
      draft.stats.quizPerfectCount = 6
      draft.stats.minigameCount = 2
      draft.stats.typerCount = 3
      draft.stats.memoryCount = 4
      draft.stats.mathCount = 5
      draft.dailyDash.bestTime = 95
      draft.pvpStats.wins = 7
      draft.prestigeLevel = 2
    })
    renderPage(<LeaderboardPage />, { route: '/leaderboard', url: '/leaderboard' })

    expect(screen.getByRole('heading', { name: /Personal Records/ })).toBeInTheDocument()
    const tileText = (label: string): string => recordTile(label).textContent
    expect(tileText('Quests Completed')).toContain('12')
    expect(tileText('Topics Learned')).toContain('1')
    expect(tileText('Badges Earned')).toContain('4 /')
    expect(tileText('Technologies Trained')).toContain('0')
    expect(tileText('Fastest Quest')).toContain('42s')
    expect(tileText('Perfect Quizzes')).toContain('6')
    expect(tileText('Mini-game Rounds')).toContain('14')
    expect(tileText('Best Daily Dash')).toContain('95s')
    expect(tileText('Current Streak')).toContain('9 days')
    expect(tileText('Sparring Wins')).toContain('7')
    expect(tileText('Prestige Level')).toContain('2')
    expect(tileText('Gold Held')).toContain('1,234')
  })

  it('counts a technology as trained once a quest banks its XP', () => {
    // skillXp only accrues through the completion action (the storage merge
    // drops keys seeded straight into an empty record), so play one quest
    const quest = allQuests.find((entry) => entry.id === 'quest_html_intro')
    if (!quest) throw new Error('quest_html_intro missing from allQuests')
    seedDefaultGame()
    const getGame = renderGame(
      <MemoryRouter initialEntries={['/leaderboard']}>
        <LeaderboardPage />
      </MemoryRouter>,
    )
    act(() => {
      getGame().completeQuest(quest.id)
    })

    expect(recordTile('Technologies Trained').textContent).toContain('1')
  })

  it('shows a dash for records the save has no entry for yet', () => {
    renderSeededPage(<LeaderboardPage />, { route: '/leaderboard', url: '/leaderboard' })

    expect(recordTile('Fastest Quest').textContent).toContain('—')
    expect(recordTile('Best Daily Dash').textContent).toContain('—')
  })
})
