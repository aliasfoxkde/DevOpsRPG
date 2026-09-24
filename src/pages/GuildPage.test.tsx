import { describe, it, expect, beforeEach } from 'vitest'
import { screen, within, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import GuildPage from './GuildPage'
import {
  MOCK_GUILD,
  MOCK_GUILD_MEMBERS,
  MOCK_GUILD_CHALLENGES,
  FEATURED_GUILDS,
} from '@/data/guilds'
import { generateWeeklyChallenges } from '@/data/communityChallenges'
import { allQuests } from '@/data/quests'
import { closestContainer, renderPage, renderSeededPage, seedDefaultGame } from './test-utils'
import { renderGame } from '@/contexts/test-utils'
import { STORAGE_KEYS } from '@/utils/gameUtils'
import type { GameState } from '@/contexts/GameContext'

/** A quest-completion record shaped like the provider's own `TopicProgress`. */
interface SeededQuest {
  topicId: string
  technologyId: string
  questId: string
  completed: boolean
  xpEarned: number
  completedAt?: string
}

/** N completion records; only the count drives the guild progress maths. */
function completedQuests(count: number): SeededQuest[] {
  return Array.from({ length: count }, (_, i) => ({
    topicId: `topic-${i}`,
    technologyId: 'html',
    questId: `quest-${i}`,
    completed: true,
    xpEarned: 10,
  }))
}

/**
 * Seeds a save with the default state overlaid by whatever the mutator
 * changes. Only the branches the mutator touches are copied, so the cached
 * defaults object itself is never modified.
 */
function seedWith(apply: (draft: GameState) => void): GameState {
  const base = seedDefaultGame()
  const merged: GameState = {
    ...base,
    character: { ...base.character },
    stats: { ...base.stats },
    communityStats: { ...base.communityStats },
    completedQuests: [...base.completedQuests],
  }
  apply(merged)
  localStorage.setItem(STORAGE_KEYS.GAME, JSON.stringify(merged))
  return merged
}

/** Reads the value sitting directly above a stat label in a stat tile. */
function statValue(label: string): string | null {
  return screen.getByText(label).previousElementSibling?.textContent ?? null
}

describe('GuildPage', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('renders the guild hall header, tabs and current guild banner', () => {
    const { character } = seedDefaultGame()
    renderSeededPage(<GuildPage />, { route: '/guild', url: '/guild' })

    expect(screen.getByRole('heading', { level: 1, name: /Guild Hall/ })).toBeInTheDocument()
    for (const label of [
      '📊 Overview',
      '👥 Members',
      '⚔️ Challenges',
      '🌐 Community',
      '🔍 Discover',
    ]) {
      expect(screen.getByRole('button', { name: label })).toBeInTheDocument()
    }
    // The demo guild is joined by default
    expect(screen.getByText(MOCK_GUILD.name)).toBeInTheDocument()
    expect(
      screen.getByText(`${MOCK_GUILD.memberCount}/${MOCK_GUILD.maxMembers} members`),
    ).toBeInTheDocument()
    expect(screen.getByText(`${MOCK_GUILD.xp} / ${MOCK_GUILD.xpToNextLevel}`)).toBeInTheDocument()
    // A level 1 player is a plain member
    expect(screen.getByText('Your Role')).toBeInTheDocument()
    expect(character.level).toBe(1)
  })

  it('summarises the player contribution and guild statistics', () => {
    const { character } = seedDefaultGame()
    renderSeededPage(<GuildPage />, { route: '/guild', url: '/guild' })

    expect(screen.getByText('🧙 Your Guild Contribution')).toBeInTheDocument()
    expect(screen.getByText('Guild XP Contributed')).toBeInTheDocument()
    expect(screen.getByText('📊 Guild Statistics')).toBeInTheDocument()
    expect(screen.getByText(MOCK_GUILD.totalQuests.toLocaleString())).toBeInTheDocument()
    expect(screen.getByText('🏆 Guild Achievements')).toBeInTheDocument()
    expect(screen.getByText('🏅 Guild Founded')).toBeInTheDocument()
    // The contribution tile mirrors the character level from the save
    expect(screen.getByText('Your Level').previousElementSibling).toHaveTextContent(
      String(character.level),
    )
  })

  it('lists the roster with the player mixed in on the members tab', async () => {
    const user = userEvent.setup()
    const { character } = seedDefaultGame()
    renderSeededPage(<GuildPage />, { route: '/guild', url: '/guild' })

    await user.click(screen.getByRole('button', { name: '👥 Members' }))

    expect(screen.getByText('Weekly XP')).toBeInTheDocument()
    // Every mock member is listed next to the player's own entry
    for (const member of MOCK_GUILD_MEMBERS) {
      expect(screen.getByText(member.name)).toBeInTheDocument()
    }
    expect(screen.getByText(character.name)).toBeInTheDocument()
    // Roster = mock members + the player
    expect(screen.getAllByText(/Lv\.\d+/)).toHaveLength(MOCK_GUILD_MEMBERS.length + 1)
  })

  it('shows the active guild challenges and their progress', async () => {
    const user = userEvent.setup()
    renderSeededPage(<GuildPage />, { route: '/guild', url: '/guild' })

    await user.click(screen.getByRole('button', { name: '⚔️ Challenges' }))

    expect(screen.getByText('⚔️ Active Challenges')).toBeInTheDocument()
    for (const challenge of MOCK_GUILD_CHALLENGES) {
      expect(screen.getByText(challenge.title)).toBeInTheDocument()
      // Player has finished no quests, so only the base progress shows
      expect(screen.getByText(`${challenge.progress}/${challenge.target}`)).toBeInTheDocument()
    }
  })

  it('offers featured guilds but blocks joining while already in one', async () => {
    const user = userEvent.setup()
    renderSeededPage(<GuildPage />, { route: '/guild', url: '/guild' })

    await user.click(screen.getByRole('button', { name: '🔍 Discover' }))

    expect(screen.getByText('🔍 Featured Guilds')).toBeInTheDocument()
    for (const guild of FEATURED_GUILDS) {
      expect(screen.getByText(guild.name)).toBeInTheDocument()
    }
    const joinButtons = screen.getAllByRole('button', { name: 'Already in Guild' })
    expect(joinButtons).toHaveLength(FEATURED_GUILDS.length)
    for (const button of joinButtons) {
      expect(button).toBeDisabled()
    }
  })

  it('lists the weekly community goals with their progress and rewards', async () => {
    const user = userEvent.setup()
    seedDefaultGame()
    renderSeededPage(<GuildPage />, { route: '/guild', url: '/guild' })

    await user.click(screen.getByRole('button', { name: '🌐 Community' }))

    expect(screen.getByRole('heading', { name: 'Community Challenges' })).toBeInTheDocument()
    expect(screen.getByText('🏆 Weekly Community Goals')).toBeInTheDocument()
    expect(screen.getByText('Resets every Monday')).toBeInTheDocument()
    expect(screen.getByText('How Community Challenges Work')).toBeInTheDocument()

    // The stat tiles mirror the player's own weekly community stats
    expect(statValue('Your Weekly Quests')).toBe('0')
    expect(statValue('Your Weekly XP')).toBe('0')
    expect(statValue('Your Contribution')).toBe('0%')

    // Every generated goal is rendered with its target, rewards and timer
    const expected = generateWeeklyChallenges({
      totalQuestsCompleted: 0,
      totalXPEarned: 0,
      highestStreak: 0,
      totalQuizzesTaken: 0,
      totalPerfectQuizzes: 0,
      weeklyQuestsCompleted: 0,
      weeklyXPCompleted: 0,
      lastWeekReset: new Date().toISOString(),
      challengeHistory: { completedChallenges: [], totalContributions: 0 },
    })
    expect(screen.getAllByText(/remaining|Less than 1h/)).toHaveLength(expected.length)
    for (const challenge of expected) {
      const card = closestContainer(screen.getByText(challenge.title), 'div.rounded-xl')
      expect(within(card).getByText(`0 / ${challenge.target.toLocaleString()}`)).toBeInTheDocument()
      expect(within(card).getByText(`+${challenge.xpReward} XP`)).toBeInTheDocument()
      expect(within(card).getByText(`+${challenge.goldReward} Gold`)).toBeInTheDocument()
      expect(within(card).getByText('0% complete')).toBeInTheDocument()
      expect(within(card).queryByText('✓ Complete!')).not.toBeInTheDocument()
    }
    // Each goal reports the contribution stat it tracks
    expect(screen.getByText('0 quests')).toBeInTheDocument()
    expect(screen.getByText('0 XP')).toBeInTheDocument()
    expect(screen.getByText('0 days')).toBeInTheDocument()
    expect(screen.getByText('0 perfect')).toBeInTheDocument()
  })

  it('marks community goals complete once the player clears their targets', async () => {
    const user = userEvent.setup()
    seedWith((draft) => {
      draft.character.streakDays = 120
      draft.communityStats.weeklyQuestsCompleted = 500
      draft.communityStats.weeklyXPCompleted = 12345
    })
    renderPage(<GuildPage />, { route: '/guild', url: '/guild' })

    await user.click(screen.getByRole('button', { name: '🌐 Community' }))

    // 500/500 quests and a 120-day streak both clear their goals; the quest
    // goal also caps the contribution tile at 100%.
    expect(statValue('Your Weekly Quests')).toBe('500')
    expect(statValue('Your Weekly XP')).toBe('12,345')
    expect(statValue('Your Contribution')).toBe('100%')
    expect(statValue('Your Streak')).toBe('120')

    expect(screen.getAllByText('✓ Complete!')).toHaveLength(2)
    expect(screen.getAllByText('100% complete')).toHaveLength(2)
    expect(screen.getByText('500 / 500')).toBeInTheDocument()
    expect(screen.getByText('120 / 100')).toBeInTheDocument()
    expect(screen.getByText('500 quests')).toBeInTheDocument()
    expect(screen.getByText('12,345 XP')).toBeInTheDocument()
    expect(screen.getByText('120 days')).toBeInTheDocument()
    expect(screen.getByText('0 perfect')).toBeInTheDocument()
  })

  it('promotes a high level player to officer and shows their real stats', async () => {
    const user = userEvent.setup()
    seedWith((draft) => {
      draft.character.level = 35
      draft.character.xp = 20000
      draft.character.streakDays = 9
    })
    renderPage(<GuildPage />, { route: '/guild', url: '/guild' })

    // Level >= 30 earns the officer rank, shown in the banner and the roster
    expect(screen.getAllByText('Officer').length).toBeGreaterThanOrEqual(1)

    await user.click(screen.getByRole('button', { name: '👥 Members' }))

    const playerRow = closestContainer(screen.getByText('Hero'), 'div.bg-card')
    expect(within(playerRow).getByText('Lv.35')).toBeInTheDocument()
    expect(within(playerRow).getByText('⚔️ Officer')).toBeInTheDocument()
    // Weekly XP comes from skill XP, which a fresh save has none of
    expect(within(playerRow).getByText('0')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: '📊 Overview' }))

    expect(statValue('Your Level')).toBe('35')
    expect(statValue('Your Quests')).toBe('0')
    expect(statValue('Guild XP Contributed')).toBe('200')
    expect(statValue('Your Streak')).toBe('9')
  })

  it('completes a guild challenge once the player pushes it past its target', async () => {
    const user = userEvent.setup()
    seedWith((draft) => {
      draft.completedQuests = completedQuests(300)
    })
    renderPage(<GuildPage />, { route: '/guild', url: '/guild' })

    await user.click(screen.getByRole('button', { name: '⚔️ Challenges' }))

    // 300 quests add floor(300/10) = 30 progress to every guild challenge,
    // which clears Kubernetes Week (23 + 30 = 53 of a 50 target)...
    const k8s = closestContainer(screen.getByText('Kubernetes Week'), 'div.rounded-xl')
    expect(within(k8s).getByText('✓ Complete!')).toBeInTheDocument()
    expect(within(k8s).getByText('53/50')).toBeInTheDocument()
    expect(within(k8s).getByText('+2500 XP')).toBeInTheDocument()
    expect(within(k8s).getByText('+800 Gold')).toBeInTheDocument()
    expect(within(k8s).getByText(/days? left/)).toBeInTheDocument()
    // ...and leaves the rest of the board short of its goal
    expect(screen.getAllByText('✓ Complete!')).toHaveLength(1)
    expect(screen.getByText('175/500')).toBeInTheDocument()
    expect(screen.getByText('97/100')).toBeInTheDocument()
  })

  it('never offers a join button while the hero already belongs to a guild', async () => {
    const user = userEvent.setup()
    // A level 9 hero with 35 quests misses the gates of the two top guilds and
    // clears Container Crew's; membership is fixed to the demo guild either way.
    seedWith((draft) => {
      draft.character.level = 9
      draft.completedQuests = completedQuests(35)
    })
    renderPage(<GuildPage />, { route: '/guild', url: '/guild' })

    await user.click(screen.getByRole('button', { name: '🔍 Discover' }))

    for (const guild of FEATURED_GUILDS) {
      const card = closestContainer(screen.getByText(guild.name), 'div.bg-card')
      expect(within(card).getByText('Already in Guild')).toBeDisabled()
      expect(within(card).getByText(/Requires: Lv\.\d+, \d+ quests/)).toBeInTheDocument()
    }
    // The join flow is unreachable while a guild membership is held
    expect(screen.queryByRole('button', { name: 'Join Guild' })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Confirm Join' })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Requirements Not Met' })).not.toBeInTheDocument()
  })

  it('reports quest skill XP as the player’s weekly guild contribution', async () => {
    const user = userEvent.setup()
    seedDefaultGame()
    const [quest] = allQuests
    const getGame = renderGame(
      <MemoryRouter initialEntries={['/guild']}>
        <GuildPage />
      </MemoryRouter>,
    )

    act(() => {
      getGame().completeQuest(quest.id)
    })

    // Completing a quest banks skill XP for its technology...
    expect(getGame().game.skillXp[quest.technologyId]).toBe(quest.xpReward)

    await user.click(screen.getByRole('button', { name: '👥 Members' }))

    // ...and the roster credits it to the player's weekly contribution
    const playerRow = closestContainer(screen.getByText('Hero'), 'div.bg-card')
    expect(within(playerRow).getByText(quest.xpReward.toLocaleString())).toBeInTheDocument()
    expect(within(playerRow).getByText('1 this week')).toBeInTheDocument()

    const stored = JSON.parse(localStorage.getItem(STORAGE_KEYS.GAME) ?? '{}') as GameState
    expect(stored.skillXp[quest.technologyId]).toBe(quest.xpReward)
    expect(stored.completedQuests).toHaveLength(1)
  })
})
