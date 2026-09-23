import { describe, it, expect, beforeEach } from 'vitest'
import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import StorePage from './StorePage'
import { EQUIPMENT_ITEMS } from '@/data/equipment'
import { STORAGE_KEYS } from '@/utils/gameUtils'
import {
  closestContainer,
  renderPage,
  renderSeededPage,
  seedDefaultGame,
} from './test-utils'

// The static shop catalogue defined inside StorePage:
// 6 power-ups + 3 utilities + 3 mystery boxes + 4 avatars + 4 companions
const CONSUMABLE_COUNT = 20

describe('StorePage', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('renders the shop header, categories and empty inventory', () => {
    const { character } = seedDefaultGame()
    renderSeededPage(<StorePage />, { route: '/store', url: '/store' })

    expect(
      screen.getByRole('heading', { level: 1, name: /Quest Shop/ }),
    ).toBeInTheDocument()
    expect(screen.getByText('Gold Available')).toBeInTheDocument()
    expect(screen.getByText(`💰 ${character.gold}`)).toBeInTheDocument()
    for (const label of ['🏪 All Items', '⚡ Power-Ups', '🔧 Utilities', '👕 Cosmetics', '🐾 Companions', '⚙️ Equipment']) {
      expect(screen.getByRole('button', { name: label })).toBeInTheDocument()
    }
    expect(screen.getByText('🎒 Your Inventory')).toBeInTheDocument()
    expect(
      screen.getByText('No items in inventory. Purchase some from the shop!'),
    ).toBeInTheDocument()
    expect(
      screen.getByText('No companions yet. Purchase one from the shop!'),
    ).toBeInTheDocument()
  })

  it('lists the whole catalogue and prices everything out of reach', () => {
    renderSeededPage(<StorePage />, { route: '/store', url: '/store' })

    expect(screen.getByText('XP Scroll')).toBeInTheDocument()
    expect(screen.getByText('Streak Shield')).toBeInTheDocument()
    expect(screen.getByText('Wise Owl')).toBeInTheDocument()
    expect(screen.getByText(EQUIPMENT_ITEMS[0].name)).toBeInTheDocument()
    // Starting gold is zero, so nothing can be afforded yet
    expect(screen.getAllByText('Need Gold')).toHaveLength(
      CONSUMABLE_COUNT + EQUIPMENT_ITEMS.length,
    )
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
    expect(
      within(inventoryRow).getByText('+5% XP • +0% Gold'),
    ).toBeInTheDocument()
  })

  it('shows every equipment item with its slot when filtered', async () => {
    const user = userEvent.setup()
    renderSeededPage(<StorePage />, { route: '/store', url: '/store' })

    await user.click(screen.getByRole('button', { name: '⚙️ Equipment' }))

    for (const item of EQUIPMENT_ITEMS) {
      expect(screen.getByText(item.name)).toBeInTheDocument()
    }
    expect(
      screen.getAllByText(/^(WORKSTATION|ACCESSORY|COSMETIC|SPECIAL)$/).length,
    ).toBe(EQUIPMENT_ITEMS.length)
    expect(screen.queryByText('XP Scroll')).not.toBeInTheDocument()
  })
})
