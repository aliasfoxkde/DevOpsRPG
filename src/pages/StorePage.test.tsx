import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { act, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import StorePage from './StorePage'
import { EQUIPMENT_ITEMS } from '@/data/equipment'
import { STORAGE_KEYS } from '@/utils/gameUtils'
import { closestContainer, renderPage, renderSeededPage, seedDefaultGame } from './test-utils'
import type { GameState } from '@/contexts/GameContext'

// The static shop catalogue defined inside StorePage:
// 6 power-ups + 3 utilities + 3 mystery boxes + 4 avatars + 4 companions
const CONSUMABLE_COUNT = 20

/** The save as currently persisted, for asserting provider state changes. */
function storedGame(): GameState {
  const raw = localStorage.getItem(STORAGE_KEYS.GAME)
  if (!raw) throw new Error('No game state persisted to localStorage')
  return JSON.parse(raw) as GameState
}

/** Seeds defaults plus a gold balance and renders the shop. */
function renderShopWithGold(gold: number) {
  const game = seedDefaultGame()
  localStorage.setItem(
    STORAGE_KEYS.GAME,
    JSON.stringify({ ...game, character: { ...game.character, gold } }),
  )
  return renderPage(<StorePage />, { route: '/store', url: '/store' })
}

/** The gold balance panel, so `💰 N` never collides with an item price. */
function goldBalance(): HTMLElement {
  return closestContainer(screen.getByText('Gold Available'), '.rounded-xl')
}

describe('StorePage', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('renders the shop header, categories and empty inventory', () => {
    const { character } = seedDefaultGame()
    renderSeededPage(<StorePage />, { route: '/store', url: '/store' })

    expect(screen.getByRole('heading', { level: 1, name: /Quest Shop/ })).toBeInTheDocument()
    expect(screen.getByText('Gold Available')).toBeInTheDocument()
    expect(screen.getByText(`💰 ${character.gold}`)).toBeInTheDocument()
    for (const label of [
      '🏪 All Items',
      '⚡ Power-Ups',
      '🔧 Utilities',
      '👕 Cosmetics',
      '🐾 Companions',
      '⚙️ Equipment',
    ]) {
      expect(screen.getByRole('button', { name: label })).toBeInTheDocument()
    }
    expect(screen.getByText('🎒 Your Inventory')).toBeInTheDocument()
    expect(
      screen.getByText('No items in inventory. Purchase some from the shop!'),
    ).toBeInTheDocument()
    expect(screen.getByText('No companions yet. Purchase one from the shop!')).toBeInTheDocument()
  })

  it('lists the whole catalogue and prices everything out of reach', () => {
    renderSeededPage(<StorePage />, { route: '/store', url: '/store' })

    expect(screen.getByText('XP Scroll')).toBeInTheDocument()
    expect(screen.getByText('Streak Shield')).toBeInTheDocument()
    expect(screen.getByText('Wise Owl')).toBeInTheDocument()
    expect(screen.getByText(EQUIPMENT_ITEMS[0].name)).toBeInTheDocument()
    // Starting gold is zero, so nothing can be afforded yet
    expect(screen.getAllByText('Need Gold')).toHaveLength(CONSUMABLE_COUNT + EQUIPMENT_ITEMS.length)
  })

  it('narrows the catalogue when a category filter is picked', async () => {
    const user = userEvent.setup()
    renderSeededPage(<StorePage />, { route: '/store', url: '/store' })

    await user.click(screen.getByRole('button', { name: '🐾 Companions' }))

    for (const companion of ['Wise Owl', 'Lucky Cat', 'Baby Dragon', 'Phoenix']) {
      expect(screen.getByText(companion)).toBeInTheDocument()
    }
    expect(screen.queryByText('XP Scroll')).not.toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: '⚡ Power-Ups' }))
    expect(screen.getByText('XP Scroll')).toBeInTheDocument()
    expect(screen.queryByText('Wise Owl')).not.toBeInTheDocument()
  })

  it('buys and equips a companion when the player has the gold', async () => {
    const user = userEvent.setup()
    const game = seedDefaultGame()
    game.character.gold = 2000
    localStorage.setItem(STORAGE_KEYS.GAME, JSON.stringify(game))
    renderPage(<StorePage />, { route: '/store', url: '/store' })

    await user.click(screen.getByRole('button', { name: '🐾 Companions' }))

    const card = closestContainer(screen.getByText('Wise Owl'), '.rounded-xl')
    expect(within(card).getByText('💰 500')).toBeInTheDocument()

    await user.click(within(card).getByRole('button', { name: 'Buy & Equip' }))

    expect(screen.getByText('Purchased Wise Owl!')).toBeInTheDocument()
    // The companion panel and the inventory both reflect the purchase
    expect(screen.getByText('🐾 Active Companion')).toBeInTheDocument()
    expect(screen.getByText('Bond Lv.1')).toBeInTheDocument()
    // The 500 gold price was deducted from the 2000 the save started with
    expect(screen.getByText('💰 1500')).toBeInTheDocument()

    // The new companion is listed as the active one in the inventory
    const inventoryRow = closestContainer(screen.getByText('Active'), '.rounded-lg')
    expect(within(inventoryRow).getByText('Wise Owl')).toBeInTheDocument()
    expect(within(inventoryRow).getByText('+5% XP • +0% Gold')).toBeInTheDocument()
  })

  it('shows every equipment item with its slot when filtered', async () => {
    const user = userEvent.setup()
    renderSeededPage(<StorePage />, { route: '/store', url: '/store' })

    await user.click(screen.getByRole('button', { name: '⚙️ Equipment' }))

    for (const item of EQUIPMENT_ITEMS) {
      expect(screen.getByText(item.name)).toBeInTheDocument()
    }
    expect(screen.getAllByText(/^(WORKSTATION|ACCESSORY|COSMETIC|SPECIAL)$/).length).toBe(
      EQUIPMENT_ITEMS.length,
    )
    expect(screen.queryByText('XP Scroll')).not.toBeInTheDocument()
  })

  it('charges for equipment, equips it and marks the card as owned', async () => {
    const user = userEvent.setup()
    const gear = EQUIPMENT_ITEMS[0]
    renderShopWithGold(1000)

    await user.click(screen.getByRole('button', { name: '⚙️ Equipment' }))

    const card = closestContainer(screen.getByText(gear.name), '.rounded-xl')
    expect(within(card).getByText(`💰 ${gear.price}`)).toBeInTheDocument()
    expect(within(card).getByText(/% XP/)).toBeInTheDocument()

    await user.click(within(card).getByRole('button', { name: 'Buy & Equip' }))

    expect(screen.getByText(`Purchased and equipped ${gear.name}!`)).toBeInTheDocument()
    // The price comes off the balance and the item joins the character
    expect(within(goldBalance()).getByText(`💰 ${1000 - gear.price}`)).toBeInTheDocument()
    expect(storedGame().character.equippedItems).toContain(gear.id)
    // The card stops being buyable and renders as owned
    expect(within(card).getByText('Owned')).toBeInTheDocument()
    expect(within(card).queryByRole('button')).not.toBeInTheDocument()
    expect(card.className).toContain('opacity-60')
  })

  it('adds a purchased power-up to the inventory', async () => {
    const user = userEvent.setup()
    renderShopWithGold(200)

    const card = closestContainer(screen.getByText('Streak Shield'), '.rounded-xl')
    await user.click(within(card).getByRole('button', { name: 'Buy' }))

    expect(screen.getByText('Purchased Streak Shield!')).toBeInTheDocument()
    expect(within(goldBalance()).getByText('💰 50')).toBeInTheDocument()
    expect(storedGame().character.gold).toBe(50)
    expect(
      screen.queryByText('No items in inventory. Purchase some from the shop!'),
    ).not.toBeInTheDocument()

    const inventory = closestContainer(
      screen.getByRole('heading', { name: '⚡ Power-Ups & Items' }),
      '.rounded-xl',
    )
    const pill = closestContainer(within(inventory).getByText('Streak Shield'), '.rounded-lg')
    expect(within(pill).getByText('🛡️')).toBeInTheDocument()
    // Rare collectibles get the blue rarity treatment
    expect(pill.className).toContain('border-blue-600')
  })

  it('clears the purchase message after three seconds', () => {
    vi.useFakeTimers()
    renderShopWithGold(200)

    const card = closestContainer(screen.getByText('Streak Shield'), '.rounded-xl')
    act(() => {
      within(card).getByRole('button', { name: 'Buy' }).click()
    })

    expect(screen.getByText('Purchased Streak Shield!')).toBeInTheDocument()

    act(() => {
      vi.advanceTimersByTime(3000)
    })

    expect(screen.queryByText('Purchased Streak Shield!')).not.toBeInTheDocument()
  })

  it('marks a companion as purchased and swaps the active one from the inventory', async () => {
    const user = userEvent.setup()
    renderShopWithGold(3000)

    await user.click(screen.getByRole('button', { name: '🐾 Companions' }))

    const owlCard = closestContainer(screen.getByText('Wise Owl'), '.rounded-xl')
    await user.click(within(owlCard).getByRole('button', { name: 'Buy & Equip' }))
    expect(screen.getByText('Purchased Wise Owl!')).toBeInTheDocument()

    const catCard = closestContainer(screen.getByText('Lucky Cat'), '.rounded-xl')
    await user.click(within(catCard).getByRole('button', { name: 'Buy & Equip' }))
    expect(screen.getByText('Purchased Lucky Cat!')).toBeInTheDocument()

    // Both purchases went through and the second companion auto-equipped
    expect(within(owlCard).getByText('Purchased')).toBeInTheDocument()
    expect(within(owlCard).queryByRole('button')).not.toBeInTheDocument()
    expect(storedGame().character.gold).toBe(2000)
    expect(storedGame().companions.map((companion) => companion.id)).toEqual(['owl', 'cat'])

    const inventory = closestContainer(
      screen.getByRole('heading', { name: '🐾 Companions' }),
      '.rounded-xl',
    )
    expect(
      within(closestContainer(screen.getByText('Active'), '.rounded-lg')).getByText('Lucky Cat'),
    ).toBeInTheDocument()

    // Equipping from the inventory hands the active slot back to the owl
    const owlRow = closestContainer(within(inventory).getByText('Wise Owl'), '.rounded-lg')
    await user.click(within(owlRow).getByRole('button', { name: 'Equip' }))

    expect(
      within(closestContainer(screen.getByText('Active'), '.rounded-lg')).getByText('Wise Owl'),
    ).toBeInTheDocument()
    expect(within(inventory).getByRole('button', { name: 'Equip' })).toBeInTheDocument()
    expect(storedGame().activeCompanion?.id).toBe('owl')
  })

  it('shows the active companion panel with bonuses, bond and evolution', async () => {
    const user = userEvent.setup()
    renderShopWithGold(3000)

    await user.click(screen.getByRole('button', { name: '🐾 Companions' }))

    const card = closestContainer(screen.getByText('Phoenix'), '.rounded-xl')
    await user.click(within(card).getByRole('button', { name: 'Buy & Equip' }))

    const panel = closestContainer(screen.getByText('🐾 Active Companion'), '.rounded-xl')
    expect(within(panel).getByText('Phoenix')).toBeInTheDocument()
    expect(
      within(panel).getByText('+20% XP • +10% Gold • Weekly Streak Shield'),
    ).toBeInTheDocument()
    expect(within(panel).getByText('Bond Lv.1')).toBeInTheDocument()
    expect(within(panel).getByText('1/10')).toBeInTheDocument()
    expect(within(panel).getByText('✨ Evolves at bond level 10')).toBeInTheDocument()
    // No quests have been flown together yet
    expect(within(panel).queryByText(/Quests together/)).not.toBeInTheDocument()
  })

  it('leaves gold and inventory untouched when an item cannot be fulfilled', async () => {
    const user = userEvent.setup()
    renderShopWithGold(500)

    // `buy_retry_pass` resolves to no collectible in GameContext, so the shop
    // item is a documented no-op: nothing is charged and nothing is granted.
    const card = closestContainer(screen.getByText('Retry Pass'), '.rounded-xl')
    await user.click(within(card).getByRole('button', { name: 'Buy' }))

    expect(screen.queryByText(/Purchased/)).not.toBeInTheDocument()
    expect(within(goldBalance()).getByText('💰 500')).toBeInTheDocument()
    expect(storedGame().character.gold).toBe(500)
    expect(storedGame().collectibles).toEqual([])
    expect(
      screen.getByText('No items in inventory. Purchase some from the shop!'),
    ).toBeInTheDocument()
  })
})
