import { describe, it, expect, beforeEach } from 'vitest'
import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import CharacterSheetPage from './CharacterSheetPage'
import { EQUIPMENT_ITEMS } from '@/data/equipment'
import { renderPage, renderSeededPage, seedDefaultGame } from './test-utils'
import { STORAGE_KEYS } from '@/utils/gameUtils'
import type { GameState } from '@/contexts/GameContext'

const [firstItem] = EQUIPMENT_ITEMS

type Companion = GameState['companions'][number]

/** Builds a companion fixture with the fields the character sheet renders. */
function companion(overrides: Partial<Companion> & { id: string }): Companion {
  return {
    name: overrides.id,
    icon: '🐾',
    xpBonus: 0,
    goldBonus: 0,
    bondLevel: 1,
    totalQuestsCompleted: 0,
    maxBondLevel: 10,
    ...overrides,
  }
}

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

  it('sums active bonuses, groups loadout slots and chips each item bonus', () => {
    const game = seedDefaultGame()
    // Three items share the workstation slot, one sits in cosmetics and one id
    // no longer resolves, which the loadout has to skip silently.
    const equipped = ['laptop_basic', 'workstation_setup', 'cloud_server', 'notebook', 'ghost_item']
    localStorage.setItem(
      STORAGE_KEYS.GAME,
      JSON.stringify({ ...game, character: { ...game.character, equippedItems: equipped } }),
    )
    renderPage(<CharacterSheetPage />)

    // Laptop + workstation XP, workstation gold, and both AWS tech bonuses
    expect(screen.getByText('Active Bonuses')).toBeInTheDocument()
    expect(screen.getByText('+10% XP')).toBeInTheDocument()
    // Gold shows in the summary and on the item that grants it
    expect(screen.getAllByText('+3% Gold')).toHaveLength(2)
    expect(screen.getByText('+15% AWS XP')).toBeInTheDocument()

    // Each occupied slot gets its own heading and holds only its own items
    const workstation = closestSlot('workstation')
    expect(within(workstation).getByText('Basic Laptop')).toBeInTheDocument()
    expect(within(workstation).getByText('Ultimate Workstation')).toBeInTheDocument()
    expect(within(workstation).getByText('Cloud Server Instance')).toBeInTheDocument()
    expect(within(workstation).queryByText('Cloud Architect Notebook')).not.toBeInTheDocument()

    const cosmetic = closestSlot('cosmetic')
    expect(within(cosmetic).getByText('Cloud Architect Notebook')).toBeInTheDocument()

    // Per-item chips: XP, gold and technology bonuses are listed on the card
    expect(within(closestItem('Basic Laptop')).getByText('+2% XP')).toBeInTheDocument()
    expect(within(closestItem('Ultimate Workstation')).getByText('+8% XP')).toBeInTheDocument()
    expect(within(closestItem('Ultimate Workstation')).getByText('+3% Gold')).toBeInTheDocument()
    expect(within(closestItem('Cloud Server Instance')).getByText('+10% AWS')).toBeInTheDocument()
    expect(within(closestItem('Cloud Architect Notebook')).getByText('+5% AWS')).toBeInTheDocument()

    // Rarity is echoed per item and every card offers its unequip control
    expect(within(closestItem('Basic Laptop')).getByText('common')).toBeInTheDocument()
    expect(within(closestItem('Ultimate Workstation')).getByText('epic')).toBeInTheDocument()
    expect(screen.getAllByTitle('Unequip')).toHaveLength(4)
  })

  it('renders companions with their bonuses and marks the active one', () => {
    const game = seedDefaultGame()
    const owl = companion({ id: 'owl', name: 'Wise Owl', icon: '🦉', xpBonus: 0.05 })
    const cat = companion({
      id: 'cat_shadow',
      name: 'Shadow Cat',
      icon: '🐱',
      xpBonus: 0.1,
      goldBonus: 0.05,
      specialAbility: 'Lucky: +12% Gold permanently',
    })
    localStorage.setItem(
      STORAGE_KEYS.GAME,
      JSON.stringify({ ...game, companions: [owl, cat], activeCompanion: owl }),
    )
    renderPage(<CharacterSheetPage />)

    expect(screen.getByRole('heading', { name: 'Companions' })).toBeInTheDocument()
    const owlCard = companionCard('Wise Owl')
    const catCard = companionCard('Shadow Cat')

    // The active companion is highlighted and labelled; the other one is not
    expect(within(owlCard).getByText('Active')).toBeInTheDocument()
    expect(within(catCard).queryByText('Active')).not.toBeInTheDocument()

    // Bonus chips only appear for non-zero bonuses, so the owl shows XP only
    expect(within(owlCard).getByText('+5% XP')).toBeInTheDocument()
    expect(within(owlCard).queryByText(/Gold/)).not.toBeInTheDocument()
    expect(within(catCard).getByText('+10% XP')).toBeInTheDocument()
    expect(within(catCard).getByText('+5% Gold')).toBeInTheDocument()
    // Special abilities are surfaced when the companion has one
    expect(within(catCard).getByText('Lucky: +12% Gold permanently')).toBeInTheDocument()
  })

  it('splits achievements into unlocked and locked groups', () => {
    const game = seedDefaultGame()
    const { achievements } = { achievements: game.achievements }
    localStorage.setItem(
      STORAGE_KEYS.GAME,
      JSON.stringify({
        ...game,
        achievements: [{ id: 'first_steps', unlockedAt: '2026-09-01T00:00:00.000Z' }],
      }),
    )
    renderPage(<CharacterSheetPage />)

    expect(
      screen.getByRole('heading', { name: `Achievements (1/${achievements.length})` }),
    ).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Unlocked' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Locked' })).toBeInTheDocument()
    // The unlocked entry is presented with its own description
    const unlocked = screen.getByText('First Steps').closest('.rounded-lg')
    if (!(unlocked instanceof HTMLElement)) throw new Error('Unlocked achievement card missing')
    expect(unlocked.textContent).toContain('Complete your first quest')
    // Locked entries stay listed below the unlocked one
    expect(screen.getByText('Rising Star')).toBeInTheDocument()
    expect(screen.getAllByText('🔒').length).toBe(achievements.length - 1)
  })
})

/** The section that owns the loadout heading named `slot`. */
function closestSlot(slot: string): HTMLElement {
  const heading = screen.getByText(slot)
  const section = heading.closest('div')
  if (!(section instanceof HTMLElement)) throw new Error(`No container for slot "${slot}"`)
  return section
}

/** The card that renders the equipment named `name`. */
function closestItem(name: string): HTMLElement {
  const card = screen.getByText(name).closest('.group')
  if (!(card instanceof HTMLElement)) throw new Error(`No equipment card for "${name}"`)
  return card
}

/** The card that renders the companion named `name`. */
function companionCard(name: string): HTMLElement {
  const card = screen.getByText(name).closest('.rounded-lg')
  if (!(card instanceof HTMLElement)) throw new Error(`No companion card for "${name}"`)
  return card
}
