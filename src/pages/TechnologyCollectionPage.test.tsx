import { describe, it, expect, beforeEach } from 'vitest'
import { screen, within } from '@testing-library/react'
import TechnologyCollectionPage from './TechnologyCollectionPage'
import { TECHNOLOGY_COLLECTION, CATEGORY_NAMES } from '@/data/technologyCollection'
import { allQuests } from '@/data/quests'
import { closestContainer, renderPage, renderSeededPage, seedDefaultGame } from './test-utils'
import { STORAGE_KEYS } from '@/utils/gameUtils'
import type { GameState } from '@/contexts/GameContext'

/** Quest ids from `allQuests` for one technology. */
function questIdsFor(technologyId: string): string[] {
  const ids = allQuests
    .filter((quest) => quest.technologyId.toLowerCase() === technologyId.toLowerCase())
    .map((quest) => quest.id)
  if (ids.length === 0) throw new Error(`no quests found for technology "${technologyId}"`)
  return ids
}

/** Seeds the default save with the given quest log. */
function seedCompletedQuests(questIds: string[]): void {
  const base = seedDefaultGame()
  const completedQuests: GameState['completedQuests'] = questIds.map((questId, index) => ({
    topicId: `topic-${index}`,
    technologyId: 'ansible',
    questId,
    completed: true,
    xpEarned: 10,
    completedAt: new Date().toISOString(),
  }))
  localStorage.setItem(STORAGE_KEYS.GAME, JSON.stringify({ ...base, completedQuests }))
}

/** Reads the stat tile value that sits above `label` in the stats bar. */
function statValue(label: string): string | null {
  return screen.getByText(label).previousElementSibling?.textContent ?? null
}

describe('TechnologyCollectionPage', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('renders the page heading and tagline', () => {
    renderSeededPage(<TechnologyCollectionPage />)
    expect(
      screen.getByRole('heading', { level: 1, name: /Technology Collection/ }),
    ).toBeInTheDocument()
    expect(
      screen.getByText('Complete quests to unlock technology cards and build your collection!'),
    ).toBeInTheDocument()
  })

  it('renders a card for every technology in the collection', () => {
    renderSeededPage(<TechnologyCollectionPage />)
    // One progress row and one quest-count line per card
    expect(screen.getAllByText('Progress')).toHaveLength(TECHNOLOGY_COLLECTION.length)
    expect(screen.getAllByText(/total quests/)).toHaveLength(TECHNOLOGY_COLLECTION.length)
    for (const card of TECHNOLOGY_COLLECTION) {
      expect(screen.getAllByText(card.name).length).toBeGreaterThan(0)
    }
  })

  it('starts every card locked for a fresh account', () => {
    const { completedQuests } = seedDefaultGame()
    renderSeededPage(<TechnologyCollectionPage />)

    expect(completedQuests).toHaveLength(0)
    // No card is complete, so no "✓ Unlocked" marker is rendered
    expect(screen.queryByText('✓ Unlocked')).not.toBeInTheDocument()
    // Stats bar shows zero unlocked and 0% complete
    expect(screen.getByText('Unlocked')).toBeInTheDocument()
    expect(screen.getByText('0%')).toBeInTheDocument()
    // Every card reports 0 of its required quests done
    const progressTexts = screen.getAllByText(/^\d+\/\d+ quests$/)
    expect(progressTexts).toHaveLength(TECHNOLOGY_COLLECTION.length)
    expect(progressTexts.every((el) => el.textContent.startsWith('0/'))).toBe(true)
  })

  it('groups cards by named category', () => {
    renderSeededPage(<TechnologyCollectionPage />)
    const categories = [...new Set(TECHNOLOGY_COLLECTION.map((card) => card.category))]
    for (const category of categories) {
      // Some category names double as card names (e.g. "Security"), so allow repeats
      expect(screen.getAllByText(CATEGORY_NAMES[category]).length).toBeGreaterThan(0)
    }
    expect(screen.getAllByRole('heading', { level: 2 }).length).toBeGreaterThanOrEqual(
      categories.length,
    )
  })

  it('unlocks a card once every quest of its technology is complete', () => {
    const card = TECHNOLOGY_COLLECTION.find((entry) => entry.id === 'ansible')
    if (!card) throw new Error('ansible missing from TECHNOLOGY_COLLECTION')
    const ids = questIdsFor('ansible')
    // The card needs one completion per quest in the technology
    expect(ids.length).toBeGreaterThanOrEqual(card.requiredQuests)
    seedCompletedQuests(ids.slice(0, card.requiredQuests))
    renderPage(<TechnologyCollectionPage />)

    const unlockedCard = closestContainer(screen.getByText(card.name), 'div.rounded-lg')
    expect(within(unlockedCard).getByText('✓ Unlocked')).toBeInTheDocument()
    expect(
      within(unlockedCard).getByText(`${card.requiredQuests}/${card.requiredQuests} quests`),
    ).toBeInTheDocument()
    expect(
      within(unlockedCard).getByText(`${card.requiredQuests} total quests`),
    ).toBeInTheDocument()
    // Unlocked cards lose the lock overlay and reveal their flavour text
    expect(within(unlockedCard).queryByText('🔒')).not.toBeInTheDocument()
    expect(within(unlockedCard).getByText(`"${card.flavorText}"`)).toBeInTheDocument()
    expect(unlockedCard.className).toContain('border-amber-500/50')

    // Exactly one card is unlocked, so the collection counter reflects it
    expect(statValue('Unlocked')).toBe('1')
    expect(statValue('Complete')).toBe(`${Math.round((1 / TECHNOLOGY_COLLECTION.length) * 100)}%`)
  })

  it('keeps a partly played technology in progress and the rest locked', () => {
    const inProgress = TECHNOLOGY_COLLECTION.find((entry) => entry.id === 'bash')
    if (!inProgress) throw new Error('bash missing from TECHNOLOGY_COLLECTION')
    expect(inProgress.requiredQuests).toBeGreaterThan(1)

    const played = questIdsFor('bash').slice(0, inProgress.requiredQuests - 1)
    seedCompletedQuests([...questIdsFor('ansible').slice(0, 0), ...played])
    renderPage(<TechnologyCollectionPage />)

    const card = closestContainer(screen.getByText(inProgress.name), 'div.rounded-lg')
    expect(
      within(card).getByText(`${played.length}/${inProgress.requiredQuests} quests`),
    ).toBeInTheDocument()
    expect(within(card).queryByText('✓ Unlocked')).not.toBeInTheDocument()
    expect(within(card).queryByText('🔒')).not.toBeInTheDocument()

    // Exactly one card has started, every other one is still sealed shut
    const started = screen
      .getAllByText(/^\d+\/\d+ quests$/)
      .filter((el) => !el.textContent.startsWith('0/'))
    expect(started).toHaveLength(1)
    expect(statValue('In Progress')).toBe('1')
    expect(statValue('Unlocked')).toBe('0')
    expect(statValue('Locked')).toBe(String(TECHNOLOGY_COLLECTION.length - 1))
  })
})
