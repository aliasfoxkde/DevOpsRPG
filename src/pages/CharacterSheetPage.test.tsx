import { describe, it, expect, beforeEach } from 'vitest'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import CharacterSheetPage from './CharacterSheetPage'
import { EQUIPMENT_ITEMS } from '@/data/equipment'
import { renderPage, renderSeededPage, seedDefaultGame } from './test-utils'
import { STORAGE_KEYS } from '@/utils/gameUtils'

const [firstItem] = EQUIPMENT_ITEMS

describe('CharacterSheetPage', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('renders the character identity from game state', () => {
    const { character } = seedDefaultGame()
    renderSeededPage(<CharacterSheetPage />)

    expect(screen.getByRole('heading', { level: 1, name: /Character Sheet/ })).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 2, name: character.name })).toBeInTheDocument()
    // The title is echoed by the XP bar as well, so allow repeats
    expect(screen.getAllByText(character.title).length).toBeGreaterThan(0)
    expect(screen.getByText('Level')).toBeInTheDocument()
    expect(screen.getByText('Day Streak')).toBeInTheDocument()
  })

  it('reports zero progress for a fresh account', () => {
    const { completedQuests } = seedDefaultGame()
    renderSeededPage(<CharacterSheetPage />)

    expect(completedQuests).toHaveLength(0)
    expect(screen.getByRole('heading', { name: '📊 Journey Progress' })).toBeInTheDocument()
    expect(screen.getByText('Quests Conquered')).toBeInTheDocument()
    expect(screen.getByText('0% Complete')).toBeInTheDocument()
  })

  it('lists every achievement as locked for a new player', () => {
    const { achievements } = seedDefaultGame()
    renderSeededPage(<CharacterSheetPage />)

    expect(
      screen.getByRole('heading', { name: `Achievements (0/${achievements.length})` }),
    ).toBeInTheDocument()
    expect(screen.getByText('Locked')).toBeInTheDocument()
    expect(screen.queryByText('Unlocked')).not.toBeInTheDocument()
    for (const achievement of achievements) {
      expect(screen.getByText(achievement.name)).toBeInTheDocument()
    }
  })

  it('shows the empty equipment and companion prompts', () => {
    renderSeededPage(<CharacterSheetPage />)
    expect(
      screen.getByText('No equipment equipped. Visit the Store to buy gear!'),
    ).toBeInTheDocument()
    expect(
      screen.getByText('No companions yet. Visit the Store to buy companions!'),
    ).toBeInTheDocument()
  })

  it('unequips an equipped item when its remove button is clicked', async () => {
    const user = userEvent.setup()
    const game = seedDefaultGame()
    localStorage.setItem(
      STORAGE_KEYS.GAME,
      JSON.stringify({ ...game, character: { ...game.character, equippedItems: [firstItem.id] } }),
    )
    renderPage(<CharacterSheetPage />)

    expect(screen.getByText(firstItem.name)).toBeInTheDocument()

    await user.click(screen.getByTitle('Unequip'))

    expect(screen.queryByText(firstItem.name)).not.toBeInTheDocument()
    expect(
      screen.getByText('No equipment equipped. Visit the Store to buy gear!'),
    ).toBeInTheDocument()
  })
})
