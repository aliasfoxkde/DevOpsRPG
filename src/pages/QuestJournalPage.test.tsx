import { describe, it, expect, beforeEach } from 'vitest'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import QuestJournalPage from './QuestJournalPage'
import { allQuests, realms } from '@/data/quests'
import { renderSeededPage, seedDefaultGame } from './test-utils'

describe('QuestJournalPage', () => {
  beforeEach(() => {
    localStorage.clear()
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
})
