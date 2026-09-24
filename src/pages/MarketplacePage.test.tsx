import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { screen, within, fireEvent, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import MarketplacePage from './MarketplacePage'
import { closestContainer, renderPage, renderSeededPage, seedDefaultGame } from './test-utils'
import { STORAGE_KEYS } from '@/utils/gameUtils'

// The mock listings stamp their "listedAt" when this module is imported, so
// every relative timestamp is measured against this moment.
const MODULE_LOAD = Date.now()

describe('MarketplacePage', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('renders the marketplace header, gold balance and every listing', () => {
    const { character } = seedDefaultGame()
    renderSeededPage(<MarketplacePage />, { route: '/marketplace', url: '/marketplace' })

    expect(screen.getByRole('heading', { level: 1, name: /Marketplace/ })).toBeInTheDocument()
    expect(screen.getByText('Backend Required')).toBeInTheDocument()
    expect(screen.getByText('Your Gold')).toBeInTheDocument()
    expect(screen.getByText(`💰 ${character.gold.toLocaleString()}`)).toBeInTheDocument()
    for (const item of ['Docker Expert', 'Kubernetes Guru', 'Infrastructure Master']) {
      expect(screen.getByText(item)).toBeInTheDocument()
    }
    for (const seller of ['CloudNinja', 'K8sMaster', 'TerraForm']) {
      expect(screen.getByText(seller)).toBeInTheDocument()
    }
  })

  it('narrows the listings when a category filter is picked', async () => {
    const user = userEvent.setup()
    renderSeededPage(<MarketplacePage />, { route: '/marketplace', url: '/marketplace' })

    await user.click(screen.getByRole('button', { name: '✨ Titles' }))

    expect(screen.getByText('Infrastructure Master')).toBeInTheDocument()
    expect(screen.queryByText('Docker Expert')).not.toBeInTheDocument()
    expect(screen.queryByText('Kubernetes Guru')).not.toBeInTheDocument()

    // Equipment has no listings at all, so the empty state kicks in
    await user.click(screen.getByRole('button', { name: '⚙️ Equipment' }))
    expect(screen.getByText('No items listed')).toBeInTheDocument()
    expect(screen.getByText('Be the first to list an item for sale!')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: '🏪 All Items' }))
    expect(screen.getByText('Docker Expert')).toBeInTheDocument()
    expect(screen.queryByText('No items listed')).not.toBeInTheDocument()
  })

  it('opens a purchase modal that blocks buyers without enough gold', async () => {
    const user = userEvent.setup()
    renderSeededPage(<MarketplacePage />, { route: '/marketplace', url: '/marketplace' })

    await user.click(screen.getByText('Docker Expert'))

    expect(screen.getByRole('heading', { name: 'Confirm Purchase' })).toBeInTheDocument()
    // The price shows on the card behind the modal and inside the modal itself
    expect(screen.getAllByText('💰 500')).toHaveLength(2)
    const balance = screen.getByText('Your Balance:').nextElementSibling
    // A fresh hero has no gold at all
    expect(balance).toHaveTextContent('💰 0')
    const buyButton = screen.getByRole('button', { name: 'Not Enough Gold' })
    expect(buyButton).toBeDisabled()

    await user.click(screen.getByRole('button', { name: 'Cancel' }))
    expect(screen.queryByRole('heading', { name: 'Confirm Purchase' })).not.toBeInTheDocument()
  })

  it('shows the placeholder flow for creating a new listing', async () => {
    const user = userEvent.setup()
    renderSeededPage(<MarketplacePage />, { route: '/marketplace', url: '/marketplace' })

    await user.click(screen.getByRole('button', { name: /Create New Listing/ }))

    expect(screen.getByRole('heading', { name: 'Create New Listing' })).toBeInTheDocument()
    expect(screen.getByText('Coming Soon')).toBeInTheDocument()
    expect(screen.getByText('Login required to list items')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Enter price')).toBeDisabled()

    await user.click(screen.getAllByRole('button', { name: 'Close' })[0])
    expect(screen.queryByRole('heading', { name: 'Create New Listing' })).not.toBeInTheDocument()
  })

  it('shows how long ago each listing went up', () => {
    seedDefaultGame()
    renderPage(<MarketplacePage />, { route: '/marketplace', url: '/marketplace' })

    // The three fixtures were listed 2h, 5h and 12h before load
    expect(screen.getByText('2h ago')).toBeInTheDocument()
    expect(screen.getByText('5h ago')).toBeInTheDocument()
    expect(screen.getByText('12h ago')).toBeInTheDocument()
    expect(screen.queryByText('Just now')).not.toBeInTheDocument()
  })

  it('keeps both badge listings with their rarity when filtering badges', async () => {
    const user = userEvent.setup()
    renderSeededPage(<MarketplacePage />, { route: '/marketplace', url: '/marketplace' })

    await user.click(screen.getByRole('button', { name: '🏅 Badges' }))

    expect(screen.getByText('Docker Expert')).toBeInTheDocument()
    expect(screen.getByText('Kubernetes Guru')).toBeInTheDocument()
    expect(screen.queryByText('Infrastructure Master')).not.toBeInTheDocument()
    expect(screen.getByText('RARE')).toBeInTheDocument()
    expect(screen.getByText('EPIC')).toBeInTheDocument()
  })

  it('offers an empty state for the collectible category', async () => {
    const user = userEvent.setup()
    renderSeededPage(<MarketplacePage />, { route: '/marketplace', url: '/marketplace' })

    await user.click(screen.getByRole('button', { name: '💎 Collectibles' }))

    expect(screen.getByText('No items listed')).toBeInTheDocument()
    expect(screen.getByText('Be the first to list an item for sale!')).toBeInTheDocument()
  })

  it('confirms an affordable purchase and leaves the gold untouched', async () => {
    const user = userEvent.setup()
    const game = seedDefaultGame()
    localStorage.setItem(
      STORAGE_KEYS.GAME,
      JSON.stringify({ ...game, character: { ...game.character, gold: 500 } }),
    )
    renderPage(<MarketplacePage />, { route: '/marketplace', url: '/marketplace' })

    await user.click(screen.getByText('Docker Expert'))

    const buyButton = screen.getByRole('button', { name: 'Confirm Purchase' })
    expect(buyButton).toBeEnabled()
    expect(screen.getAllByText('💰 500').length).toBeGreaterThan(0)

    await user.click(buyButton)

    // Trading is a placeholder: the offer is announced, no gold moves
    expect(
      screen.getByText(
        'Would purchase "Docker Expert" from CloudNinja for 500 gold. (Requires backend)',
      ),
    ).toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: 'Confirm Purchase' })).not.toBeInTheDocument()
    // The balance banner still shows the full 500 gold
    expect(screen.getByText('Your Gold').previousElementSibling).toHaveTextContent('💰 500')

    const stored = JSON.parse(localStorage.getItem(STORAGE_KEYS.GAME) ?? '{}') as {
      character: { gold: number }
    }
    expect(stored.character.gold).toBe(500)
  })

  it('closes the purchase modal with the × button', async () => {
    const user = userEvent.setup()
    renderSeededPage(<MarketplacePage />, { route: '/marketplace', url: '/marketplace' })

    await user.click(screen.getByText('Docker Expert'))
    expect(screen.getByRole('heading', { name: 'Confirm Purchase' })).toBeInTheDocument()

    await user.click(screen.getByText('×'))
    expect(screen.queryByRole('heading', { name: 'Confirm Purchase' })).not.toBeInTheDocument()
  })

  it('closes the create-listing modal with the × button', async () => {
    const user = userEvent.setup()
    renderSeededPage(<MarketplacePage />, { route: '/marketplace', url: '/marketplace' })

    await user.click(screen.getByRole('button', { name: /Create New Listing/ }))
    expect(screen.getByRole('heading', { name: 'Create New Listing' })).toBeInTheDocument()
    expect(screen.getByText('Select Item to List')).toBeInTheDocument()

    await user.click(screen.getByText('×'))
    expect(screen.queryByRole('heading', { name: 'Create New Listing' })).not.toBeInTheDocument()
    expect(screen.queryByText('Select Item to List')).not.toBeInTheDocument()
  })

  it('clears the purchase notification after four seconds', () => {
    vi.useFakeTimers()
    const game = seedDefaultGame()
    localStorage.setItem(
      STORAGE_KEYS.GAME,
      JSON.stringify({ ...game, character: { ...game.character, gold: 500 } }),
    )
    renderPage(<MarketplacePage />, { route: '/marketplace', url: '/marketplace' })

    fireEvent.click(screen.getByText('Docker Expert'))
    fireEvent.click(screen.getByRole('button', { name: 'Confirm Purchase' }))

    const announcement = screen.getByText(/Would purchase "Docker Expert"/)
    expect(announcement).toHaveClass('bg-blue-900/30', 'text-blue-300')

    act(() => {
      vi.advanceTimersByTime(4000)
    })

    expect(screen.queryByText(/Would purchase/)).not.toBeInTheDocument()
  })

  it('shows "Just now" for a listing less than an hour old', () => {
    // Put the clock 30 minutes after the newest fixture was listed (2h before
    // module load), so it reads as fresh while the others keep hour counts
    vi.useFakeTimers({ now: MODULE_LOAD - 90 * 60 * 1000 })
    renderPage(<MarketplacePage />, { route: '/marketplace', url: '/marketplace' })

    const newest = closestContainer(screen.getByText('Docker Expert'), 'div.rounded-xl')
    expect(within(newest).getByText('Just now')).toBeInTheDocument()
    expect(within(newest).queryByText(/h ago/)).not.toBeInTheDocument()
    expect(screen.getByText('3h ago')).toBeInTheDocument()
    expect(screen.getByText('10h ago')).toBeInTheDocument()
    expect(screen.getAllByText('Just now')).toHaveLength(1)
  })

  it('ages listings past a day into days', () => {
    // Push the clock forward so all three fixtures clear the 24h mark
    vi.useFakeTimers({ now: MODULE_LOAD + 30 * 60 * 60 * 1000 })
    renderPage(<MarketplacePage />, { route: '/marketplace', url: '/marketplace' })

    expect(screen.getAllByText('1d ago')).toHaveLength(3)
    expect(screen.queryByText(/h ago$/)).not.toBeInTheDocument()
  })
})
