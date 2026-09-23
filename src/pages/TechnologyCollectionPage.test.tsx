import { describe, it, expect, beforeEach } from 'vitest'
import { screen } from '@testing-library/react'
import TechnologyCollectionPage from './TechnologyCollectionPage'
import { TECHNOLOGY_COLLECTION, CATEGORY_NAMES } from '@/data/technologyCollection'
import { renderSeededPage, seedDefaultGame } from './test-utils'

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
    expect(
      progressTexts.every(el => el.textContent?.startsWith('0/')),
    ).toBe(true)
  })

  it('groups cards by named category', () => {
    renderSeededPage(<TechnologyCollectionPage />)
    const categories = [...new Set(TECHNOLOGY_COLLECTION.map(card => card.category))]
    for (const category of categories) {
      // Some category names double as card names (e.g. "Security"), so allow repeats
      expect(screen.getAllByText(CATEGORY_NAMES[category]).length).toBeGreaterThan(0)
    }
    expect(
      screen.getAllByRole('heading', { level: 2 }).length,
    ).toBeGreaterThanOrEqual(categories.length)
  })
})
