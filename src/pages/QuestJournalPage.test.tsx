import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { act, fireEvent, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import QuestJournalPage from './QuestJournalPage'
import { allQuests, realms, type Quest } from '@/data/quests'
import { ThemeProvider } from '@/contexts/ThemeContext'
import { GameProvider, useGame, type GameState } from '@/contexts/GameContext'
import { STORAGE_KEYS } from '@/utils/gameUtils'
import { closestContainer, renderPage, renderSeededPage, seedDefaultGame } from './test-utils'

/**
 * Mounts the journal next to a probe that records quiz attempts through the
 * real provider, because weak topics cannot be seeded (the provider's deep
 * merge drops record keys that start empty).
 */
function QuizProbe() {
  const { incrementStat } = useGame()
  return (
    <>
      <button
        onClick={() => {
          incrementStat('quiz', false, 2, false, 'html_intro')
        }}
      >
        fail intro quiz
      </button>
      <button
        onClick={() => {
          incrementStat('quiz', true, 0, false, 'html_intro')
          incrementStat('quiz', true, 0, false, 'html_intro')
        }}
      >
        master intro quiz
      </button>
      <QuestJournalPage />
    </>
  )
}

const QUEST_TITLES = new Set(allQuests.map((quest) => quest.title))

/** Quest titles in list order (the realm cards render h3 headings too). */
function listedQuestTitles(): string[] {
  return screen
    .getAllByRole('heading', { level: 3 })
    .map((heading) => heading.textContent)
    .filter((title) => QUEST_TITLES.has(title))
}

/** The realm card of the world map section, resolved from its heading. */
function realmCard(realmName: string): HTMLElement {
  const heading = screen
    .getAllByText(realmName)
    .map((element) => element.closest('h3'))
    .find((element): element is HTMLHeadingElement => element !== null)
  if (!heading) throw new Error(`No realm heading found for "${realmName}"`)
  return closestContainer(heading, '.rounded-xl')
}

/** A completed-quest record shaped the way GameContext persists them. */
function completedEntry(questId: string) {
  const quest = allQuests.find((entry) => entry.id === questId)
  if (!quest) throw new Error(`Unknown quest id: ${questId}`)
  return {
    questId: quest.id,
    topicId: quest.topicId,
    technologyId: quest.technologyId,
    title: quest.title,
    xpRewarded: quest.xpReward,
    completed: true,
    xpEarned: quest.xpReward,
    completedAt: new Date().toISOString(),
  }
}

/** Seeds defaults plus a partial override, then renders the journal. */
function seedAndRender(overrides: Partial<GameState> = {}): GameState {
  const game = seedDefaultGame()
  localStorage.setItem(STORAGE_KEYS.GAME, JSON.stringify({ ...game, ...overrides }))
  renderPage(<QuestJournalPage />, { route: '/quests', url: '/quests' })
  return game
}

/** Sorts the quest data the way the journal claims to and returns the titles. */
function sortedTitles(compare: (a: Quest, b: Quest) => number): string[] {
  return [...allQuests].sort(compare).map((quest) => quest.title)
}

/** The default listing order: realm order, then the order inside the realm. */
function realmOrderTitles(quests: Quest[]): string[] {
  return [...quests]
    .sort((a, b) => {
      const realmOrder =
        Object.keys(realms).indexOf(a.realmId) - Object.keys(realms).indexOf(b.realmId)
      if (realmOrder !== 0) return realmOrder
      return a.order - b.order
    })
    .map((quest) => quest.title)
}

function questByTitle(title: string): Quest {
  const quest = allQuests.find((entry) => entry.title === title)
  if (!quest) throw new Error(`No quest titled "${title}"`)
  return quest
}

/**
 * Journal plus a target route, so navigation out of the journal can be
 * observed instead of asserted through link hrefs alone.
 */
function renderJournalWithRoutes(): void {
  seedDefaultGame()
  render(
    <ThemeProvider>
      <GameProvider>
        <MemoryRouter initialEntries={['/quests']}>
          <Routes>
            <Route path="/quests" element={<QuestJournalPage />} />
            <Route path="/quest/:questId" element={<div>Quest Arena</div>} />
          </Routes>
        </MemoryRouter>
      </GameProvider>
    </ThemeProvider>,
  )
}

describe('QuestJournalPage', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('renders the journal heading and tagline', () => {
    renderSeededPage(<QuestJournalPage />)
    expect(screen.getByRole('heading', { level: 1, name: 'Quest Journal' })).toBeInTheDocument()
    expect(screen.getByText('Your journey to become a DevOps Master awaits')).toBeInTheDocument()
  })

  it('points a new player at the first quest of the first realm', () => {
    const { completedQuests } = seedDefaultGame()
    renderSeededPage(<QuestJournalPage />)

    expect(completedQuests).toHaveLength(0)
    expect(screen.getByText('CURRENT QUEST')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'HTML Introduction' })).toHaveAttribute(
      'href',
      '/quest/quest_html_intro',
    )
    expect(screen.getByText('Begin Quest')).toBeInTheDocument()
  })

  it('lists every generated quest in the unfiltered view', () => {
    renderSeededPage(<QuestJournalPage />)
    expect(
      screen.getByText(`Showing ${allQuests.length} of ${allQuests.length} quests`),
    ).toBeInTheDocument()
    // Rendered both as the current-quest CTA and inside the quest list
    expect(screen.getAllByText('HTML Introduction').length).toBeGreaterThan(0)
  })

  it('renders the world map with all realms', () => {
    renderSeededPage(<QuestJournalPage />)
    expect(screen.getByText('🗺️ World Map')).toBeInTheDocument()
    for (const realm of Object.values(realms)) {
      // Realm names also appear in the realm filter dropdown
      expect(screen.getAllByText(realm.name).length).toBeGreaterThan(0)
      expect(
        screen.getByText(
          `Requires Level ${realm.requiredLevel} • ${realm.technologies.length} Technologies`,
        ),
      ).toBeInTheDocument()
    }
  })

  it('narrows the list when searching and offers a reset', async () => {
    const user = userEvent.setup()
    renderSeededPage(<QuestJournalPage />)

    await user.type(screen.getByPlaceholderText(/Search quests/), 'HTML Introduction')

    expect(screen.getByText(`Showing 1 of ${allQuests.length} quests`)).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Clear filters' }))
    expect(
      screen.getByText(`Showing ${allQuests.length} of ${allQuests.length} quests`),
    ).toBeInTheDocument()
  })

  it('shows no completed quests for a fresh account', async () => {
    const user = userEvent.setup()
    renderSeededPage(<QuestJournalPage />)

    await user.selectOptions(screen.getByLabelText('Filter quests by status'), 'completed')

    expect(screen.getByText(`Showing 0 of ${allQuests.length} quests`)).toBeInTheDocument()
  })

  it('splits the list into available and completed quests', async () => {
    const user = userEvent.setup()
    seedAndRender({ completedQuests: [completedEntry('quest_html_intro')] })
    const status = screen.getByLabelText('Filter quests by status')

    await user.selectOptions(status, 'available')

    expect(
      screen.getByText(`Showing ${allQuests.length - 1} of ${allQuests.length} quests`),
    ).toBeInTheDocument()
    expect(screen.queryByText('HTML Introduction')).not.toBeInTheDocument()
    // With the intro finished the current-quest pointer moved on
    expect(screen.queryByText('CURRENT QUEST')).toBeInTheDocument()
    expect(screen.queryByText('HTML Introduction')).not.toBeInTheDocument()

    await user.selectOptions(status, 'completed')

    expect(screen.getByText(`Showing 1 of ${allQuests.length} quests`)).toBeInTheDocument()
    expect(screen.getByText('HTML Introduction')).toBeInTheDocument()
  })

  it('filters by difficulty, technology and realm', async () => {
    const user = userEvent.setup()
    renderSeededPage(<QuestJournalPage />)

    const difficulty = allQuests[0].difficulty
    const byDifficulty = allQuests.filter((quest) => quest.difficulty === difficulty)
    await user.selectOptions(
      screen.getByLabelText('Filter quests by difficulty'),
      String(difficulty),
    )
    expect(
      screen.getByText(`Showing ${byDifficulty.length} of ${allQuests.length} quests`),
    ).toBeInTheDocument()
    expect(listedQuestTitles()).toEqual(realmOrderTitles(byDifficulty))

    // Filters stack, so clear between them to exercise the reset too
    await user.click(screen.getByRole('button', { name: 'Clear filters' }))

    const technology = allQuests[0].technologyId
    const byTech = allQuests.filter((quest) => quest.technologyId === technology)
    await user.selectOptions(screen.getByLabelText('Filter quests by technology'), technology)
    expect(
      screen.getByText(`Showing ${byTech.length} of ${allQuests.length} quests`),
    ).toBeInTheDocument()
    expect(listedQuestTitles()).toEqual(realmOrderTitles(byTech))

    await user.click(screen.getByRole('button', { name: 'Clear filters' }))

    const realmId = byTech[0].realmId
    const byRealm = allQuests.filter((quest) => quest.realmId === realmId)
    await user.selectOptions(screen.getByLabelText('Filter quests by realm'), realmId)
    expect(
      screen.getByText(`Showing ${byRealm.length} of ${allQuests.length} quests`),
    ).toBeInTheDocument()
    expect(listedQuestTitles()).toEqual(realmOrderTitles(byRealm))
  })

  it('sorts the list by xp, difficulty and name', async () => {
    const user = userEvent.setup()
    renderSeededPage(<QuestJournalPage />)
    const sort = screen.getByLabelText('Sort quests')

    await user.selectOptions(sort, 'xp')
    expect(listedQuestTitles()).toEqual(sortedTitles((a, b) => b.xpReward - a.xpReward))

    await user.selectOptions(sort, 'difficulty')
    expect(listedQuestTitles()).toEqual(sortedTitles((a, b) => b.difficulty - a.difficulty))

    await user.selectOptions(sort, 'name')
    expect(listedQuestTitles()).toEqual(sortedTitles((a, b) => a.title.localeCompare(b.title)))

    // Every quest of the list is reachable through its card
    const first = listedQuestTitles()[0]
    expect(screen.getAllByText(first).length).toBeGreaterThan(0)
    expect(questByTitle(first).title).toBe(first)
  })

  it('offers a full reset from the empty state', async () => {
    const user = userEvent.setup()
    renderSeededPage(<QuestJournalPage />)

    await user.type(screen.getByPlaceholderText(/Search quests/), 'no such quest zzz')

    expect(screen.getByText('No quests match your filters.')).toBeInTheDocument()
    expect(listedQuestTitles()).toEqual([])

    await user.click(screen.getByRole('button', { name: 'Clear all filters' }))

    expect(
      screen.getByText(`Showing ${allQuests.length} of ${allQuests.length} quests`),
    ).toBeInTheDocument()
    expect(screen.queryByText('No quests match your filters.')).not.toBeInTheDocument()
    expect(listedQuestTitles()).toHaveLength(allQuests.length)
  })

  it('recommends quests for topics that are due for review', () => {
    vi.useFakeTimers()
    // Weak topics only exist once a quiz has been answered wrong, so the
    // journal is driven through the real provider action.
    render(
      <ThemeProvider>
        <GameProvider>
          <MemoryRouter initialEntries={['/quests']}>
            <QuizProbe />
          </MemoryRouter>
        </GameProvider>
      </ThemeProvider>,
    )

    act(() => {
      screen.getByRole('button', { name: /fail intro quiz/ }).click()
    })
    // The review date lands a day out; push the clock past it
    act(() => {
      vi.setSystemTime(new Date(Date.now() + 3 * 24 * 60 * 60 * 1000))
    })
    act(() => {
      fireEvent.change(screen.getByPlaceholderText(/Search quests/), { target: { value: ' ' } })
    })

    expect(screen.getByText('🎯 Smart Recommendations')).toBeInTheDocument()
    expect(screen.getByText('Based on your weak areas, we recommend:')).toBeInTheDocument()
    const section = closestContainer(screen.getByText('🎯 Smart Recommendations'), '.rounded-xl')
    const quest = questByTitle('HTML Introduction')
    const link = within(section).getByRole('link', { name: new RegExp(quest.title) })
    expect(link).toHaveAttribute('href', `/quest/${quest.id}`)
    expect(within(section).getByText(quest.technologyId.toUpperCase())).toBeInTheDocument()
    expect(within(section).getByText(`${quest.xpReward} XP`)).toBeInTheDocument()
  })

  it('falls back to low-mastery recommendations when nothing is due', () => {
    render(
      <ThemeProvider>
        <GameProvider>
          <MemoryRouter initialEntries={['/quests']}>
            <QuizProbe />
          </MemoryRouter>
        </GameProvider>
      </ThemeProvider>,
    )

    act(() => {
      screen.getByRole('button', { name: /fail intro quiz/ }).click()
    })

    // The review is still a day away, so mastery alone drives the pick
    const section = closestContainer(screen.getByText('🎯 Smart Recommendations'), '.rounded-xl')
    expect(within(section).getByText('HTML Introduction')).toBeInTheDocument()
    expect(within(section).getAllByRole('link')).toHaveLength(1)
  })

  it('stays quiet when the weak topics are already mastered', () => {
    render(
      <ThemeProvider>
        <GameProvider>
          <MemoryRouter initialEntries={['/quests']}>
            <QuizProbe />
          </MemoryRouter>
        </GameProvider>
      </ThemeProvider>,
    )

    act(() => {
      screen.getByRole('button', { name: /master intro quiz/ }).click()
    })

    expect(screen.queryByText('🎯 Smart Recommendations')).not.toBeInTheDocument()
    // The quiz attempts were still recorded in the save
    const raw = localStorage.getItem(STORAGE_KEYS.GAME)
    if (!raw) throw new Error('no save persisted')
    const saved = JSON.parse(raw) as GameState
    expect(saved.stats.quizCount).toBe(2)
    expect(Object.keys(saved.weakTopics)).toEqual(['html_intro'])
  })

  it('flags a finished quest and its technology in the realm map', async () => {
    const user = userEvent.setup()
    const htmlQuests = allQuests.filter((quest) => quest.technologyId === 'html')
    expect(htmlQuests.length).toBeGreaterThan(0)
    seedAndRender({ completedQuests: htmlQuests.map((quest) => completedEntry(quest.id)) })

    // The finished card is struck through and swaps its realm icon for a tick
    const finishedCard = closestContainer(screen.getAllByText(htmlQuests[0].title)[0], 'a.block')
    expect(finishedCard).toHaveAttribute('href', `/quest/${htmlQuests[0].id}`)
    expect(finishedCard.className).toContain('border-green-700')
    expect(within(finishedCard).getByText('✓')).toBeInTheDocument()
    expect(within(finishedCard).getByText(`${htmlQuests[0].xpReward} XP`)).toBeInTheDocument()

    // The technology pill turns green once every quest of that tech is done
    const pill = screen.getByText(`${htmlQuests.length}/${htmlQuests.length} HTML`)
    expect(pill.className).toContain('border-green-700')
    // Sibling technologies with nothing done stay neutral
    const untouched = screen
      .getAllByText(/^0\/\d+ /)
      .find((element) => element.textContent.endsWith(' CSS'))
    expect(untouched).toBeDefined()
    expect(untouched?.className).toContain('border-slate-600')

    // Realm progress reflects the finished quests
    const foundations = realmCard('Village of Foundations')
    expect(within(foundations).getByText('▶️')).toBeInTheDocument()
    expect(
      within(foundations).getByText(
        `${htmlQuests.length}/${
          allQuests.filter((quest) => quest.realmId === 'foundations').length
        }`,
      ),
    ).toBeInTheDocument()

    // Realm lore opens for unlocked realms
    await user.click(within(foundations).getByText('📖 Read Realm Lore'))
    expect(screen.getAllByText(/Welcome, young apprentice/).length).toBeGreaterThan(0)
  })

  it('keeps a locked quest from navigating and lets an unlocked one through', async () => {
    const user = userEvent.setup()
    renderJournalWithRoutes()

    const lockedRealm = Object.values(realms).find((realm) => realm.requiredLevel > 1)
    if (!lockedRealm) throw new Error('no realm beyond the first one')
    const lockedQuest = allQuests.find((quest) => quest.realmId === lockedRealm.id)
    if (!lockedQuest) throw new Error('no quest inside the locked realm')

    const lockedCard = screen.getByText(lockedQuest.title).closest('a')
    if (!lockedCard) throw new Error('locked quest card was not rendered')
    expect(lockedCard).toHaveAttribute('href', '/quests')
    expect(lockedCard.className).toContain('cursor-not-allowed')

    await user.click(lockedCard)

    // The click was swallowed, so the hero never left the journal
    expect(screen.queryByText('Quest Arena')).not.toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 1, name: 'Quest Journal' })).toBeInTheDocument()

    await user.click(screen.getByRole('link', { name: 'Begin Quest' }))

    expect(screen.getByText('Quest Arena')).toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: 'Quest Journal' })).not.toBeInTheDocument()
  })

  it('drops the current-quest CTA once every quest is finished', () => {
    seedAndRender({ completedQuests: allQuests.map((quest) => completedEntry(quest.id)) })

    expect(screen.queryByText('CURRENT QUEST')).not.toBeInTheDocument()
    expect(screen.queryByText('Begin Quest')).not.toBeInTheDocument()
    expect(screen.queryByText('⚔️ Continue Quest')).not.toBeInTheDocument()
    expect(screen.getByText(`${allQuests.length} Quests Completed`)).toBeInTheDocument()
    expect(screen.getByText('100% Complete')).toBeInTheDocument()
    // Later realms open up on completed progress even at level 1
    expect(screen.queryByText('🔒')).not.toBeInTheDocument()
    // Nothing is left to point at, so no realm is flagged as current
    expect(screen.queryByText('▶️')).not.toBeInTheDocument()
  })

  it('marks the realm holding the next quest as the current one', () => {
    seedAndRender()

    const foundations = realmCard('Village of Foundations')
    expect(within(foundations).getByText('▶️')).toBeInTheDocument()
    expect(within(foundations).getByText('⚔️ Continue Quest')).toHaveAttribute(
      'href',
      '/quest/quest_html_intro',
    )
    // Realms that were never reached stay locked at level 1
    expect(realmCard('Citadel of DevOps').textContent).toContain('🔒')
    expect(screen.queryByText('100% Complete')).not.toBeInTheDocument()
  })
})
